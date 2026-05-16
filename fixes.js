const rgpdText = "Autorizo el tratamiento de mis datos personales con la finalidad de gestionar mi participacion en esta iniciativa de caracter orientativo. La informacion recopilada podra utilizarse para el analisis y elaboracion de propuestas o acciones vinculadas al ambito comercial, siempre dentro del marco establecido por el Reglamento General de Proteccion de Datos (RGPD).";

const kaiFields = [
  { path: "kai.phi", code: "phi", title: "Confianza inicial", question: "Si el comite mira esta iniciativa hoy, cuanto confia en que puede generar valor real?", help: "Mide la confianza de partida. Escribe 82 para representar 82%." },
  { path: "kai.usability", code: "u", title: "Facilidad de uso", question: "Que tan facil sera para el cliente, equipo o canal usar la solucion sin friccion?", help: "Cuanto mas simple sea activar y usar la propuesta, mayor sera este valor." },
  { path: "kai.frequency", code: "f", title: "Frecuencia de relacion", question: "Con que frecuencia razonable esperamos que exista contacto, uso o interaccion con el cliente?", help: "No mide intensidad emocional; mide recurrencia observable de la relacion." },
  { path: "kai.dataActivation", code: "DataActivation", title: "Activacion del dato", question: "La organizacion podra usar los datos para decidir, personalizar o mejorar la accion comercial?", help: "Valora si el dato esta disponible, conectado y accionable." },
  { path: "kai.networkIndex", code: "I_net", title: "Efecto red", question: "La iniciativa gana valor cuando mas personas, clientes, partners o canales participan?", help: "Mide si el sistema mejora al crecer la adopcion o la base relacional." },
  { path: "kai.cc", code: "CC", title: "Calidad de la conexion", question: "La relacion que se crea es relevante, creible y alineada con lo que el cliente necesita?", help: "Piensa en calidad de vinculo, no solo en volumen de impactos." },
  { path: "kai.abcd", code: "ABCD", title: "Capacidad de aprendizaje", question: "El sistema aprende, mejora o segmenta mejor a medida que opera?", help: "Resume la capacidad de convertir comportamiento y datos en mejores decisiones." },
  { path: "kai.nps", code: "NPS", title: "Recomendacion normalizada", question: "Que probabilidad hay de que la experiencia genere recomendacion o preferencia?", help: "Usa una lectura normalizada de 0 a 100, aunque no tengas un NPS formal." },
  { path: "kai.purpose", code: "P", title: "Coherencia estrategica", question: "La iniciativa encaja con el proposito comercial y la propuesta de valor de la marca?", help: "Un proyecto puede ser rentable y aun asi no encajar; aqui se mide ese encaje." },
  { path: "kai.context", code: "Gamma", title: "Contexto de mercado", question: "El momento, canal y contexto competitivo favorecen que esta iniciativa funcione?", help: "Valora si el entorno ayuda o dificulta la captura de valor." },
  { path: "kai.monetization", code: "MD", title: "Monetizacion observable", question: "Que valor economico atribuible podemos defender si la relacion se activa correctamente?", help: "Importe monetario estimado, no porcentaje." },
  { path: "kai.cost", code: "C", title: "Coste atribuible", question: "Que coste total debemos reconocer para generar ese valor relacional?", help: "Incluye costes directos razonables asociados a la activacion." }
];

function readPath(path) { return path.split(".").reduce((obj, key) => obj?.[key], state); }
function displayValue(value) { return value === undefined || value === null ? "" : String(value); }
function updateStepRenderer(index, renderer) { if (!Array.isArray(steps) || !steps[index]) return; if (Array.isArray(steps[index])) steps[index][3] = renderer; else steps[index].render = renderer; }
function updateStepCopy(index, title, intro, reflection) { if (!Array.isArray(steps) || !steps[index]) return; if (Array.isArray(steps[index])) { steps[index][0] = title; steps[index][1] = intro; steps[index][2] = reflection; } else { steps[index].title = title; steps[index].intro = intro; steps[index].reflection = reflection; } }

const docroiOriginalCalculate = calculate;
if (typeof placeholders !== "undefined") placeholders.notes = "Ejemplo: caso de negocio para estimar si la campana sostiene su inversion y mejora el valor del cliente.";
updateStepCopy(6, "Customer Equity Activo", "Esta parte traduce confianza, uso, dato, contexto y monetizacion en una lectura ejecutiva del valor relacional. No hace falta dominar la ecuacion para completarla: cada campo formula una pregunta de negocio.", "Responde como si estuvieras defendiendo la iniciativa ante direccion: usa una estimacion prudente, razonable y explicable.");
updateStepCopy(7, "Resultado explicado", "El cierre traduce el modelo en indicadores que un C-level puede leer rapido y un equipo puede defender con criterio.", "Un buen resultado no es solo un numero positivo. Es una decision: invertir, optimizar o redisenar.");

calculate = function calculateWithKOnVan() {
  const result = docroiOriginalCalculate();
  const kPercent = n(readPath("meta.kValue"));
  const kValue = kPercent / 100;
  const kMultiplier = 1 + kValue;
  const vanBase = result.van;
  const vanAdjusted = vanBase * kMultiplier;
  return { ...result, vanBase, van: vanAdjusted, kValue, kPercent, kMultiplier, kAdjustment: vanAdjusted - vanBase };
};

if (typeof consentField === "function") {
  consentField = function consentField() { return `<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}> <span>${rgpdText}</span></label></div>`; };
}

renderContext = function renderContextWithRgpd() {
  const notesPlaceholder = typeof placeholders !== "undefined" && placeholders.notes ? placeholders.notes : "";
  return `<div class="field-grid">${input("meta.project", "Nombre del proyecto", "Ejemplo en placeholder, no como dato cargado.", "text")}${input("meta.team", "Equipo responsable", "Quien firma las hipotesis.", "text")}${input("meta.email", "Correo electronico", "Email de contacto para comunicaciones DocROI.", "email")}<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}><span>${rgpdText}</span></label></div>${input("meta.date", "Fecha del caso", "Fecha de version del modelo.", "date")}${input("meta.arpu", "Ingreso medio por cliente / ARPU", "Importe medio por cliente.")}${input("meta.wacc", "WACC anual (%)", "Escribe 8 para 8%.")}${input("meta.riskPremium", "Prima de riesgo (%)", "Escribe 5 para 5%.")}${input("meta.kValue", "Valor K para VAN/VNA (%)", "Ajuste de sensibilidad aplicado al VAN/VNA. Escribe 0,7 para 0,7%.")}<div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4" placeholder="${notesPlaceholder}">${displayValue(state.notes)}</textarea><small>Escribe que se quiere probar y por que importa para negocio.</small></div></div>`;
};

renderAudience = function renderAudienceResponsive() {
  const monthInputs = months.map((month, index) => `<div class="month-field"><label for="audience-${index}">${month}</label><input id="audience-${index}" data-array="audience" data-index="${index}" type="number" value="${displayValue(state.audience[index])}" placeholder="${placeholders.audience?.[index] || ""}"></div>`).join("");
  return `<div class="field-grid">${input("meta.conversion", "Conversion objetivo (%)", "Escribe 3 para 3%.")}${input("meta.initialCustomers", "Cartera inicial LTV", "Base de clientes para valorar la mejora.")}</div><div class="audience-months">${monthInputs}</div>`;
};

function kaiInput(field) {
  const value = displayValue(readPath(field.path));
  const placeholder = field.path.startsWith("kai.") ? placeholders.kai?.[field.path.split(".")[1]] || "" : "";
  return `<div class="kai-field"><div><span class="kai-code">${field.code}</span><h3>${field.title}</h3><p>${field.question}</p></div><input data-path="${field.path}" type="number" value="${value}" placeholder="${placeholder}"><small>${field.help}</small></div>`;
}

renderEquity = function renderEquityExecutive() {
  const k = calculate().kai;
  return `<div class="kai-intro"><div><p class="eyebrow">Ecuacion KAI</p><h3>Completa la formula desde preguntas de negocio</h3><p>Las variables siguen presentes, pero se formulan en lenguaje ejecutivo para que puedas estimarlas con criterio.</p></div><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Ver ecuacion KAI</a></div><div class="formula-block compact-formula"><code>KAIi* = phi_i * u_i * f_i * psi_i * SPO_i * P_i * Gamma_g(i),t</code><code>CE_i = ((((KAIi* * MD_i) - C_i) / C_i) - WACC_t) / WACC_t</code></div><div class="kai-fields">${kaiFields.map(kaiInput).join("")}</div><div class="explainer-grid kai-summary"><div class="explainer"><span>psi</span><strong>${num(k.psi)}</strong></div><div class="explainer"><span>SPO</span><strong>${num(k.spo)}</strong></div><div class="explainer"><span>CE_i</span><strong>${num(k.ce)}</strong></div></div>`;
};

function kaiVariableExplainRows() { return kaiFields.map((field) => `<tr><td><strong>${field.code}</strong></td><td>${field.title}</td><td>${field.help}</td></tr>`).join(""); }

renderKpiExplain = function renderKpiExplainWithK(result) {
  const rows = [["ROI", pct(result.roi), "Retorno sobre la inversion total del proyecto."], ["VAN/VNA base", money(result.vanBase), "Valor actual neto antes de aplicar el ajuste K."], ["Valor K", `${num(result.kPercent)} %`, "Sensibilidad aplicada al VAN/VNA. Si escribes 0,7, el modelo aplica 0,7%."], ["VAN/VNA ajustado", money(result.van), "VAN/VNA base multiplicado por 1 + K."], ["Payback", result.payback ? `Mes ${result.payback}` : "No recuperado", "Mes en el que la caja acumulada compensa la inversion."], ["LTV diferencial", money(result.ltv.differential), "Valor extra por cliente al mejorar la retencion."], ["Customer Equity CE_i", num(result.kai.ce), "Valor relacional ajustado por coste y WACC."]];
  return `<table class="result-table"><thead><tr><th>KPI</th><th>Resultado</th><th>Como leerlo</th></tr></thead><tbody>${rows.map((x) => `<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table><div class="kai-report"><h3>Lectura de variables KAI</h3><p>Estas variables explican de donde sale la lectura de Customer Equity: confianza, uso, relacion, dato, contexto, monetizacion y coste atribuible.</p><table class="result-table"><thead><tr><th>Variable</th><th>Lectura ejecutiva</th><th>Criterio para defenderla</th></tr></thead><tbody>${kaiVariableExplainRows()}</tbody></table></div>`;
};

updateStepRenderer(0, renderContext);
updateStepRenderer(1, renderAudience);
updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
