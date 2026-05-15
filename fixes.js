const rgpdText = "Autorizo el tratamiento de mis datos personales con la finalidad de gestionar mi participación en esta iniciativa de carácter orientativo y académico. La información recopilada podrá utilizarse para el análisis y elaboración de propuestas o acciones vinculadas al ámbito comercial, siempre dentro del marco establecido por el Reglamento General de Protección de Datos (RGPD).";

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

const docroiOriginalCalculateKai = calculateKai;
calculateKai = function calculateKaiWithK() {
  const kai = docroiOriginalCalculateKai();
  const kValue = n(readPath("meta.kValue"));
  const multiplier = 1 + kValue;
  const kaiStar = kai.kaiStar * multiplier;
  const cost = Math.max(n(readPath("kai.cost")), 1);
  const monetization = n(readPath("kai.monetization"));
  const waccRaw = n(readPath("meta.wacc"));
  const wacc = waccRaw > 1 ? waccRaw / 100 : waccRaw;
  const ce = ((((kaiStar * monetization) - cost) / cost) - wacc) / Math.max(wacc, 0.0001);
  return { ...kai, kaiStar, ce, kValue, kMultiplier: multiplier };
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
      ${input("meta.kValue", "Valor K", "Coeficiente de sensibilidad K. Ejemplo: 0.007 significa un ajuste del 0,7% sobre KAI*.")}
      <div class="field full">
        <label for="notes">Narrativa del caso</label>
        <textarea id="notes" data-path="notes" rows="4" placeholder="${notesPlaceholder}">${displayValue(state.notes)}</textarea>
        <small>Escribe que se quiere probar y por que importa para negocio.</small>
      </div>
    </div>
  `;
};

renderEquity = function renderEquityWithK() {
  const k = calculate().kai;
  return `
    <div class="formula-block">
      <code>KAIiK = KAIi* x (1 + K)</code>
      <code>CE_i = ((((KAIiK x MD_i) - C_i) / C_i) - WACC_t) / WACC_t</code>
    </div>
    <div class="field-grid">
      ${input("kai.phi", "phi: confianza base (%)", "Escribe 82 para 82%.")}
      ${input("kai.usability", "u: facilidad de uso (%)", "Escribe 76 para 76%.")}
      ${input("kai.frequency", "f: frecuencia de relacion (%)", "Escribe 64 para 64%.")}
      ${input("kai.dataActivation", "DataActivation (%)", "Escribe 70 para 70%.")}
      ${input("kai.networkIndex", "I_net (%)", "Escribe 58 para 58%.")}
      ${input("kai.cc", "CC (%)", "Escribe 74 para 74%.")}
      ${input("kai.abcd", "ABCD (%)", "Escribe 62 para 62%.")}
      ${input("kai.nps", "NPS normalizado (%)", "Escribe 68 para 68%.")}
      ${input("kai.purpose", "P: coherencia (%)", "Escribe 80 para 80%.")}
      ${input("kai.context", "Gamma contexto (%)", "Escribe 90 para 90%.")}
      ${input("kai.monetization", "MD: monetizacion observable", "Valor monetario atribuible.")}
      ${input("kai.cost", "C: coste atribuible", "Coste total atribuible.")}
    </div>
    <div class="explainer-grid">
      <div class="explainer"><span>psi</span><strong>${num(k.psi)}</strong></div>
      <div class="explainer"><span>K aplicado</span><strong>${num(k.kMultiplier)}</strong></div>
      <div class="explainer"><span>CE_i</span><strong>${num(k.ce)}</strong></div>
    </div>
  `;
};

renderKpiExplain = function renderKpiExplainWithK(result) {
  const rows = [
    ["ROI", pct(result.roi), "Si escribes 5 en un porcentaje, el modelo calcula 5%, no 500%."],
    ["VAN", money(result.van), "Valor actual neto."],
    ["Payback", result.payback ? `Mes ${result.payback}` : "No recuperado", "Mes de recuperacion."],
    ["Beneficio neto", money(result.netProfit), "Ingresos menos OPEX y CAPEX."],
    ["LTV diferencial", money(result.ltv.differential), "Valor extra por cliente."],
    ["Valor K", num(result.kai.kValue), "Ajuste de sensibilidad aplicado sobre KAI*. 0.007 significa +0,7%."],
    ["Customer Equity CE_i", num(result.kai.ce), "Valor relacional ajustado por coste, WACC y sensibilidad K."]
  ];
  return `<table class="result-table"><thead><tr><th>KPI</th><th>Resultado</th><th>Como leerlo</th></tr></thead><tbody>${rows.map((x) => `<tr><td><strong>${x[0]}</strong></td><td>${x[1]}</td><td>${x[2]}</td></tr>`).join("")}</tbody></table>`;
};

updateStepRenderer(0, renderContext);
updateStepRenderer(6, renderEquity);
renderCurrentStep();
renderLive();
renderReport();
