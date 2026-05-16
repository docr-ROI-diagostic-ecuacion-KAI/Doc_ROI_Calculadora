const rgpdText = "Autorizo el tratamiento de mis datos personales con la finalidad de gestionar mi participacion en esta iniciativa de caracter orientativo. La informacion recopilada podra utilizarse para el analisis y elaboracion de propuestas o acciones vinculadas al ambito comercial, siempre dentro del marco establecido por el Reglamento General de Proteccion de Datos (RGPD).";

const kaiOfficialNotice = "Estructura formal oficial KAI. Titularidad: PhD Jorge Lucio. La capa de cumplimentacion es operativa y no sustituye, redefine ni simplifica el nucleo formal v1.";
const kaiOfficialFormula = [
  "KAI_i* = phi_i · u_i · f_i · psi_i · SPO_i · P_i · Gamma_g(i),t",
  "psi_i = promedio(DataActivation_i, I_net_i)",
  "SPO_i = CC_i · ABCD_i · NPS_i",
  "MD_i = sum_s (I_i,s · R_i,s + E_i,s · Q_i,s)",
  "CE_i = ((((KAI_i* · MD_i) - C_i) / C_i) - WACC_t) / WACC_t",
  "CE_empresa = sum_i CE_i",
  "V%CE = (100 / N) · sum_i 1(CE_i > 0)"
];

const kaiFields = [
  { path: "kai.phi", code: "phi_i", title: "Variable oficial phi_i", question: "Introduce el valor operativo acordado para phi_i dentro del caso.", help: "Capa operativa: usa un valor de 0 a 100. No sustituye la posicion formal de phi_i en la ecuacion." },
  { path: "kai.usability", code: "u_i", title: "Variable oficial u_i", question: "Introduce el valor operativo acordado para u_i sin asignarle una definicion semantica cerrada.", help: "u_i es estructural y multiplicativa. No se define aqui como uso, objetivo, engagement ni otro equivalente no autorizado." },
  { path: "kai.frequency", code: "f_i", title: "f_i - Inteligencia", question: "Introduce el valor operativo de inteligencia que corresponde a f_i en este caso.", help: "Capa operativa: valor de 0 a 100 alineado con la version clara de la ecuacion KAI indicada por el autor." },
  { path: "kai.dataActivation", code: "DataActivation_i", title: "DataActivation_i", question: "Que valor operativo asignas a la activacion del dato dentro del caso?", help: "Forma parte de psi_i junto con I_net_i. El modelo calcula psi_i como promedio de ambas." },
  { path: "kai.networkIndex", code: "I_net_i", title: "I_net_i", question: "Que valor operativo asignas al indice de red I_net_i?", help: "Forma parte de psi_i junto con DataActivation_i. No se sustituye la formula oficial." },
  { path: "kai.cc", code: "CC_i", title: "CC_i", question: "Que valor operativo asignas a CC_i dentro del caso?", help: "Forma parte de SPO_i. SPO_i se calcula como CC_i · ABCD_i · NPS_i." },
  { path: "kai.abcd", code: "ABCD_i", title: "ABCD_i", question: "Que valor operativo asignas a ABCD_i dentro del caso?", help: "Forma parte de SPO_i. No se sustituye ni elimina SPO_i." },
  { path: "kai.nps", code: "NPS_i", title: "NPS_i", question: "Que valor operativo asignas a NPS_i dentro del caso?", help: "Forma parte de SPO_i. Usa escala 0 a 100 cuando estes operando el cuestionario." },
  { path: "kai.purpose", code: "P_i", title: "P_i", question: "Que valor operativo asignas a P_i dentro del caso?", help: "Variable multiplicativa oficial del nucleo KAI_i*. No sustituye a ninguna otra variable." },
  { path: "kai.context", code: "Gamma_g(i),t", title: "Gamma_g(i),t", question: "Que valor operativo asignas a Gamma_g(i),t para este contexto y momento?", help: "Gamma se mantiene dentro del modelo. No se elimina ni se absorbe en otra variable." },
  { path: "kai.monetization", code: "MD_i", title: "MD_i", question: "Que MD_i consolidado vas a usar para esta implementacion?", help: "La formula oficial es MD_i = sum_s(I_i,s · R_i,s + E_i,s · Q_i,s). Este campo es una captura operativa consolidada, no una sustitucion formal." },
  { path: "kai.cost", code: "C_i", title: "C_i", question: "Que coste C_i corresponde al caso evaluado?", help: "C_i es el denominador economico del CE_i. Si no se conoce, no debe tratarse como cero." }
];

function readPath(path) { return path.split(".").reduce((obj, key) => obj?.[key], state); }
function displayValue(value) { return value === undefined || value === null ? "" : String(value); }
function hasInput(value) { return value !== undefined && value !== null && String(value).trim() !== ""; }
function decimalFromPercentPath(path) { return n(readPath(path)) / 100; }
function updateStepRenderer(index, renderer) { if (!Array.isArray(steps) || !steps[index]) return; if (Array.isArray(steps[index])) steps[index][3] = renderer; else steps[index].render = renderer; }
function updateStepCopy(index, title, intro, reflection) { if (!Array.isArray(steps) || !steps[index]) return; if (Array.isArray(steps[index])) { steps[index][0] = title; steps[index][1] = intro; steps[index][2] = reflection; } else { steps[index].title = title; steps[index].intro = intro; steps[index].reflection = reflection; } }

const docroiOriginalCalculate = calculate;
if (typeof placeholders !== "undefined") placeholders.notes = "Ejemplo: caso de negocio para estimar si la campana sostiene su inversion y mejora el valor del cliente.";
updateStepCopy(6, "Customer Equity Activo", "Esta parte aplica la estructura oficial KAI·ROI v1 desde una capa operativa de cumplimentacion. La formula formal es soberana; las preguntas solo ayudan a introducir valores defendibles.", "Responde como C-level: si una variable no esta justificada, dejala pendiente. Un dato desconocido no equivale a cero.");
updateStepCopy(7, "Resultado explicado", "El cierre traduce el modelo en indicadores que un C-level puede leer rapido y un equipo puede defender con criterio.", "Un buen resultado no es solo un numero positivo. Es una decision: invertir, optimizar o redisenar.");

calculateKai = function calculateKaiOfficialV1() {
  const required = kaiFields.map((field) => field.path);
  const missing = required.filter((path) => !hasInput(readPath(path)));
  const cost = n(readPath("kai.cost"));
  if (missing.length || cost <= 0) return { incomplete: true, missing, psi: null, spo: null, kaiStar: null, ce: null, md: null, cost };
  const psi = (decimalFromPercentPath("kai.dataActivation") + decimalFromPercentPath("kai.networkIndex")) / 2;
  const spo = decimalFromPercentPath("kai.cc") * decimalFromPercentPath("kai.abcd") * decimalFromPercentPath("kai.nps");
  const kaiStar = decimalFromPercentPath("kai.phi") * decimalFromPercentPath("kai.usability") * decimalFromPercentPath("kai.frequency") * psi * spo * decimalFromPercentPath("kai.purpose") * decimalFromPercentPath("kai.context");
  const md = n(readPath("kai.monetization"));
  const wacc = decimalFromPercentPath("meta.wacc");
  const ce = ((((kaiStar * md) - cost) / cost) - wacc) / Math.max(wacc, 0.0001);
  return { incomplete: false, psi, spo, kaiStar, md, cost, ce, enterpriseCe: ce, vCe: ce > 0 ? 100 : 0 };
};

calculate = function calculateWithKOnVan() {
  const result = docroiOriginalCalculate();
  const kPercent = n(readPath("meta.kValue"));
  const kValue = kPercent / 100;
  const kMultiplier = 1 + kValue;
  const vanBase = result.van;
  const vanAdjusted = vanBase * kMultiplier;
  return { ...result, vanBase, van: vanAdjusted, kValue, kPercent, kMultiplier, kAdjustment: vanAdjusted - vanBase };
};

if (typeof consentField === "function") consentField = function consentField() { return `<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}> <span>${rgpdText}</span></label></div>`; };

renderContext = function renderContextWithRgpd() {
  const notesPlaceholder = typeof placeholders !== "undefined" && placeholders.notes ? placeholders.notes : "";
  return `<div class="field-grid">${input("meta.project", "Nombre del proyecto", "Ejemplo en placeholder, no como dato cargado.", "text")}${input("meta.team", "Equipo responsable", "Quien firma las hipotesis.", "text")}${input("meta.email", "Correo electronico", "Email de contacto para comunicaciones DocROI.", "email")}<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}><span>${rgpdText}</span></label></div>${input("meta.date", "Fecha del caso", "Fecha de version del modelo.", "date")}${input("meta.arpu", "Ingreso medio por cliente / ARPU", "Importe medio por cliente.")}${input("meta.wacc", "WACC anual (%)", "Escribe 8 para 8%.")}${input("meta.riskPremium", "Prima de riesgo (%)", "Escribe 5 para 5%.")}${input("meta.kValue", "Valor K para VAN/VNA (%)", "Ajuste de sensibilidad aplicado al VAN/VNA. Escribe 0,7 para 0,7%.")}<div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4" placeholder="${notesPlaceholder}">${displayValue(state.notes)}</textarea><small>Escribe que se quiere probar y por que importa para negocio.</small></div></div>`;
};

renderAudience = function renderAudienceResponsive() {
  const monthInputs = months.map((month, index) => `<div class="month-field"><label for="audience-${index}">${month}</label><input id="audience-${index}" data-array="audience" data-index="${index}" type="number" value="${displayValue(state.audience[index])}" placeholder="${placeholders.audience?.[index] || ""}"></div>`).join("");
  return `<div class="field-grid">${input("meta.conversion", "Conversion objetivo (%)", "Escribe 3 para 3%.")}${input("meta.initialCustomers", "Cartera inicial LTV", "Base de clientes para valorar la mejora.")}</div><div class="audience-months">${monthInputs}</div>`;
};

function kaiInput(field) { const value = displayValue(readPath(field.path)); const placeholder = field.path.startsWith("kai.") ? placeholders.kai?.[field.path.split(".")[1]] || "" : ""; return `<div class="kai-field"><div><span class="kai-code">${field.code}</span><h3>${field.title}</h3><p>${field.question}</p></div><input data-path="${field.path}" type="number" value="${value}" placeholder="${placeholder}"><small>${field.help}</small></div>`; }
function fmtKai(value) { return value === null || value === undefined || Number.isNaN(value) ? "Pendiente" : num(value); }

renderEquity = function renderEquityExecutive() {
  const k = calculate().kai;
  return `<div class="kai-intro"><div><p class="eyebrow">Ecuacion KAI·ROI v1</p><h3>Formula oficial soberana, implementacion subordinada</h3><p>${kaiOfficialNotice}</p></div><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Ver ecuacion KAI</a></div><div class="formula-block compact-formula">${kaiOfficialFormula.map((line) => `<code>${line}</code>`).join("")}</div><div class="plain-note"><strong>Capa operativa de cumplimentacion</strong><p>Las preguntas siguientes no definen oficialmente las variables: solo ayudan a introducir valores operativos trazables para este caso.</p></div><div class="kai-fields">${kaiFields.map(kaiInput).join("")}</div><div class="explainer-grid kai-summary"><div class="explainer"><span>psi_i</span><strong>${fmtKai(k.psi)}</strong></div><div class="explainer"><span>SPO_i</span><strong>${fmtKai(k.spo)}</strong></div><div class="explainer"><span>CE_i</span><strong>${fmtKai(k.ce)}</strong></div></div>`;
};

function kaiVariableExplainRows() { return kaiFields.map((field) => `<tr><td><strong>${field.code}</strong></td><td>${field.title}</td><td>${field.help}</td></tr>`).join(""); }

renderKpiExplain = function renderKpiExplainWithK(result) {
  const rows = [["ROI", pct(result.roi), "Retorno sobre la inversion total del proyecto."], ["VAN/VNA base", money(result.vanBase), "Valor actual neto antes de aplicar el ajuste K."], ["Valor K", `${num(result.kPercent)} %`, "Sensibilidad aplicada al VAN/VNA. Si escribes 0,7, el modelo aplica 0,7%."], ["VAN/VNA ajustado", money(result.van), "VAN/VNA base multiplicado por 1 + K."], ["Payback", result.payback ? `Mes ${result.payback}` : "No recuperado", "Mes en el que la caja acumulada compensa la inversion."], ["LTV diferencial", money(result.ltv.differential), "Valor extra por cliente al mejorar la retencion."], ["Customer Equity CE_i", fmtKai(result.kai.ce), result.kai.incomplete ? "Pendiente: no se calcula CE_i hasta completar las variables KAI y un C_i valido." : "Valor relacional ajustado por coste y WACC."]];
  return `<table class="result-table"><thead><tr><th>KPI</th><th>Resultado</th><th>Como leerlo</th></tr></thead><tbody>${rows.map((x) => `<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table><div class="kai-report"><h3>Estructura oficial KAI·ROI v1</h3><p>${kaiOfficialNotice}</p><div class="formula-block compact-formula">${kaiOfficialFormula.map((line) => `<code>${line}</code>`).join("")}</div><h3>Capa operativa usada en esta implementacion</h3><p>Esta tabla documenta como se han pedido los datos en la interfaz. No redefine la formula oficial ni fija significados no autorizados.</p><table class="result-table"><thead><tr><th>Variable</th><th>Campo operativo</th><th>Criterio de cumplimentacion</th></tr></thead><tbody>${kaiVariableExplainRows()}</tbody></table></div>`;
};

updateStepRenderer(0, renderContext);
updateStepRenderer(1, renderAudience);
updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
