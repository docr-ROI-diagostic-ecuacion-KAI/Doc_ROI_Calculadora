const docroiCleanStateKey = "docroi-session-state-v6";
const docroiCleanFlagKey = "docroi-session-active-v6";

function docroiBlankEconomicState() {
  if (!state.meta) state.meta = {};
  if (!state.kai) state.kai = {};
  state.kaiUx = {};
  state.economic = {
    incomePotential: "",
    incomeCapture: "",
    efficiencyPotential: "",
    efficiencyCapture: "",
    attributableCost: "",
    periodMonths: ""
  };
}

function docroiClearLegacyDataOnNewSession() {
  const oldKeys = [
    "docroi-state-v3-rgpd",
    "docroi-session-state-v5",
    "docroi-session-active-v5",
    "docroi-session-state-v6"
  ];
  const hasCleanSession = sessionStorage.getItem(docroiCleanFlagKey) === "1";
  if (!hasCleanSession) {
    oldKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    state = blankState();
    docroiBlankEconomicState();
    sessionStorage.setItem(docroiCleanFlagKey, "1");
  } else {
    const saved = sessionStorage.getItem(docroiCleanStateKey);
    if (saved) {
      try { state = JSON.parse(saved); } catch { state = blankState(); }
    }
    docroiBlankEconomicState();
    Object.assign(state.economic, (JSON.parse(sessionStorage.getItem(docroiCleanStateKey) || "{}") || {}).economic || {});
  }
}

docroiClearLegacyDataOnNewSession();

saveState = function saveStateCleanSessionOnly() {
  sessionStorage.setItem(docroiCleanStateKey, JSON.stringify(state));
  localStorage.removeItem(STORAGE_KEY);
};

function docroiRatingQuestion(question) {
  const value = docroiExecutiveScore(question);
  const buttons = [1, 2, 3, 4, 5]
    .map((score) => `<button type="button" class="${Number(value) === score ? "selected" : ""}" data-kai-score="${question.id}" data-score="${score}"><strong>${score}</strong><span>${docroiMaturityLabels[score]}</span></button>`)
    .join("");
  return `<article class="exec-question exec-question-clean"><div class="exec-question-head"><div><h3>${question.question}</h3><p>${question.help}</p></div></div><div class="rating-row">${buttons}</div></article>`;
}

function docroiEconomicBlock() {
  return `<section class="kai-economics"><div><p class="eyebrow">Base economica ejecutiva</p><h3>Datos para ROI y Customer Equity</h3><p>Completa solo lo que puedas defender. Si falta una pieza clave, el resultado se queda como No calculable para no inventar rentabilidad.</p></div><div class="field-grid">${docroiEconomicInput("economic.incomePotential", "Valor economico potencial", "Ingreso, margen o valor que podria capturarse si el escenario funciona.")}${docroiEconomicInput("economic.incomeCapture", "Porcentaje capturable de ese valor", "Escribe 25 para 25%. Debe ser una hipotesis defendible.")}${docroiEconomicInput("economic.efficiencyPotential", "Ahorro o eficiencia potencial", "Valor economico de horas liberadas, automatizacion, productividad o menor coste operativo.")}${docroiEconomicInput("economic.efficiencyCapture", "Porcentaje capturable de la eficiencia", "Escribe 15 para 15%. Usa 0 solo si sabes que no aplica.")}${docroiEconomicInput("economic.attributableCost", "Coste atribuible de la iniciativa", "Coste que el escenario debe recuperar antes de crear retorno.")}${docroiEconomicInput("economic.periodMonths", "Horizonte de analisis", "Meses del escenario. Si lo dejas vacio, el modelo usara 12 meses para el payback.")}</div></section>`;
}

renderEquity = function renderEquityExecutiveConversationClean() {
  docroiEnsureObjects();
  docroiSyncKaiUx();
  const result = calculate().kai;
  const answered = docroiKaiQuestions.filter((question) => hasInput(state.kaiUx?.[question.id])).length;
  return `<div class="kai-intro executive-kai-intro"><div><p class="eyebrow">Diagnosis cabinet</p><h3>Diagnostico C-Level</h3><p>Responde con criterio de direccion. Esta conversacion traduce Customer Equity a decisiones de negocio: clientes, datos, eficiencia, satisfaccion, oferta y valor economico.</p></div><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Ver base conceptual</a></div><div class="plain-note executive-note"><strong>${answered}/10 dimensiones respondidas</strong><p>La estructura formal KAI·ROI v1 queda custodiada internamente. En esta pantalla solo trabajamos con lenguaje de negocio y madurez ejecutiva.</p></div><div class="exec-question-list">${docroiKaiQuestions.map(docroiRatingQuestion).join("")}</div>${docroiEconomicBlock()}<div class="explainer-grid kai-summary"><div class="explainer"><span>Potencial de activacion</span><strong>${result.incomplete ? "Pendiente" : docroiFormatPercentDot(result.kaiStar, 3)}</strong></div><div class="explainer"><span>Orquestacion cliente-oferta</span><strong>${result.incomplete ? "Pendiente" : docroiFormatPercentDot(result.spo, 1)}</strong></div><div class="explainer"><span>Madurez ejecutiva</span><strong>${docroiFormatScore(result.maturityAverage)}/5</strong></div></div>`;
};

const docroiPreviousResetButton = document.getElementById("resetExample");
if (docroiPreviousResetButton) {
  docroiPreviousResetButton.addEventListener("click", () => {
    sessionStorage.removeItem(docroiCleanStateKey);
    sessionStorage.removeItem(docroiCleanFlagKey);
    localStorage.removeItem(STORAGE_KEY);
    state = blankState();
    docroiBlankEconomicState();
    saveState();
    renderCurrentStep();
  });
}

updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
