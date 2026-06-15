const docroiSessionStateKey = "docroi-session-state-v5";
const docroiSessionFlagKey = "docroi-session-active-v5";

function docroiEnsureObjects() {
  if (!state.meta) state.meta = {};
  if (!state.kai) state.kai = {};
  if (!state.kaiUx) state.kaiUx = {};
  if (!state.economic) state.economic = { incomePotential: "", incomeCapture: "", efficiencyPotential: "", efficiencyCapture: "", attributableCost: "", periodMonths: "12" };
}

function docroiStartCleanSession() {
  try {
    const hasSession = sessionStorage.getItem(docroiSessionFlagKey) === "1";
    if (!hasSession) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(docroiSessionStateKey);
      state = blankState();
      sessionStorage.setItem(docroiSessionFlagKey, "1");
    } else {
      const saved = sessionStorage.getItem(docroiSessionStateKey);
      if (saved) state = JSON.parse(saved);
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    state = blankState();
  }
  docroiEnsureObjects();
}

docroiStartCleanSession();

saveState = function saveStateSessionOnly() {
  docroiEnsureObjects();
  sessionStorage.setItem(docroiSessionStateKey, JSON.stringify(state));
  localStorage.removeItem(STORAGE_KEY);
};

const docroiMaturityLabels = {
  1: "Ausente",
  2: "Debil",
  3: "Parcial",
  4: "Maduro",
  5: "Optimizado"
};

const docroiKaiQuestions = [
  { id: "strategy", title: "Inteligencia", symbol: "φ_i", axis: "Inteligencia (φ_i)", axisHelp: "Criterio aplicado a la decision.", question: "¿Tu empresa toma decisiones basadas en objetivos realmente compartidos?", help: "Evalua hasta que punto direccion, ventas, marketing, operaciones y finanzas trabajan con prioridades comunes.", paths: ["kai.phi"], lowRisk: "Las decisiones pueden generar mucha actividad, pero poco valor coordinado.", recommendation: "Crear un marco comun de objetivos, KPIs y prioridades ejecutivas." },
  { id: "decision", title: "Estructura", symbol: "u_i", axis: "Estructura (u_i)", axisHelp: "Input estructural del modelo.", question: "¿Las prioridades comerciales y operativas se deciden con criterios claros y repetibles?", help: "Mide si la organizacion prioriza clientes, acciones e inversiones con reglas comprensibles y trazables.", paths: ["kai.usability"], lowRisk: "La ejecucion puede depender demasiado de criterio individual o presion de corto plazo.", recommendation: "Definir criterios de decision compartidos para priorizar inversion, clientes y acciones." },
  { id: "relationship", title: "Factor operativo", symbol: "f_i", axis: "Factor operativo (f_i)", axisHelp: "Capacidad de activar informacion.", question: "¿La empresa mantiene una relacion activa y recurrente con sus clientes?", help: "Observa si la relacion con el cliente se gestiona de forma continua, no solo en momentos de venta.", paths: ["kai.frequency"], lowRisk: "Puede perderse recurrencia, recomendacion y visibilidad sobre oportunidades reales.", recommendation: "Activar ciclos de contacto, seguimiento y aprendizaje sobre comportamiento cliente." },
  { id: "intelligence", title: "Dato + IA", symbol: "ψ_i", axis: "Dato + IA (ψ_i)", axisHelp: "Dato util para decidir.", question: "¿Los datos de clientes y negocio se convierten realmente en informacion util para decidir?", help: "Evalua si los datos estan disponibles, ordenados y transformados en informacion accionable para direccion.", paths: ["kai.dataActivation", "kai.networkIndex"], lowRisk: "La organizacion puede tener datos, pero no convertirlos en decisiones economicas.", recommendation: "Conectar datos, decisiones y acciones comerciales con responsables y cadencia clara." },
  { id: "rfm", title: "Cliente", symbol: "CC_i", axis: "Cliente (CC_i)", axisHelp: "Lectura de comportamiento cliente.", question: "¿La empresa diferencia clientes segun frecuencia, valor y nivel de actividad?", help: "Ayuda a saber si la empresa distingue clientes activos, recurrentes, dormidos o de alto valor.", paths: ["kai.cc"], lowRisk: "Todos los clientes pueden recibir el mismo tratamiento aunque no tengan el mismo valor.", recommendation: "Segmentar cartera por comportamiento para priorizar retencion, crecimiento y reactivacion." },
  { id: "abcd", title: "Oferta", symbol: "ABCD_i", axis: "Oferta (ABCD_i)", axisHelp: "Rentabilidad e impacto de oferta.", question: "¿Tus productos o servicios estan clasificados segun rentabilidad e impacto real?", help: "Mide si el portfolio se gestiona segun margen, demanda, valor estrategico y capacidad de crecimiento.", paths: ["kai.abcd"], lowRisk: "La empresa puede impulsar productos visibles pero no necesariamente rentables.", recommendation: "Ordenar la oferta por contribucion economica, potencial comercial e impacto estrategico." },
  { id: "nps", title: "Satisfaccion", symbol: "NPS_i", axis: "Satisfaccion (NPS_i)", axisHelp: "Senal de experiencia y lealtad.", question: "¿La satisfaccion del cliente se mide y utiliza para mejorar decisiones?", help: "Evalua si la experiencia del cliente se convierte en senal de riesgo, lealtad y oportunidad.", paths: ["kai.nps"], lowRisk: "La voz del cliente puede llegar tarde o no influir en las decisiones clave.", recommendation: "Vincular satisfaccion, reclamaciones y recomendacion con decisiones de producto y servicio." },
  { id: "spo", title: "SPO", symbol: "SPO_i", axis: "SPO (SPO_i)", axisHelp: "Orquestacion cliente-oferta.", question: "¿Existe una forma estructurada de priorizar clientes, oferta y acciones?", help: "Evalua si la empresa conecta clientes, oferta, satisfaccion y rentabilidad en una misma logica de actuacion.", paths: [], lowRisk: "Puede haber dispersion comercial: muchas acciones, poca prioridad y valor dificil de defender.", recommendation: "Crear una matriz ejecutiva de priorizacion entre cartera, oferta, esfuerzo y retorno." },
  { id: "productivity", title: "Productividad", symbol: "P_i", axis: "Productividad (P_i)", axisHelp: "Eficiencia de ejecucion.", question: "¿La organizacion mide realmente productividad y eficiencia operativa?", help: "Mide si las decisiones se ejecutan con tiempos, recursos y eficiencia observables.", paths: ["kai.purpose"], lowRisk: "El crecimiento puede aumentar complejidad y coste sin mejorar margen.", recommendation: "Unir objetivos comerciales con productividad, capacidad operativa y eficiencia por proceso." },
  { id: "portfolio", title: "Cartera", symbol: "Γ_g(i),t", axis: "Cartera (Γ_g(i),t)", axisHelp: "Capacidad evaluada por el diagnostico.", question: "¿La empresa monitoriza la salud y evolucion de su cartera de clientes?", help: "Observa si la direccion entiende evolucion, riesgo, recurrencia y valor futuro de su cartera.", paths: ["kai.context"], lowRisk: "La empresa puede reaccionar tarde ante deterioro de cartera, churn o cambios de mercado.", recommendation: "Implantar una lectura recurrente de cartera, riesgo, recurrencia, crecimiento y contexto." }
];

function docroiSetPath(path, value) { const keys = path.split("."); const last = keys.pop(); const target = keys.reduce((obj, key) => { if (!obj[key]) obj[key] = {}; return obj[key]; }, state); target[last] = value; }
function docroiScoreFromPercent(value) { if (!hasInput(value)) return ""; const raw = n(value); if (raw >= 1 && raw <= 5) return Math.round(raw); return Math.min(5, Math.max(1, Math.round(raw / 20))); }
function docroiExecutiveScore(question) { if (hasInput(state.kaiUx?.[question.id])) return Number(state.kaiUx[question.id]); const firstPath = question.paths?.[0]; if (firstPath) return docroiScoreFromPercent(readPath(firstPath)); return ""; }
function docroiScoreToDecimal(score) { return Math.min(5, Math.max(1, n(score))) / 5; }
function docroiKaiScore(id) { const question = docroiKaiQuestions.find((item) => item.id === id); return docroiScoreToDecimal(state.kaiUx?.[id] || docroiExecutiveScore(question) || 0); }
function docroiSyncKaiUx() { docroiKaiQuestions.forEach((question) => { const score = docroiExecutiveScore(question); if (!hasInput(score)) return; state.kaiUx[question.id] = Number(score); question.paths.forEach((path) => docroiSetPath(path, Number(score) * 20)); }); }
function docroiMaturityText(score) { return docroiMaturityLabels[Math.round(n(score))] || "Pendiente"; }
function docroiScoreList() { return docroiKaiQuestions.map((question) => docroiExecutiveScore(question)).filter((score) => hasInput(score)).map(Number); }
function docroiAverageScore() { const scores = docroiScoreList(); return scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : null; }
function docroiFormatPercentComma(value, digits = 1) { return value === null || value === undefined || Number.isNaN(value) ? "No calculable" : new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n(value)).replace(/\s/g, ""); }
function docroiFormatPercentDot(value, digits = 1) { return value === null || value === undefined || Number.isNaN(value) ? "Pendiente" : `${(n(value) * 100).toFixed(digits)}%`; }
function docroiFormatScore(value) { return value === null || value === undefined || Number.isNaN(value) ? "Pendiente" : new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n(value)); }
function docroiEconomicValue(path) { return readPath(path); }
function docroiEconomicPair(valuePath, capturePath) {
  const value = docroiEconomicValue(valuePath);
  const capture = docroiEconomicValue(capturePath);
  const bothEmpty = !hasInput(value) && !hasInput(capture);
  if (bothEmpty) return { active: false, complete: true, amount: 0, base: 0 };
  if (!hasInput(value) || !hasInput(capture)) return { active: true, complete: false, amount: null, base: null };
  return { active: true, complete: true, amount: n(value) * (n(capture) / 100), base: n(value) };
}
function docroiMoneyOrPending(value) { return value === null || value === undefined || Number.isNaN(value) ? "No calculable" : money(value); }
function docroiMonthsOrPending(value) { return value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value) ? "No calculable" : `${num(value)} meses`; }

calculateKai = function calculateKaiExecutiveLayer() {
  docroiEnsureObjects();
  docroiSyncKaiUx();
  const answered = docroiKaiQuestions.filter((question) => hasInput(state.kaiUx?.[question.id])).length;
  const missing = docroiKaiQuestions.filter((question) => !hasInput(state.kaiUx?.[question.id])).map((question) => question.id);
  if (missing.length) return { incomplete: true, missing, psi: null, spo: null, kaiStar: null, ce: null, md: null, cost: null, answered, scores: {}, maturityAverage: docroiAverageScore() };
  const scores = {
    phi: docroiKaiScore("strategy"),
    u: docroiKaiScore("decision"),
    f: docroiKaiScore("relationship"),
    psi: docroiKaiScore("intelligence"),
    cc: docroiKaiScore("rfm"),
    abcd: docroiKaiScore("abcd"),
    nps: docroiKaiScore("nps"),
    spoVisual: docroiKaiScore("spo"),
    p: docroiKaiScore("productivity"),
    gamma: docroiKaiScore("portfolio")
  };
  const psi = scores.psi;
  const spo = scores.cc * scores.abcd * scores.nps;
  const kaiStar = scores.phi * scores.u * scores.f * psi * spo * scores.p * scores.gamma;
  return { incomplete: false, psi, spo, kaiStar, ce: null, answered, scores, maturityAverage: docroiAverageScore() };
};

function docroiRatingQuestion(question, index) { const value = docroiExecutiveScore(question); const buttons = [1, 2, 3, 4, 5].map((score) => `<button type="button" class="${Number(value) === score ? "selected" : ""}" data-kai-score="${question.id}" data-score="${score}"><strong>${score}</strong><span>${docroiMaturityLabels[score]}</span></button>`).join(""); return `<article class="exec-question"><div class="exec-question-head"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${question.question}</h3><p>${question.help}</p></div></div><div class="rating-row">${buttons}</div></article>`; }
function docroiExecutiveSummaryRows() { return docroiKaiQuestions.map((question) => { const score = docroiExecutiveScore(question); const interpretation = hasInput(score) ? Number(score) <= 2 ? question.lowRisk : Number(score) === 3 ? "Existe una base aprovechable, pero todavia no opera con suficiente consistencia ejecutiva." : "La organizacion muestra una capacidad solida para convertir esta dimension en valor." : "Pendiente de respuesta."; return `<tr><td><strong>${question.title}</strong></td><td>${hasInput(score) ? `${score}/5 - ${docroiMaturityText(score)}` : "Pendiente"}</td><td>${interpretation}</td><td>${question.recommendation}</td></tr>`; }).join(""); }

function docroiExecutiveMetrics(result) {
  const kai = result.kai || {};
  const income = docroiEconomicPair("economic.incomePotential", "economic.incomeCapture");
  const efficiency = docroiEconomicPair("economic.efficiencyPotential", "economic.efficiencyCapture");
  const hasAnyReturn = income.active || efficiency.active;
  const returnComplete = hasAnyReturn && income.complete && efficiency.complete;
  const grossReturn = returnComplete ? income.amount + efficiency.amount : null;
  const economicBase = returnComplete ? income.base + efficiency.base : null;
  const costRaw = hasInput(readPath("economic.attributableCost")) ? n(readPath("economic.attributableCost")) : null;
  const wacc = hasInput(readPath("meta.wacc")) ? decimalFromPercentPath("meta.wacc") : null;
  const roiSimple = grossReturn !== null && costRaw !== null && costRaw > 0 ? (grossReturn - costRaw) / costRaw : null;
  const customerEquity = roiSimple !== null && wacc !== null ? roiSimple - wacc : null;
  const margin = grossReturn !== null && economicBase !== null && economicBase > 0 ? grossReturn / economicBase : null;
  const period = hasInput(readPath("economic.periodMonths")) ? Math.max(1, n(readPath("economic.periodMonths"))) : 12;
  const payback = grossReturn !== null && grossReturn > 0 && costRaw !== null && costRaw > 0 ? costRaw / (grossReturn / period) : null;
  const avg = kai.maturityAverage ?? docroiAverageScore();
  const minScore = docroiScoreList().length ? Math.min(...docroiScoreList()) : null;
  return { grossReturn, economicBase, cost: costRaw, roiSimple, wacc, customerEquity, margin, payback, period, avg, minScore, monetizationGrade: avg === null ? null : avg / 5, positivePortfolio: customerEquity === null ? null : customerEquity > 0 ? 1 : 0 };
}

function docroiMetricCard(title, value, description, reading) { return `<article class="kai-metric-card"><span>${title}</span><strong>${value}</strong><p>${description}</p><div><b>Lectura simple</b><p>${reading}</p></div></article>`; }
function docroiEconomicInput(path, label, help, type = "number") { const id = path.replaceAll(".", "-"); return `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-path="${path}" type="${type}" value="${displayValue(readPath(path))}"><small>${help}</small></div>`; }
function docroiEconomicBlock() { return `<section class="kai-economics"><div><p class="eyebrow">Base economica ejecutiva</p><h3>Datos para ROI y Customer Equity</h3><p>Estos campos alimentan el calculo financiero: Retorno bruto = (valor potencial x % captura) + (eficiencia potencial x % captura). Si falta un dato clave, el resultado queda como No calculable.</p></div><div class="field-grid">${docroiEconomicInput("economic.incomePotential", "Ingreso o margen potencial estimado", "I_i,s. Valor economico potencial del escenario.")}${docroiEconomicInput("economic.incomeCapture", "% capturable del ingreso", "R_i,s. Escribe 25 para 25%.")}${docroiEconomicInput("economic.efficiencyPotential", "Eficiencia economica potencial", "E_i,s. Ahorro o eficiencia monetizable.")}${docroiEconomicInput("economic.efficiencyCapture", "% capturable de eficiencia", "Q_i,s. Escribe 15 para 15%.")}${docroiEconomicInput("economic.attributableCost", "Coste atribuible de la iniciativa", "C_i. Coste que debe recuperar el escenario.")}${docroiEconomicInput("economic.periodMonths", "Periodo de analisis (meses)", "Por defecto, 12 meses.")}</div></section>`; }
function docroiRadarBlock(result) {
  const metrics = docroiExecutiveMetrics(result);
  const center = 160;
  const radius = 118;
  const axes = docroiKaiQuestions.map((question, index) => {
    const score = Number(docroiExecutiveScore(question) || 0);
    const angle = (-90 + (360 / docroiKaiQuestions.length) * index) * Math.PI / 180;
    return { question, score, angle, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius, px: center + Math.cos(angle) * radius * (score / 5), py: center + Math.sin(angle) * radius * (score / 5) };
  });
  const points = axes.map((axis) => `${axis.px},${axis.py}`).join(" ");
  const rings = [1, 2, 3, 4, 5].map((ring) => `<circle cx="${center}" cy="${center}" r="${radius * ring / 5}" fill="none" stroke="#e4e4e4" stroke-width="1" />`).join("");
  const spokes = axes.map((axis) => `<line x1="${center}" y1="${center}" x2="${axis.x}" y2="${axis.y}" stroke="#e4e4e4" stroke-width="1" />`).join("");
  const dots = axes.map((axis) => `<circle cx="${axis.px}" cy="${axis.py}" r="4" fill="#111" />`).join("");
  const axisCards = axes.map((axis) => `<article class="kai-axis-card"><span>${axis.question.axis}</span><strong>${axis.score || "Pendiente"}${axis.score ? "/5" : ""}</strong><p>${axis.question.axisHelp}</p></article>`).join("");
  return `<section class="kai-radar-section"><h3>Mapa ejecutivo de capacidades KAI·ROI</h3><p>Vista directiva de las capacidades que alimentan el diagnostico. El objetivo no es leer una formula, sino identificar que palancas sostienen o frenan la creacion de Customer Equity.</p><div class="kai-radar-layout"><div class="kai-radar-figure"><svg viewBox="0 0 320 320" role="img" aria-label="Radar KAI ROI"><rect width="320" height="320" fill="#fff" />${rings}${spokes}<polygon points="${points}" fill="rgba(0,59,92,.16)" stroke="#003B5C" stroke-width="2" />${dots}</svg><div class="kai-radar-numbers">${axes.map((axis) => `<span>${axis.score || "-"}</span>`).join("")}</div><p>Escala 1-5 · promedio ${docroiFormatScore(metrics.avg)}/5</p></div><div class="kai-radar-read"><strong>Lectura rapida</strong><p>Los ejes mas cercanos al centro senalan capacidades a reforzar. Los ejes hacia el borde muestran fortalezas para escalar Customer Equity.</p></div></div><div class="kai-axis-grid">${axisCards}</div></section>`;
}
function docroiMonetizationText(value) { if (value === null) return "Responde las capacidades KAI·ROI para estimar el grado de monetizacion del dato."; if (value <= 0.25) return "Mucho recorrido de mejora. Hay una base valiosa sobre la que trabajar. El siguiente paso es ordenar mejor dato, decision y ejecucion para convertirlos en valor monetizable."; if (value <= 0.75) return "Buen camino. La empresa ya tiene una base real para monetizar el dato. Con foco, conexion y metodo, este recorrido puede ganar mucha fuerza."; return "Alta capacidad. La organizacion muestra una posicion fuerte. Ahora toca sostener, repetir y escalar esta capacidad con energia."; }
function docroiExecutiveReading(metrics) { if (metrics.roiSimple === null || metrics.customerEquity === null) return "Completa retorno bruto, coste atribuible y WACC para generar una lectura financiera defendible. Hasta entonces, el modelo no debe inventar ROI ni Customer Equity."; return `El escenario muestra un ROI de ${docroiFormatPercentComma(metrics.roiSimple, 1)}, frente a una referencia financiera de ${docroiFormatPercentComma(metrics.wacc, 1)}. Esto genera un Customer Equity de ${docroiFormatPercentComma(metrics.customerEquity, 1)}. Las palancas principales son aumentar retorno bruto capturable, mejorar eficiencia, controlar coste atribuible y reforzar las capacidades KAI mas debiles.`; }

renderContext = function renderContextCLevel() {
  return `<div class="field-grid">${input("meta.project", "Empresa", "Nombre de la empresa o unidad evaluada.", "text")}${input("meta.country", "Pais o territorio", "Mercado principal del diagnostico.", "text")}${input("meta.sector", "Sector", "Actividad principal de la organizacion.", "text")}${input("meta.companySize", "Tamano de empresa", "Ejemplo: pyme, mid-market, enterprise.", "text")}${input("meta.digitalMaturity", "Madurez digital percibida", "Describe brevemente el punto de partida.", "text")}${input("meta.wacc", "WACC o referencia financiera (%)", "Escribe 10 para 10%.")}<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}><span>Acepto que Doc ROI trate estos datos para generar el diagnostico KAI·ROI y conservar la trazabilidad tecnica del resultado. Los datos se usan para el analisis del diagnostico y no es necesario facilitar email.</span></label></div><div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4">${displayValue(state.notes)}</textarea><small>Explica que escenario se quiere evaluar y por que importa para negocio.</small></div></div>`;
};

renderEquity = function renderEquityExecutiveConversation() { docroiEnsureObjects(); docroiSyncKaiUx(); const result = calculate().kai; const answered = docroiKaiQuestions.filter((question) => hasInput(state.kaiUx?.[question.id])).length; return `<div class="kai-intro executive-kai-intro"><div><p class="eyebrow">Diagnosis cabinet</p><h3>Diagnostico C-Level</h3><p>Responde con criterio de direccion. Esta conversacion traduce Customer Equity a decisiones de negocio: clientes, datos, eficiencia, satisfaccion, oferta y valor economico.</p></div><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Ver base conceptual</a></div><div class="plain-note executive-note"><strong>${answered}/10 dimensiones respondidas</strong><p>La estructura formal KAI·ROI v1 queda custodiada internamente. En esta pantalla solo trabajamos con lenguaje de negocio y madurez ejecutiva.</p></div><div class="exec-question-list">${docroiKaiQuestions.map(docroiRatingQuestion).join("")}</div>${docroiEconomicBlock()}<div class="explainer-grid kai-summary"><div class="explainer"><span>Potencial de activacion</span><strong>${result.incomplete ? "Pendiente" : docroiFormatPercentDot(result.kaiStar, 3)}</strong></div><div class="explainer"><span>Orquestacion cliente-oferta</span><strong>${result.incomplete ? "Pendiente" : docroiFormatPercentDot(result.spo, 1)}</strong></div><div class="explainer"><span>Madurez ejecutiva</span><strong>${docroiFormatScore(result.maturityAverage)}/5</strong></div></div>`; };

const docroiBindBeforeExecutiveKai = bindInputs;
bindInputs = function bindInputsExecutiveKai() { docroiBindBeforeExecutiveKai(); document.querySelectorAll("[data-kai-score]").forEach((button) => { button.addEventListener("click", () => { const question = docroiKaiQuestions.find((item) => item.id === button.dataset.kaiScore); if (!question) return; state.kaiUx[question.id] = Number(button.dataset.score); question.paths.forEach((path) => docroiSetPath(path, Number(button.dataset.score) * 20)); changed(true); }); }); };

renderKpiExplain = function renderKpiExplainExecutive(result) {
  const kai = result.kai;
  const metrics = docroiExecutiveMetrics(result);
  const cards = [
    docroiMetricCard("ROI", docroiFormatPercentComma(metrics.roiSimple, 1), "ROI simple del escenario: retorno bruto estimado menos coste atribuible, dividido entre el coste.", "Este ROI compara el retorno bruto estimado con el coste atribuible. Es la lectura mas clara para saber si el escenario compensa economicamente antes de compararlo con la referencia financiera."),
    docroiMetricCard("Customer Equity", docroiFormatPercentComma(metrics.customerEquity, 1), "Customer Equity ejecutivo: ROI menos WACC. Si es positivo, el escenario supera la referencia financiera declarada.", "Customer Equity compara el ROI del escenario con el coste de capital o referencia financiera. Si el ROI supera el WACC, el escenario crea valor economico adicional."),
    docroiMetricCard("Retorno bruto estimado", docroiMoneyOrPending(metrics.grossReturn), "Suma de ingreso o margen capturable y eficiencia economica capturable.", "Retorno bruto = (I_i,s x R_i,s) + (E_i,s x Q_i,s). No se calcula si falta una pieza de la pareja valor-porcentaje."),
    docroiMetricCard("Beneficio neto", metrics.grossReturn !== null && metrics.cost !== null ? docroiMoneyOrPending(metrics.grossReturn - metrics.cost) : "No calculable", "Retorno bruto estimado menos coste atribuible de la iniciativa.", "Indica cuanto excedente queda despues de recuperar el coste declarado."),
    docroiMetricCard("Payback aproximado", docroiMonthsOrPending(metrics.payback), "Meses aproximados para recuperar el coste si el retorno se comporta linealmente en el periodo.", "Si el retorno bruto no es positivo o falta el coste, no se debe calcular payback."),
    docroiMetricCard("Margen diagnosticado", docroiFormatPercentComma(metrics.margin, 1), "Retorno bruto estimado sobre la base economica declarada.", "Ayuda a ver que parte del potencial declarado podria convertirse en retorno bruto capturable."),
    docroiMetricCard("Potencial de activacion", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.kaiStar, 3), "Capacidad estructural para convertir decision, dato y ejecucion en valor.", "KAI no descuenta el dinero. Senala donde reforzar la capacidad para que el resultado economico sea repetible."),
    docroiMetricCard("Inteligencia de datos", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.psi, 1), "Nivel combinado de activacion y calidad de informacion para decidir.", "El dato aporta valor cuando se convierte en decisiones repetibles, priorizacion y acciones comerciales conectadas."),
    docroiMetricCard("Orquestacion cliente-oferta", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.spo, 1), "Lectura integrada de clientes, oferta y satisfaccion.", "Este valor baja cuando comportamiento cliente, rentabilidad de oferta o satisfaccion no estan bien conectados. Si una pieza falla, SPO cae mucho."),
    docroiMetricCard("Cartera positiva", metrics.positivePortfolio === null ? "No calculable" : docroiFormatPercentComma(metrics.positivePortfolio, 0), "En esta beta hay una unidad evaluada. Sube a 100% cuando Customer Equity es positivo.", "Aparece 100% si Customer Equity es positivo y 0% si no supera el WACC."),
    docroiMetricCard("Madurez ejecutiva", `${docroiFormatScore(metrics.avg)}/5`, "Lectura directiva de madurez; no sustituye la ecuacion formal.", "No es un juicio: senala donde ordenar decisiones, datos y ejecucion.")
  ].join("");
  return `<div class="kai-result-suite"><div class="plain-note"><strong>Lectura ejecutiva integrada</strong><p>${docroiExecutiveReading(metrics)}</p></div><div class="kai-metric-grid">${cards}</div><div class="kai-mini-grid"><article><span>Alcance diagnosticado</span><strong>10 capacidades KAI·ROI</strong><p>La lectura mantiene el alcance completo de la ecuacion: decision, dato, SPO, productividad y cartera.</p></article><article><span>Madurez media</span><strong>${docroiFormatScore(metrics.avg)}/5</strong><p>Resume la posicion ejecutiva sin sustituir la interpretacion de cada variable.</p></article><article><span>Prioridad visual</span><strong>${metrics.minScore || "Pendiente"}${metrics.minScore ? "/5" : ""}</strong><p>Los ejes mas cercanos al centro senalan donde conviene actuar primero.</p></article></div>${docroiRadarBlock(result)}<div class="kai-data-grade"><span>Grado de monetizacion del dato</span><strong>${docroiFormatPercentDot(metrics.monetizationGrade, 0)}</strong><p>${docroiMonetizationText(metrics.monetizationGrade)}</p></div><div class="kai-report"><h3>Diagnostico por capacidad</h3><p>Esta lectura no evalua personas. Evalua capacidad de monetizacion del dato, madurez estructural, calidad de decision, eficiencia economica y potencial de Customer Equity.</p><table class="result-table"><thead><tr><th>Dimension</th><th>Resultado</th><th>Interpretacion</th><th>Recomendacion</th></tr></thead><tbody>${docroiExecutiveSummaryRows()}</tbody></table><p class="trace-note">Trazabilidad interna: la estructura formal KAI·ROI v1, titularidad de PhD Jorge Lucio, permanece intacta y subordinante sobre la implementacion operativa.</p></div></div>`;
};

renderReport = function renderReportExecutiveOnly() { const result = calculate(); document.getElementById("reportMeta").textContent = `${state.meta.project || "Empresa sin nombre"} - ${state.meta.sector || "Sector"} - ${state.meta.country || "Territorio"}`; document.getElementById("reportBody").innerHTML = `<section class="report-section"><h3>Indicadores KAI·ROI explicados</h3>${renderKpiExplain(result)}</section>`; };

const resetButton = document.getElementById("resetExample");
if (resetButton) resetButton.addEventListener("click", () => { sessionStorage.removeItem(docroiSessionStateKey); sessionStorage.removeItem(docroiSessionFlagKey); localStorage.removeItem(STORAGE_KEY); });

updateStepRenderer(0, renderContext);
updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
