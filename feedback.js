const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

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
      source: "feedback-page",
    };

    const submitButton = feedbackForm.querySelector("button[type='submit']");
    const originalText = submitButton?.textContent || "Enviar feedback";

    if (!payload.message) {
      setFeedbackStatus("Necesito que nos cuentes que paso o que te confundio.");
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
      setFeedbackStatus(result?.message || "Tu feedback ya quedo guardado.");
    } catch (error) {
      setFeedbackStatus(error?.message || "No pude guardar tu feedback ahora mismo.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  });
}

function setFeedbackStatus(message) {
  if (!feedbackStatus) {
    return;
  }

  feedbackStatus.textContent = message;
  feedbackStatus.classList.add("is-visible");
}
