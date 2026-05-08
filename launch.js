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

const waitlistForm = document.getElementById("waitlist-form");
const waitlistFeedback = document.getElementById("waitlist-feedback");
const previewTabs = Array.from(document.querySelectorAll("[data-preview-key]"));
const previewShots = Array.from(document.querySelectorAll("[data-preview-panel]"));
const supportsHover = window.matchMedia("(hover: hover)").matches;

let activePreview = "home";

initLaunch();

async function initLaunch() {
  await loadPublicConfig();
  hydrateLaunchMeta();
  wireWaitlistForm();
  wirePreviewTabs();
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
      source: "launch-beta-minimal",
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
