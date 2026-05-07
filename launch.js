let publicConfig = {
  appBaseUrl: "",
  contactEmail: "hola@hoysi.app",
  betaMode: true,
  billingEnabled: false,
  beta: {
    applyPath: "/api/testers/apply",
    feedbackPath: "/feedback.html",
    guidePath: "/tester-guide.html",
    applyOpen: true,
  },
  release: {
    stage: "open",
    stageLabel: "Beta oficial abierta",
    publicReady: false,
    shareUrl: "",
    appUrl: "/",
  },
  lumi: {
    mode: "local-fallback",
    model: "gpt-5-mini",
  },
};

const betaForm = document.getElementById("beta-form");
const betaFeedback = document.getElementById("beta-feedback");

initLaunch();

async function initLaunch() {
  await loadPublicConfig();
  hydrateReleaseState();
  wireBetaForm();
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

function wireBetaForm() {
  if (!betaForm) {
    return;
  }

  if (!publicConfig.beta.applyOpen) {
    const submitButton = betaForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Postulaciones pausadas";
    }
    showFeedback("Las postulaciones estan pausadas por ahora. Puedes volver pronto o escribirnos.");
    return;
  }

  betaForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(betaForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      whatsapp: String(formData.get("whatsapp") || "").trim(),
      profile: String(formData.get("profile") || "").trim(),
      biggestPain: String(formData.get("biggestPain") || "").trim(),
      source: "launch-beta",
    };

    const submitButton = betaForm.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "Quiero entrar a la beta";

    if (!payload.email) {
      showFeedback("Necesito tu correo para postularte a la beta.");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Guardando...";
    }

    try {
      const response = await fetch(publicConfig.beta.applyPath || "/api/testers/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "No pude guardarte en la beta.");
      }

      betaForm.reset();
      showFeedback(result?.message || "Ya te guardamos para esta ronda beta.");
    } catch (error) {
      showFeedback(error?.message || "No pude guardarte ahora mismo.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

function hydrateReleaseState() {
  setText("beta-stage-value", publicConfig.release.stageLabel || "Beta oficial abierta");
  setText(
    "beta-cost-value",
    publicConfig.billingEnabled ? "Cobro opcional listo si activas Pro" : "Sin cobro en esta ronda beta",
  );
  setText(
    "beta-lumi-value",
    publicConfig.lumi.mode === "openai"
      ? `IA real con ${publicConfig.lumi.model || "OpenAI"}`
      : "Lumi listo con fallback local",
  );

  const contactEmail = publicConfig.contactEmail || "hola@hoysi.app";
  setText("beta-contact-value", contactEmail);

  const contactLink = document.getElementById("beta-contact-link");
  if (contactLink) {
    contactLink.href = `mailto:${contactEmail}`;
    contactLink.textContent = contactEmail;
  }
}

function showFeedback(message) {
  if (!betaFeedback) {
    return;
  }

  betaFeedback.textContent = message;
  betaFeedback.classList.add("is-visible");
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }

  node.textContent = value;
}
