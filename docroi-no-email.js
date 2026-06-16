renderContext = function renderContextWithoutEmail() {
  if (!state.meta) state.meta = {};
  state.meta.email = "";
  state.meta.rgpdConsent = false;
  return `<div class="field-grid">${input("meta.project", "Empresa", "Nombre de la empresa o unidad evaluada.", "text")}${input("meta.country", "Pais o territorio", "Mercado principal del diagnostico.", "text")}${input("meta.sector", "Sector", "Actividad principal de la organizacion.", "text")}${input("meta.companySize", "Tamano de empresa", "Pyme, mid-market, enterprise u otra referencia ejecutiva.", "text")}${input("meta.digitalMaturity", "Madurez digital percibida", "Describe brevemente el punto de partida.", "text")}${input("meta.wacc", "WACC o referencia financiera (%)", "Escribe 10 para 10%.")}<div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4" placeholder="">${displayValue(state.notes)}</textarea><small>Explica que escenario se quiere evaluar y por que importa para negocio.</small></div></div>`;
};

if (Array.isArray(steps)) {
  const contextIndex = steps.findIndex((step) => Array.isArray(step) && /Contexto/i.test(step[0] || ""));
  if (contextIndex >= 0) steps[contextIndex][3] = renderContext;
}

saveState();
if (typeof currentStep !== "undefined" && currentStep === 0) {
  renderCurrentStep();
  renderLive();
  renderReport();
}
