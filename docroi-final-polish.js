const DOCROI_LOGO_URL = "https://docroi.marketing/wp-content/uploads/2026/05/Logo_Negro_DoC_ROI.jpg";
const DOCROI_FINAL_SESSION_KEY = "docroi-final-clean-session-v1";

function docroiFinalCleanState() {
  [
    STORAGE_KEY,
    "docroi-session-state-v5",
    "docroi-session-active-v5",
    "docroi-session-state-v6",
    "docroi-session-active-v6",
    "docroi-session-state-v7",
    DOCROI_FINAL_SESSION_KEY
  ].forEach((key) => {
    try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch {}
  });
  state = blankState();
  if (typeof docroiEnsureObjects === "function") docroiEnsureObjects();
  state.revenueRows = [docroiBlankRevenueCampaign(), docroiBlankRevenueCampaign(), docroiBlankRevenueCampaign()];
  state.opexRows = [docroiBlankOpexLine(), docroiBlankOpexLine(), docroiBlankOpexLine()];
  state.capexRows = [docroiBlankCapexLine(), docroiBlankCapexLine(), docroiBlankCapexLine()];
  if (!state.meta) state.meta = {};
  state.meta.rgpdConsent = false;
  state.monthlyConversion = Array(12).fill("");
  saveState();
}

function docroiBlankRevenueCampaign() {
  return { channel: "", medium: "", customerType: "", convertible: true, capturedClients: "", conversion: "", arpu: "", q: ["", "", "", ""] };
}

function docroiBlankOpexLine() {
  return { concept: "", description: "", linkedRevenue: "", unitCost: "", units: "", q: ["", "", "", ""] };
}

function docroiBlankCapexLine() {
  return { category: "", concept: "", unit: "", units: "", unitInvestment: "" };
}

saveState = function saveStateFinalSessionOnly() {
  try { sessionStorage.setItem(DOCROI_FINAL_SESSION_KEY, JSON.stringify(state)); } catch {}
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
};

docroiFinalCleanState();

function docroiSelect(options, value, attrs) {
  return `<select ${attrs}>${["", ...options].map((option) => `<option value="${option}" ${String(value || "") === option ? "selected" : ""}>${option || "Seleccionar"}</option>`).join("")}</select>`;
}

function docroiCellInput(kind, row, key, value, type = "text") {
  return `<input data-final-table="${kind}" data-row="${row}" data-key="${key}" type="${type}" value="${displayValue(value)}" placeholder="">`;
}

function docroiRevenueValue(row) {
  if (!row) return 0;
  const hasCampaignFields = hasInput(row.capturedClients) || hasInput(row.conversion) || hasInput(row.arpu) || hasInput(row.medium) || hasInput(row.customerType);
  if (hasCampaignFields) {
    if (row.convertible === false || row.convertible === "false") return 0;
    return n(row.capturedClients) * (n(row.conversion) / 100) * n(row.arpu);
  }
  return sum(row.q || []);
}

function docroiOpexValue(row) {
  if (!row) return 0;
  if (hasInput(row.unitCost) || hasInput(row.units)) return n(row.unitCost) * n(row.units);
  return sum(row.q || []);
}

function docroiCapexValue(row) {
  return n(row?.units) * n(row?.unitInvestment);
}

function renderRevenueCalculator() {
  const media = ["Despegable", "Search", "Email", "RRSS", "Web/Blog", "Presencia", "Retail media", "Display", "Afiliacion", "Evento", "Tradicional", "Otros"];
  const customerTypes = ["Audiencia", "Lead", "Cliente nuevo", "Cliente pasivo", "Cliente activo", "Cliente insatisfecho"];
  const rows = state.revenueRows.map((row, index) => `<tr>
    <td>${docroiCellInput("revenueRows", index, "channel", row.channel, "text")}</td>
    <td>${docroiSelect(media, row.medium, `data-final-table="revenueRows" data-row="${index}" data-key="medium"`)}</td>
    <td>${docroiSelect(customerTypes, row.customerType, `data-final-table="revenueRows" data-row="${index}" data-key="customerType"`)}</td>
    <td><input data-final-table="revenueRows" data-row="${index}" data-key="convertible" type="checkbox" ${row.convertible === false || row.convertible === "false" ? "" : "checked"}></td>
    <td>${docroiCellInput("revenueRows", index, "capturedClients", row.capturedClients, "number")}</td>
    <td>${docroiCellInput("revenueRows", index, "conversion", row.conversion, "number")}</td>
    <td>${docroiCellInput("revenueRows", index, "arpu", row.arpu, "number")}</td>
    <td class="calc-total" data-row-total="revenueRows-${index}">${money(docroiRevenueValue(row))}</td>
  </tr>`).join("");
  return `<div class="plain-note"><strong>Calculadora de ingresos por campana</strong><p>Introduce cada campana o fuente de valor. Si marcas que es convertible, el valor esperado se calcula como clientes captados x conversion esperada x ARPU.</p></div><div class="calc-table-wrap"><table class="calc-table"><thead><tr><th>Canal</th><th>Medio</th><th>Tipo cliente</th><th>Convertible</th><th>Clientes captados</th><th>% conversion</th><th>ARPU esperado</th><th>Valor esperado</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-actions"><button class="ghost-action" type="button" data-add-final-row="revenueRows">Anadir campana</button></div>`;
}

function renderOpexCalculator() {
  const revenueNames = state.revenueRows.map((row, index) => row.channel || `Campana ${index + 1}`);
  const rows = state.opexRows.map((row, index) => `<tr>
    <td>${docroiCellInput("opexRows", index, "concept", row.concept, "text")}</td>
    <td>${docroiCellInput("opexRows", index, "description", row.description, "text")}</td>
    <td>${docroiSelect(revenueNames, row.linkedRevenue, `data-final-table="opexRows" data-row="${index}" data-key="linkedRevenue"`)}</td>
    <td>${docroiCellInput("opexRows", index, "unitCost", row.unitCost, "number")}</td>
    <td>${docroiCellInput("opexRows", index, "units", row.units, "number")}</td>
    <td class="calc-total" data-row-total="opexRows-${index}">${money(docroiOpexValue(row))}</td>
  </tr>`).join("");
  return `<div class="plain-note"><strong>Calculadora OPEX</strong><p>Define el coste operativo como coste por unidad x unidades. Puedes vincularlo a una campana de ingresos para defender mejor la trazabilidad.</p></div><div class="calc-table-wrap"><table class="calc-table"><thead><tr><th>Concepto</th><th>Descripcion</th><th>Asociado a ingreso</th><th>Coste unidad</th><th>Unidades</th><th>Total OPEX</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-actions"><button class="ghost-action" type="button" data-add-final-row="opexRows">Anadir linea OPEX</button></div>`;
}

function renderCapexCalculator() {
  const rows = state.capexRows.map((row, index) => `<tr>
    <td>${docroiCellInput("capexRows", index, "category", row.category, "text")}</td>
    <td>${docroiCellInput("capexRows", index, "concept", row.concept, "text")}</td>
    <td>${docroiCellInput("capexRows", index, "unit", row.unit, "text")}</td>
    <td>${docroiCellInput("capexRows", index, "units", row.units, "number")}</td>
    <td>${docroiCellInput("capexRows", index, "unitInvestment", row.unitInvestment, "number")}</td>
    <td class="calc-total" data-row-total="capexRows-${index}">${money(docroiCapexValue(row))}</td>
  </tr>`).join("");
  return `<div class="plain-note"><strong>Calculadora CAPEX</strong><p>Recoge la inversion inicial necesaria para arrancar. El total se calcula como unidades x inversion por unidad.</p></div><div class="calc-table-wrap"><table class="calc-table"><thead><tr><th>Categoria</th><th>Concepto</th><th>Unidad</th><th>Unidades</th><th>Inversion unidad</th><th>Total CAPEX</th></tr></thead><tbody>${rows}</tbody></table></div><div class="table-actions"><button class="ghost-action" type="button" data-add-final-row="capexRows">Anadir inversion</button></div>`;
}

input = function inputNoPlaceholders(path, label, help, type = "number") {
  const id = path.replaceAll(".", "-");
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-path="${path}" type="${type}" value="${displayValue(readPath(path))}" placeholder=""><small>${help}</small></div>`;
};

docroiEconomicInput = function docroiEconomicInputNoPlaceholder(path, label, help, type = "number") {
  const id = path.replaceAll(".", "-");
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" data-path="${path}" type="${type}" value="${displayValue(readPath(path))}" placeholder=""><small>${help.replace(/Si lo dejas[^.]*\./gi, "")}</small></div>`;
};

renderContext = function renderContextFinalPolish() {
  return `<div class="field-grid">${input("meta.project", "Empresa", "Nombre de la empresa o unidad evaluada.", "text")}${input("meta.country", "Pais o territorio", "Mercado principal del diagnostico.", "text")}${input("meta.sector", "Sector", "Actividad principal de la organizacion.", "text")}${input("meta.companySize", "Tamano de empresa", "Pyme, mid-market, enterprise u otra referencia ejecutiva.", "text")}${input("meta.digitalMaturity", "Madurez digital percibida", "Describe brevemente el punto de partida.", "text")}${input("meta.email", "Correo electronico", "Dato opcional de contacto.", "email")}${input("meta.wacc", "WACC o referencia financiera (%)", "Escribe 10 para 10%.")}<div class="field full consent-field"><label><input type="checkbox" data-check="meta.rgpdConsent" ${readPath("meta.rgpdConsent") ? "checked" : ""}><span>Autorizo el tratamiento de mis datos personales con la finalidad de gestionar mi participacion en esta iniciativa de caracter orientativo y academico. La informacion recopilada podra utilizarse para el analisis y elaboracion de propuestas o acciones vinculadas al ambito comercial, siempre dentro del marco establecido por el Reglamento General de Proteccion de Datos (RGPD).</span></label></div><div class="field full"><label for="notes">Narrativa del caso</label><textarea id="notes" data-path="notes" rows="4" placeholder="">${displayValue(state.notes)}</textarea><small>Explica que escenario se quiere evaluar y por que importa para negocio.</small></div></div>`;
};

function docroiFinalizeSteps() {
  if (!Array.isArray(steps)) return;
  const ltvIndex = steps.findIndex((step) => Array.isArray(step) && /LTV|cartera/i.test(step[0] || ""));
  if (ltvIndex >= 0) steps.splice(ltvIndex, 1);
  const revenueIndex = steps.findIndex((step) => Array.isArray(step) && /Ingresos/i.test(step[0] || ""));
  const opexIndex = steps.findIndex((step) => Array.isArray(step) && /OPEX/i.test(step[0] || ""));
  const capexIndex = steps.findIndex((step) => Array.isArray(step) && /CAPEX/i.test(step[0] || ""));
  const contextIndex = steps.findIndex((step) => Array.isArray(step) && /Contexto/i.test(step[0] || ""));
  const finalIndex = steps.findIndex((step) => Array.isArray(step) && /Resultado/i.test(step[0] || ""));
  if (contextIndex >= 0) steps[contextIndex][3] = renderContext;
  if (revenueIndex >= 0) steps[revenueIndex][3] = renderRevenueCalculator;
  if (opexIndex >= 0) steps[opexIndex][3] = renderOpexCalculator;
  if (capexIndex >= 0) steps[capexIndex][3] = renderCapexCalculator;
  if (finalIndex >= 0) steps[finalIndex][3] = renderFinal;
  if (currentStep >= steps.length) currentStep = steps.length - 1;
}

function docroiFinalFinancialCore() {
  const totalRevenue = sum((state.revenueRows || []).map(docroiRevenueValue));
  const totalOpex = sum((state.opexRows || []).map(docroiOpexValue));
  const capex = sum((state.capexRows || []).map(docroiCapexValue));
  const totalCost = totalOpex + capex;
  const netProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? netProfit / totalCost : null;
  const wacc = hasInput(readPath("meta.wacc")) ? decimalFromPercentPath("meta.wacc") : null;
  const customerEquity = roi !== null && wacc !== null ? roi - wacc : null;
  const waccMultiple = roi !== null && wacc !== null && wacc > 0 ? roi / wacc : null;
  const monthlyRevenue = months.map(() => totalRevenue / 12);
  const monthlyOpex = months.map(() => totalOpex / 12);
  const cashFlow = months.map((_, index) => monthlyRevenue[index] - monthlyOpex[index] - (index === 0 ? capex : 0));
  const accumulated = cashFlow.reduce((items, value, index) => { items.push(value + (items[index - 1] || 0)); return items; }, []);
  const monthlyRate = wacc !== null ? Math.pow(1 + wacc, 1 / 12) - 1 : null;
  const van = monthlyRate !== null ? cashFlow.reduce((total, value, index) => total + value / Math.pow(1 + monthlyRate, index + 1), 0) : null;
  const paybackIndex = accumulated.findIndex((value) => value >= 0);
  const payback = totalCost > 0 && paybackIndex >= 0 ? paybackIndex + 1 : null;
  return { totalRevenue, totalOpex, capex, totalCost, netProfit, roi, wacc, customerEquity, waccMultiple, monthlyRevenue, monthlyOpex, cashFlow, accumulated, van, payback };
}

docroiFinancialCore = docroiFinalFinancialCore;

const docroiFinalCalculateBase = calculate;
calculate = function calculateFinalPolish() {
  const base = docroiFinalCalculateBase();
  const financial = docroiFinalFinancialCore();
  return { ...base, ...financial, financial, kai: calculateKai() };
};

function docroiFinalKpiCard(title, value, text) {
  return `<article class="financial-card"><span>${title}</span><strong>${value}</strong><p>${text}</p></article>`;
}

function docroiFinalFinancialBlock(result) {
  const f = result.financial;
  const decision = docroiFinancialDecision(f, result.kai);
  const multiple = f.waccMultiple === null ? "No calculable" : `${num(f.waccMultiple)}x`;
  return `<section class="report-section"><h3>Diagnostico financiero de viabilidad</h3><div class="financial-suite"><section class="plain-note"><strong class="${decision.status}">${decision.title}</strong><p>${decision.body}</p></section><div class="financial-grid">${[
    docroiFinalKpiCard("Ingresos declarados", docroiMoneyOrPendingFinal(f.totalRevenue), "Suma del valor esperado de las campanas declaradas."),
    docroiFinalKpiCard("OPEX", docroiMoneyOrPendingFinal(f.totalOpex), "Coste operativo calculado por unidades y coste unitario."),
    docroiFinalKpiCard("CAPEX", docroiMoneyOrPendingFinal(f.capex), "Inversion inicial calculada por unidades e inversion unitaria."),
    docroiFinalKpiCard("Coste total", docroiMoneyOrPendingFinal(f.totalCost), "OPEX + CAPEX."),
    docroiFinalKpiCard("ROI", docroiPercentOrPending(f.roi, 1), "(Ingresos - OPEX - CAPEX) / (OPEX + CAPEX)."),
    docroiFinalKpiCard("ROI sobre WACC", multiple, "Veces que el ROI cubre la referencia financiera declarada."),
    docroiFinalKpiCard("Customer Equity ejecutivo", docroiPercentOrPending(f.customerEquity, 1), "Excedente financiero: ROI - WACC."),
    docroiFinalKpiCard("VAN / VNA", docroiMoneyOrPendingFinal(f.van), "Valor actual neto de los flujos usando WACC como tasa de descuento."),
    docroiFinalKpiCard("Payback", docroiMonthsOrPendingFinal(f.payback), "Mes estimado en que la caja acumulada recupera la inversion.")
  ].join("")}</div>${docroiFinancialChart(f)}<section class="plain-note"><strong>Donde mejorar para generar mas ROI</strong><ul>${docroiImprovementList(f, result.kai).filter((item) => !/LTV|churn|cartera/i.test(item)).map((item) => `<li>${item}</li>`).join("")}</ul></section></div></section>`;
}

function docroiFinalKaiBlock(result) {
  const metrics = typeof docroiExecutiveMetrics === "function" ? docroiExecutiveMetrics(result) : { monetizationGrade: null, avg: docroiAverageScore(), minScore: null };
  return `<section class="report-section"><h3>Indicadores de monetizacion del dato KAI·ROI</h3>${typeof docroiRadarBlock === "function" ? docroiRadarBlock(result) : ""}<div class="kai-data-grade"><span>Grado de monetizacion del dato</span><strong>${docroiFormatPercentDot(metrics.monetizationGrade ?? ((result.kai?.maturityAverage ?? docroiAverageScore()) === null ? null : (result.kai?.maturityAverage ?? docroiAverageScore()) / 5), 0)}</strong><p>${docroiMonetizationText(metrics.monetizationGrade ?? ((result.kai?.maturityAverage ?? docroiAverageScore()) === null ? null : (result.kai?.maturityAverage ?? docroiAverageScore()) / 5))}</p></div></section>`;
}

function docroiFinalCapacityBlock() {
  return `<section class="report-section"><div class="kai-report"><h3>Diagnostico por capacidad</h3><p>Esta lectura no evalua personas. Evalua capacidad de monetizacion del dato, madurez estructural, calidad de decision, eficiencia economica y potencial de Customer Equity.</p><table class="result-table"><thead><tr><th>Dimension</th><th>Resultado</th><th>Interpretacion</th><th>Recomendacion</th></tr></thead><tbody>${docroiExecutiveSummaryRows()}</tbody></table><p class="trace-note">Trazabilidad interna: la estructura formal KAI·ROI v1, titularidad de PhD Jorge Lucio, permanece intacta y subordinante sobre la implementacion operativa.</p></div></section>`;
}

function docroiDiipBlock() {
  const items = [
    ["D", "Data", "Dato bruto capturado desde la actividad del negocio."],
    ["I", "Information", "Dato ordenado con contexto, origen, responsable y lectura minima."],
    ["I", "Intelligence", "Capacidad de convertir informacion en criterio de decision."],
    ["I", "Insights", "Indicadores que ayudan a priorizar accion, riesgo y oportunidad."],
    ["P", "Personalization Actions", "Acciones visibles que conectan decision, cliente, oferta y resultado."]
  ];
  return `<section class="docroi-diip"><div class="docroi-diip-inner"><div class="docroi-diip-head"><span>Metodologia al final del recorrido</span><h2>DIIIP explica por que esta conexion genera valor</h2><p>Despues de entender el caso, el ROI y la eficiencia, DIIIP ordena la logica: el valor no aparece en un nodo aislado. Aparece cuando el dato bruto se transforma en una decision visible.</p></div><div class="docroi-diip-list">${items.map((item) => `<article class="docroi-diip-item"><div class="docroi-diip-letter">${item[0]}</div><div><strong>${item[1]}</strong><p>${item[2]}</p></div></article>`).join("")}</div></div></section>`;
}

function docroiReportFooter() {
  return `<footer class="docroi-report-footer"><img src="${DOCROI_LOGO_URL}" alt="Doc ROI"><p>La propiedad intelectual del ecosistema Doc ROI pertenece al Ph. D. Jorge Lucio Sanchez Galan.</p><p><a href="https://docroi.marketing/kai-equation/" target="_blank" rel="noopener">Accede a la Ecuacion KAI·ROI</a></p></footer>`;
}

renderFinal = function renderFinalOnlyReportPrompt() {
  return `<div class="plain-note"><strong>Informe final preparado</strong><p>Revisa el informe consolidado que aparece a continuacion. Incluye viabilidad financiera, monetizacion del dato KAI·ROI y diagnostico por capacidad.</p></div><div class="report-print-top"><button class="docroi-print-action" type="button" data-docroi-print>Imprimir en PDF</button></div>`;
};

renderReport = function renderReportFinalPolish() {
  if (!docroiIsFinalStep()) {
    if (typeof docroiSetReportVisibility === "function") docroiSetReportVisibility();
    return;
  }
  if (typeof docroiSetReportVisibility === "function") docroiSetReportVisibility();
  const result = calculate();
  const cover = document.querySelector(".report-cover");
  if (cover) {
    cover.classList.add("docroi-black-cover");
    cover.innerHTML = `<div class="brand-lockup compact"><img class="docroi-logo report-logo" src="${DOCROI_LOGO_URL}" alt="DocROI"><div><p class="eyebrow">DocROI</p><h2>Informe ROI, LTV y Customer Equity</h2></div></div><p id="reportMeta">${state.meta.project || "Empresa sin nombre"} - ${state.meta.sector || "Sector"} - ${state.meta.country || "Territorio"}</p>`;
  }
  document.getElementById("reportBody").innerHTML = `<div class="report-print-top"><button class="docroi-print-action" type="button" data-docroi-print>Imprimir en PDF</button></div>${docroiFinalFinancialBlock(result)}${docroiFinalKaiBlock(result)}${docroiFinalCapacityBlock()}${docroiDiipBlock()}<div class="report-print-bottom"><button class="docroi-print-action" type="button" data-docroi-print>Imprimir en PDF</button></div>${docroiReportFooter()}`;
};

renderLive = function renderLiveFinalPolish() {
  if (!docroiIsFinalStep()) {
    if (typeof docroiRenderGuidePanel === "function") docroiRenderGuidePanel();
    if (typeof docroiSetReportVisibility === "function") docroiSetReportVisibility();
    return;
  }
  const result = calculate();
  const decision = docroiFinancialDecision(result.financial, result.kai);
  const mini = document.querySelector(".mini-chart");
  if (mini) mini.style.display = "block";
  document.getElementById("resultTitle").textContent = decision.title;
  document.getElementById("kpiStrip").innerHTML = [
    ["ROI", docroiPercentOrPending(result.financial.roi, 1), "Retorno sobre coste total"],
    ["VAN", docroiMoneyOrPendingFinal(result.financial.van), "Valor actual neto"],
    ["Payback", docroiMonthsOrPendingFinal(result.financial.payback), "Recuperacion"],
    ["Coste total", docroiMoneyOrPendingFinal(result.financial.totalCost), "OPEX + CAPEX"]
  ].map((kpi) => `<div class="kpi-card"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><span>${kpi[2]}</span></div>`).join("");
  document.getElementById("executiveRead").innerHTML = `<strong class="${decision.status}">${decision.title}</strong><p>${decision.body}</p>`;
  renderChart(result.financial.accumulated);
  if (typeof docroiSetReportVisibility === "function") docroiSetReportVisibility();
};

const docroiFinalBindBase = bindInputs;
bindInputs = function bindInputsFinalPolish() {
  docroiFinalBindBase();
  document.querySelectorAll("[data-final-table]").forEach((element) => {
    element.addEventListener("input", () => docroiFinalInputChange(element));
    element.addEventListener("change", () => docroiFinalInputChange(element));
  });
  document.querySelectorAll("[data-add-final-row]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.addFinalRow;
      if (kind === "revenueRows") state.revenueRows.push(docroiBlankRevenueCampaign());
      if (kind === "opexRows") state.opexRows.push(docroiBlankOpexLine());
      if (kind === "capexRows") state.capexRows.push(docroiBlankCapexLine());
      changed(true);
    });
  });
  document.querySelectorAll("input, textarea").forEach((element) => element.setAttribute("placeholder", ""));
};

function docroiFinalInputChange(element) {
  const row = state[element.dataset.finalTable][Number(element.dataset.row)];
  row[element.dataset.key] = element.type === "checkbox" ? element.checked : element.value;
  saveState();
  docroiRefreshInlineTotals();
  renderLive();
  renderReport();
}

function docroiRefreshInlineTotals() {
  (state.revenueRows || []).forEach((row, index) => {
    const target = document.querySelector(`[data-row-total="revenueRows-${index}"]`);
    if (target) target.textContent = money(docroiRevenueValue(row));
  });
  (state.opexRows || []).forEach((row, index) => {
    const target = document.querySelector(`[data-row-total="opexRows-${index}"]`);
    if (target) target.textContent = money(docroiOpexValue(row));
  });
  (state.capexRows || []).forEach((row, index) => {
    const target = document.querySelector(`[data-row-total="capexRows-${index}"]`);
    if (target) target.textContent = money(docroiCapexValue(row));
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-docroi-print]")) {
    renderReport();
    window.print();
  }
});

document.querySelectorAll(".docroi-logo").forEach((logo) => { logo.src = DOCROI_LOGO_URL; });
const heroActions = document.querySelector(".hero-actions");
if (heroActions) heroActions.remove();

docroiFinalizeSteps();
renderCurrentStep();
renderLive();
renderReport();
