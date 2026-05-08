const opsAccessForm = document.getElementById("ops-access-form");
const opsTokenInput = document.getElementById("ops-token-input");
const opsStatus = document.getElementById("ops-status");
const opsSummary = document.getElementById("ops-summary");
const feedbackList = document.getElementById("feedback-list");
const lumiList = document.getElementById("lumi-list");
const waitlistList = document.getElementById("waitlist-list");

const queryToken = new URLSearchParams(window.location.search).get("token") || "";
const savedToken = window.localStorage.getItem("hoysi-ops-token") || "";
let activeToken = queryToken || savedToken;
let autoLoadTimer = 0;

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

loadOpsData({ force: true });

function syncTokenFromInput({ shouldLoad = false, force = false } = {}) {
  const nextToken = String(opsTokenInput?.value || "").trim();
  const changed = nextToken !== activeToken;
  activeToken = nextToken;

  if (activeToken) {
    window.localStorage.setItem("hoysi-ops-token", activeToken);
  } else {
    window.localStorage.removeItem("hoysi-ops-token");
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
    renderFeedback(payload.feedbackEntries || []);
    renderLumiQuestions(payload.lumiQuestions || []);
    renderWaitlist(payload.waitlist || []);
    setOpsStatus("Panel cargado.");
  } catch (error) {
    renderSummary({});
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

function setOpsStatus(message) {
  if (!opsStatus) {
    return;
  }

  opsStatus.textContent = message;
  opsStatus.classList.add("is-visible");
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
