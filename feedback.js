const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");
const trackedLinks = Array.from(document.querySelectorAll("[data-track-link]"));
const FEEDBACK_SOURCE_KEY = "hoysi-beta-source";
const currentSource = resolveSource();

hydrateTrackedLinks();

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(feedbackForm);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      area: String(formData.get("area") || "general").trim(),
      severity: String(formData.get("severity") || "media").trim(),
      message: String(formData.get("message") || "").trim(),
      suggestion: String(formData.get("suggestion") || "").trim(),
      device: String(formData.get("device") || "").trim(),
      source: currentSource || "feedback-page",
    };

    const submitButton = feedbackForm.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "Enviar feedback";

    setFeedbackStatus("", "success");

    if (!payload.message && !payload.suggestion) {
      setFeedbackStatus("Necesito que nos cuentes que paso, o que le agregarias y por que.", "error");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "No pude guardar tu feedback.");
      }

      feedbackForm.reset();
      setFeedbackStatus(
        result?.message || "Gracias. Tu feedback ya quedo guardado y lo recibimos para revisar esta beta.",
        "success",
      );
      if (submitButton) {
        submitButton.textContent = "Enviado";
      }
    } catch (error) {
      setFeedbackStatus(error?.message || "No pude guardar tu feedback ahora mismo.", "error");
    } finally {
      window.setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        }
      }, 1200);
    }
  });
}

function setFeedbackStatus(message, tone) {
  if (!feedbackStatus) {
    return;
  }

  feedbackStatus.textContent = message;
  feedbackStatus.classList.toggle("is-visible", Boolean(message));
  feedbackStatus.classList.toggle("is-error", tone === "error");
  feedbackStatus.classList.toggle("is-success", tone !== "error");

  if (message) {
    feedbackStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function hydrateTrackedLinks() {
  trackedLinks.forEach((link) => {
    const kind = link.dataset.trackLink;
    const href = link.getAttribute("href") || "/";
    const fallbackSource = kind === "launch" ? "feedback-return" : "feedback-direct";
    link.href = appendSourceToPath(href, currentSource || fallbackSource);
  });
}

function resolveSource() {
  const params = new URLSearchParams(window.location.search);
  const querySource = normalizeSource(params.get("source"));
  const savedSource = normalizeSource(window.localStorage.getItem(FEEDBACK_SOURCE_KEY));
  const nextSource = querySource || savedSource || "feedback-page";
  window.localStorage.setItem(FEEDBACK_SOURCE_KEY, nextSource);
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
