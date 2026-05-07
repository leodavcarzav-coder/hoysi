const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 4173;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const STORE_FILE = path.join(DATA_DIR, "launch-store.json");
const APP_BASE_URL = normalizeBaseUrl(process.env.APP_BASE_URL || "");
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "hola@hoysi.app";
const BETA_STAGE = normalizeBetaStage(process.env.BETA_STAGE || "open");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY || "";
const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_YEARLY || "";
const MONTHLY_PRICE_USD = 2.99;
const YEARLY_PRICE_USD = 24.99;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, "http://127.0.0.1");

  try {
    if (request.method === "GET" && requestUrl.pathname === "/api/health") {
      writeJson(response, 200, {
        ok: true,
        service: "hoysi",
        time: new Date().toISOString(),
      });
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/public-config") {
      writeJson(response, 200, buildPublicConfig(request));
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/readiness") {
      writeJson(response, 200, await buildReadiness(request));
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/lumi-chat") {
      await handleLumiChat(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/lumi-status") {
      writeJson(response, 200, {
        ok: true,
        mode: OPENAI_API_KEY ? "openai" : "local-fallback",
        model: OPENAI_MODEL,
      });
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/waitlist") {
      await handleWaitlist(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/testers/apply") {
      await handleTesterApply(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/feedback") {
      await handleFeedback(request, response);
      return;
    }

    if (request.method === "POST" && requestUrl.pathname === "/api/billing/checkout") {
      await handleBillingCheckout(request, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/api/billing/session") {
      await handleBillingSession(requestUrl, response);
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/robots.txt") {
      response.writeHead(200, securityHeaders({ "Content-Type": "text/plain; charset=utf-8" }));
      response.end(buildRobotsTxt(request));
      return;
    }

    if (request.method === "GET" && requestUrl.pathname === "/sitemap.xml") {
      response.writeHead(200, securityHeaders({ "Content-Type": "application/xml; charset=utf-8" }));
      response.end(buildSitemapXml(request));
      return;
    }

    serveStaticFile(requestUrl, response);
  } catch (error) {
    writeJson(response, 500, {
      error: error?.message || "No pude responder desde el servidor.",
    });
  }
});

async function handleLumiChat(request, response) {
  const body = await readJsonBody(request);
  const prompt = String(body?.prompt || "").trim();
  const financeContext = body?.financeContext || {};

  if (!prompt) {
    writeJson(response, 400, { error: "Falta la pregunta para Lumi." });
    return;
  }

  if (!OPENAI_API_KEY) {
    writeJson(response, 503, {
      error: "Lumi real todavia no tiene una API key configurada en el servidor.",
    });
    return;
  }

  const lumiReply = await askOpenAI(prompt, financeContext);
  writeJson(response, 200, lumiReply);
}

async function handleWaitlist(request, response) {
  if (!betaApplicationsOpen()) {
    writeJson(response, 503, {
      error: "Las postulaciones de esta beta estan pausadas por ahora.",
    });
    return;
  }

  const body = await readJsonBody(request);
  const name = safeShortText(body?.name, "").slice(0, 60);
  const email = normalizeEmail(body?.email);
  const source = safeShortText(body?.source, "landing").slice(0, 40);
  const intent = safeShortText(body?.intent, "early-access").slice(0, 60);

  if (!email) {
    writeJson(response, 400, { error: "Necesito un correo valido para guardarte." });
    return;
  }

  const store = await readStore();
  const existingIndex = store.waitlist.findIndex((item) => item.email === email);
  const entry = {
    id: existingIndex >= 0 ? store.waitlist[existingIndex].id : uid("lead"),
    name,
    email,
    source,
    intent,
    createdAt: existingIndex >= 0 ? store.waitlist[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    store.waitlist[existingIndex] = entry;
  } else {
    store.waitlist.unshift(entry);
  }

  await writeStore(store);

  writeJson(response, 200, {
    ok: true,
    message: "Te guardamos para la beta y te escribiremos cuando toque.",
  });
}

async function handleTesterApply(request, response) {
  if (!betaApplicationsOpen()) {
    writeJson(response, 503, {
      error: "Las postulaciones para esta ronda beta estan pausadas por ahora.",
    });
    return;
  }

  const body = await readJsonBody(request);
  const name = safeShortText(body?.name, "").slice(0, 60);
  const email = normalizeEmail(body?.email);
  const whatsapp = normalizePhone(body?.whatsapp);
  const profile = safeShortText(body?.profile, "").slice(0, 80);
  const biggestPain = safeLongText(body?.biggestPain, "").slice(0, 320);
  const source = safeShortText(body?.source, "launch-beta").slice(0, 40);

  if (!email) {
    writeJson(response, 400, { error: "Necesito un correo valido para postularte a la beta." });
    return;
  }

  const store = await readStore();
  const existingIndex = store.testerApplications.findIndex((item) => item.email === email);
  const previous = existingIndex >= 0 ? store.testerApplications[existingIndex] : null;
  const entry = {
    id: previous?.id || uid("tester"),
    name,
    email,
    whatsapp,
    profile,
    biggestPain,
    source,
    status: previous?.status || "new",
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    store.testerApplications[existingIndex] = entry;
  } else {
    store.testerApplications.unshift(entry);
  }

  store.testerApplications = store.testerApplications.slice(0, 2000);
  await writeStore(store);

  writeJson(response, 200, {
    ok: true,
    message: "Ya te anotamos. Si encajas con esta ronda beta, te escribiremos con los siguientes pasos.",
  });
}

async function handleFeedback(request, response) {
  const body = await readJsonBody(request);
  const name = safeShortText(body?.name, "").slice(0, 60);
  const email = normalizeEmail(body?.email);
  const area = safeShortText(body?.area, "general").slice(0, 60);
  const severity = safeShortText(body?.severity, "media").slice(0, 32);
  const message = safeLongText(body?.message, "").slice(0, 600);
  const suggestion = safeLongText(body?.suggestion, "").slice(0, 420);
  const device = safeShortText(body?.device, "").slice(0, 80);
  const source = safeShortText(body?.source, "feedback-page").slice(0, 40);

  if (!message) {
    writeJson(response, 400, { error: "Necesito que nos cuentes que paso o que te confundio." });
    return;
  }

  const store = await readStore();
  store.feedbackEntries.unshift({
    id: uid("fb"),
    name,
    email,
    area,
    severity,
    message,
    suggestion,
    device,
    source,
    createdAt: new Date().toISOString(),
  });
  store.feedbackEntries = store.feedbackEntries.slice(0, 5000);
  await writeStore(store);

  writeJson(response, 200, {
    ok: true,
    message: "Gracias. Tu feedback ya quedo guardado para revisar esta beta.",
  });
}

async function handleBillingCheckout(request, response) {
  const body = await readJsonBody(request);
  const plan = body?.plan === "yearly" ? "yearly" : "monthly";
  const email = normalizeEmail(body?.email);
  const source = safeShortText(body?.source, "launch").slice(0, 40);

  if (!billingEnabled()) {
    writeJson(response, 503, {
      ok: false,
      error: "Checkout todavia no esta activado en el servidor.",
      fallbackUrl: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quiero HoySi Pro")}`,
    });
    return;
  }

  const baseUrl = resolveBaseUrl(request);
  const session = await createStripeCheckoutSession({
    baseUrl,
    plan,
    source,
    email,
  });

  const store = await readStore();
  store.checkouts.unshift({
    id: uid("chk"),
    stripeSessionId: session.id,
    email,
    plan,
    source,
    status: "created",
    createdAt: new Date().toISOString(),
  });
  store.checkouts = store.checkouts.slice(0, 2000);
  await writeStore(store);

  writeJson(response, 200, {
    ok: true,
    url: session.url,
    sessionId: session.id,
  });
}

async function handleBillingSession(requestUrl, response) {
  const sessionId = String(requestUrl.searchParams.get("session_id") || "").trim();
  if (!sessionId) {
    writeJson(response, 400, { error: "Falta session_id." });
    return;
  }

  if (!billingEnabled()) {
    writeJson(response, 503, { error: "Billing no esta activo en el servidor." });
    return;
  }

  const session = await retrieveStripeCheckoutSession(sessionId);
  const isComplete = session.status === "complete";
  const hasSubscription = Boolean(session.subscription);
  const activatePro = isComplete && hasSubscription;
  const customerEmail = normalizeEmail(session.customer_details?.email || session.customer_email || "");
  const plan = session.metadata?.plan === "yearly" ? "yearly" : "monthly";

  const store = await readStore();
  const checkout = store.checkouts.find((item) => item.stripeSessionId === sessionId);
  if (checkout) {
    checkout.status = activatePro ? "activated" : session.status || "open";
    checkout.email = customerEmail || checkout.email;
    checkout.updatedAt = new Date().toISOString();
  } else {
    store.checkouts.unshift({
      id: uid("chk"),
      stripeSessionId: sessionId,
      email: customerEmail,
      plan,
      source: session.metadata?.source || "launch",
      status: activatePro ? "activated" : session.status || "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await writeStore(store);

  writeJson(response, 200, {
    ok: true,
    activatePro,
    plan,
    status: session.status,
    customerEmail,
  });
}

async function askOpenAI(prompt, financeContext) {
  const systemPrompt = [
    "Eres Lumi, una asistente financiera amable para personas con ingresos variables en Latinoamerica.",
    "Respondes solo en espanol simple.",
    "Tu trabajo es ayudar con dudas practicas usando el contexto financiero recibido.",
    "Habla como una conversacion normal, no como un reporte.",
    "Tu inteligencia es media: se util, clara y prudente, pero no suenes demasiado perfecta ni demasiado tecnica.",
    "Responde en 2 a 5 frases cortas. Usa listas solo si ayudan mucho.",
    "No uses jerga bancaria complicada.",
    "No inventes datos que no esten en el contexto.",
    "Si el contexto no alcanza, dilo con honestidad.",
    "No hables de inversion, bolsa, criptos ni temas fuera de esta app si no te lo preguntan.",
    "Devuelve JSON puro con esta forma exacta:",
    '{"topicId":"overview|spend|receivables|payments|mix|savings","title":"string corto","body":"respuesta principal clara","tips":["tip 1","tip 2","tip 3"],"primaryAction":{"label":"string","action":"go-view|open-sheet|open-goal-sheet","target":"home|flow|receivables|protected|insights","kind":"income|expense|receivable|saving|protect"},"secondaryAction":{"label":"string","action":"go-view|open-sheet|open-goal-sheet","target":"home|flow|receivables|protected|insights","kind":"income|expense|receivable|saving|protect"}}',
    "Si una accion no aplica, omite target o kind, pero conserva la estructura del objeto.",
    "No pongas markdown ni backticks.",
  ].join(" ");

  const userPrompt = JSON.stringify(
    {
      user_question: prompt,
      finance_context: financeContext,
    },
    null,
    2,
  );

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_output_tokens: 320,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  const payload = await apiResponse.json().catch(() => ({}));
  if (!apiResponse.ok) {
    const message =
      payload?.error?.message || payload?.message || "La API de Lumi no pudo responder.";
    throw new Error(message);
  }

  const rawText = String(payload?.output_text || "").trim();
  if (!rawText) {
    throw new Error("Lumi no devolvio texto.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch (error) {
    throw new Error("Lumi devolvio una respuesta invalida.");
  }

  return {
    topicId: normalizeTopicId(parsed.topicId),
    title: safeShortText(parsed.title, "Respuesta de Lumi"),
    body: safeLongText(parsed.body, "No pude responder bien esta vez."),
    tips: normalizeTips(parsed.tips),
    primaryAction: normalizeAction(parsed.primaryAction),
    secondaryAction: normalizeAction(parsed.secondaryAction),
  };
}

function serveStaticFile(requestUrl, response) {
  const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, securityHeaders({ "Content-Type": "text/plain; charset=utf-8" }));
      response.end("No encontrado");
      return;
    }

    const extension = path.extname(filePath);
    response.writeHead(
      200,
      securityHeaders({
        "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      }),
    );
    response.end(data);
  });
}

async function createStripeCheckoutSession({ baseUrl, plan, source, email }) {
  const priceId = plan === "yearly" ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY;
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("success_url", `${baseUrl}/billing-success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${baseUrl}/launch.html#beta`);
  params.set("allow_promotion_codes", "true");
  params.set("billing_address_collection", "auto");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("metadata[plan]", plan);
  params.set("metadata[source]", source || "launch");
  params.set("client_reference_id", `${source || "launch"}-${Date.now()}`);
  if (email) {
    params.set("customer_email", email);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "No pude crear el checkout en Stripe.");
  }

  if (!payload?.url || !payload?.id) {
    throw new Error("Stripe no devolvio una sesion valida.");
  }

  return payload;
}

async function retrieveStripeCheckoutSession(sessionId) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || "No pude leer la sesion de Stripe.");
  }

  return payload;
}

async function readStore() {
  await ensureStoreFile();
  try {
    const raw = await fsp.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist : [],
      testerApplications: Array.isArray(parsed.testerApplications) ? parsed.testerApplications : [],
      feedbackEntries: Array.isArray(parsed.feedbackEntries) ? parsed.feedbackEntries : [],
      checkouts: Array.isArray(parsed.checkouts) ? parsed.checkouts : [],
    };
  } catch (error) {
    return {
      waitlist: [],
      testerApplications: [],
      feedbackEntries: [],
      checkouts: [],
    };
  }
}

async function writeStore(store) {
  await ensureStoreFile();
  const payload = JSON.stringify(
    {
      waitlist: Array.isArray(store.waitlist) ? store.waitlist : [],
      testerApplications: Array.isArray(store.testerApplications) ? store.testerApplications : [],
      feedbackEntries: Array.isArray(store.feedbackEntries) ? store.feedbackEntries : [],
      checkouts: Array.isArray(store.checkouts) ? store.checkouts : [],
    },
    null,
    2,
  );
  await fsp.writeFile(STORE_FILE, payload, "utf8");
}

async function ensureStoreFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(STORE_FILE, fs.constants.F_OK);
  } catch (error) {
    await fsp.writeFile(
      STORE_FILE,
      JSON.stringify({ waitlist: [], testerApplications: [], feedbackEntries: [], checkouts: [] }, null, 2),
      "utf8",
    );
  }
}

function buildPublicConfig(request) {
  const baseUrl = resolveBaseUrl(request);

  return {
    ok: true,
    appBaseUrl: baseUrl,
    betaMode: true,
    billingEnabled: billingEnabled(),
    contactEmail: CONTACT_EMAIL,
    prices: {
      monthlyUsd: MONTHLY_PRICE_USD,
      yearlyUsd: YEARLY_PRICE_USD,
    },
    beta: {
      applyPath: "/api/testers/apply",
      feedbackPath: "/feedback.html",
      guidePath: "/tester-guide.html",
      applyOpen: betaApplicationsOpen(),
    },
    release: buildReleaseState(baseUrl),
    lumi: {
      mode: OPENAI_API_KEY ? "openai" : "local-fallback",
      model: OPENAI_MODEL,
    },
  };
}

async function buildReadiness(request) {
  const baseUrl = resolveBaseUrl(request);
  const blockers = [];
  const warnings = [];
  let storageOk = true;

  try {
    await readStore();
  } catch (error) {
    storageOk = false;
    blockers.push("No pude preparar el almacenamiento local para leads y feedback.");
  }

  if (!isPublicBaseUrl(baseUrl)) {
    blockers.push("La app todavia no esta corriendo bajo una URL publica compartible.");
  }

  if (!APP_BASE_URL) {
    warnings.push("APP_BASE_URL no esta configurado; conviene fijarlo cuando ya tengas dominio o URL final.");
  }

  if (!OPENAI_API_KEY) {
    warnings.push("Lumi seguira en modo fallback local hasta configurar OPENAI_API_KEY.");
  }

  if (!billingEnabled()) {
    warnings.push("Stripe sigue desactivado. Eso esta bien si esta ronda beta no va a cobrar.");
  }

  return {
    ok: true,
    publicReady: blockers.length === 0,
    betaStage: BETA_STAGE,
    betaStageLabel: betaStageLabel(BETA_STAGE),
    shareUrl: `${baseUrl}/launch.html`,
    appUrl: `${baseUrl}/`,
    storageOk,
    blockers,
    warnings,
    capabilities: {
      applicationsOpen: betaApplicationsOpen(),
      billingEnabled: billingEnabled(),
      lumiMode: OPENAI_API_KEY ? "openai" : "local-fallback",
    },
  };
}

function buildRobotsTxt(request) {
  const baseUrl = resolveBaseUrl(request);
  return `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

function buildSitemapXml(request) {
  const baseUrl = resolveBaseUrl(request);
  const now = new Date().toISOString();
  const urls = ["/", "/launch.html", "/feedback.html", "/tester-guide.html", "/privacy.html", "/terms.html"];
  const items = urls
    .map(
      (pathname) => `
  <url>
    <loc>${escapeXml(`${baseUrl}${pathname}`)}</loc>
    <lastmod>${now}</lastmod>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}
</urlset>`;
}

function resolveBaseUrl(request) {
  if (APP_BASE_URL) {
    return APP_BASE_URL;
  }

  const forwardedProto = request.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProto === "string" && forwardedProto ? forwardedProto.split(",")[0] : "http";
  const host = request.headers.host || `127.0.0.1:${PORT}`;
  return normalizeBaseUrl(`${protocol}://${host}`);
}

function buildReleaseState(baseUrl) {
  return {
    stage: BETA_STAGE,
    stageLabel: betaStageLabel(BETA_STAGE),
    publicReady: isPublicBaseUrl(baseUrl),
    shareUrl: `${baseUrl}/launch.html`,
    appUrl: `${baseUrl}/`,
  };
}

function normalizeBetaStage(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return ["private", "open", "paused"].includes(normalized) ? normalized : "open";
}

function betaStageLabel(stage) {
  if (stage === "private") {
    return "Beta privada por invitacion";
  }

  if (stage === "paused") {
    return "Beta pausada temporalmente";
  }

  return "Beta oficial abierta";
}

function betaApplicationsOpen() {
  return BETA_STAGE !== "paused";
}

function isPublicBaseUrl(value) {
  try {
    const url = new URL(String(value || ""));
    const host = url.hostname.toLowerCase();

    if (!host || host === "localhost" || host === "0.0.0.0") {
      return false;
    }

    if (host === "127.0.0.1" || host === "::1") {
      return false;
    }

    if (host.endsWith(".local")) {
      return false;
    }

    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      const octets = host.split(".").map((item) => Number.parseInt(item, 10));
      const [a, b] = octets;
      if (a === 10 || a === 127) {
        return false;
      }
      if (a === 172 && b >= 16 && b <= 31) {
        return false;
      }
      if (a === 192 && b === 168) {
        return false;
      }
    }

    return url.protocol === "https:" || url.protocol === "http:";
  } catch (error) {
    return false;
  }
}

function normalizeTopicId(value) {
  const allowed = new Set(["overview", "spend", "receivables", "payments", "mix", "savings"]);
  return allowed.has(value) ? value : "overview";
}

function normalizeAction(value) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const allowedActions = new Set(["go-view", "open-sheet", "open-goal-sheet"]);
  const allowedTargets = new Set(["home", "flow", "receivables", "protected", "insights"]);
  const allowedKinds = new Set(["income", "expense", "receivable", "saving", "protect"]);

  const normalized = {
    label: safeShortText(value.label, ""),
    action: allowedActions.has(value.action) ? value.action : "go-view",
  };

  if (allowedTargets.has(value.target)) {
    normalized.target = value.target;
  }

  if (allowedKinds.has(value.kind)) {
    normalized.kind = value.kind;
  }

  return normalized.label ? normalized : null;
}

function safeShortText(value, fallback) {
  const text = String(value || "").trim();
  return text ? text.slice(0, 120) : fallback;
}

function safeLongText(value, fallback) {
  const text = String(value || "").trim();
  return text ? text.slice(0, 520) : fallback;
}

function normalizeTips(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "";
  }
  return email.slice(0, 160);
}

function normalizePhone(value) {
  return String(value || "")
    .trim()
    .replace(/[^\d+]/g, "")
    .slice(0, 20);
}

function normalizeBaseUrl(value) {
  const url = String(value || "").trim();
  return url ? url.replace(/\/+$/, "") : "";
}

function billingEnabled() {
  return Boolean(STRIPE_SECRET_KEY && STRIPE_PRICE_MONTHLY && STRIPE_PRICE_YEARLY);
}

function uid(prefix) {
  return `${prefix}_${crypto.randomBytes(5).toString("hex")}`;
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function securityHeaders(headers = {}) {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    ...headers,
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";

    request.on("data", (chunk) => {
      raw += chunk.toString("utf8");
      if (raw.length > 2_000_000) {
        reject(new Error("La peticion es demasiado grande."));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error("No pude leer el JSON enviado."));
      }
    });

    request.on("error", (error) => reject(error));
  });
}

function writeJson(response, statusCode, payload) {
  response.writeHead(
    statusCode,
    securityHeaders({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    }),
  );
  response.end(JSON.stringify(payload));
}

server.listen(PORT, HOST, () => {
  const networkUrls = Object.values(os.networkInterfaces())
    .flat()
    .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
    .map((entry) => `http://${entry.address}:${PORT}`);

  console.log(`HoySi listo en http://127.0.0.1:${PORT}`);
  console.log(`Landing: http://127.0.0.1:${PORT}/launch.html`);
  console.log(`Beta: ${betaStageLabel(BETA_STAGE)}`);
  console.log(`Beta publica: ${isPublicBaseUrl(APP_BASE_URL) ? "lista para compartir" : "pendiente de URL publica o dominio final"}`);
  console.log(`Checkout: ${billingEnabled() ? "activo si Stripe esta bien configurado" : "pendiente de llaves Stripe"}`);
  console.log(`Lumi IA: ${OPENAI_API_KEY ? `activa con ${OPENAI_MODEL}` : "modo fallback local"}`);

  if (networkUrls.length) {
    console.log("Tambien disponible en:");
    networkUrls.forEach((url) => console.log(`- ${url}`));
  }
});
