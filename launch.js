const previews = [
  {
    key: "home",
    title: "Hoy",
    body: "La cifra central, tus siguientes movimientos y lo que no conviene tocar hoy.",
  },
  {
    key: "lumi",
    title: "Preguntas beta",
    body: "Una capa en prueba para dejar preguntas reales y entender como deberia responder la futura IA.",
  },
  {
    key: "protect",
    title: "Apartados",
    body: "Pagos y apartados visibles para que no te sorprenda lo que ya tenia destino.",
  },
];

let publicConfig = {
  appBaseUrl: "",
  contactEmail: "hola@hoysi.app",
  billingEnabled: false,
  beta: {
    waitlistPath: "/api/waitlist",
    feedbackPath: "/feedback.html",
    guidePath: "/tester-guide.html",
    applyOpen: true,
  },
  release: {
    stageLabel: "Beta abierta",
  },
  lumi: {
    mode: "question-lab",
    model: "gpt-5-mini",
  },
};

const ACQUISITION_SOURCE_KEY = "hoysi-beta-source";
const urlParams = new URLSearchParams(window.location.search);
const waitlistForm = document.getElementById("waitlist-form");
const waitlistFeedback = document.getElementById("waitlist-feedback");
const previewTabs = Array.from(document.querySelectorAll("[data-preview-key]"));
const previewShots = Array.from(document.querySelectorAll("[data-preview-panel]"));
const trackedLinks = Array.from(document.querySelectorAll("[data-track-link]"));
const supportsHover = window.matchMedia("(hover: hover)").matches;
const shareWhatsAppLink = document.querySelector("[data-share-whatsapp]");
const copyInviteButton = document.querySelector("[data-copy-invite]");
const shareCopyText = document.getElementById("share-copy-text");

const referralCopy =
  "Si vendes por WhatsApp, cobras por partes o mezclas casa y negocio, abre HoySi 5 minutos con tu realidad y dime que no entendiste o que te faltaria:";

let activePreview = "home";
let acquisitionSource = resolveAcquisitionSource();

initLaunch();

async function initLaunch() {
  await loadPublicConfig();
  hydrateLaunchMeta();
  hydrateTrackedLinks();
  wireWaitlistForm();
  wirePreviewTabs();
  wireReferralShare();
  activatePreview(activePreview);
}

async function loadPublicConfig() {
  try {
    const response = await fetch("/api/public-config", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return;
    }

    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === "object") {
      publicConfig = {
        ...publicConfig,
        ...payload,
        beta: {
          ...publicConfig.beta,
          ...(payload.beta || {}),
        },
        release: {
          ...publicConfig.release,
          ...(payload.release || {}),
        },
        lumi: {
          ...publicConfig.lumi,
          ...(payload.lumi || {}),
        },
      };
    }
  } catch (error) {
    return;
  }
}

function hydrateLaunchMeta() {
  setText("beta-stage-inline", publicConfig.release.stageLabel || "Beta abierta");
  setText(
    "beta-lumi-inline",
    publicConfig.lumi.mode === "openai" ? "Preguntas con IA real" : "Preguntas en prueba",
  );

  const contactEmail = publicConfig.contactEmail || "hola@hoysi.app";
  const contactLink = document.getElementById("beta-contact-inline");
  if (contactLink) {
    contactLink.href = `mailto:${contactEmail}`;
    contactLink.textContent = contactEmail;
  }
}

function wireWaitlistForm() {
  if (!waitlistForm) {
    return;
  }

  waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(waitlistForm);
    const payload = {
      email: String(formData.get("email") || "").trim(),
      source: acquisitionSource || "launch-direct",
      intent: "updates",
    };

    const submitButton = waitlistForm.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "Guardar correo";

    if (!payload.email) {
      showWaitlistFeedback("Necesito tu correo para guardarlo.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Guardando...";
    }

    try {
      const response = await fetch(publicConfig.beta.waitlistPath || "/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "No pude guardar tu correo.");
      }

      waitlistForm.reset();
      showWaitlistFeedback(
        result?.message || "Correo guardado. Mientras tanto, puedes entrar a la app cuando quieras.",
        "success",
      );
    } catch (error) {
      showWaitlistFeedback(error?.message || "No pude guardar tu correo ahora mismo.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

function hydrateTrackedLinks() {
  trackedLinks.forEach((link) => {
    const kind = link.dataset.trackLink;
    const href = link.getAttribute("href") || "/";
    if (!kind) {
      return;
    }

    const fallbackSource = kind === "feedback" ? "beta-feedback" : "beta-landing";
    link.href = appendSourceToPath(href, acquisitionSource || fallbackSource);
  });
}

function wirePreviewTabs() {
  if (!previewTabs.length) {
    return;
  }

  previewTabs.forEach((tab) => {
    const key = tab.dataset.previewKey;
    if (!key) {
      return;
    }

    if (supportsHover) {
      tab.addEventListener("mouseenter", () => activatePreview(key));
    }
    tab.addEventListener("focus", () => activatePreview(key));
    tab.addEventListener("click", () => activatePreview(key));
  });
}

function wireReferralShare() {
  const referralLink = appendSourceToPath("/launch.html", "referral-share");
  const message = `${referralCopy} ${window.location.origin}${referralLink}`;

  if (shareCopyText) {
    shareCopyText.textContent = message;
  }

  if (shareWhatsAppLink) {
    shareWhatsAppLink.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  if (copyInviteButton) {
    copyInviteButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message);
        showWaitlistFeedback("Invitacion copiada. Puedes pegarla donde quieras.", "success");
      } catch (error) {
        showWaitlistFeedback("No pude copiar la invitacion ahora mismo.", "error");
      }
    });
  }
}

function activatePreview(key) {
  activePreview = previews.some((item) => item.key === key) ? key : "home";

  previewTabs.forEach((tab) => {
    const isActive = tab.dataset.previewKey === activePreview;
    tab.classList.toggle("active-preview-tab", isActive);
    tab.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  previewShots.forEach((shot) => {
    shot.classList.toggle("active-preview-shot", shot.dataset.previewPanel === activePreview);
  });

  const current = previews.find((item) => item.key === activePreview) || previews[0];
  setText("preview-title", current.title);
  setText("preview-body", current.body);
}

function showWaitlistFeedback(message, tone) {
  if (!waitlistFeedback) {
    return;
  }

  waitlistFeedback.textContent = message;
  waitlistFeedback.classList.toggle("is-visible", Boolean(message));
  waitlistFeedback.classList.toggle("is-error", tone === "error");
  waitlistFeedback.classList.toggle("is-success", tone !== "error");
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }

  node.textContent = value;
}

function resolveAcquisitionSource() {
  const querySource = normalizeSource(urlParams.get("source"));
  const savedSource = normalizeSource(window.localStorage.getItem(ACQUISITION_SOURCE_KEY));
  const nextSource = querySource || savedSource || "launch-direct";
  window.localStorage.setItem(ACQUISITION_SOURCE_KEY, nextSource);
  return nextSource;
}

function normalizeSource(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 40);
}

function appendSourceToPath(path, source) {
  const [basePath, hashPart = ""] = String(path || "/").split("#");
  const url = new URL(basePath || "/", window.location.origin);
  if (source) {
    url.searchParams.set("source", source);
  }
  return `${url.pathname}${url.search}${hashPart ? `#${hashPart}` : ""}`;
}
