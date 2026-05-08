const launchParams = new URLSearchParams(window.location.search);
const SHOULD_BOOT = !window.__hoysiBooted && !launchParams.has("repair");
const INITIAL_SHEET_KIND = launchParams.get("sheet");
const INITIAL_VIEW = launchParams.get("view");
const INITIAL_TOUR = launchParams.get("tour");
const INITIAL_TOUR_STEP = Number.parseInt(launchParams.get("tourStep") || "0", 10);

window.__hoysiBooted = true;

const STORAGE_KEY = "hoysi-state-v3";
const LEGACY_KEYS = ["hoysi-state-v2", "hoysi-state-v1"];
const VIEW_NAMES = ["home", "flow", "receivables", "protected", "insights"];
const PROFILE_MODES = ["home", "business", "both"];
const HISTORY_FILTERS = ["all", "income", "expense"];
const GREETING_STYLES = ["warm", "push", "direct"];
const CHART_MODES = ["week", "month", "year"];
const TOUR_MODES = ["quick", "full"];
const INSTALL_LABEL = "Instalar";
const INSTALL_ENABLED = false;
const AGENT_NAME = "Lumi Lab";
const PRO_TRIAL_DAYS = 7;
const PRO_MONTHLY_PRICE = 2.99;
const PRO_YEARLY_PRICE = 24.99;
const FREE_AI_WEEKLY_LIMIT = 3;
const SALES_EMAIL = "hola@hoysi.app";
const LAUNCH_PAGE_PATH = "/launch.html#beta";
const FEEDBACK_PAGE_PATH = "/feedback.html";
const TESTER_GUIDE_PATH = "/tester-guide.html";
const ACQUISITION_SOURCE_KEY = "hoysi-beta-source";
const ACQUISITION_SOURCE = captureAcquisitionSource();

const KINDS = {
  income: {
    sheetTitle: "Registrar ingreso",
    mainLabel: "Que entro",
    mainPlaceholder: "Ej. Venta del dia",
    noteLabel: "Detalle corto",
    notePlaceholder: "Ej. Venta de ropa o pago de cliente",
    showPhone: false,
    showChannel: true,
    dateLabel: "Fecha",
    submitLabel: "Guardar ingreso",
  },
  expense: {
    sheetTitle: "Registrar salida",
    mainLabel: "En que salio",
    mainPlaceholder: "Ej. Compra de mercaderia",
    noteLabel: "Detalle corto",
    notePlaceholder: "Ej. Compra urgente o gasto del dia",
    showPhone: false,
    showChannel: true,
    dateLabel: "Fecha",
    submitLabel: "Guardar salida",
  },
  receivable: {
    sheetTitle: "Registrar cobro pendiente",
    mainLabel: "Quien te debe",
    mainPlaceholder: "Ej. Andrea",
    noteLabel: "Que te debe",
    notePlaceholder: "Ej. Uniformes, almuerzo o prestamo",
    showPhone: true,
    showChannel: false,
    phoneLabel: "WhatsApp de la persona (opcional)",
    dateLabel: "Para cuando te prometio pagar",
    submitLabel: "Guardar cobro",
  },
  saving: {
    sheetTitle: "Apartar ahorro",
    mainLabel: "Para que quieres ahorrar",
    mainPlaceholder: "Ej. Fondo de emergencia",
    noteLabel: "Detalle corto",
    notePlaceholder: "Ej. Apartado de esta semana",
    showPhone: false,
    showChannel: false,
    dateLabel: "Fecha",
    submitLabel: "Guardar ahorro",
  },
  protect: {
    sheetTitle: "Apartar un pago",
    mainLabel: "Que pago quieres apartar",
    mainPlaceholder: "Ej. Arriendo",
    noteLabel: "Detalle corto",
    notePlaceholder: "Ej. No tocar este dinero",
    showPhone: false,
    showChannel: false,
    dateLabel: "Cuando vence",
    submitLabel: "Guardar pago",
  },
};

const pocketDefinitions = [
  { id: "home", name: "Casa", tone: "home" },
  { id: "business", name: "Negocio", tone: "business" },
  { id: "shared", name: "Encargos y familia", tone: "shared" },
];

const channelLabels = {
  cash: "Efectivo",
  transfer: "Transferencia",
  whatsapp: "WhatsApp",
  qr: "QR o link",
  other: "Otro",
  saving: "Ahorro",
};

const AGENT_SUGGESTIONS = [
  "No me alcanza hoy",
  "Como cobro sin incomodar",
  "Que significa usable",
  "Que es apartar un pago",
  "Explicame flujo",
  "Como dejo de mezclar plata",
  "Cuanto me conviene ahorrar esta semana",
];

const QUICK_TOUR_STEPS = [
  {
    title: "Mira primero tu usable",
    body: "El numero grande te dice cuanto si puedes mover hoy sin tocar lo que ya apartaste para pagos.",
  },
  {
    title: "Usa la isla de accesos",
    body: "Ingreso, salida, cobro y pago estan ahi para que no tengas que pensar demasiado ni buscar menus.",
  },
  {
    title: "Flujo es tu mapa",
    body: "En Flujo ves graficas, ruta de 14 dias y escenarios para anticiparte antes de quedarte corta.",
  },
  {
    title: "El laboratorio recoge preguntas reales",
    body: "En Lab puedes dejar dudas, pedir tips o contar tu problema con tus propias palabras mientras afinamos la futura IA.",
  },
];

const FULL_TOUR_STEPS = [
  {
    view: "home",
    selector: "#home-hero",
    title: "Aqui empieza tu revision de finanzas",
    body: "Este numero te dice cuanto si puedes mover hoy. Mira esto antes de gastar.",
    note: "Si un dia solo revisas una cosa, revisa esta.",
  },
  {
    view: "home",
    selector: "#home-review-section",
    title: "Aqui registras sin enredarte",
    body: "Aqui anotas lo importante rapido: lo que entro, salio, te deben, ahorras o apartas para pagar.",
    note: "Pago no es transferir. Es separar visualmente plata que no quieres tocar.",
  },
  {
    view: "home",
    selector: "#home-reminders",
    title: "Aqui la app te refresca la memoria",
    body: "Aqui veras que conviene atender primero: cobros, pagos o ahorro.",
    note: "Si no hay urgencias, el laboratorio te deja recomendaciones simples para seguir probando.",
  },
  {
    view: "flow",
    selector: "#flow-chart-section",
    title: "Flujo te muestra la pelicula, no solo la foto",
    body: "Aqui entiendes como se mueve tu dinero en el tiempo para anticiparte.",
    note: "Si ves bajada fuerte, toca cobrar, frenar salidas o apartar mejor pagos.",
  },
  {
    view: "receivables",
    selector: "#receivables-panel",
    title: "Cobros es para recuperar plata que ya es tuya",
    body: "Aqui dejas visibles los pendientes para cobrar sin depender de tu memoria.",
    note: "Muchas veces el mejor ingreso del dia es cobrar mejor, no vender mas.",
  },
  {
    view: "protected",
    selector: "#protected-panel",
    title: "Pagos te ayuda a no gastar lo que ya tenia destino",
    body: "Aqui ves la plata que ya tenia destino para que no te confundas al gastar.",
    note: "Cuando pagas algo, lo marcas y tu usable queda limpio otra vez.",
  },
  {
    view: "insights",
    selector: "#ai-panel",
    title: "El laboratorio de preguntas esta en prueba",
    body: "Aqui puedes dejar preguntas reales: terminos, cobros, ahorro o que mover primero. Las guardamos para entrenar respuestas mejores.",
    note: "Habla como hablas normalmente. No hace falta escribir tecnico.",
  },
  {
    view: "home",
    selector: "#open-settings-button",
    title: "En configuracion dejas la app a tu estilo",
    body: "Desde el engrane cambias la app a tu gusto y puedes repetir este tutorial cuando quieras.",
    note: "Si quieres ver mejor o leer mas facil, aqui se ajusta.",
  },
];

const state = loadState();
let activeView = "home";
let activeKind = "income";
let historyFilter = "all";
let assistantTopic = "overview";
let setupOpen = !state.profile.setupComplete;
let settingsOpen = false;
let tourOpen = false;
let tourMode = "menu";
let tourStep = 0;
let aiDraft = "";
let aiPending = false;
let aiError = "";
let aiExchange = {
  prompt: "",
  title: "",
  body: "",
  tips: [],
};
let installPromptEvent = null;
let toastTimer = null;
let currentMembership = null;

const elements = {
  appShell: document.querySelector(".app-shell"),
  headerGreeting: document.getElementById("header-greeting"),
  homeContent: document.getElementById("home-content"),
  flowContent: document.getElementById("flow-content"),
  receivablesContent: document.getElementById("receivables-content"),
  protectedContent: document.getElementById("protected-content"),
  insightsContent: document.getElementById("insights-content"),
  navItems: Array.from(document.querySelectorAll(".nav-item")),
  views: Array.from(document.querySelectorAll(".view")),
  openSheetButton: document.getElementById("open-sheet-button"),
  openSettingsButton: document.getElementById("open-settings-button"),
  installButton: document.getElementById("install-button"),
  closeSheetButton: document.getElementById("close-sheet-button"),
  cancelSheetButton: document.getElementById("cancel-sheet-button"),
  closeGoalButton: document.getElementById("close-goal-button"),
  cancelGoalSheetButton: document.getElementById("cancel-goal-sheet-button"),
  sheetBackdrop: document.getElementById("sheet-backdrop"),
  entrySheet: document.getElementById("entry-sheet"),
  goalSheet: document.getElementById("goal-sheet"),
  form: document.getElementById("entry-form"),
  goalForm: document.getElementById("goal-form"),
  sheetTitle: document.getElementById("sheet-title"),
  mainLabel: document.getElementById("main-label"),
  mainInput: document.getElementById("main-input"),
  noteLabel: document.getElementById("note-label"),
  submitButton: document.getElementById("submit-button"),
  phoneField: document.getElementById("phone-field"),
  phoneLabel: document.getElementById("phone-label"),
  channelField: document.getElementById("channel-field"),
  dateLabel: document.getElementById("date-label"),
  dateInput: document.getElementById("date-input"),
  pocketSelect: document.getElementById("pocket-select"),
  goalPocketSelect: document.getElementById("goal-pocket-select"),
  goalDateInput: document.getElementById("goal-date-input"),
  goalTitleInput: document.getElementById("goal-title-input"),
  kindSwitch: document.getElementById("kind-switch"),
  setupOverlay: document.getElementById("setup-overlay"),
  setupContent: document.getElementById("setup-content"),
  settingsOverlay: document.getElementById("settings-overlay"),
  settingsContent: document.getElementById("settings-content"),
  tourOverlay: document.getElementById("tour-overlay"),
  tourContent: document.getElementById("tour-content"),
  importInput: document.getElementById("import-input"),
  toast: document.getElementById("toast"),
  noteInput: document.querySelector('#entry-form textarea[name="note"]'),
  phoneInput: document.querySelector('#entry-form input[name="phone"]'),
  channelSelect: document.querySelector('#entry-form select[name="channel"]'),
};

if (SHOULD_BOOT) {
  init();
}

function init() {
  applyLaunchFlags();
  hydratePocketOptions();
  wireEvents();
  setupTouchFeedback();
  syncKindUI();
  updateInstallButton();
  persistState();
  render();
  if (launchParams.get("billing") === "success") {
    window.setTimeout(() => {
      showToast("Tu acceso ampliado ya esta activo en este navegador.");
    }, 120);
  }
  if (VIEW_NAMES.includes(INITIAL_VIEW)) {
    switchView(INITIAL_VIEW);
  }
  if (state.profile.setupComplete && KINDS[INITIAL_SHEET_KIND]) {
    openEntrySheet(INITIAL_SHEET_KIND);
  }
  if (INITIAL_TOUR === "menu") {
    openTourMenu();
  } else if (TOUR_MODES.includes(INITIAL_TOUR)) {
    tourMode = INITIAL_TOUR;
    tourStep = Number.isFinite(INITIAL_TOUR_STEP) ? Math.max(0, INITIAL_TOUR_STEP) : 0;
    tourOpen = true;
    render();
  } else {
    maybeOpenTourOnBoot();
  }
  registerServiceWorker();
}

function applyLaunchFlags() {
  const params = new URLSearchParams(window.location.search);
  let changed = false;

  if (params.get("static") === "1") {
    document.documentElement.classList.add("qa-static");
  }

  if (params.get("lite") === "1") {
    document.documentElement.classList.add("lite-mode");
  }

  if (params.get("demo") === "1") {
    const demoState = createDemoState();
    demoState.billing = normalizeBilling(state.billing);
    replaceState(demoState);
    setupOpen = false;
    historyFilter = "all";
    changed = true;
  } else if (params.get("fresh") === "1") {
    const freshState = createEmptyState();
    freshState.billing = normalizeBilling(state.billing);
    replaceState(freshState);
    setupOpen = true;
    historyFilter = "all";
    changed = true;
  }

  if (!changed) {
    return;
  }

  const cleanUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, "", cleanUrl);
}

function hydratePocketOptions() {
  const options = pocketDefinitions
    .map((pocket) => `<option value="${pocket.id}">${pocket.name}</option>`)
    .join("");

  elements.pocketSelect.innerHTML = options;
  elements.goalPocketSelect.innerHTML = options;
}

function wireEvents() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => switchView(item.dataset.target));
  });

  elements.openSheetButton.addEventListener("click", () => {
    if (!state.profile.setupComplete) {
      openSetup();
      return;
    }
    openEntrySheet("income");
  });
  elements.openSettingsButton.addEventListener("click", openSettings);

  if (elements.installButton) {
    elements.installButton.addEventListener("click", installApp);
  }
  elements.closeSheetButton.addEventListener("click", closeEntrySheet);
  elements.cancelSheetButton.addEventListener("click", closeEntrySheet);
  elements.closeGoalButton.addEventListener("click", closeGoalSheet);
  elements.cancelGoalSheetButton.addEventListener("click", closeGoalSheet);
  elements.sheetBackdrop.addEventListener("click", closeAllSheets);

  elements.kindSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kind]");
    if (!button) {
      return;
    }

    activeKind = button.dataset.kind;
    syncKindUI();
  });

  elements.form.addEventListener("submit", handleEntrySubmit);
  elements.goalForm.addEventListener("submit", handleGoalSubmit);
  elements.setupOverlay.addEventListener("submit", handleSetupSubmit);
  elements.setupOverlay.addEventListener("click", handleSetupClick);
  elements.settingsOverlay.addEventListener("click", handleSettingsClick);
  elements.settingsOverlay.addEventListener("change", handleSettingsChange);
  elements.settingsOverlay.addEventListener("submit", handleSettingsSubmit);
  elements.tourOverlay.addEventListener("click", handleTourClick);

  [
    elements.homeContent,
    elements.flowContent,
    elements.receivablesContent,
    elements.protectedContent,
    elements.insightsContent,
  ].forEach((container) => {
    container.addEventListener("click", handleActionClick);
    container.addEventListener("change", handleDynamicChange);
  });

  elements.insightsContent.addEventListener("submit", handleAiSubmit);

  elements.importInput.addEventListener("change", handleImportChange);

  if (INSTALL_ENABLED) {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      installPromptEvent = event;
      updateInstallButton();
    });

    window.addEventListener("appinstalled", () => {
      installPromptEvent = null;
      updateInstallButton();
      showToast("HoySi ya quedo instalada.");
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!elements.goalSheet.classList.contains("hidden")) {
        closeGoalSheet();
        return;
      }

      if (!elements.entrySheet.classList.contains("hidden")) {
        closeEntrySheet();
        return;
      }

      if (tourOpen) {
        closeTour(true);
        return;
      }

      if (settingsOpen) {
        closeSettings();
        return;
      }

      if (setupOpen && state.profile.setupComplete) {
        closeSetup();
      }
    }
  });
}

function switchView(view) {
  if (!VIEW_NAMES.includes(view)) {
    return;
  }

  activeView = view;

  elements.views.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.target === view);
  });

  window.scrollTo({ top: 0, behavior: "auto" });
}

function openEntrySheet(kind = "income") {
  if (!state.profile.setupComplete) {
    openSetup();
    return;
  }

  activeKind = kind;
  syncKindUI();
  elements.form.reset();
  elements.entrySheet.scrollTop = 0;
  elements.kindSwitch.scrollLeft = 0;
  elements.dateInput.value = isoToday();
  elements.pocketSelect.value = defaultPocketForKind(kind, state.profile.mode);
  elements.entrySheet.classList.remove("hidden");
  updateSheetBackdrop();
  window.setTimeout(() => elements.mainInput.focus(), 40);
}

function closeEntrySheet() {
  elements.entrySheet.classList.add("hidden");
  updateSheetBackdrop();
}

function openGoalSheet() {
  elements.goalForm.reset();
  elements.goalSheet.scrollTop = 0;
  elements.goalPocketSelect.value = defaultPocketForKind("protect", state.profile.mode);
  elements.goalDateInput.value = isoPlusDays(30);
  elements.goalSheet.classList.remove("hidden");
  updateSheetBackdrop();
  window.setTimeout(() => elements.goalTitleInput.focus(), 40);
}

function closeGoalSheet() {
  elements.goalSheet.classList.add("hidden");
  updateSheetBackdrop();
}

function closeAllSheets() {
  closeEntrySheet();
  closeGoalSheet();
}

function updateSheetBackdrop() {
  const anySheetOpen =
    !elements.entrySheet.classList.contains("hidden") ||
    !elements.goalSheet.classList.contains("hidden");
  elements.sheetBackdrop.classList.toggle("hidden", !anySheetOpen);
  document.body.classList.toggle("sheet-mode", anySheetOpen);
}

function syncKindUI() {
  const config = KINDS[activeKind];
  elements.sheetTitle.textContent = config.sheetTitle;
  elements.mainLabel.textContent = config.mainLabel;
  elements.mainInput.placeholder = config.mainPlaceholder;
  elements.noteLabel.textContent = config.noteLabel;
  elements.noteInput.placeholder = config.notePlaceholder || "Solo lo minimo para recordar";
  elements.submitButton.textContent = config.submitLabel;
  elements.dateLabel.textContent = config.dateLabel;
  elements.phoneField.classList.toggle("hidden", !config.showPhone);
  elements.channelField.classList.toggle("hidden", !config.showChannel);
  elements.phoneLabel.textContent = config.phoneLabel || "WhatsApp de la persona";
  elements.phoneInput.disabled = !config.showPhone;
  elements.channelSelect.disabled = !config.showChannel;

  if (!config.showPhone) {
    elements.phoneInput.value = "";
  }

  elements.kindSwitch.querySelectorAll("[data-kind]").forEach((button) => {
    button.classList.toggle("active", button.dataset.kind === activeKind);
  });

  const activeButton = elements.kindSwitch.querySelector(`[data-kind="${activeKind}"]`);
  if (activeButton && !elements.entrySheet.classList.contains("hidden")) {
    window.requestAnimationFrame(() => {
      activeButton.scrollIntoView({ block: "nearest", inline: "center" });
    });
  }
}

function handleEntrySubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const amount = toNumber(formData.get("amount"));
  const title = String(formData.get("title") || "").trim();
  const pocket = normalizePocket(formData.get("pocket"));
  const date = validIsoDate(formData.get("date")) ? String(formData.get("date")) : isoToday();
  const note = String(formData.get("note") || "").trim();
  const phone = sanitizePhone(String(formData.get("phone") || ""));
  const channel = String(formData.get("channel") || "cash");

  if (!title || amount <= 0) {
    showToast("Completa al menos nombre y monto.");
    return;
  }

  if (activeKind === "income" || activeKind === "expense" || activeKind === "saving") {
    state.transactions.unshift({
      id: uid("txn"),
      type: activeKind,
      title,
      amount,
      pocket,
      channel: activeKind === "saving" ? "saving" : channel,
      date,
      note,
    });
  } else if (activeKind === "receivable") {
    state.receivables.unshift({
      id: uid("rec"),
      person: title,
      amount,
      pocket,
      dueDate: date,
      note,
      phone,
      status: "pending",
      remindersCount: 0,
      lastReminderAt: "",
      createdAt: new Date().toISOString(),
    });
  } else if (activeKind === "protect") {
    state.protectedItems.unshift({
      id: uid("pro"),
      title,
      amount,
      pocket,
      dueDate: date,
      note,
      status: "active",
      createdAt: new Date().toISOString(),
    });
  }

  persistState();
  render();
  closeEntrySheet();
  showToast("Movimiento guardado.");
}

function handleGoalSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.goalForm);
  const title = String(formData.get("title") || "").trim();
  const target = toNumber(formData.get("target"));
  const current = toNumber(formData.get("current"));
  const pocket = normalizePocket(formData.get("pocket"));
  const dueDate = validIsoDate(formData.get("dueDate")) ? String(formData.get("dueDate")) : isoPlusDays(30);
  const note = String(formData.get("note") || "").trim();

  if (!title || target <= 0 || current < 0 || current > target) {
    showToast("Revisa la meta, el monto y el avance.");
    return;
  }

  state.goals.unshift({
    id: uid("goal"),
    title,
    target,
    current,
    pocket,
    dueDate,
    note,
    status: current >= target ? "done" : "active",
    createdAt: new Date().toISOString(),
  });

  persistState();
  render();
  closeGoalSheet();
  showToast("Meta guardada.");
}

function handleSetupSubmit(event) {
  const form = event.target.closest("#setup-form");
  if (!form) {
    return;
  }

  event.preventDefault();

  const formData = new FormData(form);
  const draft = {
    name: String(formData.get("name") || "").trim(),
    mode: normalizeMode(formData.get("mode")),
    homeStart: toNumber(formData.get("homeStart")),
    businessStart: toNumber(formData.get("businessStart")),
    sharedStart: toNumber(formData.get("sharedStart")),
    paymentTitle: String(formData.get("paymentTitle") || "").trim(),
    paymentAmount: toNumber(formData.get("paymentAmount")),
    paymentPocket: normalizePocket(formData.get("paymentPocket")),
    paymentDate: validIsoDate(formData.get("paymentDate")) ? String(formData.get("paymentDate")) : isoPlusDays(5),
    paymentNote: String(formData.get("paymentNote") || "").trim(),
  };

  const next = buildStateFromSetup(draft);
  replaceState(next);
  setupOpen = false;
  historyFilter = "all";
  persistState();
  render();
  switchView("home");
  showToast("Configuracion guardada.");
}

function handleSetupClick(event) {
  const button = event.target.closest("[data-setup-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.setupAction;

  if (action === "cancel") {
    closeSetup();
    return;
  }

  if (action === "demo") {
    const demoState = createDemoState();
    demoState.billing = normalizeBilling(state.billing);
    replaceState(demoState);
    setupOpen = false;
    historyFilter = "all";
    persistState();
    render();
    showToast("Demo cargada.");
  }
}

function handleActionClick(event) {
  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const { action, id, kind, target, filter, topic } = button.dataset;

  if (action === "open-sheet") {
    openEntrySheet(kind);
    return;
  }

  if (action === "open-goal-sheet") {
    openGoalSheet();
    return;
  }

  if (action === "go-view") {
    switchView(target);
    return;
  }

  if (action === "set-history-filter") {
    if (HISTORY_FILTERS.includes(filter)) {
      historyFilter = filter;
      render();
    }
    return;
  }

  if (action === "set-ai-topic") {
    assistantTopic = topic || "overview";
    aiPending = false;
    aiError = "";
    aiExchange = {
      prompt: "",
      title: "",
      body: "",
      tips: [],
    };
    render();
    return;
  }

  if (action === "ask-ai-prompt") {
    const promptText = String(button.dataset.prompt || "").trim();
    if (!promptText) {
      return;
    }

    submitAiQuestion(promptText);
    return;
  }

  if (action === "open-settings") {
    openSettings();
    return;
  }

  if (action === "start-trial") {
    startFreeTrial();
    return;
  }

  if (action === "open-launch") {
    openLaunchPage();
    return;
  }

  if (action === "open-feedback") {
    openFeedbackPage();
    return;
  }

  if (action === "open-tester-guide") {
    openTesterGuide();
    return;
  }

  if (action === "replay-tour") {
    openTourMenu();
    return;
  }

  if (action === "set-greeting-style") {
    state.profile.greetingStyle = normalizeGreetingStyle(button.dataset.style);
    persistState();
    render();
    showToast("Saludo actualizado.");
    return;
  }

  if (action === "toggle-vibration") {
    state.profile.vibrationEnabled = !state.profile.vibrationEnabled;
    persistState();
    render();
    showToast(state.profile.vibrationEnabled ? "Vibracion activada." : "Vibracion desactivada.");
    return;
  }

  if (action === "toggle-motion") {
    state.profile.motionEnabled = !state.profile.motionEnabled;
    persistState();
    render();
    showToast(state.profile.motionEnabled ? "Animaciones activadas." : "Animaciones suaves desactivadas.");
    return;
  }

  if (action === "set-chart-mode") {
    applyChartMode(button.dataset.mode);
    persistState();
    render();
    return;
  }

  if (action === "remind") {
    remindReceivable(id);
    return;
  }

  if (action === "collect") {
    collectReceivable(id);
    return;
  }

  if (action === "pay") {
    markProtectedPaid(id);
    return;
  }

  if (action === "boost-goal") {
    boostGoal(id);
    return;
  }

  if (action === "delete-transaction") {
    deleteTransaction(id);
    return;
  }

  if (action === "delete-receivable") {
    deleteReceivable(id);
    return;
  }

  if (action === "delete-protected") {
    deleteProtected(id);
    return;
  }

  if (action === "delete-goal") {
    deleteGoal(id);
    return;
  }

  if (action === "start-setup") {
    openSetup();
    return;
  }

  if (action === "reset-demo") {
    const demoState = createDemoState();
    demoState.billing = normalizeBilling(state.billing);
    replaceState(demoState);
    setupOpen = false;
    historyFilter = "all";
    persistState();
    render();
    showToast("Demo cargada.");
    return;
  }

  if (action === "export-backup") {
    if (!currentMembership?.hasBackups) {
      showToast("Los respaldos completos se abren con el acceso beta ampliado.");
      openSettings();
      return;
    }
    exportBackup();
    return;
  }

  if (action === "import-backup") {
    if (!currentMembership?.hasBackups) {
      showToast("Importar respaldo se abre con el acceso beta ampliado.");
      openSettings();
      return;
    }
    elements.importInput.click();
    return;
  }

  if (action === "install-app") {
    installApp();
  }
}

function handleDynamicChange(event) {
  const target = event.target;

  if (target.id === "personal-name-input") {
    state.profile.name = String(target.value || "").trim().slice(0, 28);
    persistState();
    render();
    return;
  }

  if (target.id === "chart-start-input" || target.id === "chart-end-input") {
    if (!currentMembership?.hasAdvancedCharts) {
      showToast("El rango libre por fechas se abre con la beta ampliada.");
      render();
      return;
    }

    const value = validIsoDate(target.value) ? target.value : null;
    if (!value) {
      return;
    }

    if (target.id === "chart-start-input") {
      state.profile.chartStartDate = value;
    } else {
      state.profile.chartEndDate = value;
    }

    const normalizedRange = normalizeDateRange(
      state.profile.chartStartDate,
      state.profile.chartEndDate,
      state.profile.chartMode,
    );
    state.profile.chartStartDate = normalizedRange.start;
    state.profile.chartEndDate = normalizedRange.end;
    persistState();
    render();
  }
}

function handleImportChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      const next = normalizeState(parsed);
      replaceState(next);
      setupOpen = !state.profile.setupComplete;
      historyFilter = "all";
      persistState();
      render();
      showToast("Respaldo importado.");
    } catch (error) {
      showToast("No pude leer ese respaldo.");
    } finally {
      elements.importInput.value = "";
    }
  };
  reader.readAsText(file);
}

function remindReceivable(id) {
  const item = state.receivables.find((entry) => entry.id === id && entry.status === "pending");
  if (!item) {
    return;
  }

  item.remindersCount = Number(item.remindersCount || 0) + 1;
  item.lastReminderAt = new Date().toISOString();
  persistState();

  const message = `Hola ${item.person}, te escribo para recordarte ${formatMoney(item.amount)}${item.note ? ` por ${item.note}` : ""}. Si hoy puedes transferirme, me ayudas un monton. Gracias.`;
  const url = item.phone
    ? `https://wa.me/${item.phone}?text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank", "noopener");
  render();
  showToast("Recordatorio abierto en WhatsApp.");
}

function collectReceivable(id) {
  const item = state.receivables.find((entry) => entry.id === id && entry.status === "pending");
  if (!item) {
    return;
  }

  item.status = "collected";
  state.transactions.unshift({
    id: uid("txn"),
    type: "income",
    title: `Cobro: ${item.person}`,
    amount: item.amount,
    pocket: item.pocket,
    channel: "whatsapp",
    date: isoToday(),
    note: item.note || "Cobro pendiente recuperado",
  });

  persistState();
  render();
  showToast("Cobro marcado como recibido.");
}

function markProtectedPaid(id) {
  const item = state.protectedItems.find((entry) => entry.id === id && entry.status === "active");
  if (!item) {
    return;
  }

  item.status = "paid";
  state.transactions.unshift({
    id: uid("txn"),
    type: "expense",
    title: item.title,
    amount: item.amount,
    pocket: item.pocket,
    channel: "transfer",
    date: isoToday(),
    note: item.note || "Pago apartado cubierto",
  });

  persistState();
  render();
  showToast("Pago marcado como cubierto.");
}

function boostGoal(id) {
  const item = state.goals.find((entry) => entry.id === id && entry.status === "active");
  if (!item) {
    return;
  }

  const answer = window.prompt(`Cuanto quieres sumar a ${item.title}?`, "10");
  if (answer === null) {
    return;
  }

  const amount = toNumber(answer);
  if (amount <= 0) {
    showToast("Ese avance no me sirve.");
    return;
  }

  item.current = roundMoney(Math.min(item.current + amount, item.target));
  item.status = item.current >= item.target ? "done" : "active";
  state.transactions.unshift({
    id: uid("txn"),
    type: "expense",
    title: `Aporte a meta: ${item.title}`,
    amount,
    pocket: item.pocket,
    channel: "other",
    date: isoToday(),
    note: "Ahorro intencional",
  });

  persistState();
  render();
  showToast(item.status === "done" ? "Meta completada." : "Meta actualizada.");
}

function deleteTransaction(id) {
  const item = state.transactions.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  if (!window.confirm(`Eliminar ${item.title} por ${formatMoney(item.amount)}?`)) {
    return;
  }

  state.transactions = state.transactions.filter((entry) => entry.id !== id);
  persistState();
  render();
  showToast("Movimiento eliminado.");
}

function deleteReceivable(id) {
  const item = state.receivables.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  if (!window.confirm(`Quitar el pendiente de ${item.person}?`)) {
    return;
  }

  state.receivables = state.receivables.filter((entry) => entry.id !== id);
  persistState();
  render();
  showToast("Cobro eliminado.");
}

function deleteProtected(id) {
  const item = state.protectedItems.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  if (!window.confirm(`Quitar ${item.title} de pagos apartados?`)) {
    return;
  }

  state.protectedItems = state.protectedItems.filter((entry) => entry.id !== id);
  persistState();
  render();
  showToast("Pago apartado eliminado.");
}

function deleteGoal(id) {
  const item = state.goals.find((entry) => entry.id === id);
  if (!item) {
    return;
  }

  if (!window.confirm(`Quitar la meta ${item.title}?`)) {
    return;
  }

  state.goals = state.goals.filter((entry) => entry.id !== id);
  persistState();
  render();
  showToast("Meta eliminada.");
}

function openSetup() {
  settingsOpen = false;
  tourOpen = false;
  closeAllSheets();
  setupOpen = true;
  render();
}

function closeSetup() {
  if (!state.profile.setupComplete) {
    return;
  }

  setupOpen = false;
  render();
}

function openSettings() {
  if (!state.profile.setupComplete) {
    openSetup();
    return;
  }

  setupOpen = false;
  tourOpen = false;
  closeAllSheets();
  settingsOpen = true;
  render();
}

function closeSettings() {
  settingsOpen = false;
  render();
}

function maybeOpenTourOnBoot() {
  if (launchParams.has("sheet") || launchParams.has("view") || launchParams.get("repair") === "1") {
    return;
  }

  if (state.profile.tourSeen) {
    return;
  }

  openTourMenu();
}

function openTourMenu() {
  settingsOpen = false;
  closeAllSheets();
  setupOpen = false;
  clearTourTarget();
  tourMode = "menu";
  tourStep = 0;
  tourOpen = true;
  render();
}

function startTour(mode) {
  settingsOpen = false;
  closeAllSheets();
  setupOpen = false;
  tourMode = TOUR_MODES.includes(mode) ? mode : "quick";
  tourStep = 0;
  tourOpen = true;
  render();
}

function closeTour(markSeen = true) {
  tourOpen = false;
  tourMode = "menu";
  tourStep = 0;
  clearTourTarget();

  if (markSeen) {
    state.profile.tourSeen = true;
    persistState();
  }

  if (!state.profile.setupComplete) {
    setupOpen = true;
  }

  render();
}

function getTourSteps(mode = tourMode) {
  return mode === "full" ? FULL_TOUR_STEPS : QUICK_TOUR_STEPS;
}

function getCurrentTourStep() {
  const steps = getTourSteps();
  return steps[tourStep] || steps[0] || null;
}

function clearTourTarget() {
  document.documentElement.classList.remove("guided-tour-active");
  document.querySelectorAll(".tour-target-active").forEach((node) => {
    node.classList.remove("tour-target-active");
  });
}

function syncGuidedTourStep() {
  clearTourTarget();

  if (!tourOpen || tourMode !== "full") {
    elements.tourOverlay.classList.remove("guided-tour-overlay");
    return;
  }

  const step = getCurrentTourStep();
  elements.tourOverlay.classList.add("guided-tour-overlay");
  document.documentElement.classList.add("guided-tour-active");

  if (!step) {
    return;
  }

  if (step.view && activeView !== step.view) {
    switchView(step.view);
  }

  window.requestAnimationFrame(() => {
    const target = step.selector ? document.querySelector(step.selector) : null;
    if (!target) {
      return;
    }

    target.classList.add("tour-target-active");
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  });
}

function handleSettingsClick(event) {
  if (event.target === elements.settingsOverlay) {
    closeSettings();
    return;
  }

  const button = event.target.closest("[data-settings-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.settingsAction;

  if (action === "close") {
    closeSettings();
    return;
  }

  if (action === "set-greeting-style") {
    state.profile.greetingStyle = normalizeGreetingStyle(button.dataset.style);
    persistState();
    render();
    showToast("Saludo actualizado.");
    return;
  }

  if (action === "toggle-dark-mode") {
    state.profile.darkMode = state.profile.darkMode !== true;
    persistState();
    render();
    showToast(state.profile.darkMode ? "Modo oscuro activado." : "Modo oscuro desactivado.");
    return;
  }

  if (action === "toggle-motion") {
    state.profile.motionEnabled = !state.profile.motionEnabled;
    persistState();
    render();
    showToast(state.profile.motionEnabled ? "Animaciones activadas." : "Animaciones pausadas.");
    return;
  }

  if (action === "toggle-vibration") {
    state.profile.vibrationEnabled = !state.profile.vibrationEnabled;
    persistState();
    render();
    showToast(state.profile.vibrationEnabled ? "Vibracion activada." : "Vibracion pausada.");
    return;
  }

  if (action === "toggle-large-text") {
    state.profile.largeText = state.profile.largeText !== true;
    persistState();
    render();
    showToast(state.profile.largeText ? "Texto grande activado." : "Texto grande desactivado.");
    return;
  }

  if (action === "open-tour-full") {
    startTour("full");
    return;
  }

  if (action === "start-trial") {
    startFreeTrial();
    return;
  }

  if (action === "open-launch") {
    openLaunchPage();
    return;
  }

  if (action === "open-feedback") {
    openFeedbackPage();
    return;
  }

  if (action === "open-tester-guide") {
    openTesterGuide();
    return;
  }

  if (action === "open-tour-quick") {
    startTour("quick");
    return;
  }

  if (action === "export-backup") {
    if (!currentMembership?.hasBackups) {
      showToast("Los respaldos completos se abren con el acceso beta ampliado.");
      return;
    }
    exportBackup();
    return;
  }

  if (action === "import-backup") {
    if (!currentMembership?.hasBackups) {
      showToast("Importar respaldo se abre con el acceso beta ampliado.");
      return;
    }
    elements.importInput.click();
    return;
  }

  if (action === "start-setup") {
    openSetup();
    return;
  }

  if (action === "reset-demo") {
    const demoState = createDemoState();
    demoState.billing = normalizeBilling(state.billing);
    replaceState(demoState);
    settingsOpen = false;
    setupOpen = false;
    historyFilter = "all";
    assistantTopic = "overview";
    aiExchange = {
      prompt: "",
      title: "",
      body: "",
      tips: [],
    };
    persistState();
    render();
    showToast("Demo cargada.");
  }
}

function handleSettingsChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.id === "settings-name-input") {
    state.profile.name = String(target.value || "").trim().slice(0, 28);
    persistState();
    render();
  }
}

function handleSettingsSubmit(event) {
  const form = event.target.closest("#settings-form");
  if (!form) {
    return;
  }

  event.preventDefault();
}

function handleTourClick(event) {
  if (event.target === elements.tourOverlay) {
    closeTour(true);
    return;
  }

  const button = event.target.closest("[data-tour-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.tourAction;
  const steps = tourMode === "full" ? FULL_TOUR_STEPS : QUICK_TOUR_STEPS;

  if (action === "start-full") {
    startTour("full");
    return;
  }

  if (action === "start-quick") {
    startTour("quick");
    return;
  }

  if (action === "skip" || action === "finish") {
    closeTour(true);
    return;
  }

  if (action === "menu") {
    openTourMenu();
    return;
  }

  if (action === "back") {
    tourStep = Math.max(tourStep - 1, 0);
    render();
    return;
  }

  if (action === "next") {
    tourStep = Math.min(tourStep + 1, steps.length - 1);
    render();
  }
}

function handleAiSubmit(event) {
  const form = event.target.closest("#ai-form");
  if (!form) {
    return;
  }

  event.preventDefault();

  const formData = new FormData(form);
  const promptText = String(formData.get("question") || "").trim();

  if (!promptText) {
    showToast("Escribe tu duda y la guardamos en el laboratorio.");
    return;
  }

  submitAiQuestion(promptText);
}

async function submitAiQuestion(promptText) {
  syncMembershipState();
  const data = computeDashboardState();
  aiDraft = promptText;
  aiPending = true;
  aiError = "";
  aiExchange = {
    prompt: promptText,
    title: "",
    body: "Estoy mirando tus numeros un momento para responderte claro.",
    tips: [],
  };
  render();

  try {
    const response = await fetch("/api/lumi-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptText,
        financeContext: buildAiFinanceContext(data),
        source: ACQUISITION_SOURCE ? `lab-${ACQUISITION_SOURCE}` : "in-app-lab",
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || "No pude conectar el laboratorio.");
    }

    aiExchange = {
      prompt: promptText,
      title: payload.title || "",
      body: payload.body || "No pude responder bien esta vez.",
      tips: Array.isArray(payload.tips) ? payload.tips.slice(0, 4) : [],
      primaryAction: payload.primaryAction || null,
      secondaryAction: payload.secondaryAction || null,
    };
    assistantTopic = payload.topicId || guessAiTopicFromPrompt(promptText);
  } catch (error) {
    aiError = error?.message || "El laboratorio no pudo responder en este momento.";
    const fallback = buildAiReply(promptText, data);
    aiExchange = {
      ...fallback,
      prompt: promptText,
      title: "",
      body: fallback.body,
    };
    assistantTopic = fallback.topicId || assistantTopic;
  } finally {
    aiPending = false;
    render();
  }
}

function exportBackup() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `hoysi-respaldo-${isoToday()}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("Respaldo exportado.");
}

async function installApp() {
  if (!installPromptEvent) {
    showToast("Instalacion no disponible en este momento.");
    return;
  }

  installPromptEvent.prompt();
  await installPromptEvent.userChoice.catch(() => {});
  installPromptEvent = null;
  updateInstallButton();
}

function updateInstallButton() {
  if (!elements.installButton || !INSTALL_ENABLED) {
    return;
  }

  const shouldShow = Boolean(installPromptEvent);
  elements.installButton.classList.toggle("hidden", !shouldShow);
  elements.installButton.textContent = INSTALL_LABEL;
}

function render() {
  currentMembership = syncMembershipState();
  const data = computeDashboardState(currentMembership);
  updateTopLevelUi(data);
  elements.homeContent.innerHTML = renderHome(data);
  elements.flowContent.innerHTML = renderFlow(data);
  elements.receivablesContent.innerHTML = renderReceivables(data);
  elements.protectedContent.innerHTML = renderProtected(data);
  elements.insightsContent.innerHTML = renderInsights(data);
  renderSetup();
  renderSettings(data);
  renderTour();
}

function updateTopLevelUi(data) {
  const uiLocked = setupOpen || settingsOpen || (tourOpen && tourMode !== "full");
  elements.openSheetButton.textContent = state.profile.setupComplete ? "Nuevo" : "Configura";
  elements.openSheetButton.classList.toggle("attention", !state.profile.setupComplete);
  elements.setupOverlay.classList.toggle("hidden", !setupOpen);
  elements.settingsOverlay.classList.toggle("hidden", !settingsOpen);
  elements.tourOverlay.classList.toggle("hidden", !tourOpen);
  elements.appShell.classList.toggle("locked-shell", uiLocked);
  document.body.classList.toggle("setup-mode", uiLocked);
  document.documentElement.classList.toggle("motion-off", !state.profile.motionEnabled);
  document.documentElement.classList.toggle("theme-dark", state.profile.darkMode === true);
  document.documentElement.classList.toggle("large-text", state.profile.largeText === true);

  if (elements.headerGreeting) {
    elements.headerGreeting.textContent = data.headerGreeting;
  }

  if (!VIEW_NAMES.includes(activeView)) {
    activeView = "home";
  }

  switchView(activeView);
  updateInstallButton();
  updateSheetBackdrop();
}

function renderSetup() {
  if (!setupOpen) {
    elements.setupContent.innerHTML = "";
    return;
  }

  const snapshot = computeSetupSnapshot(state);
  const cancelButton = state.profile.setupComplete
    ? `<button class="ghost-button" data-setup-action="cancel" type="button">Cancelar</button>`
    : "";

  elements.setupContent.innerHTML = `
    <div class="setup-head">
      <p class="eyebrow">Configura tu arranque</p>
      <h2>${state.profile.setupComplete ? "Rehaz tu base" : "Vamos a dejar HoySi listo"}</h2>
      <p class="setup-copy">
        ${state.profile.setupComplete ? "Puedes resetear la base desde tu realidad actual." : "Con esto la app deja de ser demo y empieza a hablar con tu realidad."}
      </p>
    </div>

    <form id="setup-form" class="setup-form">
      <label class="field">
        <span>Como quieres que te llame la app</span>
        <input name="name" type="text" maxlength="28" placeholder="Ej. Mari" value="${escapeAttribute(state.profile.name || "")}" />
      </label>

      <fieldset class="setup-fieldset">
        <legend>Tu uso principal</legend>
        <div class="mode-grid">
          ${renderModeOption("both", "Casa + negocio", "Mezclas ambos mundos y quieres verlos claros.")}
          ${renderModeOption("business", "Solo negocio", "Vendes o trabajas por tu cuenta y quieres caja clara.")}
          ${renderModeOption("home", "Solo casa", "Quieres orden diario del hogar sin enredos raros.")}
        </div>
      </fieldset>

      <div class="setup-amount-grid">
        <label class="field">
          <span>Arranque en Casa</span>
          <input name="homeStart" type="number" step="0.01" min="0" inputmode="decimal" value="${safeNumberInput(snapshot.homeStart)}" />
        </label>
        <label class="field">
          <span>Arranque en Negocio</span>
          <input name="businessStart" type="number" step="0.01" min="0" inputmode="decimal" value="${safeNumberInput(snapshot.businessStart)}" />
        </label>
        <label class="field">
          <span>Arranque en Encargos</span>
          <input name="sharedStart" type="number" step="0.01" min="0" inputmode="decimal" value="${safeNumberInput(snapshot.sharedStart)}" />
        </label>
      </div>

      <div class="setup-divider"></div>

      <div class="section-head setup-section-head">
        <div>
          <p class="eyebrow">Opcional</p>
          <h3 class="card-title">Primer pago que no quieres tocar</h3>
        </div>
      </div>

      <label class="field">
        <span>Nombre del pago</span>
        <input name="paymentTitle" type="text" maxlength="40" placeholder="Ej. Arriendo" />
      </label>

      <div class="dual-grid">
        <label class="field">
          <span>Monto</span>
          <input name="paymentAmount" type="number" step="0.01" min="0" inputmode="decimal" />
        </label>
        <label class="field">
          <span>Bolsillo</span>
          <select name="paymentPocket">
            ${pocketDefinitions
              .map(
                (pocket) =>
                  `<option value="${pocket.id}"${pocket.id === defaultPocketForKind("protect", state.profile.mode) ? " selected" : ""}>${pocket.name}</option>`,
              )
              .join("")}
          </select>
        </label>
      </div>

      <div class="dual-grid">
        <label class="field">
          <span>Fecha de vencimiento</span>
          <input name="paymentDate" type="date" value="${isoPlusDays(5)}" />
        </label>
        <label class="field">
          <span>Nota corta</span>
          <input name="paymentNote" type="text" maxlength="40" placeholder="Ej. No tocar" />
        </label>
      </div>

      <div class="setup-actions">
        <button class="mini-button" data-setup-action="demo" type="button">Usar demo</button>
        ${cancelButton}
        <button class="primary-button" type="submit">Guardar configuracion</button>
      </div>
    </form>
  `;

  elements.setupContent.querySelectorAll('input[name="mode"]').forEach((input) => {
    input.checked = input.value === normalizeMode(state.profile.mode);
    input.closest(".mode-option")?.classList.toggle("selected-mode", input.checked);
    input.addEventListener("change", () => {
      elements.setupContent.querySelectorAll(".mode-option").forEach((option) => {
        const selected = option.querySelector('input[name="mode"]')?.checked;
        option.classList.toggle("selected-mode", Boolean(selected));
      });
    });
  });
}

function renderHome(data) {
  const primaryTask = data.topTasks[0] || null;
  const reminders = buildHomeReminders(data);
  const membershipStrip = renderMembershipStrip(data.membership);

  return `
    <div class="stack home-stack">
      <section class="hero-card home-hero-card" id="home-hero">
        <div class="hero-head">
          <div>
            <p class="eyebrow">${data.heroEyebrow}</p>
            <h2>${formatMoney(data.availableToday)}</h2>
          </div>
          <span class="health-badge ${data.healthTone}">${data.healthLabel}</span>
        </div>
        <p class="hero-subcopy">${data.heroCopy}</p>
        <div class="list-actions hero-actions">
          ${
            primaryTask
              ? `<button class="mini-button primary" data-action="${primaryTask.action}"${primaryTask.kind ? ` data-kind="${primaryTask.kind}"` : ""}${primaryTask.target ? ` data-target="${primaryTask.target}"` : ""} type="button">${escapeHtml(primaryTask.cta)}</button>`
              : `<button class="mini-button primary" data-action="go-view" data-target="flow" type="button">Ver mi flujo</button>`
          }
          <button class="mini-button" data-action="go-view" data-target="insights" type="button">Abrir laboratorio</button>
        </div>
        <div class="hero-meta">
          <span class="chip light">Apartado ${formatMoney(data.protectedReserve)}</span>
          <span class="chip light">Por cobrar ${formatMoney(data.pendingReceivablesTotal)}</span>
          <span class="chip light">Ahorro ${formatMoney(data.savingsTotal)}</span>
        </div>
      </section>

      ${membershipStrip}

      <section class="action-island" id="home-review-section">
        <div class="section-head action-island-head">
          <div>
            <p class="eyebrow">Revision de finanzas</p>
            <h3 class="card-title">Que quieres revisar o registrar?</h3>
          </div>
        </div>
        <div class="action-island-grid">
          ${renderHomeIslandAction("Ingreso", "Anota la plata que entro", "open-sheet", "income")}
          ${renderHomeIslandAction("Salida", "Marca en que se fue", "open-sheet", "expense")}
          ${renderHomeIslandAction("Cobro", "Recuerda o cobra pendiente", "open-sheet", "receivable")}
          ${renderHomeIslandAction("Pago", "Separa plata de una cuenta", "open-sheet", "protect")}
        </div>
        <div class="list-actions action-island-links">
          <button class="mini-button" data-action="open-sheet" data-kind="saving" type="button">Apartar ahorro</button>
          <button class="mini-button" data-action="go-view" data-target="flow" type="button">Ver flujo</button>
          <button class="mini-button" data-action="go-view" data-target="insights" type="button">Ir a preguntas beta</button>
        </div>
      </section>

      <section class="glass-card reminder-shell" id="home-reminders">
        <div class="section-head">
          <div>
            <p class="eyebrow">Para que no se te pase</p>
            <h3 class="card-title">Lo que conviene recordar hoy</h3>
          </div>
        </div>
        <div class="reminder-list">
          ${reminders.map(renderHomeReminder).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderMembershipStrip(membership) {
  if (!membership) {
    return "";
  }

  if (membership.trialActive) {
    return `
      <section class="glass-card membership-strip membership-live">
        <div>
          <p class="eyebrow">Beta activa</p>
          <h3 class="card-title">Te quedan ${membership.trialDaysLeft} dia(s) para probar la version completa</h3>
          <p class="helper">Aprovecha esta beta para probar el laboratorio de preguntas, flujo ampliado y contarnos que te confunde o que te sirve.</p>
        </div>
        <div class="list-actions">
          <button class="mini-button primary" data-action="open-feedback" type="button">Enviar feedback</button>
          <button class="mini-button" data-action="open-tester-guide" type="button">Guia tester</button>
        </div>
      </section>
    `;
  }

  if (membership.trialAvailable) {
    return `
      <section class="glass-card membership-strip">
        <div>
          <p class="eyebrow">Beta privada</p>
          <h3 class="card-title">Estamos buscando testers con uso real</h3>
          <p class="helper">Si quieres ayudarnos a pulir la app, entra a la beta, pruebala unos dias y mandanos feedback concreto.</p>
        </div>
        <div class="list-actions">
          <button class="mini-button primary" data-action="open-launch" type="button">Unirme a la beta</button>
          <button class="mini-button" data-action="open-tester-guide" type="button">Ver guia</button>
        </div>
      </section>
    `;
  }

  return `
    <section class="glass-card membership-strip membership-expired">
      <div>
        <p class="eyebrow">Beta pausada</p>
        <h3 class="card-title">Tu acceso ampliado termino, pero tu base sigue viva</h3>
        <p class="helper">Sigues con usable, cobros y pagos. Si quieres seguir ayudando a mejorar la app, dejanos mas feedback.</p>
      </div>
      <div class="list-actions">
        <button class="mini-button primary" data-action="open-feedback" type="button">Enviar feedback</button>
      </div>
    </section>
  `;
}

function renderPlanStatusCard(membership) {
  const statusTone = membership.trialActive ? "tone-success" : membership.trialAvailable ? "tone-warning" : "tone-neutral";
  const statusText = membership.trialActive
    ? `Beta ampliada activa · ${membership.trialDaysLeft} dia(s)`
    : membership.trialAvailable
      ? "Acceso beta disponible"
      : membership.hasPro
        ? "Acceso ampliado activo"
        : "Base activa";
  const copy = membership.trialActive
    ? "Ahora mismo puedes probar la capa completa: laboratorio de preguntas, flujo ampliado, fechas libres y respaldos."
    : membership.trialAvailable
      ? `Tu base diaria sigue gratis. Si quieres ayudarnos a probar lo mas avanzado, activa ${PRO_TRIAL_DAYS} dias de beta ampliada y mandanos feedback real.`
      : "Sigues con usable, cobros y pagos en la base gratis. Si quieres seguir ayudandonos, puedes volver por la landing beta o dejarnos feedback.";

  return `
    <div class="plan-card">
      <div class="summary-row">
        <span class="health-badge ${statusTone}">${statusText}</span>
        <strong class="plan-price">Sin cobro por ahora</strong>
      </div>
      <p class="helper">${copy}</p>
      <div class="plan-feature-grid">
        <span class="chip light">Feedback directo</span>
        <span class="chip light">Preguntas laboratorio</span>
        <span class="chip light">Flujo mensual y anual</span>
        <span class="chip light">Respaldos y fechas libres</span>
      </div>
      <div class="list-actions">
        ${
          membership.trialAvailable
            ? `<button class="mini-button primary" data-settings-action="start-trial" type="button">Activar beta ampliada</button>`
            : `<button class="mini-button primary" data-settings-action="open-feedback" type="button">Enviar feedback</button>`
        }
        <button class="mini-button" data-settings-action="open-tester-guide" type="button">Guia tester</button>
      </div>
    </div>
  `;
}

function renderFlowPlanCard(membership) {
  if (membership.hasAdvancedCharts) {
    return `
      <div class="plan-inline-note">
        <span class="tag calm">Beta ampliada</span>
        <span class="helper">Aqui ya puedes leer flujo semanal, mensual, anual y moverte por fechas para probar bien la app.</span>
      </div>
    `;
  }

  return `
    <div class="plan-inline-note">
      <span class="tag today">Semanal gratis</span>
      <span class="helper">Mensual, anual y rango libre se abren con ${PRO_TRIAL_DAYS} dias de beta ampliada.</span>
      <div class="list-actions">
        ${
          membership.trialAvailable
            ? `<button class="mini-button primary" data-action="start-trial" type="button">Activar beta</button>`
            : `<button class="mini-button primary" data-action="open-launch" type="button">Ir a la beta</button>`
        }
      </div>
    </div>
  `;
}

function renderAiQuotaHint(membership) {
  if (membership.hasUnlimitedAi) {
    return `
      <div class="ai-plan-hint ai-plan-live">
        <strong>Laboratorio ampliado</strong>
        <p>Tus preguntas quedan habilitadas y se siguen guardando mientras dura ${membership.trialActive ? `esta beta de ${membership.trialDaysLeft} dia(s)` : "tu acceso activo"}.</p>
      </div>
    `;
  }

  return `
    <div class="ai-plan-hint">
      <strong>Laboratorio de preguntas</strong>
      <p>Esta parte sigue en prueba. Tus preguntas se guardan para entrenar respuestas mas utiles y la ayuda puede variar mientras afinamos la IA.</p>
    </div>
  `;
}

function renderSettings(data) {
  if (!settingsOpen) {
    elements.settingsContent.innerHTML = "";
    return;
  }

  elements.settingsContent.innerHTML = `
    <div class="settings-head">
      <div class="settings-title-block">
        <p class="eyebrow">Configuracion</p>
        <h2>Ajusta HoySi a tu manera</h2>
        <p class="setup-copy">Aqui estan los cambios de apariencia, ayuda y respaldo sin mezclarlo con tu flujo del dia.</p>
      </div>
      <button class="icon-button" data-settings-action="close" type="button" aria-label="Cerrar configuracion">X</button>
    </div>

    <form class="setup-form" id="settings-form">
      <section class="settings-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Perfil</p>
            <h3 class="card-title">Como quieres que te salude</h3>
          </div>
        </div>
        <label class="field compact-field">
          <span>Nombre corto</span>
          <input id="settings-name-input" name="name" type="text" maxlength="28" value="${escapeAttribute(state.profile.name || "")}" placeholder="Ej. Mari" />
        </label>
        <div class="coach-topic-row settings-chip-row">
          ${renderSettingsGreetingButton("warm", "Cercano")}
          ${renderSettingsGreetingButton("push", "Con empuje")}
          ${renderSettingsGreetingButton("direct", "Directo")}
        </div>
        <div class="personal-preview">
          <span class="eyebrow">Asi se vera</span>
          <strong>${escapeHtml(data.heroEyebrow)}</strong>
          <p>${escapeHtml(data.headerGreeting)}</p>
        </div>
      </section>

      <section class="settings-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Apariencia</p>
            <h3 class="card-title">Lo visual y lo tactil</h3>
          </div>
        </div>
        <div class="toggle-row">
          ${renderSettingsToggle("toggle-dark-mode", state.profile.darkMode === true, "Modo oscuro")}
          ${renderSettingsToggle("toggle-motion", state.profile.motionEnabled, "Animaciones")}
          ${renderSettingsToggle("toggle-vibration", state.profile.vibrationEnabled, "Vibracion")}
          ${renderSettingsToggle("toggle-large-text", state.profile.largeText === true, "Texto grande")}
        </div>
      </section>

      <section class="settings-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Ayuda</p>
            <h3 class="card-title">Si quieres repasar</h3>
          </div>
        </div>
        <div class="list-actions">
          <button class="mini-button primary" data-settings-action="open-tour-full" type="button">Tutorial completo</button>
          <button class="mini-button" data-settings-action="open-tour-quick" type="button">Recorrido rapido</button>
        </div>
      </section>

      <section class="settings-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Beta testers</p>
            <h3 class="card-title">Tu acceso de prueba</h3>
          </div>
        </div>
        ${renderPlanStatusCard(data.membership)}
      </section>

      <section class="settings-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Base y respaldo</p>
            <h3 class="card-title">Cosas utiles para no perder orden</h3>
          </div>
        </div>
        <div class="list-actions">
          <button class="mini-button" data-settings-action="export-backup" type="button">Exportar respaldo</button>
          <button class="mini-button" data-settings-action="import-backup" type="button">Importar respaldo</button>
          <button class="mini-button" data-settings-action="start-setup" type="button">Rehacer base</button>
          <button class="mini-button" data-settings-action="reset-demo" type="button">Cargar demo</button>
        </div>
      </section>
    </form>
  `;
}

function renderTour() {
  if (!tourOpen) {
    elements.tourOverlay.classList.remove("guided-tour-overlay");
    elements.tourContent.innerHTML = "";
    return;
  }

  if (tourMode === "menu") {
    elements.tourOverlay.classList.remove("guided-tour-overlay");
    elements.tourContent.innerHTML = `
      <div class="tour-shell">
        <div class="tour-mascot-card">
          ${renderMascot()}
          <div>
            <p class="eyebrow">Hola, soy ${AGENT_NAME}</p>
            <h2>Te acompano para que la app no se sienta dificil</h2>
            <p class="setup-copy">Si quieres, te hago un tutorial con calma, un recorrido corto o te dejo entrar de una.</p>
          </div>
        </div>
        <div class="tour-choice-grid">
          <button class="tour-choice-card" data-tour-action="start-full" type="button">
            <strong>Tutorial desde cero</strong>
            <span>Explicado con mas calma y lenguaje simple para aprender paso a paso.</span>
          </button>
          <button class="tour-choice-card" data-tour-action="start-quick" type="button">
            <strong>Recorrido rapido</strong>
            <span>Un repaso corto de las funciones principales sin practicar nada.</span>
          </button>
          <button class="tour-choice-card" data-tour-action="skip" type="button">
            <strong>Entrar directo</strong>
            <span>Saltamos el recorrido y entras de una a usar la app.</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  const steps = getTourSteps();
  const step = steps[tourStep] || steps[0];
  const lastStep = tourStep === steps.length - 1;

  if (tourMode === "full") {
    elements.tourContent.innerHTML = `
      <div class="tour-guide-card">
        <div class="tour-guide-head">
          <div>
            <p class="eyebrow">Paso ${tourStep + 1} de ${steps.length}</p>
            <h3 class="card-title">${escapeHtml(step.title)}</h3>
          </div>
          <button class="icon-button" data-tour-action="skip" type="button" aria-label="Cerrar tutorial">X</button>
        </div>
        <p class="tour-guide-copy">${escapeHtml(step.body)}</p>
        <div class="tour-guide-note">
          <strong>Tip del lab</strong>
          <p>${escapeHtml(step.note || "")}</p>
        </div>
        <div class="setup-actions">
          <button class="mini-button" data-tour-action="back" type="button"${tourStep === 0 ? " disabled" : ""}>Anterior</button>
          <button class="mini-button" data-tour-action="skip" type="button">Saltar</button>
          <button class="primary-button" data-tour-action="${lastStep ? "finish" : "next"}" type="button">${lastStep ? "Terminar recorrido" : "Seguir"}</button>
        </div>
      </div>
    `;
    syncGuidedTourStep();
    return;
  }

  elements.tourOverlay.classList.remove("guided-tour-overlay");

  elements.tourContent.innerHTML = `
    <div class="tour-shell">
      <div class="tour-mascot-card">
        ${renderMascot()}
        <div>
          <p class="eyebrow">${tourMode === "full" ? "Tutorial completo" : "Recorrido rapido"} - Paso ${tourStep + 1} de ${steps.length}</p>
          <h2>${escapeHtml(step.title)}</h2>
          <p class="setup-copy">${escapeHtml(step.body)}</p>
        </div>
      </div>
      <div class="tour-progress">
        ${steps.map((_, index) => `<span class="tour-dot ${index === tourStep ? "active-tour-dot" : ""}"></span>`).join("")}
      </div>
      <div class="setup-actions">
        <button class="mini-button" data-tour-action="back" type="button"${tourStep === 0 ? " disabled" : ""}>Anterior</button>
        <button class="mini-button" data-tour-action="menu" type="button">Cambiar recorrido</button>
        <button class="primary-button" data-tour-action="${lastStep ? "finish" : "next"}" type="button">${lastStep ? "Entrar a la app" : "Siguiente"}</button>
      </div>
    </div>
  `;
}

function renderFlow(data) {
  const goalCards = data.goals.map(renderGoalCard).join("");
  const recentTransactions = data.recentTransactions.map((item) => renderTransactionCard(item, true)).join("");
  const scenarioCards = data.scenarios.map(renderScenarioCard).join("");
  const forecastDays = data.flowForecast.map(renderForecastDay).join("");
  const forecastEvents = data.flowEvents.map(renderFlowEvent).join("");
  const weeklyBars = data.weeklyBars.map(renderWeeklyRow).join("");
  const chartBuckets = data.chart.buckets.map(renderTrendBucket).join("");
  const flowPlanCard = renderFlowPlanCard(data.membership);

  return `
    <div class="stack">
      <section class="hero-card flow-hero">
        <div class="hero-head">
          <div>
            <p class="eyebrow">Flujo de 14 dias</p>
            <h2>${formatMoney(data.flowEndBalance)}</h2>
          </div>
          <span class="health-badge ${data.flowTone}">${data.flowLabel}</span>
        </div>
        <p class="hero-subcopy">${data.flowMessage}</p>
      </section>

      <section class="score-card flow-score-card">
        <div>
          <p class="eyebrow score-eyebrow">Pulso de la semana</p>
          <strong>${data.weeklyScore}</strong>
        </div>
        <p class="score-copy">${data.weeklyMessage}</p>
      </section>

      <section class="glass-card" id="flow-chart-section">
        <div class="section-head">
          <div>
            <p class="eyebrow">Vista de caja</p>
            <h3 class="card-title">Como se esta moviendo tu dinero</h3>
          </div>
        </div>
        <div class="coach-topic-row">
          ${renderChartModeButton("week", "Semanal")}
          ${renderChartModeButton("month", "Mensual")}
          ${renderChartModeButton("year", "Anual")}
        </div>
        ${flowPlanCard}
        <div class="chart-date-grid">
          <label class="field compact-field">
            <span>Desde</span>
            <input id="chart-start-input" type="date" value="${data.chart.startDate}"${data.membership.hasAdvancedCharts ? "" : " disabled"} />
          </label>
          <label class="field compact-field">
            <span>Hasta</span>
            <input id="chart-end-input" type="date" value="${data.chart.endDate}"${data.membership.hasAdvancedCharts ? "" : " disabled"} />
          </label>
        </div>
        <div class="summary-grid">
          <article class="summary-box">
            <p class="eyebrow">Entradas</p>
            <strong>${formatMoney(data.chart.incomeTotal)}</strong>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Salidas</p>
            <strong>${formatMoney(data.chart.expenseTotal)}</strong>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Ahorro</p>
            <strong>${formatMoney(data.chart.savingTotal)}</strong>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Balance neto</p>
            <strong>${formatMoney(data.chart.netTotal)}</strong>
          </article>
        </div>
        <p class="helper chart-helper">${data.chart.rangeCopy}</p>
        <div class="trend-chart-shell ${data.chart.mode}">
          <div class="trend-legend">
            <span class="trend-legend-chip income-chip">Entra</span>
            <span class="trend-legend-chip expense-chip">Sale</span>
            <span class="trend-legend-chip saving-chip">Ahorro</span>
          </div>
          <div class="trend-chart">
            ${chartBuckets || `<div class="empty-state"><strong>Sin movimientos en este rango</strong><p>Mueve las fechas o registra algo nuevo para ver la grafica.</p></div>`}
          </div>
        </div>
      </section>

      <section class="glass-card" id="receivables-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Ritmo real</p>
            <h3 class="card-title">Como entro y salio en los ultimos 7 dias</h3>
          </div>
        </div>
        <div class="summary-grid">
          <article class="summary-box">
            <p class="eyebrow">Entro esta semana</p>
            <strong>${formatMoney(data.weeklyIncome)}</strong>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Salio esta semana</p>
            <strong>${formatMoney(data.weeklyExpense)}</strong>
          </article>
        </div>
        <div class="weekly-bars">${weeklyBars}</div>
      </section>

      <section class="glass-card" id="protected-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Ruta de 14 dias</p>
            <h3 class="card-title">Como podria respirar tu caja</h3>
          </div>
        </div>
        <div class="forecast-rail">${forecastDays}</div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Si pasa esto</p>
            <h3 class="card-title">Asi cambia tu cierre</h3>
          </div>
        </div>
        <div class="scenario-grid">${scenarioCards}</div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Eventos del flujo</p>
            <h3 class="card-title">Lo que pega en tu caja</h3>
          </div>
        </div>
        <div class="card-list">
          ${
            forecastEvents ||
            `<div class="empty-state"><strong>Sin eventos cercanos</strong><p>Tu flujo esta bastante limpio en los proximos dias.</p></div>`
          }
        </div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Metas activas</p>
            <h3 class="card-title">Lo que ya estas construyendo</h3>
          </div>
          <button class="mini-button primary" data-action="open-goal-sheet" type="button">Nueva meta</button>
        </div>
        <div class="card-list">
          ${
            goalCards ||
            `<div class="empty-state"><strong>Aun no tienes metas</strong><p>Crear una meta te ayuda a que el control diario tambien se convierta en avance.</p></div>`
          }
        </div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Actividad reciente</p>
            <h3 class="card-title">Tus ultimos movimientos visibles</h3>
          </div>
        </div>
        <div class="card-list">
          ${
            recentTransactions ||
            `<div class="empty-state"><strong>Sin movimientos aun</strong><p>En cuanto registres ingresos o salidas, aqui veras la pelicula corta de tu caja.</p></div>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderReceivables(data) {
  const content = data.pendingReceivables.map(renderReceivableCard).join("");

  return `
    <div class="stack">
      <section class="glass-card">
        <div class="summary-grid">
          <article class="summary-box">
            <p class="eyebrow">Pendiente total</p>
            <strong>${formatMoney(data.pendingReceivablesTotal)}</strong>
            <span class="helper">${data.pendingReceivables.length} pendiente(s)</span>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Tasa recuperada</p>
            <strong>${data.collectionRate}%</strong>
            <span class="helper">Segun lo que ya marcaste cobrado.</span>
          </article>
        </div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Prioridad maxima</p>
            <h3 class="card-title">${data.topReceivable ? escapeHtml(data.topReceivable.person) : "Sin urgencias"}</h3>
          </div>
          ${
            data.topReceivable
              ? `<span class="tag urgent">Libera ${formatMoney(data.topReceivable.amount)}</span>`
              : ""
          }
        </div>
        <p class="helper">${data.topReceivable ? buildTopReceivableMessage(data.topReceivable) : "Cuando alguien te deba, aqui veras a quien conviene escribir primero."}</p>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Tu lista</p>
            <h3 class="card-title">Cobros con accion inmediata</h3>
          </div>
        </div>
        <div class="card-list">
          ${
            content ||
            `<div class="empty-state"><strong>Todo cobrado</strong><p>Cuando registres un pendiente aparecera aqui con prioridad y recordatorio.</p></div>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderProtected(data) {
  const content = data.activeProtected.map(renderProtectedCard).join("");
  const paidCount = state.protectedItems.filter((item) => item.status === "paid").length;

  return `
    <div class="stack">
      <section class="glass-card">
        <div class="summary-grid">
          <article class="summary-box">
            <p class="eyebrow">Apartado hoy</p>
            <strong>${formatMoney(data.protectedReserve)}</strong>
            <span class="helper">Lo que ya separaste para pagos.</span>
          </article>
          <article class="summary-box">
            <p class="eyebrow">Pagos cubiertos</p>
            <strong>${paidCount}</strong>
            <span class="helper">Los que ya saldaste sin perder orden.</span>
          </article>
        </div>
      </section>

      <section class="glass-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">Lo que ya apartaste</p>
            <h3 class="card-title">Pagos con fecha clara</h3>
          </div>
        </div>
        <div class="card-list">
          ${
            content ||
            `<div class="empty-state"><strong>No has apartado pagos</strong><p>Agrega uno y la app lo sacara de tu usable para que no te confundas al gastar.</p></div>`
          }
        </div>
      </section>
    </div>
  `;
}

function renderHomeIslandAction(title, copy, action, kind = "", target = "") {
  return `
    <button class="island-action" data-action="${action}"${kind ? ` data-kind="${kind}"` : ""}${target ? ` data-target="${target}"` : ""} type="button">
      <span class="island-action-title">${escapeHtml(title)}</span>
      <span class="island-action-copy">${escapeHtml(copy)}</span>
    </button>
  `;
}

function renderHomeFocusTask(task) {
  return `
    <article class="task-card home-focus-card ${task.tone}">
      <span class="task-kicker">${escapeHtml(task.kicker)}</span>
      <strong>${escapeHtml(task.title)}</strong>
      <p>${escapeHtml(task.body)}</p>
      <button class="mini-button ${task.buttonTone}" data-action="${task.action}"${task.kind ? ` data-kind="${task.kind}"` : ""}${task.target ? ` data-target="${task.target}"` : ""} type="button">
        ${escapeHtml(task.cta)}
      </button>
    </article>
  `;
}

function renderHomeMiniTask(task) {
  return `
    <button class="home-mini-task" data-action="${task.action}"${task.kind ? ` data-kind="${task.kind}"` : ""}${task.target ? ` data-target="${task.target}"` : ""} type="button">
      <span>${escapeHtml(task.kicker)}</span>
      <strong>${escapeHtml(task.title)}</strong>
    </button>
  `;
}

function renderHomeGlanceRow(label, note, value, cta, action, kind = "", target = "") {
  return `
    <article class="glance-row">
      <div class="glance-main">
        <span class="glance-label">${escapeHtml(label)}</span>
        <strong class="glance-value">${escapeHtml(value)}</strong>
        <span class="glance-note">${escapeHtml(note)}</span>
      </div>
      <button class="mini-button" data-action="${action}"${kind ? ` data-kind="${kind}"` : ""}${target ? ` data-target="${target}"` : ""} type="button">
        ${escapeHtml(cta)}
      </button>
    </article>
  `;
}

function buildHomeReminders(data) {
  const reminders = [];

  if (data.topReceivable) {
    reminders.push({
      kicker: "Cobro que te destraba",
      title: `Escribe a ${data.topReceivable.person}`,
      body: `${formatMoney(data.topReceivable.amount)} sigue afuera. Recuperarlo te libera aire sin vender mas.`,
      cta: "Ver cobros",
      action: "go-view",
      target: "receivables",
    });
  } else {
    reminders.push({
      kicker: "Recomendacion simple",
      title: "No dejes cobros en tu memoria",
      body: "Si hoy alguien te queda debiendo, anotalo de una para que no se enfrie ni se te vaya.",
      cta: "Anotar cobro",
      action: "open-sheet",
      kind: "receivable",
    });
  }

  if (data.activeProtected[0]) {
    reminders.push({
      kicker: "Pago que no debes tocar",
      title: data.activeProtected[0].title,
      body: `Vence ${longDateLabel(data.activeProtected[0].dueDate)} y ya conviene tratarlo como dinero reservado.`,
      cta: "Ver pagos",
      action: "go-view",
      target: "protected",
    });
  } else {
    reminders.push({
      kicker: "Recomendacion simple",
      title: "Separa tu proximo pago importante",
      body: "Cuando arriendo, servicios o reposicion quedan visibles, dejas de gastar plata que ya tenia destino.",
      cta: "Apartar pago",
      action: "open-sheet",
      kind: "protect",
    });
  }

  if (data.savingGoal) {
    reminders.push({
      kicker: "Ahorro visible",
      title: data.savingGoal.title,
      body: `${formatMoney(data.savingGoal.current)} de ${formatMoney(data.savingGoal.target)}. ${data.savingGoal.paceCopy}`,
      cta: "Apartar ahorro",
      action: "open-sheet",
      kind: "saving",
    });
  } else {
    reminders.push({
      kicker: "Siguiente paso",
      title: "Convierte control en avance",
      body: "Si ya registras mejor tu dia, el siguiente salto es apartar ahorro pequeno con una meta concreta.",
      cta: "Crear meta",
      action: "open-goal-sheet",
    });
  }

  return reminders.slice(0, 3);
}

function renderHomeReminder(item) {
  return `
    <article class="reminder-card">
      <div class="reminder-copy">
        <span class="task-kicker">${escapeHtml(item.kicker)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </div>
      <button class="mini-button" data-action="${item.action}"${item.kind ? ` data-kind="${item.kind}"` : ""}${item.target ? ` data-target="${item.target}"` : ""} type="button">
        ${escapeHtml(item.cta)}
      </button>
    </article>
  `;
}

function renderAiSignalCard(label, value, note) {
  return `
    <article class="summary-box ai-signal-card">
      <p class="eyebrow">${escapeHtml(label)}</p>
      <strong>${escapeHtml(value)}</strong>
      <span class="helper">${escapeHtml(note)}</span>
    </article>
  `;
}

function renderAiSuggestionButton(prompt) {
  return `
    <button class="coach-topic-chip" data-action="ask-ai-prompt" data-prompt="${escapeAttribute(prompt)}" type="button">
      ${escapeHtml(prompt)}
    </button>
  `;
}

function renderMascot() {
  return `
    <svg class="lumi-bot" viewBox="8 8 124 124" aria-hidden="true">
      <defs>
        <linearGradient id="lumiCore" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#173d3a"></stop>
          <stop offset="100%" stop-color="#2d6d67"></stop>
        </linearGradient>
        <linearGradient id="lumiRing" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#9df0df"></stop>
          <stop offset="100%" stop-color="#58ccb3"></stop>
        </linearGradient>
        <linearGradient id="lumiPulse" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"></stop>
          <stop offset="100%" stop-color="#dff7f0"></stop>
        </linearGradient>
        <radialGradient id="lumiAura" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="rgba(157,240,223,0.28)"></stop>
          <stop offset="100%" stop-color="rgba(157,240,223,0)"></stop>
        </radialGradient>
        <radialGradient id="lumiGlow" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.72)"></stop>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"></stop>
        </radialGradient>
      </defs>
      <ellipse cx="70" cy="124" rx="26" ry="8" fill="rgba(22,59,57,0.10)"></ellipse>
      <circle cx="30" cy="31" r="7" fill="rgba(103,216,190,0.16)"></circle>
      <circle cx="108" cy="34" r="5" fill="rgba(255,123,74,0.12)"></circle>
      <g class="lumi-bot-float">
        <circle cx="70" cy="67" r="34" fill="url(#lumiAura)"></circle>
        <circle cx="70" cy="67" r="27" fill="url(#lumiCore)"></circle>
        <circle cx="70" cy="67" r="19" fill="none" stroke="url(#lumiRing)" stroke-width="5"></circle>
        <circle cx="70" cy="67" r="8" fill="url(#lumiPulse)"></circle>
        <path d="M70 32 L74 42 L84 45 L76 53 L78 64 L70 58 L62 64 L64 53 L56 45 L66 42 Z" fill="rgba(255,255,255,0.16)"></path>
        <circle cx="50" cy="49" r="4" fill="rgba(255,255,255,0.16)"></circle>
        <circle cx="91" cy="82" r="3.5" fill="rgba(255,255,255,0.14)"></circle>
        <circle cx="89" cy="49" r="2.8" fill="rgba(255,255,255,0.16)"></circle>
        <path d="M51 95 C57 85 66 81 70 81 C74 81 83 85 89 95" fill="none" stroke="url(#lumiRing)" stroke-width="5" stroke-linecap="round"></path>
        <path d="M58 102 C62 96 67 93 70 93 C73 93 78 96 82 102" fill="none" stroke="rgba(29,44,42,0.18)" stroke-width="3.5" stroke-linecap="round"></path>
        <ellipse cx="78" cy="50" rx="31" ry="24" fill="url(#lumiGlow)" opacity="0.18"></ellipse>
      </g>
    </svg>
  `;
}

function renderInsights(data) {
  const coach = buildAiCoach(data);
  const aiQuotaHint = renderAiQuotaHint(data.membership);
  const reply = aiExchange.prompt
    ? aiExchange
    : {
        prompt: coach.userPrompt,
        title: "",
        body: coach.aiMessage,
        tips: coach.tips,
        primaryAction: coach.primaryAction,
        secondaryAction: coach.secondaryAction,
      };

  return `
    <div class="stack ai-stack">
      <section class="coach-card ai-room-card" id="ai-panel">
        <div class="ai-hero">
          <div class="ai-hero-mascot">
            ${renderMascot()}
          </div>
          <div class="ai-hero-copy">
            <p class="eyebrow coach-eyebrow">Laboratorio de preguntas</p>
            <h3 class="card-title">${AGENT_NAME}, en fase de prueba</h3>
            <p class="coach-copy">Esta capa sigue en construccion. Puedes dejar dudas reales de plata, cobros, pagos, ahorro o terminos raros, y tus preguntas nos ayudan a entrenar respuestas mas rapidas y utiles.</p>
          </div>
        </div>

        <div class="ai-signal-grid">
          ${renderAiSignalCard("Usable hoy", formatMoney(data.availableToday), data.runwayNote)}
          ${renderAiSignalCard("Por cobrar", formatMoney(data.pendingReceivablesTotal), data.topReceivable ? `Prioridad: ${data.topReceivable.person}` : "Sin cobro urgente")}
          ${renderAiSignalCard("Pagos apartados", formatMoney(data.protectedReserve), data.activeProtected.length ? `${data.activeProtected.length} activo(s)` : "Nada apartado")}
          ${renderAiSignalCard("Ahorro visible", formatMoney(data.savingsTotal), data.savingGoal ? data.savingGoal.title : "Sin meta activa")}
        </div>

        <div class="section-head ai-section-head">
          <div>
            <p class="eyebrow">Empieza por aqui</p>
            <h4 class="card-title">${escapeHtml(coach.title)}</h4>
          </div>
        </div>
        <div class="ai-badge-row">
          <span class="health-badge ${coach.tone}">${escapeHtml(coach.badge)}</span>
        </div>
        <p class="coach-copy">${escapeHtml(coach.summary)}</p>
        <div class="coach-topic-row">
          ${coach.topics.map(renderCoachTopicButton).join("")}
        </div>
        <div class="coach-thread">
          <div class="coach-bubble user-bubble">${escapeHtml(reply.prompt)}</div>
          <div class="coach-bubble ai-bubble">
            ${reply.title ? `<strong>${escapeHtml(reply.title)}</strong>` : ""}
            <p>${escapeHtml(reply.body)}</p>
          </div>
        </div>
        <div class="coach-tip-list">
          ${(reply.tips || []).map(renderCoachTip).join("")}
        </div>
        ${aiError ? `<p class="helper ai-lab-note">${escapeHtml(aiError)}</p>` : ""}
        <div class="list-actions coach-actions">
          ${renderCoachActionButton(reply.primaryAction || coach.primaryAction)}
          ${renderCoachActionButton(reply.secondaryAction || coach.secondaryAction)}
        </div>
        <form class="ai-form" id="ai-form">
          ${aiQuotaHint}
          <label class="field ai-question-field">
            <span>Deja una pregunta real</span>
            <textarea name="question" rows="3" placeholder="Ej. No me alcanza esta semana, que deberia mover primero?">${escapeHtml(aiDraft)}</textarea>
          </label>
          <button class="primary-button" type="submit"${aiPending ? " disabled" : ""}>${aiPending ? "Guardando pregunta..." : "Probar pregunta"}</button>
        </form>

        <div class="ai-suggestion-block">
          <p class="helper">Ideas rapidas para empezar</p>
          <div class="coach-topic-row ai-suggestion-row">
            ${AGENT_SUGGESTIONS.map(renderAiSuggestionButton).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTaskCard(task) {
  return `
    <article class="task-card ${task.tone}">
      <span class="task-kicker">${escapeHtml(task.kicker)}</span>
      <strong>${escapeHtml(task.title)}</strong>
      <p>${escapeHtml(task.body)}</p>
      <button class="mini-button ${task.buttonTone}" data-action="${task.action}"${task.kind ? ` data-kind="${task.kind}"` : ""}${task.target ? ` data-target="${task.target}"` : ""} type="button">
        ${escapeHtml(task.cta)}
      </button>
    </article>
  `;
}

function renderScenarioCard(item) {
  return `
    <article class="scenario-card ${item.tone}">
      <span class="scenario-label">${escapeHtml(item.label)}</span>
      <strong>${formatMoney(item.value)}</strong>
      <p>${escapeHtml(item.copy)}</p>
    </article>
  `;
}

function renderForecastDay(item) {
  return `
    <article class="forecast-day ${item.tone}">
      <span class="forecast-label">${escapeHtml(item.label)}</span>
      <strong>${formatMoney(item.balance)}</strong>
      <span class="forecast-note">${item.delta >= 0 ? "+" : "-"}${formatMoney(Math.abs(item.delta))}</span>
    </article>
  `;
}

function renderFlowEvent(item) {
  return `
    <article class="list-card compact-card">
      <div class="list-top">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="timeline-note">${escapeHtml(item.dayLabel)} - ${escapeHtml(item.category)}</p>
        </div>
        <span class="amount-pill ${item.delta > 0 ? "success" : "warning"}">${item.delta > 0 ? "+" : "-"}${formatMoney(Math.abs(item.delta))}</span>
      </div>
      <div class="list-actions">
        <span class="tag ${item.tone === "danger" ? "urgent" : item.tone === "warning" ? "today" : "calm"}">${escapeHtml(item.statusLabel)}</span>
      </div>
    </article>
  `;
}

function renderWeeklyRow(item) {
  return `
    <article class="weekly-card">
      <div class="weekly-row">
        <span class="weekly-label">${escapeHtml(item.label)}</span>
        <div class="bar-group">
          <div class="bar-track">
            <div class="bar-fill income" style="width:${item.incomeWidth}%"></div>
          </div>
          <span class="bar-value">${formatMoney(item.income)}</span>
        </div>
      </div>
      <div class="weekly-row">
        <span class="weekly-label muted">Sale</span>
        <div class="bar-group">
          <div class="bar-track muted-track">
            <div class="bar-fill" style="width:${item.expenseWidth}%"></div>
          </div>
          <span class="bar-value">${formatMoney(item.expense)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderPocket(pocket) {
  return `
    <article class="pocket-card ${pocket.id === "shared" ? "wide" : ""}">
      <span class="pocket-chip ${pocket.tone}">${pocket.name}</span>
      <p class="pocket-amount">${formatMoney(pocket.balance)}</p>
      <span class="helper">${escapeHtml(pocket.message)}</span>
    </article>
  `;
}

function renderReceivableCard(item) {
  const dueTag = urgencyTag(item.dueState);
  return `
    <article class="list-card">
      <div class="list-top">
        <div>
          <strong>${escapeHtml(item.person)}</strong>
          <p class="timeline-note">${escapeHtml(item.note || "Cobro pendiente")}</p>
        </div>
        <span class="amount-pill success">${formatMoney(item.amount)}</span>
      </div>
      <div class="summary-row">
        <span class="tag ${dueTag.className}">${dueTag.label}</span>
        <span class="helper">${item.pocketName}${item.remindersCount ? ` - ${item.remindersCount} toque(s)` : ""}</span>
      </div>
      <div class="list-actions">
        <button class="mini-button warn" data-action="remind" data-id="${item.id}" type="button">Recordar por WhatsApp</button>
        <button class="mini-button primary" data-action="collect" data-id="${item.id}" type="button">Marcar cobrado</button>
        <button class="mini-button" data-action="delete-receivable" data-id="${item.id}" type="button">Quitar</button>
      </div>
    </article>
  `;
}

function renderProtectedCard(item) {
  const dueTag = urgencyTag(item.dueState);
  const reserveText =
    item.reserveRatio >= 1
      ? "Apartado completo"
      : `Apartado ${Math.round(item.reserveRatio * 100)}%`;

  return `
    <article class="list-card">
      <div class="list-top">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="timeline-note">${escapeHtml(item.note || "Pago importante ya separado")}</p>
        </div>
        <span class="amount-pill warning">${formatMoney(item.amount)}</span>
      </div>
      <div class="summary-row">
        <span class="tag ${dueTag.className}">${dueTag.label}</span>
        <span class="helper">${reserveText} - ${item.pocketName}</span>
      </div>
      <div class="list-actions">
        <button class="mini-button primary" data-action="pay" data-id="${item.id}" type="button">Marcar pagado</button>
        <button class="mini-button" data-action="delete-protected" data-id="${item.id}" type="button">Quitar</button>
      </div>
    </article>
  `;
}

function renderGoalCard(item) {
  const percent = Math.max(4, Math.round(item.progress * 100));
  return `
    <article class="goal-card ${item.status === "done" ? "done-goal" : ""}">
      <div class="list-top">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="timeline-note">${escapeHtml(item.pocketName)} - ${escapeHtml(item.paceCopy)}</p>
        </div>
        <span class="amount-pill ${item.status === "done" ? "success" : "neutral"}">${formatMoney(item.current)} / ${formatMoney(item.target)}</span>
      </div>
      <div class="goal-progress">
        <div class="goal-fill" style="width:${percent}%"></div>
      </div>
      <div class="summary-row">
        <span class="tag ${item.status === "done" ? "calm" : item.daysLeft <= 7 ? "today" : "calm"}">${item.status === "done" ? "Completa" : `${item.daysLeft} dia(s)`}</span>
        <span class="helper">${escapeHtml(item.note || "Meta activa")}</span>
      </div>
      <div class="list-actions">
        ${
          item.status === "active"
            ? `<button class="mini-button primary" data-action="boost-goal" data-id="${item.id}" type="button">Sumar avance</button>`
            : ""
        }
        <button class="mini-button" data-action="delete-goal" data-id="${item.id}" type="button">Quitar</button>
      </div>
    </article>
  `;
}

function renderTransactionCard(item, compact) {
  return `
    <article class="list-card transaction-card ${compact ? "compact-card" : ""}">
      <div class="list-top">
        <div>
          <strong>${escapeHtml(item.title)}</strong>
          <p class="timeline-note">${escapeHtml(item.dayLabel)}${item.note ? ` - ${escapeHtml(item.note)}` : ""}</p>
        </div>
        <span class="amount-pill ${item.type === "income" ? "success" : item.type === "saving" ? "warning" : "neutral"}">${item.type === "income" ? "+" : "-"}${formatMoney(item.amount)}</span>
      </div>
      <div class="list-actions">
        <span class="tag calm">${escapeHtml(item.pocketName)}</span>
        <span class="helper">${escapeHtml(item.channelLabel)}</span>
        ${
          compact
            ? ""
            : `<button class="mini-button" data-action="delete-transaction" data-id="${item.id}" type="button">Eliminar</button>`
        }
      </div>
    </article>
  `;
}

function renderFilterButton(filter, label) {
  return `
    <button class="filter-pill ${historyFilter === filter ? "active-filter" : ""}" data-action="set-history-filter" data-filter="${filter}" type="button">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderChartModeButton(mode, label) {
  const locked = mode !== "week" && !currentMembership?.hasAdvancedCharts;
  const action = locked ? (currentMembership?.trialAvailable ? "start-trial" : "open-launch") : "set-chart-mode";
  return `
    <button class="coach-topic-chip ${state.profile.chartMode === mode ? "active-topic" : ""} ${locked ? "locked-topic" : ""}" data-action="${action}"${locked ? "" : ` data-mode="${mode}"`} type="button">
      ${escapeHtml(label)}${locked ? " Beta" : ""}
    </button>
  `;
}

function renderCoachTopicButton(topic) {
  return `
    <button class="coach-topic-chip ${assistantTopic === topic.id ? "active-topic" : ""}" data-action="set-ai-topic" data-topic="${topic.id}" type="button">
      ${escapeHtml(topic.label)}
    </button>
  `;
}

function renderCoachTip(text, index) {
  return `
    <article class="coach-tip">
      <span class="coach-tip-index">${index + 1}</span>
      <p>${escapeHtml(text)}</p>
    </article>
  `;
}

function renderCoachActionButton(action) {
  if (!action) {
    return "";
  }

  return `
    <button class="mini-button ${action.toneClass || ""}" data-action="${action.action}"${action.kind ? ` data-kind="${action.kind}"` : ""}${action.target ? ` data-target="${action.target}"` : ""}${action.topic ? ` data-topic="${action.topic}"` : ""}${action.prompt ? ` data-prompt="${escapeAttribute(action.prompt)}"` : ""} type="button">
      ${escapeHtml(action.label)}
    </button>
  `;
}

function renderGreetingStyleButton(style, label) {
  return `
    <button class="coach-topic-chip ${state.profile.greetingStyle === style ? "active-topic" : ""}" data-action="set-greeting-style" data-style="${style}" type="button">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderSettingsGreetingButton(style, label) {
  return `
    <button class="coach-topic-chip ${state.profile.greetingStyle === style ? "active-topic" : ""}" data-settings-action="set-greeting-style" data-style="${style}" type="button">
      ${escapeHtml(label)}
    </button>
  `;
}

function renderPreferenceToggle(action, active, label) {
  return `
    <button class="preference-toggle ${active ? "toggle-on" : "toggle-off"}" data-action="${action}" type="button">
      <span>${escapeHtml(label)}</span>
      <strong>${active ? "Activo" : "Pausado"}</strong>
    </button>
  `;
}

function renderSettingsToggle(action, active, label) {
  return `
    <button class="preference-toggle ${active ? "toggle-on" : "toggle-off"}" data-settings-action="${action}" type="button">
      <span>${escapeHtml(label)}</span>
      <strong>${active ? "Activo" : "Pausado"}</strong>
    </button>
  `;
}

function renderTrendBucket(bucket) {
  return `
    <article class="trend-bucket ${bucket.empty ? "empty-bucket" : ""}">
      <div class="trend-columns">
        <span class="trend-column income-column" style="height:${bucket.incomeHeight}%"></span>
        <span class="trend-column expense-column" style="height:${bucket.expenseHeight}%"></span>
        <span class="trend-column saving-column" style="height:${bucket.savingHeight}%"></span>
      </div>
      <span class="trend-label">${escapeHtml(bucket.label)}</span>
      <span class="trend-sub">${escapeHtml(bucket.subLabel)}</span>
    </article>
  `;
}

function renderModeOption(value, title, copy) {
  const checked = normalizeMode(state.profile.mode) === value;
  return `
    <label class="mode-option ${checked ? "selected-mode" : ""}">
      <input type="radio" name="mode" value="${value}"${checked ? " checked" : ""} />
      <span class="mode-title">${escapeHtml(title)}</span>
      <span class="mode-copy">${escapeHtml(copy)}</span>
    </label>
  `;
}

function buildAiCoach(data) {
  const topics = [
    { id: "overview", label: "Mi caso hoy" },
    { id: "spend", label: "No me alcanza" },
    { id: "receivables", label: "No me pagan" },
    { id: "payments", label: "Se me juntan pagos" },
    { id: "mix", label: "Mezclo plata" },
    { id: "savings", label: "Quiero ahorrar" },
  ];

  const overdueReceivables = data.pendingReceivables.filter((item) => item.dueDays < 0);
  const urgentPayments = data.activeProtected.filter((item) => item.dueDays <= 3);
  const multiPocketMode = state.profile.mode === "both" || data.pockets.filter((item) => item.balance > 0).length >= 2;
  const recommendedTopic =
    data.runwayDays <= 3 || data.availableToday <= 25
      ? "spend"
      : overdueReceivables.length > 0
        ? "receivables"
        : urgentPayments.length > 0
          ? "payments"
          : data.savingsTotal <= 0
            ? "savings"
            : multiPocketMode
              ? "mix"
              : "overview";

  if (!topics.some((topic) => topic.id === assistantTopic)) {
    assistantTopic = "overview";
  }

  if (assistantTopic === "overview") {
    const firstTask = data.topTasks[0] || null;
    const secondTask = data.topTasks[1] || null;
    const focusLabel =
      recommendedTopic === "spend"
        ? "margen de gasto"
        : recommendedTopic === "receivables"
          ? "cobros atrasados"
          : recommendedTopic === "payments"
            ? "pagos por cubrir"
            : recommendedTopic === "mix"
              ? "mezcla entre casa y negocio"
              : "ritmo de ahorro";

    return {
      topics,
      title: "Lo primero que te conviene mover hoy",
      tone: data.healthTone,
      badge: data.healthLabel,
      summary: `Estoy viendo tu caja, tus cobros, tus pagos y tus ahorros. Hoy el foco mas delicado es ${focusLabel}.`,
      userPrompt: "Que problema me esta frenando mas hoy?",
      aiHeadline:
        recommendedTopic === "spend"
          ? `Tu usable real hoy es ${formatMoney(data.availableToday)} y tu margen esta corto.`
          : recommendedTopic === "receivables"
            ? `Tienes ${formatMoney(data.pendingReceivablesTotal)} afuera y parte ya va tarde.`
            : recommendedTopic === "payments"
              ? `Tienes pagos cercanos que pueden tragarse tu aire si los sueltas tarde.`
              : recommendedTopic === "mix"
                ? "Tu riesgo no es gastar mucho: es mezclar sin darte cuenta."
                : "Ya puedes pasar de sobrevivir a ordenar mejor tu progreso.",
      aiMessage:
        recommendedTopic === "spend"
          ? "Antes de gastar, mira la home y actua solo sobre lo que si puedes usar hoy. Si no entra algo pronto o no frenas salidas tontas, tu caja se te aprieta rapido."
          : recommendedTopic === "receivables"
            ? "La plata que mas te ayuda hoy no siempre es vender mas; muchas veces es recuperar lo que ya te deben y dejar de financiar a otros con tu propia caja."
            : recommendedTopic === "payments"
              ? "Si dejas los pagos importantes para reaccionar al final, tu usable se ve mas grande de lo que realmente es y ahi empieza el desorden."
              : recommendedTopic === "mix"
                ? "Cuando casa y negocio se tapan mutuamente sin verse claro, pierdes criterio. No es solo registrar; es saber de que bolsillo estas sacando y a cual estas debilitando."
                : "Tu siguiente salto no es hacer mas cosas, sino repetir dos o tres movimientos buenos hasta volverlos habito.",
      tips: [
        firstTask ? `${firstTask.title}: ${firstTask.body}` : `Revisa tu usable de ${formatMoney(data.availableToday)} antes de mover otra salida.`,
        secondTask ? `${secondTask.title}: ${secondTask.body}` : data.nextBestAction,
        data.savingGoal
          ? `Tu meta activa es ${data.savingGoal.title}. ${data.savingGoal.paceCopy}`
          : "Si todavia no tienes meta activa, crea una para que el control diario se convierta en avance real.",
      ],
      primaryAction: firstTask
        ? {
            label: firstTask.cta,
            action: firstTask.action,
            kind: firstTask.kind,
            target: firstTask.target,
            toneClass: firstTask.buttonTone || "primary",
          }
        : { label: "Ver flujo", action: "go-view", target: "flow", toneClass: "primary" },
      secondaryAction: secondTask
        ? {
            label: secondTask.cta,
            action: secondTask.action,
            kind: secondTask.kind,
            target: secondTask.target,
            toneClass: secondTask.buttonTone || "",
          }
        : { label: "Abrir hoy", action: "go-view", target: "home", toneClass: "" },
    };
  }

  if (assistantTopic === "spend") {
    return {
      topics,
      title: "Cuando sientes que no te alcanza",
      tone: data.healthTone,
      badge: data.runwayLabel,
      summary: "Aqui no se trata de gastar menos por culpa. Se trata de saber cuanto margen real tienes antes de mover otra salida.",
      userPrompt: "Siento que no me alcanza y no se cuanto puedo gastar hoy.",
      aiHeadline: `Hoy solo te conviene mover ${formatMoney(data.availableToday)} sin tocar lo apartado.`,
      aiMessage: `Ese monto ya deja fuera ${formatMoney(data.protectedReserve)} que ya apartaste para pagos. Si gastas por sensacion, el error no se ve hoy; se ve cuando llega el pago o cuando toca reponer negocio.`,
      tips: [
        "Abre la home antes de cada gasto mediano y usa esa cifra como tope, no como sugerencia.",
        data.topReceivable
          ? `Tienes plata afuera con ${data.topReceivable.person}. Recuperar ${formatMoney(data.topReceivable.amount)} vale mas que improvisar otro recorte.`
          : "Si no tienes cobros fuertes por recuperar, tu siguiente defensa es frenar las salidas chicas que no empujan nada.",
        `Tu runway actual es ${data.runwayLabel}. Si esta corto, hoy toca caja defensiva: menos impulsos y mas decision.`,
      ],
      primaryAction: data.topReceivable
        ? { label: "Ir a cobros", action: "go-view", target: "receivables", toneClass: "primary" }
        : { label: "Ver flujo", action: "go-view", target: "flow", toneClass: "primary" },
      secondaryAction: { label: "Registrar ingreso", action: "open-sheet", kind: "income", toneClass: "" },
    };
  }

  if (assistantTopic === "receivables") {
    return {
      topics,
      title: "Cuando te deben y no te pagan",
      tone: overdueReceivables.length > 0 ? "tone-danger" : "tone-warning",
      badge: `${data.pendingReceivables.length} pendiente(s)`,
      summary: "Cobrar no es incomodar: es defender tu caja. La deuda que enfria tu flujo suele ser mas grave que un gasto aislado.",
      userPrompt: "Me deben plata y no se como priorizar a quien cobrar primero.",
      aiHeadline: `Hoy tienes ${formatMoney(data.pendingReceivablesTotal)} por recuperar.`,
      aiMessage: data.topReceivable
        ? `${data.topReceivable.person} es tu mejor jugada para liberar caja. Cuando un cobro se atrasa, la app lo sube de prioridad porque ya esta afectando lo que si puedes usar hoy.`
        : "Aunque hoy no tengas cobros cargados, usa este apartado para no volver a dejar plata afuera sin seguimiento.",
      tips: [
        overdueReceivables.length > 0
          ? `Empieza por el mas atrasado. Ya tienes ${overdueReceivables.length} cobro(s) vencido(s) y eso te esta comiendo aire.`
          : "Empieza por el cobro que mas te libera caja, no por el mas comodo de pedir.",
        "Manda recordatorio por WhatsApp desde la app y marca cobrado apenas entre para que el usable quede honesto.",
        "Si alguien te compra seguido pero siempre paga tarde, deja de tratarlo como ingreso seguro hasta que de verdad caiga.",
      ],
      primaryAction: { label: "Ver cobros", action: "go-view", target: "receivables", toneClass: "primary" },
      secondaryAction: { label: "Anotar cobro", action: "open-sheet", kind: "receivable", toneClass: "" },
    };
  }

  if (assistantTopic === "payments") {
    const nextPayment = urgentPayments[0] || data.activeProtected[0];
    return {
      topics,
      title: "Cuando se te juntan pagos",
      tone: urgentPayments.length > 0 ? "tone-danger" : "tone-warning",
      badge: `${data.activeProtected.length} pago(s)`,
      summary: "El problema no es tener pagos; el problema es sentir que aun puedes gastar plata que en realidad ya tiene dueno.",
      userPrompt: "Se me estan juntando pagos y siento que pierdo control.",
      aiHeadline: `Hoy ya tienes ${formatMoney(data.protectedReserve)} apartado para no desordenarte.`,
      aiMessage: nextPayment
        ? `${nextPayment.title} es de lo primero que tienes que respetar. Si un pago esta cerca y aun no lo tratas como dinero intocable, tu usable se infla de mentira.`
        : "Aparta cada pago importante apenas aparezca. Eso evita que tu cabeza tenga que recordarlo todo sola.",
      tips: [
        "Aparta primero arriendo, servicios, reposicion o cualquier pago que te deje sin operar si se cae.",
        urgentPayments.length > 0
          ? `Tienes ${urgentPayments.length} pago(s) dentro de la zona delicada. No los dejes como tarea mental.`
          : "Aunque no venzan hoy, los pagos grandes deben entrar como apartados apenas existan.",
        "Cuando uno salga, marcalo pagado para que tu usable vuelva a mostrar la verdad.",
      ],
      primaryAction: { label: "Ver pagos", action: "go-view", target: "protected", toneClass: "primary" },
      secondaryAction: { label: "Apartar pago", action: "open-sheet", kind: "protect", toneClass: "" },
    };
  }

  if (assistantTopic === "mix") {
    const positivePockets = data.pockets.filter((item) => item.balance > 0).map((item) => item.name);
    return {
      topics,
      title: "Cuando mezclas plata de casa y negocio",
      tone: "tone-warning",
      badge: state.profile.mode === "both" ? "Modo mixto" : "Bolsillos activos",
      summary: "Tu desorden no siempre viene del monto. Muchas veces viene de no ver de que bolsillo sale cada decision.",
      userPrompt: "Siento que mezclo plata de casa, negocio y encargos todo el tiempo.",
      aiHeadline: positivePockets.length > 1 ? `Hoy ya tienes movimiento visible en ${positivePockets.join(", ")}.` : "Tu caja necesita fronteras claras para no agotarte.",
      aiMessage: "La app no te pide contabilidad. Te pide separar mentalmente menos y separar visualmente mas. Si negocio tapa casa todos los dias, dejas de saber si estas vendiendo bien o sobreviviendo con cruces.",
      tips: [
        "Cada ingreso registralo en el bolsillo correcto, aunque despues muevas parte de la plata.",
        "Si sacas del negocio para la casa, anotalo como salida real; asi dejas de pensar que la caja del negocio sigue sana.",
        "Usa los bolsillos como semaforo: si uno se queda sin aire muy seguido, ahi esta el problema verdadero.",
      ],
      primaryAction: { label: "Ver bolsillos", action: "go-view", target: "home", toneClass: "primary" },
      secondaryAction: { label: "Registrar salida", action: "open-sheet", kind: "expense", toneClass: "" },
    };
  }

  return {
    topics,
    title: "Cuando quieres empezar a ahorrar en serio",
    tone: data.savingsTotal > 0 ? "tone-success" : "tone-warning",
    badge: formatMoney(data.savingsTotal),
    summary: "Ahorrar con ingresos inestables no empieza con grandes montos. Empieza con apartados repetidos y visibles.",
    userPrompt: "Quiero ahorrar, pero siempre termino usando esa plata.",
    aiHeadline: data.savingGoal
      ? `Tu ahorro visible hoy va en ${formatMoney(data.savingsTotal)} y tu meta es ${data.savingGoal.title}.`
      : `Hoy tienes ${formatMoney(data.savingsTotal)} en ahorro visible.`,
    aiMessage: data.savingGoal
      ? `${data.savingGoal.paceCopy} Mientras el ahorro exista como movimiento real y no solo como intencion, es mucho mas dificil que desaparezca sin que te des cuenta.`
      : "Si no hay meta, el ahorro queda flojo. Si hay meta y apartado visible, tu progreso empieza a pelear por quedarse.",
    tips: [
      "Aparta ahorro como si fuera una salida intencional en cuanto entre plata buena, no al final si sobra.",
      data.savingGoal
        ? `Tu meta activa ya te da direccion: ${data.savingGoal.title}.`
        : "Crea una meta corta primero. Una meta demasiado grande se siente lejana y pierde fuerza.",
      "No midas el ahorro solo por monto. Midelo por cuantas semanas lograste apartarlo sin devolverte ese dinero.",
    ],
    primaryAction: { label: "Apartar ahorro", action: "open-sheet", kind: "saving", toneClass: "primary" },
    secondaryAction: { label: "Crear meta", action: "open-goal-sheet", toneClass: "" },
  };
}

function buildAiReply(prompt, data) {
  const normalizedPrompt = normalizeLooseText(prompt);
  let topicId = "overview";

  if (["hola", "holi", "buenas", "hello", "hi"].includes(normalizedPrompt)) {
    return {
      topicId: "overview",
      prompt,
      title: "",
      body: `Hola. Viendo tus numeros, hoy puedes mover ${formatMoney(data.availableToday)} sin tocar lo que ya apartaste. Si quieres, preguntame que te conviene mover primero o explicarte alguna parte de la app.`,
      tips: [
        "Puedes preguntarme cosas simples como: no me alcanza, que hago primero.",
        "Tambien te explico usable, flujo, cobros, pagos o ahorro en palabras faciles.",
      ],
      primaryAction: { label: "Ver flujo", action: "go-view", target: "flow", toneClass: "primary" },
      secondaryAction: { label: "Volver a Hoy", action: "go-view", target: "home", toneClass: "" },
    };
  }

  if (normalizedPrompt.includes("que significa") || normalizedPrompt.includes("explica") || normalizedPrompt.includes("termino")) {
    if (normalizedPrompt.includes("usable")) {
      return {
        topicId: "spend",
        prompt,
        title: "",
        body: `Usable es la plata que si puedes mover hoy. En tu caso son ${formatMoney(data.availableToday)} despues de sacar lo que ya apartaste para pagos importantes.`,
        tips: [
          "Mira ese numero antes de una salida mediana o impulsiva.",
          "Si cobras algo pendiente, el usable sube; si apartas un pago, el usable baja.",
          "Te sirve para decidir hoy, no para hacerte sentir culpable por todo el mes.",
        ],
        primaryAction: { label: "Volver a Hoy", action: "go-view", target: "home", toneClass: "primary" },
        secondaryAction: { label: "Ver flujo", action: "go-view", target: "flow", toneClass: "" },
      };
    }

    if (normalizedPrompt.includes("flujo")) {
      return {
        topicId: "overview",
        prompt,
        title: "",
        body: "Flujo es la pelicula corta de tu caja. Te ayuda a ver como entra, sale y se aprieta tu dinero en los proximos dias para no reaccionar tarde.",
        tips: [
          "Usa Flujo para anticiparte, no para mirar el pasado nada mas.",
          "Si ves una bajada fuerte, toca cobrar, frenar salidas o apartar mejor tus pagos.",
          "Las graficas y escenarios sirven para entender ritmo, no para decorar la app.",
        ],
        primaryAction: { label: "Ver flujo", action: "go-view", target: "flow", toneClass: "primary" },
        secondaryAction: { label: "Hablar de mi caso", action: "set-ai-topic", toneClass: "" },
      };
    }

    if (normalizedPrompt.includes("apartar") || normalizedPrompt.includes("pago")) {
      return {
        topicId: "payments",
        prompt,
        title: "",
        body: "Apartar un pago es dejar de tratar esa plata como libre. No la mueves a otro banco; solo la separas visualmente para no gastarla por error.",
        tips: [
          "Sirve mucho para arriendo, servicios y reposicion del negocio.",
          "Si el pago ya salio, marcalo como pagado para devolver claridad a tu caja.",
          `Ahora mismo tienes ${formatMoney(data.protectedReserve)} ya apartado para no desordenarte.`,
        ],
        primaryAction: { label: "Ver pagos", action: "go-view", target: "protected", toneClass: "primary" },
        secondaryAction: { label: "Apartar uno nuevo", action: "open-sheet", kind: "protect", toneClass: "" },
      };
    }

    if (normalizedPrompt.includes("bolsillo") || normalizedPrompt.includes("mezcl")) {
      return {
        topicId: "mix",
        prompt,
        title: "",
        body: "Un bolsillo es una forma simple de separar tu dinero. Casa, negocio y encargos se dividen para que veas de donde sale cada decision.",
        tips: [
          "Si sacas plata del negocio para la casa, registralo como salida real.",
          "Cuando un bolsillo vive salvando a otro, ahi suele estar el problema de fondo.",
          "No necesitas perfeccion: necesitas ver mejor las fronteras.",
        ],
        primaryAction: { label: "Volver a Hoy", action: "go-view", target: "home", toneClass: "primary" },
        secondaryAction: { label: "Registrar salida", action: "open-sheet", kind: "expense", toneClass: "" },
      };
    }
  }

  if (
    normalizedPrompt.includes("mezcl") ||
    normalizedPrompt.includes("casa y negocio") ||
    normalizedPrompt.includes("bolsillo")
  ) {
    topicId = "mix";
  } else if (
    normalizedPrompt.includes("ahorr") ||
    normalizedPrompt.includes("meta") ||
    normalizedPrompt.includes("colchon")
  ) {
    topicId = "savings";
  } else if (
    normalizedPrompt.includes("deben") ||
    normalizedPrompt.includes("cobro") ||
    normalizedPrompt.includes("cobrar") ||
    normalizedPrompt.includes("whatsapp")
  ) {
    topicId = "receivables";
  } else if (
    normalizedPrompt.includes("pago") ||
    normalizedPrompt.includes("venc") ||
    normalizedPrompt.includes("servicio") ||
    normalizedPrompt.includes("arriendo")
  ) {
    topicId = "payments";
  } else if (
    normalizedPrompt.includes("alcanz") ||
    normalizedPrompt.includes("gastar") ||
    normalizedPrompt.includes("usable") ||
    normalizedPrompt.includes("margen")
  ) {
    topicId = "spend";
  }

  const previousTopic = assistantTopic;
  assistantTopic = topicId;
  const coach = buildAiCoach(data);
  assistantTopic = previousTopic;

  return {
    topicId,
    prompt,
    title: "",
    body: coach.aiMessage,
    tips: coach.tips,
    primaryAction: coach.primaryAction,
    secondaryAction: coach.secondaryAction,
  };
}

function buildAiFinanceContext(data) {
  return {
    currency: "USD",
    availableToday: data.availableToday,
    protectedReserve: data.protectedReserve,
    pendingReceivablesTotal: data.pendingReceivablesTotal,
    savingsTotal: data.savingsTotal,
    runwayLabel: data.runwayLabel,
    healthLabel: data.healthLabel,
    weeklyIncome: data.weeklyIncome,
    weeklyExpense: data.weeklyExpense,
    topReceivable: data.topReceivable
      ? {
          person: data.topReceivable.person,
          amount: data.topReceivable.amount,
          dueDate: data.topReceivable.dueDate,
        }
      : null,
    activeProtected: data.activeProtected.slice(0, 3).map((item) => ({
      title: item.title,
      amount: item.amount,
      dueDate: item.dueDate,
    })),
    pockets: data.pockets.map((item) => ({
      name: item.name,
      balance: item.balance,
      message: item.message,
    })),
    goals: data.goals.slice(0, 2).map((item) => ({
      title: item.title,
      current: item.current,
      target: item.target,
      paceCopy: item.paceCopy,
    })),
    nextBestAction: data.nextBestAction,
  };
}

function guessAiTopicFromPrompt(prompt) {
  const text = normalizeLooseText(prompt);
  if (text.includes("cobro") || text.includes("deben") || text.includes("pagarme")) {
    return "receivables";
  }
  if (text.includes("pago") || text.includes("arriendo") || text.includes("venc")) {
    return "payments";
  }
  if (text.includes("ahorr") || text.includes("meta")) {
    return "savings";
  }
  if (text.includes("mezcl") || text.includes("bolsillo")) {
    return "mix";
  }
  if (text.includes("alcanz") || text.includes("gastar") || text.includes("usable")) {
    return "spend";
  }
  return "overview";
}

function buildGreetingData(profile) {
  const hour = new Date().getHours();
  const baseGreeting = hour < 12 ? "Buen dia" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const nameSuffix = profile.name ? `, ${profile.name}` : "";
  const style = normalizeGreetingStyle(profile.greetingStyle);

  if (style === "push") {
    return {
      headerGreeting: `${baseGreeting}${nameSuffix}`,
      heroEyebrow: profile.name ? `${baseGreeting}, ${profile.name}. Revision financiera de hoy.` : `${baseGreeting}. Revision financiera de hoy.`,
    };
  }

  if (style === "direct") {
    return {
      headerGreeting: `${baseGreeting}${nameSuffix}`,
      heroEyebrow: profile.name ? `${baseGreeting}, ${profile.name}. Vamos al grano con tu dinero.` : `${baseGreeting}. Vamos al grano con tu dinero.`,
    };
  }

  return {
    headerGreeting: `${baseGreeting}${nameSuffix}`,
    heroEyebrow: profile.name ? `${baseGreeting}, ${profile.name}. Aqui va tu calma financiera.` : `${baseGreeting}. Aqui va tu calma financiera.`,
  };
}

function buildTrendChart(transactions, profile) {
  const mode = normalizeChartMode(profile.chartMode);
  const normalizedRange = normalizeDateRange(profile.chartStartDate, profile.chartEndDate, mode);
  const filtered = transactions.filter(
    (item) =>
      compareIsoDates(item.date, normalizedRange.start) >= 0 &&
      compareIsoDates(item.date, normalizedRange.end) <= 0,
  );

  const buckets = mode === "year"
    ? buildMonthlyBuckets(filtered, normalizedRange.start, normalizedRange.end)
    : buildDailyBuckets(filtered, normalizedRange.start, normalizedRange.end);

  const maxValue = Math.max(
    ...buckets.flatMap((bucket) => [bucket.income, bucket.expense, bucket.saving]),
    1,
  );

  return {
    mode,
    startDate: normalizedRange.start,
    endDate: normalizedRange.end,
    rangeCopy:
      mode === "week"
        ? `Vista semanal desde ${longDateLabel(normalizedRange.start)} hasta ${longDateLabel(normalizedRange.end)}.`
        : mode === "month"
          ? `Vista mensual configurable desde ${longDateLabel(normalizedRange.start)} hasta ${longDateLabel(normalizedRange.end)}.`
          : `Vista anual configurable desde ${longDateLabel(normalizedRange.start)} hasta ${longDateLabel(normalizedRange.end)}.`,
    incomeTotal: roundMoney(filtered.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)),
    expenseTotal: roundMoney(filtered.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0)),
    savingTotal: roundMoney(filtered.filter((item) => item.type === "saving").reduce((sum, item) => sum + item.amount, 0)),
    netTotal: roundMoney(
      filtered.reduce(
        (sum, item) => sum + (item.type === "income" ? item.amount : -item.amount),
        0,
      ),
    ),
    buckets: buckets.map((bucket) => ({
      ...bucket,
      empty: bucket.income === 0 && bucket.expense === 0 && bucket.saving === 0,
      incomeHeight: Math.max((bucket.income / maxValue) * 100, bucket.income > 0 ? 8 : 4),
      expenseHeight: Math.max((bucket.expense / maxValue) * 100, bucket.expense > 0 ? 8 : 4),
      savingHeight: Math.max((bucket.saving / maxValue) * 100, bucket.saving > 0 ? 8 : 4),
    })),
  };
}

function buildDailyBuckets(transactions, startDate, endDate) {
  const buckets = [];
  let cursor = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  while (cursor.getTime() <= end.getTime()) {
    const iso = isoDate(cursor);
    const currentItems = transactions.filter((item) => item.date === iso);
    buckets.push({
      label: shortDayLabel(iso),
      subLabel: dayOfMonth(iso),
      income: roundMoney(currentItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)),
      expense: roundMoney(currentItems.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0)),
      saving: roundMoney(currentItems.filter((item) => item.type === "saving").reduce((sum, item) => sum + item.amount, 0)),
    });
    cursor = addDays(cursor, 1);
  }

  return buckets;
}

function buildMonthlyBuckets(transactions, startDate, endDate) {
  const buckets = [];
  let cursor = new Date(`${startDate}T12:00:00`);
  cursor = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const end = new Date(`${endDate}T12:00:00`);

  while (cursor.getTime() <= end.getTime()) {
    const monthStart = isoDate(new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12));
    const monthEnd = isoDate(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 12));
    const currentItems = transactions.filter(
      (item) => compareIsoDates(item.date, monthStart) >= 0 && compareIsoDates(item.date, monthEnd) <= 0,
    );
    buckets.push({
      label: new Intl.DateTimeFormat("es-EC", { month: "short" })
        .format(new Date(`${monthStart}T12:00:00`))
        .replace(".", ""),
      subLabel: String(cursor.getFullYear()),
      income: roundMoney(currentItems.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0)),
      expense: roundMoney(currentItems.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0)),
      saving: roundMoney(currentItems.filter((item) => item.type === "saving").reduce((sum, item) => sum + item.amount, 0)),
    });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 12);
  }

  return buckets;
}

function computeDashboardState(membership = currentMembership || syncMembershipState()) {
  const transactions = normalizeTransactionsForView(state.transactions);
  const pendingReceivables = normalizeReceivablesForView(state.receivables);
  const activeProtected = normalizeProtectedForView(state.protectedItems);
  const goals = normalizeGoalsForView(state.goals);
  const greetings = buildGreetingData(state.profile);

  const balance = roundMoney(
    transactions.reduce((total, txn) => total + (txn.type === "income" ? txn.amount : -txn.amount), 0),
  );
  const protectedReserve = roundMoney(
    activeProtected.reduce((total, item) => total + item.amount * item.reserveRatio, 0),
  );
  const pendingReceivablesTotal = roundMoney(
    pendingReceivables.reduce((total, item) => total + item.amount, 0),
  );
  const availableToday = roundMoney(Math.max(balance - protectedReserve, 0));
  const topReceivable = pendingReceivables[0] || null;
  const paymentsNext7Total = roundMoney(
    activeProtected.filter((item) => item.dueDays <= 7).reduce((total, item) => total + item.amount, 0),
  );
  const receivablesNext7Total = roundMoney(
    pendingReceivables.filter((item) => item.dueDays <= 7).reduce((total, item) => total + item.amount, 0),
  );
  const pocketBalances = computePocketBalances(transactions);
  const weekly = buildWeeklyStats(transactions);
  const savingsTransactions = transactions.filter((item) => item.type === "saving");
  const savingsTotal = roundMoney(savingsTransactions.reduce((total, item) => total + item.amount, 0));
  const savingGoal = goals.find((item) => item.status === "active") || goals[0] || null;
  const avgDailyExpense = weekly.expense > 0 ? weekly.expense / 7 : 0;
  const runwayDays = avgDailyExpense > 0 ? Math.floor(availableToday / avgDailyExpense) : 99;
  const runwayLabel = avgDailyExpense > 0 ? `${runwayDays} dia(s)` : "Sobrado";
  const healthTone = runwayDays <= 3 ? "tone-danger" : runwayDays <= 7 ? "tone-warning" : "tone-success";
  const healthLabel = runwayDays <= 3 ? "Alerta" : runwayDays <= 7 ? "Justo" : "Firme";
  const healthNote =
    runwayDays <= 3 ? "Cobra o frena salidas." : runwayDays <= 7 ? "Tienes margen corto." : "Tu caja tiene aire.";
  const collectionRate = computeCollectionRate(state.receivables);
  const flow = buildFlowForecast(balance, pendingReceivables, activeProtected);
  const weeklyScore = buildWeeklyScore(weekly, pendingReceivables, activeProtected, runwayDays);
  const chart = buildTrendChart(transactions, state.profile);
  const topTasks = buildTopTasks({
    topReceivable,
    activeProtected,
    availableToday,
    runwayDays,
    flow,
  });

  return {
    balance,
    availableToday,
    availableIfTopCollected: roundMoney(availableToday + (topReceivable?.amount || 0)),
    pendingReceivables,
    pendingReceivablesTotal,
    topReceivable,
    activeProtected,
    protectedReserve,
    paymentsNext7Total,
    receivablesNext7Total,
    pockets: pocketBalances,
    recentTransactions: transactions.slice(0, 4),
    filteredTransactions: transactions
      .filter((item) => {
        if (historyFilter === "all") {
          return true;
        }
        if (historyFilter === "expense") {
          return item.type === "expense" || item.type === "saving";
        }
        return item.type === historyFilter;
      })
      .slice(0, 12),
    savingsCount: savingsTransactions.length,
    savingsTotal,
    savingGoal,
    collectionRate,
    weeklyIncome: weekly.income,
    weeklyExpense: weekly.expense,
    weeklyBars: weekly.bars,
    weeklyScore: weeklyScore.score,
    weeklyMessage: weeklyScore.message,
    nextBestAction: weeklyScore.nextAction,
    runwayDays,
    healthLabel,
    healthTone,
    headerGreeting: greetings.headerGreeting,
    heroEyebrow: greetings.heroEyebrow,
    heroCopy:
      state.profile.source === "demo"
        ? "Estas viendo un escenario demo. Cambialo cuando quieras y llevalo a tu realidad."
        : "Ya dejamos fuera lo que no te conviene tocar y no contamos lo que aun no te pagan.",
    runwayLabel,
    runwayNote: healthNote,
    flowEndBalance: flow.endBalance,
    flowLabel: flow.label,
    flowTone: flow.tone,
    flowMessage: flow.message,
    flowForecast: flow.days,
    flowEvents: flow.events,
    scenarios: flow.scenarios,
    chart,
    topTasks,
    goals,
    membership,
  };
}

function normalizeTransactionsForView(transactions) {
  return normalizeTransactions(transactions)
    .map((txn) => ({
      ...txn,
      pocketName: pocketName(txn.pocket),
      channelLabel: channelLabels[txn.channel] || "Otro",
      dayLabel: longDateLabel(txn.date),
    }))
    .sort((a, b) => compareIsoDates(b.date, a.date));
}

function normalizeReceivablesForView(receivables) {
  return normalizeReceivables(receivables)
    .filter((item) => item.status === "pending")
    .map((item) => ({
      ...item,
      dueDays: dayDelta(item.dueDate),
      dueState: getDueState(item.dueDate),
      pocketName: pocketName(item.pocket),
    }))
    .sort((a, b) => a.dueDays - b.dueDays || b.amount - a.amount);
}

function normalizeProtectedForView(items) {
  return normalizeProtectedItems(items)
    .filter((item) => item.status === "active")
    .map((item) => ({
      ...item,
      dueDays: dayDelta(item.dueDate),
      dueState: getDueState(item.dueDate),
      reserveRatio: reserveRatioForDate(item.dueDate),
      pocketName: pocketName(item.pocket),
    }))
    .sort((a, b) => a.dueDays - b.dueDays || b.amount - a.amount);
}

function normalizeGoalsForView(items) {
  return normalizeGoals(items)
    .map((item) => {
      const daysLeft = Math.max(dayDelta(item.dueDate), 0);
      const progress = item.target > 0 ? item.current / item.target : 0;
      const remaining = roundMoney(Math.max(item.target - item.current, 0));
      const dailyPace = daysLeft > 0 ? roundMoney(remaining / Math.max(daysLeft, 1)) : remaining;
      return {
        ...item,
        daysLeft,
        progress,
        remaining,
        pocketName: pocketName(item.pocket),
        paceCopy:
          item.status === "done"
            ? "Ya esta lograda."
            : daysLeft > 0
              ? `Si quieres llegar, te toca apartar ${formatMoney(dailyPace)} por dia.`
              : "Tu fecha ya llego; toca cerrar la brecha.",
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft || b.target - a.target);
}

function computePocketBalances(transactions) {
  return pocketDefinitions.map((pocket) => {
    const balance = transactions
      .filter((txn) => txn.pocket === pocket.id)
      .reduce((total, txn) => total + (txn.type === "income" ? txn.amount : -txn.amount), 0);

    return {
      ...pocket,
      balance: roundMoney(balance),
      message: pocketMessage(pocket.id, balance, state.profile.mode),
    };
  });
}

function buildWeeklyStats(transactions) {
  const bars = [];
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return isoDate(date);
  });

  let income = 0;
  let expense = 0;

  last7.forEach((date) => {
    const dayTransactions = transactions.filter((txn) => txn.date === date);
    const dayIncome = dayTransactions
      .filter((txn) => txn.type === "income")
      .reduce((total, txn) => total + txn.amount, 0);
    const dayExpense = dayTransactions
      .filter((txn) => txn.type === "expense" || txn.type === "saving")
      .reduce((total, txn) => total + txn.amount, 0);

    income += dayIncome;
    expense += dayExpense;

    bars.push({
      label: shortDayLabel(date),
      income: roundMoney(dayIncome),
      expense: roundMoney(dayExpense),
    });
  });

  const maxAmount = Math.max(...bars.flatMap((item) => [item.income, item.expense]), 1);

  return {
    income: roundMoney(income),
    expense: roundMoney(expense),
    bars: bars.map((item) => ({
      ...item,
      incomeWidth: Math.max((item.income / maxAmount) * 100, item.income > 0 ? 6 : 0),
      expenseWidth: Math.max((item.expense / maxAmount) * 100, item.expense > 0 ? 6 : 0),
    })),
  };
}

function buildWeeklyScore(weekly, receivables, protectedItems, runwayDays) {
  const net = weekly.income - weekly.expense;
  const overdueReceivables = receivables.filter((item) => item.dueDays < 0).length;
  const criticalPayments = protectedItems.filter((item) => item.dueDays <= 3).length;

  if (net >= 60 && overdueReceivables === 0 && runwayDays > 7) {
    return {
      score: "Firme",
      message: "Tu semana va con aire: entra mas de lo que sale y tu caja no esta respirando por milagro.",
      nextAction: "Aprovecha la inercia y usa una meta para convertir control en progreso real.",
    };
  }

  if (net >= 0 && runwayDays > 3) {
    return {
      score: "En control",
      message: "No esta perfecta, pero sigue ordenada. La diferencia ahora esta en no perder seguimiento fino.",
      nextAction:
        overdueReceivables > 0
          ? "Tu siguiente mejor jugada es cobrar al menos un pendiente atrasado antes de abrir otro gasto."
          : criticalPayments > 0
            ? "Hay pagos pegados en menos de 3 dias. Marcalos apenas salgan para que el usable siga honesto."
            : "Mira tu flujo y revisa si un cobro grande te conviene perseguir hoy.",
    };
  }

  return {
    score: "Ajustando",
    message: "Tu caja se puede apretar rapido. La app no te juzga; te esta mostrando donde tocar primero.",
    nextAction:
      overdueReceivables > 0
        ? "Empieza por recuperar un cobro hoy mismo. Eso pesa mas que registrar diez gastos chicos."
        : "Antes de cerrar el dia, aparta lo importante y evita sacar de negocio para tapar casa sin verlo claro.",
  };
}

function buildTopTasks({ topReceivable, activeProtected, availableToday, runwayDays, flow }) {
  const tasks = [];
  const urgentPayment = activeProtected.find((item) => item.dueDays <= 3);

  if (topReceivable) {
    tasks.push({
      kicker: topReceivable.dueDays < 0 ? "Ya va tarde" : topReceivable.dueDays === 0 ? "Se espera hoy" : "Te libera caja",
      title: `Cobra a ${topReceivable.person}`,
      body: `Son ${formatMoney(topReceivable.amount)} que no deberian seguir afuera.`,
      cta: "Ir a cobros",
      action: "go-view",
      target: "receivables",
      tone: "task-success",
      buttonTone: "primary",
    });
  }

  if (urgentPayment) {
    tasks.push({
      kicker: urgentPayment.dueDays < 0 ? "Ya vencio" : "Se viene pronto",
      title: `Cuida ${urgentPayment.title}`,
      body: `Necesita ${formatMoney(urgentPayment.amount)} y ya esta dentro de la zona delicada.`,
      cta: "Ver pagos",
      action: "go-view",
      target: "protected",
      tone: "task-warning",
      buttonTone: "",
    });
  }

  tasks.push({
    kicker: availableToday <= 25 ? "Margen chico" : "Siguiente nivel",
    title: availableToday <= 25 ? "Gasta solo lo necesario" : "Mira tu flujo de 14 dias",
    body:
      availableToday <= 25
        ? `Hoy tienes ${formatMoney(availableToday)} libres. No te conviene improvisar.`
        : flow.message,
    cta: availableToday <= 25 ? "Registrar salida" : "Abrir flujo",
    action: availableToday <= 25 ? "open-sheet" : "go-view",
    kind: availableToday <= 25 ? "expense" : "",
    target: availableToday <= 25 ? "" : "flow",
    tone: availableToday <= 25 ? "task-danger" : "task-neutral",
    buttonTone: availableToday <= 25 ? "" : "primary",
  });

  if (runwayDays <= 3) {
    tasks.unshift({
      kicker: "Caja corta",
      title: "Cuida tu margen",
      body: "Si no entra algo pronto, tu margen se vuelve muy fino.",
      cta: "Registrar ingreso",
      action: "open-sheet",
      kind: "income",
      tone: "task-danger",
      buttonTone: "primary",
    });
  }

  return tasks.slice(0, 3);
}

function buildFlowForecast(balance, receivables, protectedItems) {
  const events = [];
  const days = [];
  let running = balance;

  for (let offset = 0; offset < 14; offset += 1) {
    const date = isoPlusDays(offset);
    const dayReceivables = receivables.filter((item) => item.dueDate === date);
    const dayPayments = protectedItems.filter((item) => item.dueDate === date);
    const positive = roundMoney(dayReceivables.reduce((total, item) => total + item.amount, 0));
    const negative = roundMoney(dayPayments.reduce((total, item) => total + item.amount, 0));
    const delta = roundMoney(positive - negative);
    running = roundMoney(running + delta);
    const tone = running < 0 ? "day-danger" : running < 30 ? "day-warning" : "day-safe";

    days.push({
      date,
      label: `${shortDayLabel(date)} ${dayOfMonth(date)}`,
      balance: running,
      delta,
      tone,
    });

    dayReceivables.forEach((item) => {
      events.push({
        date: item.dueDate,
        title: item.person,
        dayLabel: `${shortDayLabel(item.dueDate)} ${dayOfMonth(item.dueDate)}`,
        category: "Cobro pendiente",
        delta: item.amount,
        tone: item.dueDays <= 0 ? "warning" : "calm",
        statusLabel: item.dueDays <= 0 ? "Mover hoy" : "Esperado",
      });
    });

    dayPayments.forEach((item) => {
      events.push({
        date: item.dueDate,
        title: item.title,
        dayLabel: `${shortDayLabel(item.dueDate)} ${dayOfMonth(item.dueDate)}`,
        category: "Pago apartado",
        delta: -item.amount,
        tone: item.dueDays <= 0 ? "danger" : "warning",
        statusLabel: item.dueDays <= 0 ? "Ya deberia salir" : "Toca pronto",
      });
    });
  }

  const endBalance = roundMoney(running);
  const minBalance = Math.min(...days.map((item) => item.balance), balance);
  const label = minBalance < 0 ? "Fragil" : minBalance < 30 ? "Apretado" : "Sano";
  const tone = minBalance < 0 ? "tone-danger" : minBalance < 30 ? "tone-warning" : "tone-success";
  const message =
    minBalance < 0
      ? "Si no se mueve algo, en esta ventana tu flujo se puede meter en rojo."
      : minBalance < 30
        ? "Tu flujo aguanta, pero con poco margen. Cualquier salida boba pega."
        : "Tu ruta de 14 dias se ve respirable si los eventos pasan mas o menos como esperas.";

  const topReceivable = receivables[0];
  const topPayment = protectedItems[0];

  return {
    days,
    endBalance,
    label,
    tone,
    message,
    events: events.sort((a, b) => compareIsoDates(a.date, b.date)),
    scenarios: [
      {
        label: "Base",
        value: endBalance,
        copy: "Asi termina tu caja si todo pasa cuando toca.",
        tone: "scenario-neutral",
      },
      {
        label: "Si cobras prioridad",
        value: roundMoney(endBalance + (topReceivable?.amount || 0)),
        copy: topReceivable ? `Recuperar ${topReceivable.person} te cambia bastante el cierre.` : "Sin cobro fuerte para mover este escenario.",
        tone: "scenario-success",
      },
      {
        label: "Si se cae un cobro",
        value: roundMoney(endBalance - (topReceivable?.amount || 0) - (topPayment ? topPayment.amount * 0.15 : 0)),
        copy: topReceivable ? "Te muestra como quedas si lo esperado no entra a tiempo." : "Tu riesgo aqui es mas por pagos que por cobros.",
        tone: "scenario-danger",
      },
    ],
  };
}

function computeCollectionRate(receivables) {
  const normalized = normalizeReceivables(receivables);
  if (normalized.length === 0) {
    return 0;
  }

  const collectedTotal = normalized
    .filter((item) => item.status === "collected")
    .reduce((total, item) => total + item.amount, 0);
  const grossTotal = normalized.reduce((total, item) => total + item.amount, 0);
  return grossTotal > 0 ? Math.round((collectedTotal / grossTotal) * 100) : 0;
}

function normalizeBilling(billing) {
  const tier = ["free", "trial", "pro"].includes(billing?.tier) ? billing.tier : "free";
  const trialStartedAt = isValidDateTime(billing?.trialStartedAt) ? String(billing.trialStartedAt) : "";
  const trialEndsAt = isValidDateTime(billing?.trialEndsAt) ? String(billing.trialEndsAt) : "";
  return {
    tier,
    trialStartedAt,
    trialEndsAt,
    trialUsed: billing?.trialUsed === true || tier === "trial" || tier === "pro",
    aiWindowStartedAt: isValidDateTime(billing?.aiWindowStartedAt)
      ? String(billing.aiWindowStartedAt)
      : new Date().toISOString(),
    aiQuestionsUsed: Math.max(0, Number.parseInt(billing?.aiQuestionsUsed || "0", 10) || 0),
  };
}

function buildMembershipState(billing) {
  const now = Date.now();
  const trialEndsMs = Date.parse(billing.trialEndsAt || "");
  const trialActive = billing.tier === "trial" && Number.isFinite(trialEndsMs) && trialEndsMs > now;
  const hasPro = billing.tier === "pro" || trialActive;
  const trialAvailable = !billing.trialUsed && !hasPro;
  const remainingMs = Number.isFinite(trialEndsMs) ? Math.max(trialEndsMs - now, 0) : 0;
  const trialDaysLeft = trialActive ? Math.max(1, Math.ceil(remainingMs / 86400000)) : 0;
  const aiRemaining = hasPro ? Number.POSITIVE_INFINITY : Math.max(FREE_AI_WEEKLY_LIMIT - billing.aiQuestionsUsed, 0);
  const aiWindowMs = Date.parse(billing.aiWindowStartedAt || "");
  const resetMs = Number.isFinite(aiWindowMs) ? Math.max(aiWindowMs + 7 * 86400000 - now, 0) : 0;
  const resetDays = Math.max(1, Math.ceil(resetMs / 86400000));

  return {
    tier: hasPro ? (billing.tier === "pro" ? "pro" : "trial") : "free",
    hasPro,
    trialActive,
    trialAvailable,
    trialDaysLeft,
    hasUnlimitedAi: hasPro,
    hasAdvancedCharts: hasPro,
    hasBackups: hasPro,
    aiRemaining,
    canAskAi: hasPro || aiRemaining > 0,
    aiResetCopy: hasPro ? "" : `Se renueva en ${resetDays} dia(s).`,
  };
}

function syncMembershipState() {
  state.billing = normalizeBilling(state.billing);
  let dirty = false;
  const now = Date.now();

  if (now - Date.parse(state.billing.aiWindowStartedAt || "") >= 7 * 86400000) {
    state.billing.aiWindowStartedAt = new Date().toISOString();
    state.billing.aiQuestionsUsed = 0;
    dirty = true;
  }

  if (state.billing.tier === "trial") {
    const trialEndsMs = Date.parse(state.billing.trialEndsAt || "");
    if (!Number.isFinite(trialEndsMs) || trialEndsMs <= now) {
      state.billing.tier = "free";
      state.billing.trialUsed = true;
      dirty = true;
    }
  }

  const membership = buildMembershipState(state.billing);
  if (!membership.hasAdvancedCharts && state.profile.chartMode !== "week") {
    applyChartMode("week");
    dirty = true;
  }

  if (dirty) {
    persistState();
  }

  return membership;
}

function consumeAiQuestionQuota() {
  state.billing = normalizeBilling(state.billing);
  state.billing.aiQuestionsUsed += 1;
  persistState();
}

function buildAiUpgradeReply(promptText, membership) {
  const body = membership.trialAvailable
    ? `Esta capa sigue en laboratorio. Puedes seguir dejando preguntas mientras afinamos la futura IA y, si quieres probar el resto de funciones ampliadas, activa ${PRO_TRIAL_DAYS} dias de beta ampliada.`
    : `El laboratorio sigue abierto para preguntas. ${membership.aiResetCopy} Si quieres seguir ayudandonos hoy, activa la beta ampliada o dejanos feedback.`;

  return {
    prompt: promptText,
    title: membership.trialAvailable ? "Laboratorio en prueba" : "Laboratorio abierto",
    body,
    tips: [
      "La base diaria de usable, cobros y pagos sigue funcionando gratis.",
      "Tus preguntas nos sirven para entrenar respuestas mas utiles y mas rapidas.",
      membership.trialAvailable ? "La prueba es corta: 7 dias, suficiente para detectar que te sirve y que te confunde." : "Si algo te confundio, el mejor siguiente paso es dejar feedback concreto.",
    ],
    primaryAction: membership.trialAvailable
      ? { label: "Activar beta ampliada", action: "start-trial" }
      : { label: "Enviar feedback", action: "open-feedback" },
    secondaryAction: { label: "Guia tester", action: "open-tester-guide" },
  };
}

function startFreeTrial() {
  const membership = syncMembershipState();
  if (!membership.trialAvailable) {
    openLaunchPage();
    return;
  }

  const start = new Date();
  const end = new Date(start.getTime() + PRO_TRIAL_DAYS * 86400000);
  state.billing = {
    ...normalizeBilling(state.billing),
    tier: "trial",
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
    trialUsed: true,
  };
  persistState();
  render();
  showToast(`Beta ampliada activada por ${PRO_TRIAL_DAYS} dias.`);
}

function openLaunchPage() {
  const targetPath = withTrackedPath(LAUNCH_PAGE_PATH, ACQUISITION_SOURCE || "in-app");
  const popup = window.open(targetPath, "_blank", "noopener");
  if (!popup) {
    window.location.href = targetPath;
  }
}

function openFeedbackPage() {
  const targetPath = withTrackedPath(FEEDBACK_PAGE_PATH, ACQUISITION_SOURCE || "in-app");
  const popup = window.open(targetPath, "_blank", "noopener");
  if (!popup) {
    window.location.href = targetPath;
  }
}

function openTesterGuide() {
  const targetPath = withTrackedPath(TESTER_GUIDE_PATH, ACQUISITION_SOURCE || "in-app");
  const popup = window.open(targetPath, "_blank", "noopener");
  if (!popup) {
    window.location.href = targetPath;
  }
}

function captureAcquisitionSource() {
  const querySource = normalizeSourceTag(launchParams.get("source"));
  const savedSource = normalizeSourceTag(localStorage.getItem(ACQUISITION_SOURCE_KEY));
  const nextSource = querySource || savedSource || "";
  if (nextSource) {
    localStorage.setItem(ACQUISITION_SOURCE_KEY, nextSource);
  }
  return nextSource;
}

function normalizeSourceTag(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 40);
}

function withTrackedPath(path, fallbackSource) {
  const source = normalizeSourceTag(fallbackSource);
  if (!source) {
    return path;
  }

  const [basePath, hashPart = ""] = String(path || "/").split("#");
  const url = new URL(basePath || "/", window.location.origin);
  url.searchParams.set("source", source);
  return `${url.pathname}${url.search}${hashPart ? `#${hashPart}` : ""}`;
}

function loadState() {
  const candidates = [STORAGE_KEY, ...LEGACY_KEYS];

  for (const key of candidates) {
    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      continue;
    }
  }

  return createEmptyState();
}

function normalizeState(input) {
  const base = createEmptyState();
  const next = {
    profile: normalizeProfile(input?.profile),
    billing: normalizeBilling(input?.billing),
    transactions: normalizeTransactions(input?.transactions),
    receivables: normalizeReceivables(input?.receivables),
    protectedItems: normalizeProtectedItems(input?.protectedItems),
    goals: normalizeGoals(input?.goals),
  };

  if (
    !next.profile.setupComplete &&
    (next.transactions.length > 0 ||
      next.receivables.length > 0 ||
      next.protectedItems.length > 0 ||
      next.goals.length > 0)
  ) {
    next.profile.setupComplete = true;
    next.profile.source = next.profile.source || "legacy";
  }

  return { ...base, ...next };
}

function normalizeProfile(profile) {
  const chartMode = normalizeChartMode(profile?.chartMode);
  const chartRange = normalizeDateRange(profile?.chartStartDate, profile?.chartEndDate, chartMode);
  return {
    name: String(profile?.name || "").trim(),
    mode: normalizeMode(profile?.mode),
    greetingStyle: normalizeGreetingStyle(profile?.greetingStyle),
    motionEnabled: profile?.motionEnabled !== false,
    vibrationEnabled: profile?.vibrationEnabled !== false,
    darkMode: profile?.darkMode === true,
    largeText: profile?.largeText === true,
    tourSeen: profile?.tourSeen === true,
    chartMode,
    chartStartDate: chartRange.start,
    chartEndDate: chartRange.end,
    setupComplete: Boolean(profile?.setupComplete),
    source: String(profile?.source || ""),
    version: 5,
  };
}

function normalizeTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    return [];
  }

  return transactions
    .map((item) => ({
      id: String(item?.id || uid("txn")),
      type:
        item?.type === "income"
          ? "income"
          : item?.type === "saving"
            ? "saving"
            : "expense",
      title: String(item?.title || "").trim(),
      amount: toNumber(item?.amount),
      pocket: normalizePocket(item?.pocket),
      channel: String(item?.channel || "other"),
      date: validIsoDate(item?.date) ? item.date : isoToday(),
      note: String(item?.note || "").trim(),
    }))
    .filter((item) => item.title && item.amount > 0);
}

function normalizeReceivables(receivables) {
  if (!Array.isArray(receivables)) {
    return [];
  }

  return receivables
    .map((item) => ({
      id: String(item?.id || uid("rec")),
      person: String(item?.person || "").trim(),
      amount: toNumber(item?.amount),
      pocket: normalizePocket(item?.pocket),
      dueDate: validIsoDate(item?.dueDate) ? item.dueDate : isoToday(),
      note: String(item?.note || "").trim(),
      phone: sanitizePhone(String(item?.phone || "")),
      status: item?.status === "collected" ? "collected" : "pending",
      remindersCount: Number(item?.remindersCount || 0),
      lastReminderAt: String(item?.lastReminderAt || ""),
      createdAt: String(item?.createdAt || new Date().toISOString()),
    }))
    .filter((item) => item.person && item.amount > 0);
}

function normalizeProtectedItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      id: String(item?.id || uid("pro")),
      title: String(item?.title || "").trim(),
      amount: toNumber(item?.amount),
      pocket: normalizePocket(item?.pocket),
      dueDate: validIsoDate(item?.dueDate) ? item.dueDate : isoPlusDays(7),
      note: String(item?.note || "").trim(),
      status: item?.status === "paid" ? "paid" : "active",
      createdAt: String(item?.createdAt || new Date().toISOString()),
    }))
    .filter((item) => item.title && item.amount > 0);
}

function normalizeGoals(goals) {
  if (!Array.isArray(goals)) {
    return [];
  }

  return goals
    .map((item) => ({
      id: String(item?.id || uid("goal")),
      title: String(item?.title || "").trim(),
      target: toNumber(item?.target),
      current: toNumber(item?.current),
      pocket: normalizePocket(item?.pocket),
      dueDate: validIsoDate(item?.dueDate) ? item.dueDate : isoPlusDays(30),
      note: String(item?.note || "").trim(),
      status: item?.status === "done" ? "done" : "active",
      createdAt: String(item?.createdAt || new Date().toISOString()),
    }))
    .filter((item) => item.title && item.target > 0);
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
}

function replaceState(nextState) {
  const normalized = normalizeState(nextState);
  state.profile = normalized.profile;
  state.billing = normalized.billing;
  state.transactions = normalized.transactions;
  state.receivables = normalized.receivables;
  state.protectedItems = normalized.protectedItems;
  state.goals = normalized.goals;
}

function createEmptyState() {
  return {
    profile: {
      name: "",
      mode: "both",
      greetingStyle: "warm",
      motionEnabled: true,
      vibrationEnabled: true,
      darkMode: false,
      largeText: false,
      tourSeen: false,
      chartMode: "week",
      chartStartDate: isoPlusDays(-6),
      chartEndDate: isoToday(),
      setupComplete: false,
      source: "",
      version: 5,
    },
    billing: {
      tier: "free",
      trialStartedAt: "",
      trialEndsAt: "",
      trialUsed: false,
      aiWindowStartedAt: new Date().toISOString(),
      aiQuestionsUsed: 0,
    },
    transactions: [],
    receivables: [],
    protectedItems: [],
    goals: [],
  };
}

function createDemoState() {
  const today = new Date();
  const iso = (days) => isoDate(addDays(today, days));

  return normalizeState({
      profile: {
        name: "Mari",
        mode: "both",
        greetingStyle: "push",
        motionEnabled: true,
        vibrationEnabled: true,
        darkMode: false,
        largeText: false,
        tourSeen: true,
        chartMode: "month",
        chartStartDate: isoDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1, 12)),
        chartEndDate: isoToday(),
        setupComplete: true,
        source: "demo",
        version: 5,
      },
    transactions: [
      {
        id: uid("txn"),
        type: "income",
        title: "Ventas de almuerzos",
        amount: 86,
        pocket: "business",
        channel: "cash",
        date: iso(0),
        note: "Cierre del mediodia",
      },
      {
        id: uid("txn"),
        type: "income",
        title: "Transferencia de mi hermana",
        amount: 80,
        pocket: "home",
        channel: "transfer",
        date: iso(-1),
        note: "Para casa",
      },
      {
        id: uid("txn"),
        type: "income",
        title: "Anticipo uniforme",
        amount: 36,
        pocket: "shared",
        channel: "transfer",
        date: iso(-2),
        note: "Pedido de una vecina",
      },
      {
        id: uid("txn"),
        type: "saving",
        title: "Ahorro semanal",
        amount: 18,
        pocket: "home",
        channel: "saving",
        date: iso(-1),
        note: "Apartado para no tocarlo",
      },
      {
        id: uid("txn"),
        type: "expense",
        title: "Compra de pollo y arroz",
        amount: 42,
        pocket: "business",
        channel: "cash",
        date: iso(0),
        note: "Reposicion",
      },
      {
        id: uid("txn"),
        type: "expense",
        title: "Recarga y pasaje",
        amount: 11.5,
        pocket: "home",
        channel: "cash",
        date: iso(-1),
        note: "Dia a dia",
      },
      {
        id: uid("txn"),
        type: "expense",
        title: "Entrega de encargo",
        amount: 14,
        pocket: "shared",
        channel: "transfer",
        date: iso(-2),
        note: "Compra para cumplir pedido",
      },
    ],
    receivables: [
      {
        id: uid("rec"),
        person: "Andrea",
        amount: 28,
        pocket: "business",
        dueDate: iso(0),
        note: "Uniformes escolares",
        phone: "593991234567",
        status: "pending",
        remindersCount: 1,
        lastReminderAt: new Date().toISOString(),
      },
      {
        id: uid("rec"),
        person: "Carlos",
        amount: 16,
        pocket: "home",
        dueDate: iso(-1),
        note: "Prestamo corto",
        phone: "593987654321",
        status: "pending",
        remindersCount: 0,
        lastReminderAt: "",
      },
    ],
    protectedItems: [
      {
        id: uid("pro"),
        title: "Arriendo",
        amount: 62,
        pocket: "home",
        dueDate: iso(3),
        note: "No tocar",
        status: "active",
      },
      {
        id: uid("pro"),
        title: "Gas y luz",
        amount: 16,
        pocket: "home",
        dueDate: iso(5),
        note: "Servicios",
        status: "active",
      },
      {
        id: uid("pro"),
        title: "Compra de aceite",
        amount: 21,
        pocket: "business",
        dueDate: iso(7),
        note: "Para seguir vendiendo",
        status: "active",
      },
    ],
    goals: [
      {
        id: uid("goal"),
        title: "Colchon de emergencia",
        target: 120,
        current: 45,
        pocket: "home",
        dueDate: iso(45),
        note: "Para no pedir prestado a fin de mes",
        status: "active",
      },
    ],
  });
}

function computeSetupSnapshot(currentState) {
  const normalizedTransactions = normalizeTransactions(currentState.transactions);
  const balances = pocketDefinitions.reduce((result, pocket) => {
    const balance = normalizedTransactions
      .filter((txn) => txn.pocket === pocket.id)
      .reduce((total, txn) => total + (txn.type === "income" ? txn.amount : -txn.amount), 0);
    result[pocket.id] = Math.max(roundMoney(balance), 0);
    return result;
  }, {});

  return {
    homeStart: balances.home || "",
    businessStart: balances.business || "",
    sharedStart: balances.shared || "",
  };
}

function buildStateFromSetup(draft) {
  const next = createEmptyState();
  next.profile = {
    ...next.profile,
    name: String(draft.name || "").trim(),
    mode: normalizeMode(draft.mode),
    setupComplete: true,
    source: "custom",
    version: 5,
  };
  next.billing = normalizeBilling(state.billing);

  const starters = [
    { pocket: "home", amount: draft.homeStart, title: "Saldo inicial - Casa" },
    { pocket: "business", amount: draft.businessStart, title: "Saldo inicial - Negocio" },
    { pocket: "shared", amount: draft.sharedStart, title: "Saldo inicial - Encargos" },
  ]
    .filter((item) => item.amount > 0)
    .map((item) => ({
      id: uid("txn"),
      type: "income",
      title: item.title,
      amount: item.amount,
      pocket: item.pocket,
      channel: "other",
      date: isoToday(),
      note: "Base inicial",
    }));

  next.transactions = starters;

  if (draft.paymentTitle && draft.paymentAmount > 0) {
    next.protectedItems = [
      {
        id: uid("pro"),
        title: draft.paymentTitle,
        amount: draft.paymentAmount,
        pocket: draft.paymentPocket,
        dueDate: draft.paymentDate,
        note: draft.paymentNote,
        status: "active",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  return next;
}

function reserveRatioForDate(dateValue) {
  const days = dayDelta(dateValue);
  if (days <= 7) {
    return 1;
  }
  if (days <= 14) {
    return 0.5;
  }
  return 0.25;
}

function pocketName(pocketId) {
  return pocketDefinitions.find((item) => item.id === pocketId)?.name || "Sin bolsillo";
}

function pocketMessage(pocketId, balance, mode) {
  if (mode === "home" && pocketId === "business") {
    return "No es tu foco principal, pero sigue visible.";
  }
  if (mode === "business" && pocketId === "home") {
    return "La casa sigue a la vista por si se cruza.";
  }
  if (pocketId === "home") {
    return balance >= 30 ? "Casa con algo de aire." : "Casa necesita cuidado fino.";
  }
  if (pocketId === "business") {
    return balance >= 40 ? "Negocio puede reponer sin apuro." : "No vacies negocio para tapar todo.";
  }
  return balance >= 0 ? "Encargos claros y separados." : "Este bolsillo esta absorbiendo de mas.";
}

function buildTopReceivableMessage(item) {
  if (item.dueDays < 0) {
    return `${item.person} ya se atraso. Recuperar ${formatMoney(item.amount)} te sube el usable del dia sin vender mas.`;
  }
  if (item.dueDays === 0) {
    return `${item.person} deberia pagarte hoy. Si entra, tu usable cambia de inmediato.`;
  }
  return `${item.person} te prometio pagar pronto. Tenerlo visible evita que se te enfrie el cobro.`;
}

function normalizeMode(mode) {
  return PROFILE_MODES.includes(mode) ? mode : "both";
}

function normalizeGreetingStyle(style) {
  return GREETING_STYLES.includes(style) ? style : "warm";
}

function normalizeLooseText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeChartMode(mode) {
  return CHART_MODES.includes(mode) ? mode : "week";
}

function defaultChartRange(mode) {
  const safeMode = normalizeChartMode(mode);
  const today = isoToday();

  if (safeMode === "month") {
    const now = new Date();
    return {
      start: isoDate(new Date(now.getFullYear(), now.getMonth(), 1, 12)),
      end: today,
    };
  }

  if (safeMode === "year") {
    const now = new Date();
    return {
      start: isoDate(new Date(now.getFullYear(), 0, 1, 12)),
      end: today,
    };
  }

  return {
    start: isoPlusDays(-6),
    end: today,
  };
}

function normalizeDateRange(startDate, endDate, mode) {
  const defaults = defaultChartRange(mode);
  let start = validIsoDate(startDate) ? startDate : defaults.start;
  let end = validIsoDate(endDate) ? endDate : defaults.end;

  if (compareIsoDates(start, end) > 0) {
    [start, end] = [end, start];
  }

  return { start, end };
}

function applyChartMode(mode) {
  const safeMode = normalizeChartMode(mode);
  if (safeMode !== "week" && !currentMembership?.hasAdvancedCharts) {
    showToast("Mensual y anual se abren con la beta ampliada.");
    return;
  }
  const defaults = defaultChartRange(safeMode);
  state.profile.chartMode = safeMode;
  state.profile.chartStartDate = defaults.start;
  state.profile.chartEndDate = defaults.end;
}

function normalizePocket(value) {
  return pocketDefinitions.some((item) => item.id === value) ? value : "business";
}

function defaultPocketForKind(kind, mode) {
  const safeMode = normalizeMode(mode);
  if (safeMode === "home") {
    return "home";
  }
  if (safeMode === "business") {
    return "business";
  }
  if (kind === "saving") {
    return "home";
  }
  return kind === "protect" ? "home" : "business";
}

function validIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isValidDateTime(value) {
  return Number.isFinite(Date.parse(String(value || "")));
}

function compareIsoDates(left, right) {
  return String(left || "").localeCompare(String(right || ""));
}

function formatMoney(amount) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function shortDayLabel(dateValue) {
  return new Intl.DateTimeFormat("es-EC", { weekday: "short" })
    .format(new Date(`${dateValue}T12:00:00`))
    .replace(".", "");
}

function longDateLabel(dateValue) {
  return new Intl.DateTimeFormat("es-EC", { day: "numeric", month: "short" })
    .format(new Date(`${dateValue}T12:00:00`))
    .replace(".", "");
}

function dayOfMonth(dateValue) {
  return new Intl.DateTimeFormat("es-EC", { day: "numeric" }).format(new Date(`${dateValue}T12:00:00`));
}

function dayDelta(dateValue) {
  const start = new Date(`${isoToday()}T12:00:00`);
  const end = new Date(`${dateValue}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function getDueState(dateValue) {
  const days = dayDelta(dateValue);
  if (days < 0) {
    return "overdue";
  }
  if (days === 0) {
    return "today";
  }
  if (days <= 3) {
    return "soon";
  }
  return "calm";
}

function urgencyTag(stateValue) {
  if (stateValue === "overdue") {
    return { className: "urgent", label: "Atrasado" };
  }
  if (stateValue === "today") {
    return { className: "today", label: "Hoy" };
  }
  if (stateValue === "soon") {
    return { className: "today", label: "Esta semana" };
  }
  return { className: "calm", label: "Mas adelante" };
}

function addDays(dateValue, days) {
  const next = new Date(dateValue);
  next.setDate(next.getDate() + days);
  return next;
}

function isoDate(dateValue) {
  return dateValue.toISOString().slice(0, 10);
}

function isoToday() {
  return isoDate(new Date());
}

function isoPlusDays(days) {
  return isoDate(addDays(new Date(), days));
}

function toNumber(value) {
  return roundMoney(Number.parseFloat(String(value || "").replace(",", ".")) || 0);
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function sanitizePhone(value) {
  return value.replace(/[^\d]/g, "");
}

function safeNumberInput(value) {
  return value === "" || value === null || value === undefined ? "" : String(value);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden");

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    elements.toast.classList.add("hidden");
  }, 2200);
}

function setupTouchFeedback() {
  document.addEventListener("pointerdown", (event) => {
    if (!state.profile.motionEnabled) {
      return;
    }

    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const rect = button.getBoundingClientRect();
    button.style.setProperty("--tap-x", `${event.clientX - rect.left}px`);
    button.style.setProperty("--tap-y", `${event.clientY - rect.top}px`);
    button.classList.add("is-pressing");
  });

  const releasePressState = () => {
    document.querySelectorAll("button.is-pressing").forEach((button) => {
      button.classList.remove("is-pressing");
    });
  };

  document.addEventListener("pointerup", releasePressState);
  document.addEventListener("pointercancel", releasePressState);
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    triggerHaptic();
  });
}

function triggerHaptic() {
  if (!state.profile.vibrationEnabled || typeof navigator.vibrate !== "function") {
    return;
  }

  navigator.vibrate(12);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (["127.0.0.1", "localhost"].includes(window.location.hostname)) {
    window.addEventListener("load", async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      } catch (error) {
        // ignore
      }

      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        } catch (error) {
          // ignore
        }
      }
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      // ignore
    });
  });
}
