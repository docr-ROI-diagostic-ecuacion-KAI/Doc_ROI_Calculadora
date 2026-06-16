renderContext = function renderContextWithoutEmail() {
  if (!state.meta) state.meta = {};
  state.meta.email = "";
  state.meta.rgpdConsent = false;
  return `<div class="field-grid">${input("meta.project", "Empresa", "Nombre de la empresa o unidad evaluada.", "text")}${input("meta.country", "Pais o territorio", "Mercado principal del diagnostico.", "text")}${input("meta.sector", "Sector", "Actividad principal de la organizacion.", "text")}${input("meta.companySize", "Tamano de empresa", "Pyme, mid-market, enterprise u otra referencia ejecutiva.", "text")}${input("meta.digitalMaturity", "Madurez digital percibida", "Describe brevemente el punto de partida.", "text")}${input("meta.wacc", "WACC o referencia financiera (%)", "Escribe 10 para 10%.")}<div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4" placeholder="">${displayValue(state.notes)}</textarea><small>Explica que escenario se quiere evaluar y por que importa para negocio.</small></div></div>`;
};

function docroiEnsureAudienceModel() {
  if (!state.audienceModel) {
    state.audienceModel = { average: "", profile: "stable", conversion: readPath("meta.conversion") || "" };
  }
  if (!Array.isArray(state.monthlyConversion)) state.monthlyConversion = Array(12).fill("");
}

function docroiAudienceProfileFactors(profile) {
  const profiles = {
    stable: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    softGrowth: [0.72, 0.78, 0.84, 0.9, 0.96, 1, 1.05, 1.09, 1.13, 1.18, 1.23, 1.3],
    progressiveLaunch: [0.35, 0.45, 0.58, 0.72, 0.86, 1, 1.12, 1.22, 1.3, 1.38, 1.45, 1.52],
    finalPeak: [0.68, 0.7, 0.74, 0.78, 0.82, 0.88, 0.96, 1.05, 1.18, 1.34, 1.48, 1.58],
    seasonal: [0.82, 0.88, 1.06, 1.18, 1.08, 0.92, 0.78, 0.82, 1.05, 1.18, 1.24, 0.99]
  };
  return profiles[profile] || profiles.stable;
}

function docroiApplyAudienceEstimate() {
  docroiEnsureAudienceModel();
  const average = n(state.audienceModel.average);
  const conversion = hasInput(state.audienceModel.conversion) ? state.audienceModel.conversion : readPath("meta.conversion");
  const factors = docroiAudienceProfileFactors(state.audienceModel.profile);
  state.audience = factors.map((factor) => average ? String(Math.round(average * factor)) : "");
  state.monthlyConversion = months.map(() => displayValue(conversion));
  state.meta.conversion = displayValue(conversion);
  saveState();
}

function renderAudience() {
  docroiEnsureAudienceModel();
  const profiles = [
    ["stable", "Estable"],
    ["softGrowth", "Crecimiento suave"],
    ["progressiveLaunch", "Lanzamiento progresivo"],
    ["finalPeak", "Pico al final"],
    ["seasonal", "Estacional"],
  ];
  const profileOptions = profiles.map(([value, label]) => `<option value="${value}" ${state.audienceModel.profile === value ? "selected" : ""}>${label}</option>`).join("");
  const monthCards = months.map((month, index) => {
    const monthlyValue = hasInput(state.monthlyConversion?.[index]) ? displayValue(state.monthlyConversion[index]) : displayValue(readPath("meta.conversion"));
    return `<article class="audience-card"><h3>${month}</h3><label for="audience-${index}">Audiencia</label><input id="audience-${index}" data-array="audience" data-index="${index}" type="number" value="${displayValue(state.audience[index])}" placeholder=""><label for="month-conversion-${index}">Conversion (%)</label><input id="month-conversion-${index}" data-month-conversion="${index}" type="number" value="${monthlyValue}" placeholder=""></article>`;
  }).join("");
  return `<section class="audience-model"><div class="plain-note"><strong>Estimacion rapida de audiencia</strong><p>Para un ejercicio teorico, basta con crear una hipotesis razonable y luego ajustar los meses que tengan una logica distinta.</p></div><div class="field-grid audience-estimator"><div class="field"><label for="audience-average">Audiencia media mensual estimada</label><input id="audience-average" data-audience-model="average" type="number" value="${displayValue(state.audienceModel.average)}" placeholder=""><small>Una cifra base para construir el escenario.</small></div><div class="field"><label for="audience-profile">Patron de evolucion</label><select id="audience-profile" data-audience-model="profile">${profileOptions}</select><small>Elige la forma mas parecida al caso.</small></div><div class="field"><label for="audience-conversion">Conversion objetivo (%)</label><input id="audience-conversion" data-audience-model="conversion" type="number" value="${displayValue(state.audienceModel.conversion || readPath("meta.conversion"))}" placeholder=""><small>Escribe 3 para 3%.</small></div><div class="field audience-apply"><button class="primary-action" type="button" data-apply-audience>Aplicar estimacion mensual</button><small>Despues puedes editar cualquier mes manualmente.</small></div></div><div class="plain-note audience-summary"><strong>Meses editables</strong><p>Revisa la propuesta mensual y cambia solo los meses que quieras ajustar.</p></div><div class="audience-months friendly-audience-months">${monthCards}</div></section>`;
}

if (Array.isArray(steps)) {
  const contextIndex = steps.findIndex((step) => Array.isArray(step) && /Contexto/i.test(step[0] || ""));
  const audienceIndex = steps.findIndex((step) => Array.isArray(step) && /Audiencia/i.test(step[0] || ""));
  if (contextIndex >= 0) steps[contextIndex][3] = renderContext;
  if (audienceIndex >= 0) {
    steps[audienceIndex][1] = "Construye una hipotesis sencilla de audiencia y conversion. El modelo puede extrapolar los meses para que no tengas que rellenarlo todo desde cero.";
    steps[audienceIndex][2] = "Piensa en una media razonable, elige el patron mas parecido y ajusta solo los meses que lo necesiten.";
    steps[audienceIndex][3] = renderAudience;
  }
}

const docroiNoEmailBindBase = bindInputs;
bindInputs = function bindInputsNoEmailAudience() {
  docroiNoEmailBindBase();
  document.querySelectorAll("[data-audience-model]").forEach((element) => {
    element.addEventListener("input", () => {
      docroiEnsureAudienceModel();
      state.audienceModel[element.dataset.audienceModel] = element.value;
      if (element.dataset.audienceModel === "conversion") state.meta.conversion = element.value;
      saveState();
    });
    element.addEventListener("change", () => {
      docroiEnsureAudienceModel();
      state.audienceModel[element.dataset.audienceModel] = element.value;
      saveState();
    });
  });
  document.querySelectorAll("[data-apply-audience]").forEach((button) => {
    button.addEventListener("click", () => {
      docroiApplyAudienceEstimate();
      renderCurrentStep();
      renderLive();
      renderReport();
    });
  });
};

saveState();
if (typeof currentStep !== "undefined") {
  renderCurrentStep();
  renderLive();
  renderReport();
}
