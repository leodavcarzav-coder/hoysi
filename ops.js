const opsAccessForm = document.getElementById("ops-access-form");
const opsTokenInput = document.getElementById("ops-token-input");
const opsStatus = document.getElementById("ops-status");
const opsSummary = document.getElementById("ops-summary");
const feedbackList = document.getElementById("feedback-list");
const lumiList = document.getElementById("lumi-list");
const waitlistList = document.getElementById("waitlist-list");
const testerList = document.getElementById("tester-list");
const sourceBreakdownList = document.getElementById("source-breakdown");
const channelLinks = document.getElementById("channel-links");
const campaignKit = document.getElementById("campaign-kit");
const opsBoardForm = document.getElementById("ops-board-form");
const opsBoardBody = document.getElementById("ops-board-body");
const opsExportBoardButton = document.getElementById("ops-export-board");
const opsSeedBoardButton = document.getElementById("ops-seed-board");

const BOARD_STORAGE_KEY = "hoysi-beta-board-v1";
const OPS_TOKEN_STORAGE_KEY = "hoysi-ops-token";
const queryToken = new URLSearchParams(window.location.search).get("token") || "";
const savedToken = window.localStorage.getItem(OPS_TOKEN_STORAGE_KEY) || "";
const CAMPAIGN_CONFIG = [
  {
    label: "WhatsApp directo",
    source: "whatsapp",
    channel: "Canal principal",
    duration: "2 a 5 min",
    body:
      "Estoy probando una app llamada HoySi para gente a la que la plata le entra por partes. Si vendes por WhatsApp, cobras a ratos o mezclas casa y negocio, abre esto 5 minutos con tu realidad y dime que no entendiste o que le agregarias: {link}",
  },
  {
    label: "Reddit alpha",
    source: "reddit-alpha",
    channel: "Builders y testers",
    duration: "5 min",
    title: "Looking for real testers for a mobile-first beta for variable-income users in LatAm",
    body:
      "I am testing a mobile-first beta called HoySi for people whose money comes in parts: WhatsApp sellers, independent workers, and anyone mixing home and business cash. I do not need generic praise. I need 5 minutes of real use and 1 concrete comment about onboarding, daily usable money, receivables, or protected payments. If that profile fits you or someone close to you, start here: {link}",
  },
  {
    label: "Reddit TestMyApp",
    source: "reddit-testmyapp",
    channel: "Feedback rapido",
    duration: "5 min",
    title: "Can you test a money app for users with variable income and give 1 concrete usability note?",
    body:
      "I am looking for a small group of testers for HoySi, a beta focused on people who get paid in parts and need to know what they can safely use today. Best fit: WhatsApp sellers, freelancers, side-income users, or people mixing home and business money. I only ask for 5 minutes of real use plus 1 concrete note on what felt confusing, heavy, or missing: {link}",
  },
  {
    label: "Reddit SideProject",
    source: "reddit-sideproject",
    channel: "Feedback de builders",
    duration: "5 min",
    title: "Built a mobile-first finance beta for people with inconsistent income, looking for real usage feedback",
    body:
      "I am testing HoySi, a mobile-first finance beta for people whose money comes in parts instead of on a fixed paycheck. The goal is not accounting software. The goal is helping someone know what they can safely move today, what should stay protected, and what to collect first. I am looking for real testers plus 1 useful feedback note after trying it: {link}",
  },
  {
    label: "Founder feedback",
    source: "indiehackers",
    channel: "Carril secundario",
    duration: "3 a 5 min",
    title: "Would love feedback on positioning and distribution for a beta aimed at variable-income users",
    body:
      "I am validating HoySi, a simple money flow aimed at people with variable income, WhatsApp sales, and mixed home/business cash. I am not looking for massive growth yet. I want honest feedback on positioning, channel fit, and whether the flow makes sense without explanation. If you are a founder or builder, this is the current beta: {link}",
  },
];
let activeToken = queryToken || savedToken;
let autoLoadTimer = 0;
let boardRows = readBoardRows();

if (opsTokenInput) {
  opsTokenInput.value = activeToken;
}

if (opsAccessForm) {
  opsAccessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    syncTokenFromInput({ shouldLoad: true, force: true });
  });
}

if (opsTokenInput) {
  opsTokenInput.addEventListener("input", () => {
    window.clearTimeout(autoLoadTimer);
    autoLoadTimer = window.setTimeout(() => {
      syncTokenFromInput({ shouldLoad: true });
    }, 260);
  });

  window.setTimeout(() => {
    syncTokenFromInput({ shouldLoad: true });
  }, 180);
}

if (opsBoardForm) {
  opsBoardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(opsBoardForm);
    const row = {
      id: `row_${Date.now()}`,
      name: cleanText(formData.get("name"), 80),
      channel: cleanText(formData.get("channel"), 60),
      profile: cleanText(formData.get("profile"), 120),
      status: cleanText(formData.get("status"), 40) || "nuevo",
      firstContactAt: cleanText(formData.get("firstContactAt"), 24),
      entered: cleanText(formData.get("entered"), 40) || "pendiente",
      sentFeedback: cleanText(formData.get("sentFeedback"), 40) || "pendiente",
      quality: cleanText(formData.get("quality"), 40) || "media",
    };

    if (!row.name || !row.channel || !row.profile) {
      setOpsStatus("Necesito nombre, canal y perfil para guardar la fila.");
      return;
    }

    boardRows.unshift(row);
    persistBoardRows();
    renderBoard();
    opsBoardForm.reset();
    setOpsStatus("Fila guardada en el tablero operativo.");
  });
}

if (opsExportBoardButton) {
  opsExportBoardButton.addEventListener("click", () => {
    const rows = boardRows.length ? boardRows : buildSeedRows();
    const csv = buildBoardCsv(rows);
    downloadText(csv, "hoysi-beta-board.csv", "text/csv;charset=utf-8");
    setOpsStatus("CSV exportado.");
  });
}

if (opsSeedBoardButton) {
  opsSeedBoardButton.addEventListener("click", () => {
    if (boardRows.length) {
      setOpsStatus("Ya tienes filas guardadas. Si quieres ejemplos, exporta primero y luego limpia manualmente.");
      return;
    }

    boardRows = buildSeedRows();
    persistBoardRows();
    renderBoard();
    setOpsStatus("Tablero cargado con ejemplos base.");
  });
}

renderBoard();
renderChannelLinks();
renderCampaignKit();
loadOpsData({ force: true });

function syncTokenFromInput({ shouldLoad = false, force = false } = {}) {
  const nextToken = String(opsTokenInput?.value || "").trim();
  const changed = nextToken !== activeToken;
  activeToken = nextToken;

  if (activeToken) {
    window.localStorage.setItem(OPS_TOKEN_STORAGE_KEY, activeToken);
  } else {
    window.localStorage.removeItem(OPS_TOKEN_STORAGE_KEY);
  }

  syncUrlToken(activeToken);

  if (shouldLoad && (changed || force)) {
    loadOpsData({ force: true });
  }
}

async function loadOpsData({ force = false } = {}) {
  if (!activeToken && !force) {
    return;
  }

  setOpsStatus("Cargando panel...");

  try {
    const response = await fetch(buildOpsUrl(), {
      headers: activeToken ? { "x-ops-token": activeToken } : { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.error || "No pude abrir el panel.");
    }

    renderSummary(payload.summary || {});
    renderSourceBreakdown(payload.sourceBreakdown || []);
    renderTesters(payload.testerApplications || []);
    renderFeedback(payload.feedbackEntries || []);
    renderLumiQuestions(payload.lumiQuestions || []);
    renderWaitlist(payload.waitlist || []);
    setOpsStatus("Panel cargado.");
  } catch (error) {
    renderSummary({});
    renderSourceBreakdown([]);
    renderTesters([]);
    renderFeedback([]);
    renderLumiQuestions([]);
    renderWaitlist([]);
    setOpsStatus(error?.message || "No pude abrir el panel.");
  }
}

function buildOpsUrl() {
  const url = new URL("/api/ops/feedback", window.location.origin);
  if (activeToken) {
    url.searchParams.set("token", activeToken);
  }
  return url.toString();
}

function syncUrlToken(token) {
  const url = new URL(window.location.href);
  if (token) {
    url.searchParams.set("token", token);
  } else {
    url.searchParams.delete("token");
  }
  window.history.replaceState({}, "", url.toString());
}

function renderSummary(summary) {
  if (!opsSummary) {
    return;
  }

  const cards = [
    ["Feedback", summary.feedbackEntries || 0],
    ["Preguntas beta", summary.lumiQuestions || 0],
    ["Correos guardados", summary.waitlist || 0],
    ["Testers", summary.testerApplications || 0],
  ];

  opsSummary.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="ops-summary-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </article>
      `,
    )
    .join("");
}

function renderChannelLinks() {
  if (!channelLinks) {
    return;
  }

  channelLinks.innerHTML = CAMPAIGN_CONFIG
    .map((item) => {
      const url = buildCampaignLink(item.source);
      return `
        <article class="ops-link-card">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.channel)}</p>
            <code>${escapeHtml(url)}</code>
          </div>
          <button class="launch-button" type="button" data-copy-link="${escapeHtml(url)}">Copiar</button>
        </article>
      `;
    })
    .join("");

  channelLinks.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      const url = button.getAttribute("data-copy-link") || "";
      try {
        await navigator.clipboard.writeText(url);
        setOpsStatus("Link copiado.");
      } catch (error) {
        setOpsStatus("No pude copiar el link. Pero ya lo ves arriba.");
      }
    });
  });
}

function renderCampaignKit() {
  if (!campaignKit) {
    return;
  }

  campaignKit.innerHTML = CAMPAIGN_CONFIG.map((item) => {
    const link = buildCampaignLink(item.source);
    const copyBody = item.body.replace("{link}", link);
    const copyFull = item.title ? `${item.title}\n\n${copyBody}` : copyBody;
    return `
      <article class="ops-campaign-card">
        <div class="ops-entry-top">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.duration)}</span>
        </div>
        <p class="ops-inline-meta">${escapeHtml(item.channel)}</p>
        ${item.title ? `<p><strong>Titulo:</strong> ${escapeHtml(item.title)}</p>` : ""}
        <p>${escapeHtml(copyBody)}</p>
        <div class="ops-campaign-actions">
          <button class="launch-button" type="button" data-copy-message="${escapeHtml(copyBody)}">Copiar mensaje</button>
          <button class="launch-button ghost" type="button" data-copy-full="${escapeHtml(copyFull)}">Copiar post completo</button>
        </div>
      </article>
    `;
  }).join("");

  campaignKit.querySelectorAll("[data-copy-message]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy-message") || "");
        setOpsStatus("Mensaje copiado.");
      } catch (error) {
        setOpsStatus("No pude copiar el mensaje.");
      }
    });
  });

  campaignKit.querySelectorAll("[data-copy-full]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.getAttribute("data-copy-full") || "");
        setOpsStatus("Post completo copiado.");
      } catch (error) {
        setOpsStatus("No pude copiar el post.");
      }
    });
  });
}

function renderSourceBreakdown(entries) {
  if (!sourceBreakdownList) {
    return;
  }

  if (!entries.length) {
    sourceBreakdownList.innerHTML = `<p class="ops-empty">Todavia no hay datos por fuente.</p>`;
    return;
  }

  sourceBreakdownList.innerHTML = entries
    .map(
      (entry) => `
        <article class="ops-entry-card">
          <div class="ops-entry-top">
            <strong>${escapeHtml(entry.source || "direct")}</strong>
            <span>${escapeHtml(`${entry.total || 0} evento(s)`)}</span>
          </div>
          <div class="ops-metric-row">
            <span>Correos ${escapeHtml(String(entry.waitlist || 0))}</span>
            <span>Testers ${escapeHtml(String(entry.testers || 0))}</span>
            <span>Feedback ${escapeHtml(String(entry.feedback || 0))}</span>
            <span>Preguntas ${escapeHtml(String(entry.questions || 0))}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderTesters(entries) {
  if (!testerList) {
    return;
  }

  if (!entries.length) {
    testerList.innerHTML = `<p class="ops-empty">Todavia no hay testers aplicados por este canal.</p>`;
    return;
  }

  testerList.innerHTML = entries
    .map(
      (entry) => `
        <article class="ops-entry-card">
          <div class="ops-entry-top">
            <strong>${escapeHtml(entry.name || entry.email || "Tester sin nombre")}</strong>
            <span>${escapeHtml(formatDate(entry.updatedAt))}</span>
          </div>
          ${entry.email ? `<p class="ops-inline-meta">${escapeHtml(entry.email)}</p>` : ""}
          ${entry.profile ? `<p>${escapeHtml(entry.profile)}</p>` : ""}
          ${entry.biggestPain ? `<p><strong>Dolor:</strong> ${escapeHtml(entry.biggestPain)}</p>` : ""}
          <p class="ops-inline-meta">Estado: ${escapeHtml(entry.status || "new")} · Fuente: ${escapeHtml(entry.source || "direct")}</p>
        </article>
      `,
    )
    .join("");
}

function renderFeedback(entries) {
  if (!feedbackList) {
    return;
  }

  if (!entries.length) {
    feedbackList.innerHTML = `<p class="ops-empty">Todavia no entra feedback aqui.</p>`;
    return;
  }

  feedbackList.innerHTML = entries
    .map(
      (entry) => `
        <article class="ops-entry-card">
          <div class="ops-entry-top">
            <strong>${escapeHtml(entry.area || "general")}</strong>
            <span>${escapeHtml(formatDate(entry.createdAt))}</span>
          </div>
          ${entry.email ? `<p class="ops-inline-meta">${escapeHtml(entry.email)}</p>` : ""}
          ${entry.message ? `<p>${escapeHtml(entry.message)}</p>` : ""}
          ${entry.suggestion ? `<p><strong>Le agregaria:</strong> ${escapeHtml(entry.suggestion)}</p>` : ""}
          ${entry.source ? `<p class="ops-inline-meta">Fuente: ${escapeHtml(entry.source)}</p>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderLumiQuestions(entries) {
  if (!lumiList) {
    return;
  }

  if (!entries.length) {
    lumiList.innerHTML = `<p class="ops-empty">Todavia no hay preguntas guardadas del laboratorio.</p>`;
    return;
  }

  lumiList.innerHTML = entries
    .map(
      (entry) => `
        <article class="ops-entry-card">
          <div class="ops-entry-top">
            <strong>${escapeHtml(entry.status || "queued-for-review")}</strong>
            <span>${escapeHtml(formatDate(entry.createdAt))}</span>
          </div>
          <p>${escapeHtml(entry.prompt || "")}</p>
          ${entry.answerBody ? `<p><strong>Respuesta:</strong> ${escapeHtml(entry.answerBody)}</p>` : ""}
          ${entry.error ? `<p><strong>Nota:</strong> ${escapeHtml(entry.error)}</p>` : ""}
          ${entry.source ? `<p class="ops-inline-meta">Fuente: ${escapeHtml(entry.source)}</p>` : ""}
        </article>
      `,
    )
    .join("");
}

function renderWaitlist(entries) {
  if (!waitlistList) {
    return;
  }

  if (!entries.length) {
    waitlistList.innerHTML = `<p class="ops-empty">Todavia no hay correos guardados.</p>`;
    return;
  }

  waitlistList.innerHTML = entries
    .map(
      (entry) => `
        <article class="ops-entry-card">
          <div class="ops-entry-top">
            <strong>${escapeHtml(entry.email || "")}</strong>
            <span>${escapeHtml(formatDate(entry.updatedAt))}</span>
          </div>
          <p class="ops-inline-meta">Fuente: ${escapeHtml(entry.source || "landing")}</p>
          <p class="ops-inline-meta">Intencion: ${escapeHtml(entry.intent || "updates")}</p>
        </article>
      `,
    )
    .join("");
}

function renderBoard() {
  if (!opsBoardBody) {
    return;
  }

  if (!boardRows.length) {
    opsBoardBody.innerHTML = `
      <tr>
        <td colspan="9" class="ops-board-empty">Todavia no tienes filas guardadas en tu tablero.</td>
      </tr>
    `;
    return;
  }

  opsBoardBody.innerHTML = boardRows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.channel)}</td>
          <td>${escapeHtml(row.profile)}</td>
          <td>${escapeHtml(row.status)}</td>
          <td>${escapeHtml(row.firstContactAt || "sin fecha")}</td>
          <td>${escapeHtml(row.entered || "pendiente")}</td>
          <td>${escapeHtml(row.sentFeedback || "pendiente")}</td>
          <td>${escapeHtml(row.quality || "media")}</td>
          <td><button class="ops-delete-button" data-row-id="${escapeHtml(row.id)}" type="button">Borrar</button></td>
        </tr>
      `,
    )
    .join("");

  opsBoardBody.querySelectorAll("[data-row-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const rowId = button.getAttribute("data-row-id") || "";
      boardRows = boardRows.filter((row) => row.id !== rowId);
      persistBoardRows();
      renderBoard();
      setOpsStatus("Fila borrada del tablero.");
    });
  });
}

function readBoardRows() {
  try {
    const raw = window.localStorage.getItem(BOARD_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function persistBoardRows() {
  window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(boardRows));
}

function buildSeedRows() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    {
      id: "seed_1",
      name: "Referido WhatsApp 1",
      channel: "whatsapp",
      profile: "Vende por WhatsApp",
      status: "contactado",
      firstContactAt: today,
      entered: "pendiente",
      sentFeedback: "pendiente",
      quality: "alta",
    },
    {
      id: "seed_2",
      name: "Founder feedback 1",
      channel: "indiehackers",
      profile: "Founder para feedback de distribucion",
      status: "nuevo",
      firstContactAt: today,
      entered: "no entro",
      sentFeedback: "no",
      quality: "media",
    },
  ];
}

function buildBoardCsv(rows) {
  const headers = [
    "nombre",
    "canal",
    "perfil",
    "estado",
    "fecha de primer contacto",
    "entro/no entro",
    "mando feedback",
    "calidad",
  ];

  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const values = [
      row.name,
      row.channel,
      row.profile,
      row.status,
      row.firstContactAt,
      row.entered,
      row.sentFeedback,
      row.quality,
    ].map(csvEscape);
    lines.push(values.join(","));
  });
  return lines.join("\n");
}

function csvEscape(value) {
  const text = String(value || "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function setOpsStatus(message) {
  if (!opsStatus) {
    return;
  }

  opsStatus.textContent = message;
  opsStatus.classList.add("is-visible");
}

function buildCampaignLink(source) {
  return `${window.location.origin}/launch.html?source=${encodeURIComponent(source)}`;
}

function formatDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) {
    return "sin fecha";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function cleanText(value, maxLength) {
  return String(value || "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
