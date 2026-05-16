const rgpdText = "Autorizo el tratamiento de mis datos personales con la finalidad de gestionar mi participación en esta iniciativa de carácter orientativo. La información recopilada podrá utilizarse para el análisis y elaboración de propuestas o acciones vinculadas al ámbito comercial, siempre dentro del marco establecido por el Reglamento General de Protección de Datos (RGPD).";

function readPath(path) {
  return path.split(".").reduce((obj, key) => obj?.[key], state);
}

function displayValue(value) {
  return value === undefined || value === null ? "" : String(value);
}

function updateStepRenderer(index, renderer) {
  if (!Array.isArray(steps) || !steps[index]) return;
  if (Array.isArray(steps[index])) steps[index][3] = renderer;
  else steps[index].render = renderer;
}

const docroiOriginalCalculate = calculate;
if (typeof placeholders !== "undefined") {
  placeholders.notes = "Ejemplo: caso de negocio para estimar si la campaña sostiene su inversión y mejora el valor del cliente.";
}
if (Array.isArray(steps) && steps[7]) {
  if (Array.isArray(steps[7])) {
    steps[7][1] = "El cierre traduce el modelo en indicadores que un C-level puede leer rápido y un equipo puede defender con criterio.";
  } else {
    steps[7].intro = "El cierre traduce el modelo en indicadores que un C-level puede leer rápido y un equipo puede defender con criterio.";
  }
}

calculate = function calculateWithKOnVan() {
  const result = docroiOriginalCalculate();
  const kValue = n(readPath("meta.kValue"));
  const kMultiplier = 1 + kValue;
  const vanBase = result.van;
  const vanAdjusted = vanBase * kMultiplier;
  return {
    ...result,
    vanBase,
    van: vanAdjusted,
    kValue,
    kMultiplier,
    kAdjustment: vanAdjusted - vanBase
  };
};

if (typeof consentField === "function") {
  consentField = function consentField() {
    return `<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}> <span>${rgpdText}</span></label></div>`;
  };
}

renderContext = function renderContextWithRgpd() {
  const notesPlaceholder = typeof placeholders !== "undefined" && placeholders.notes ? placeholders.notes : "";
  return `
    <div class="field-grid">
      ${input("meta.project", "Nombre del proyecto", "Ejemplo en placeholder, no como dato cargado.", "text")}
      ${input("meta.team", "Equipo responsable", "Quien firma las hipotesis.", "text")}
      ${input("meta.email", "Correo electronico", "Email de contacto para comunicaciones DocROI.", "email")}
      <div class="field full consent-field">
        <label>
          <input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}>
          <span>${rgpdText}</span>
        </label>
      </div>
      ${input("meta.date", "Fecha del caso", "Fecha de version del modelo.", "date")}
      ${input("meta.arpu", "Ingreso medio por cliente / ARPU", "Importe medio por cliente.")}
      ${input("meta.wacc", "WACC anual (%)", "Escribe 8 para 8%.")}
      ${input("meta.riskPremium", "Prima de riesgo (%)", "Escribe 5 para 5%.")}
      ${input("meta.kValue", "Valor K para VAN/VNA", "Ajuste de sensibilidad aplicado al VAN/VNA. Ejemplo: 0.007 significa +0,7% sobre el VAN.")}
      <div class="field full">
        <label for="notes">Narrativa del caso</label>
        <textarea id="notes" data-path="notes" rows="4" placeholder="${notesPlaceholder}">${displayValue(state.notes)}</textarea>
        <small>Escribe que se quiere probar y por que importa para negocio.</small>
      </div>
    </div>
  `;
};

renderAudience = function renderAudienceResponsive() {
  const monthInputs = months
    .map(
      (month, index) => `
        <div class="month-field">
          <label for="audience-${index}">${month}</label>
          <input id="audience-${index}" data-array="audience" data-index="${index}" type="number" value="${displayValue(state.audience[index])}" placeholder="${placeholders.audience?.[index] || ""}">
        </div>
      `
    )
    .join("");

  return `
    <div class="field-grid">
      ${input("meta.conversion", "Conversion objetivo (%)", "Escribe 3 para 3%.")}
      ${input("meta.initialCustomers", "Cartera inicial LTV", "Base de clientes para valorar la mejora.")}
    </div>
    <div class="audience-months">
      ${monthInputs}
    </div>
  `;
};

renderKpiExplain = function renderKpiExplainWithK(result) {
  const rows = [
    ["ROI", pct(result.roi), "Retorno sobre la inversion total del proyecto."],
    ["VAN/VNA base", money(result.vanBase), "Valor actual neto antes de aplicar el ajuste K."],
    ["Valor K", num(result.kValue), "Sensibilidad aplicada al VAN/VNA. 0.007 significa +0,7%."],
    ["VAN/VNA ajustado", money(result.van), "VAN/VNA base multiplicado por 1 + K."],
    ["Payback", result.payback ? `Mes ${result.payback}` : "No recuperado", "Mes en el que la caja acumulada compensa la inversion."],
    ["LTV diferencial", money(result.ltv.differential), "Valor extra por cliente al mejorar la retencion."],
    ["Customer Equity CE_i", num(result.kai.ce), "Valor relacional ajustado por coste y WACC."]
  ];
  return `<table class="result-table"><thead><tr><th>KPI</th><th>Resultado</th><th>Como leerlo</th></tr></thead><tbody>${rows.map((x) => `<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table>`;
};

updateStepRenderer(0, renderContext);
updateStepRenderer(1, renderAudience);
renderCurrentStep();
renderLive();
renderReport();
