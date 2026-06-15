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

if (!state.kaiUx) state.kaiUx = {};
function docroiSetPath(path, value) { const keys = path.split("."); const last = keys.pop(); const target = keys.reduce((obj, key) => obj[key], state); target[last] = value; }
function docroiScoreFromPercent(value) { if (!hasInput(value)) return ""; const raw = n(value); if (raw >= 1 && raw <= 5) return Math.round(raw); return Math.min(5, Math.max(1, Math.round(raw / 20))); }
function docroiExecutiveScore(question) { if (hasInput(state.kaiUx?.[question.id])) return Number(state.kaiUx[question.id]); const firstPath = question.paths?.[0]; if (firstPath) return docroiScoreFromPercent(readPath(firstPath)); return ""; }
function docroiScoreToDecimal(score) { return Math.min(5, Math.max(1, n(score))) / 5; }
function docroiKaiScore(id) { const question = docroiKaiQuestions.find((item) => item.id === id); return docroiScoreToDecimal(state.kaiUx?.[id] || docroiExecutiveScore(question) || 0); }
function docroiSyncKaiUx() { docroiKaiQuestions.forEach((question) => { const score = docroiExecutiveScore(question); if (!hasInput(score)) return; state.kaiUx[question.id] = Number(score); question.paths.forEach((path) => docroiSetPath(path, Number(score) * 20)); }); }
function docroiMaturityText(score) { return docroiMaturityLabels[Math.round(n(score))] || "Pendiente"; }
function docroiScoreList() { return docroiKaiQuestions.map((question) => docroiExecutiveScore(question)).filter((score) => hasInput(score)).map(Number); }
function docroiAverageScore() { const scores = docroiScoreList(); return scores.length ? scores.reduce((total, score) => total + score, 0) / scores.length : 0; }
function docroiFormatPercentComma(value, digits = 1) { return new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n(value)).replace(/\s/g, ""); }
function docroiFormatPercentDot(value, digits = 1) { return `${(n(value) * 100).toFixed(digits)}%`; }
function docroiFormatScore(value) { return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n(value)); }

calculateKai = function calculateKaiExecutiveLayer() {
  docroiSyncKaiUx();
  const answered = docroiKaiQuestions.filter((question) => hasInput(state.kaiUx?.[question.id])).length;
  const missing = docroiKaiQuestions.filter((question) => !hasInput(state.kaiUx?.[question.id])).map((question) => question.id);
  const cost = n(readPath("kai.cost"));
  if (missing.length || cost <= 0) return { incomplete: true, missing, psi: null, spo: null, kaiStar: null, ce: null, md: null, cost, answered, scores: {}, maturityAverage: docroiAverageScore() };
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
  const md = n(readPath("kai.monetization"));
  const wacc = decimalFromPercentPath("meta.wacc");
  const formalCe = ((((kaiStar * md) - cost) / cost) - wacc) / Math.max(wacc, 0.0001);
  return { incomplete: false, psi, spo, kaiStar, md, cost, ce: formalCe, enterpriseCe: formalCe, vCe: formalCe > 0 ? 100 : 0, answered, scores, maturityAverage: docroiAverageScore() };
};

function docroiRatingQuestion(question, index) { const value = docroiExecutiveScore(question); const buttons = [1, 2, 3, 4, 5].map((score) => `<button type="button" class="${Number(value) === score ? "selected" : ""}" data-kai-score="${question.id}" data-score="${score}"><strong>${score}</strong><span>${docroiMaturityLabels[score]}</span></button>`).join(""); return `<article class="exec-question"><div class="exec-question-head"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${question.question}</h3><p>${question.help}</p></div></div><div class="rating-row">${buttons}</div></article>`; }
function docroiExecutiveSummaryRows() { return docroiKaiQuestions.map((question) => { const score = docroiExecutiveScore(question); const interpretation = hasInput(score) ? Number(score) <= 2 ? question.lowRisk : Number(score) === 3 ? "Existe una base aprovechable, pero todavia no opera con suficiente consistencia ejecutiva." : "La organizacion muestra una capacidad solida para convertir esta dimension en valor." : "Pendiente de respuesta."; return `<tr><td><strong>${question.title}</strong></td><td>${hasInput(score) ? `${score}/5 - ${docroiMaturityText(score)}` : "Pendiente"}</td><td>${interpretation}</td><td>${question.recommendation}</td></tr>`; }).join(""); }

function docroiExecutiveMetrics(result) {
  const kai = result.kai || {};
  const grossReturn = Math.max(0, n(result.totalRevenue) - n(result.totalOpex));
  const roiSimple = n(result.capex) > 0 ? (grossReturn - n(result.capex)) / n(result.capex) : n(result.roi);
  const wacc = decimalFromPercentPath("meta.wacc");
  const customerEquity = roiSimple - wacc;
  const margin = n(result.totalRevenue) > 0 ? grossReturn / n(result.totalRevenue) : 0;
  const avg = kai.maturityAverage || docroiAverageScore();
  const minScore = docroiScoreList().length ? Math.min(...docroiScoreList()) : 0;
  return { grossReturn, roiSimple, wacc, customerEquity, margin, avg, minScore, monetizationGrade: avg / 5, positivePortfolio: customerEquity > 0 ? 1 : 0 };
}

function docroiMetricCard(title, value, description, reading) { return `<article class="kai-metric-card"><span>${title}</span><strong>${value}</strong><p>${description}</p><div><b>Lectura simple</b><p>${reading}</p></div></article>`; }
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
  return `<section class="kai-radar-section"><h3>Radar KAI·ROI</h3><p>Vista directiva de las capacidades que alimentan el diagnostico. El objetivo no es leer una formula, sino identificar que palancas sostienen o frenan la creacion de Customer Equity.</p><div class="kai-radar-layout"><div class="kai-radar-figure"><svg viewBox="0 0 320 320" role="img" aria-label="Radar KAI ROI"><rect width="320" height="320" fill="#fff" />${rings}${spokes}<polygon points="${points}" fill="rgba(17,17,17,.16)" stroke="#111" stroke-width="2" />${dots}</svg><div class="kai-radar-numbers">${axes.map((axis) => `<span>${axis.score || "-"}</span>`).join("")}</div><p>Escala 1-5 · promedio ${docroiFormatScore(metrics.avg)}/5</p></div><div class="kai-radar-read"><strong>Lectura rapida</strong><p>Los ejes mas cercanos al centro senalan capacidades a reforzar. Los ejes hacia el borde muestran fortalezas para escalar Customer Equity.</p></div></div><div class="kai-axis-grid">${axisCards}</div></section>`;
}

renderEquity = function renderEquityExecutiveConversation() { docroiSyncKaiUx(); const result = calculate().kai; const answered = docroiKaiQuestions.filter((question) => hasInput(state.kaiUx?.[question.id])).length; return `<div class="kai-intro executive-kai-intro"><div><p class="eyebrow">Diagnosis cabinet</p><h3>Diagnostico C-Level</h3><p>Responde con criterio de direccion. Esta conversacion traduce Customer Equity a decisiones de negocio: clientes, datos, eficiencia, satisfaccion, oferta y valor economico.</p></div><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Ver base conceptual</a></div><div class="plain-note executive-note"><strong>${answered}/10 dimensiones respondidas</strong><p>La estructura formal KAI·ROI v1 queda custodiada internamente. En esta pantalla solo trabajamos con lenguaje de negocio y madurez ejecutiva.</p></div><div class="exec-question-list">${docroiKaiQuestions.map(docroiRatingQuestion).join("")}</div><div class="explainer-grid kai-summary"><div class="explainer"><span>Potencial de activacion</span><strong>${result.incomplete ? "Pendiente" : docroiFormatPercentDot(result.kaiStar, 3)}</strong></div><div class="explainer"><span>Madurez ejecutiva</span><strong>${docroiFormatScore(result.maturityAverage || docroiAverageScore())}/5</strong></div><div class="explainer"><span>Customer Equity</span><strong>${result.incomplete ? "Pendiente" : fmtKai(result.ce)}</strong></div></div>`; };

const docroiBindBeforeExecutiveKai = bindInputs;
bindInputs = function bindInputsExecutiveKai() { docroiBindBeforeExecutiveKai(); document.querySelectorAll("[data-kai-score]").forEach((button) => { button.addEventListener("click", () => { const question = docroiKaiQuestions.find((item) => item.id === button.dataset.kaiScore); if (!question) return; state.kaiUx[question.id] = Number(button.dataset.score); question.paths.forEach((path) => docroiSetPath(path, Number(button.dataset.score) * 20)); changed(true); }); }); };

renderKpiExplain = function renderKpiExplainExecutive(result) {
  const kai = result.kai;
  const metrics = docroiExecutiveMetrics(result);
  const cards = [
    docroiMetricCard("Potencial de activacion", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.kaiStar, 3), "Capacidad estructural para convertir decision, dato y ejecucion en valor.", "KAI sale bajo porque varias capacidades directivas y operativas todavia no estan conectadas. Ahora no reduce el ROI simple, pero si senala donde reforzar la capacidad para que el resultado sea repetible."),
    docroiMetricCard("Inteligencia de datos", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.psi, 1), "Nivel combinado de activacion y calidad de informacion para decidir.", "El dato todavia ayuda solo de forma parcial. Hay senales utiles, pero falta convertirlas en decisiones repetibles, priorizacion y acciones comerciales conectadas."),
    docroiMetricCard("Orquestacion cliente-oferta", kai.incomplete ? "Pendiente" : docroiFormatPercentDot(kai.spo, 1), "Lectura integrada de clientes, oferta y satisfaccion.", "Este valor baja cuando comportamiento cliente, rentabilidad de oferta o satisfaccion no estan bien conectados. Si una de esas piezas falla, SPO cae mucho."),
    docroiMetricCard("Margen diagnosticado", docroiFormatPercentComma(metrics.margin, 1), "Margen capturable estimado sobre la base economica declarada. Ayuda a entender que parte del potencial podria convertirse en valor.", "Este porcentaje sale de dividir el retorno bruto estimado entre la base economica declarada. Ayuda a ver la intensidad economica del escenario."),
    docroiMetricCard("Customer Equity", docroiFormatPercentComma(metrics.customerEquity, 1), "Customer Equity ejecutivo: ROI simple menos WACC. Si es positivo, el escenario supera la referencia financiera declarada.", "Sale positivo cuando el ROI simple supera el WACC. En sencillo: despues de cubrir el coste, queda rentabilidad por encima de la referencia financiera."),
    docroiMetricCard("ROI", docroiFormatPercentComma(metrics.roiSimple, 1), "ROI simple del escenario: retorno potencial menos coste, dividido entre el coste.", "Este ROI usa la lectura simple: retorno bruto menos coste, dividido entre coste. Es la forma mas clara de saber si el escenario compensa economicamente."),
    docroiMetricCard("Cartera positiva", docroiFormatPercentComma(metrics.positivePortfolio, 0), "En esta beta hay una unidad evaluada. Sube a 100% cuando Customer Equity es positivo.", "En esta beta hay una unidad evaluada. Aparece 100% si Customer Equity es positivo y 0% si no supera el WACC."),
    docroiMetricCard("Madurez ejecutiva", `${docroiFormatScore(metrics.avg)}/5`, "Lectura directiva de madurez; no sustituye la ecuacion formal.", "La madurez sale baja cuando varias respuestas estan en zona inicial o parcial. No es un juicio: senala donde ordenar decisiones, datos y ejecucion.")
  ].join("");
  return `<div class="kai-result-suite"><div class="kai-metric-grid">${cards}</div><div class="kai-mini-grid"><article><span>Alcance diagnosticado</span><strong>10 capacidades KAI·ROI</strong><p>La lectura mantiene el alcance completo de la ecuacion: decision, dato, SPO, productividad y cartera.</p></article><article><span>Madurez media</span><strong>${docroiFormatScore(metrics.avg)}/5</strong><p>Resume la posicion ejecutiva sin sustituir la interpretacion de cada variable.</p></article><article><span>Prioridad visual</span><strong>${metrics.minScore || "Pendiente"}${metrics.minScore ? "/5" : ""}</strong><p>Los ejes mas cercanos al centro senalan donde conviene actuar primero.</p></article></div>${docroiRadarBlock(result)}<div class="kai-data-grade"><span>Grado de monetizacion del dato</span><strong>${docroiFormatPercentDot(metrics.monetizationGrade, 0)}</strong><p>Buen camino. La empresa ya tiene una base real para monetizar el dato. Con foco, conexion y metodo, este recorrido puede ganar mucha fuerza.</p></div><div class="kai-report"><h3>Lectura ejecutiva de Customer Equity</h3><p>Esta lectura no evalua personas. Evalua madurez estructural, capacidad de decision, monetizacion del dato, alineacion operativa y potencial de valor cliente.</p><table class="result-table"><thead><tr><th>Dimension</th><th>Resultado</th><th>Interpretacion</th><th>Recomendacion</th></tr></thead><tbody>${docroiExecutiveSummaryRows()}</tbody></table><p class="trace-note">Trazabilidad interna: la estructura formal KAI·ROI v1, titularidad de PhD Jorge Lucio, permanece intacta y subordinante sobre la implementacion operativa.</p></div></div>`;
};

renderReport = function renderReportExecutiveOnly() { const result = calculate(); const decision = decisionText(result); document.getElementById("reportMeta").textContent = `${state.meta.project || "Proyecto sin nombre"} - ${state.meta.team || "Equipo"} - ${state.meta.date || "Fecha"}`; const monthlyRows = months.map((month, i) => `<tr><td>${month}</td><td>${money(result.monthlyRevenue[i])}</td><td>${money(result.monthlyOpex[i])}</td><td>${money(result.cashFlow[i])}</td><td>${money(result.accumulated[i])}</td></tr>`).join(""); document.getElementById("reportBody").innerHTML = `<section class="report-section"><h3>Lectura ejecutiva</h3><p><strong class="${decision.status}">${decision.title}.</strong> ${decision.body}</p><p>${state.notes || ""}</p></section><section class="report-section"><h3>Indicadores KAI·ROI explicados</h3>${renderKpiExplain(result)}</section><section class="report-section"><h3>Resumen mensual</h3><table class="result-table"><thead><tr><th>Mes</th><th>Ingresos</th><th>OPEX</th><th>Cash flow</th><th>Acumulado</th></tr></thead><tbody>${monthlyRows}</tbody></table></section>`; };

updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
