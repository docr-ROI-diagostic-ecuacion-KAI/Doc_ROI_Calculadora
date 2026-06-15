function docroiHasNumber(value) {
  return value !== undefined && value !== null && String(value).trim() !== "" && Number.isFinite(n(value));
}

function docroiPercentOrPending(value, digits = 1) {
  return value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)
    ? "No calculable"
    : new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value).replace(/\s/g, "");
}

function docroiMoneyOrPendingFinal(value) {
  return value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value) ? "No calculable" : money(value);
}

function docroiMonthsOrPendingFinal(value) {
  return value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value) ? "No recuperado" : `Mes ${Math.ceil(value)}`;
}

function docroiQuarterTotals(rows) {
  return quarters.map((_, index) => sum((rows || []).map((row) => row?.q?.[index] || 0)));
}

function docroiMonthlyFromQuarters(quarterTotals) {
  return months.map((_, index) => n(quarterTotals[Math.floor(index / 3)]) / 3);
}

function docroiFinancialCore() {
  const revenueQ = docroiQuarterTotals(state.revenueRows || []);
  const opexQ = docroiQuarterTotals(state.opexRows || []);
  const monthlyRevenue = docroiMonthlyFromQuarters(revenueQ);
  const monthlyOpex = docroiMonthlyFromQuarters(opexQ);
  const capex = sum((state.capexRows || []).map((row) => n(row.units) * n(row.unitInvestment)));
  const totalRevenue = sum(revenueQ);
  const totalOpex = sum(opexQ);
  const totalCost = totalOpex + capex;
  const netProfit = totalRevenue - totalCost;
  const roi = totalCost > 0 ? netProfit / totalCost : null;
  const wacc = docroiHasNumber(readPath("meta.wacc")) ? decimalFromPercentPath("meta.wacc") : null;
  const customerEquity = roi !== null && wacc !== null ? roi - wacc : null;
  const waccMultiple = roi !== null && wacc !== null && wacc > 0 ? roi / wacc : null;
  const monthlyRate = wacc !== null ? Math.pow(1 + wacc, 1 / 12) - 1 : null;
  const cashFlow = monthlyRevenue.map((revenue, index) => revenue - monthlyOpex[index] - (index === 0 ? capex : 0));
  const accumulated = cashFlow.reduce((items, value, index) => { items.push(value + (items[index - 1] || 0)); return items; }, []);
  const van = monthlyRate !== null ? cashFlow.reduce((total, value, index) => total + value / Math.pow(1 + monthlyRate, index + 1), 0) : null;
  const paybackIndex = accumulated.findIndex((value) => value >= 0);
  const payback = totalCost > 0 && paybackIndex >= 0 ? paybackIndex + 1 : null;
  const retentionBase = docroiHasNumber(readPath("meta.retentionBase")) ? decimalFromPercentPath("meta.retentionBase") : null;
  const retentionStrategy = docroiHasNumber(readPath("meta.retentionStrategy")) ? decimalFromPercentPath("meta.retentionStrategy") : null;
  const churnBase = retentionBase !== null ? Math.max(0, Math.min(1, 1 - retentionBase)) : null;
  const churnStrategy = retentionStrategy !== null ? Math.max(0, Math.min(1, 1 - retentionStrategy)) : null;
  const ltv = calculateLtv ? calculateLtv() : { baseLtv: null, strategyLtv: null, differential: null, totalImpact: null };
  return { revenueQ, opexQ, monthlyRevenue, monthlyOpex, capex, totalRevenue, totalOpex, totalCost, netProfit, roi, wacc, customerEquity, waccMultiple, van, cashFlow, accumulated, payback, churnBase, churnStrategy, ltv };
}

const docroiCalculateBase = calculate;
calculate = function calculateDocroiFinancial() {
  const base = docroiCalculateBase();
  const financial = docroiFinancialCore();
  return {
    ...base,
    ...financial,
    financial,
    kai: calculateKai()
  };
};

function docroiFinancialDecision(financial, kai) {
  if (financial.roi === null) return { status: "status-watch", title: "Diagnostico pendiente", body: "Completa ingresos, OPEX y CAPEX para calcular una viabilidad financiera defendible." };
  if (financial.roi < 0) return { status: "status-risk", title: "Proyecto en riesgo", body: "Los ingresos declarados no recuperan todavia la suma de OPEX y CAPEX. La prioridad es aumentar retorno atribuible, reducir coste o redisenar el alcance." };
  if (financial.wacc !== null && financial.roi < financial.wacc) return { status: "status-watch", title: "Viable operativo, debil frente al WACC", body: "El proyecto recupera costes, pero el ROI queda por debajo de la referencia financiera. Conviene mejorar conversion, ARPU, eficiencia o coste antes de escalar." };
  if (financial.payback && financial.payback <= 12) return { status: "status-good", title: "Proyecto atractivo", body: "El ROI supera el umbral financiero y el payback se mantiene dentro del horizonte anual. La siguiente decision es escalar con trazabilidad." };
  return { status: "status-watch", title: "Proyecto viable, con control", body: "El ROI es positivo, pero conviene vigilar el plazo de recuperacion, la calidad de atribucion y las capacidades KAI mas debiles." };
}

function docroiImprovementList(financial, kai) {
  const items = [];
  if (financial.roi === null) items.push("Completar ingresos, OPEX y CAPEX para evitar una lectura incompleta.");
  if (financial.roi !== null && financial.roi < 0) items.push("Aumentar ingresos atribuibles o reducir el coste total antes de defender escalado.");
  if (financial.wacc !== null && financial.roi !== null && financial.roi < financial.wacc) items.push("Elevar ROI por encima del WACC mejorando conversion, ARPU, margen o eficiencia.");
  if (financial.payback === null) items.push("Revisar calendario de retorno: el proyecto no recupera la inversion dentro del horizonte calculado.");
  if (financial.churnStrategy !== null && financial.churnStrategy > 0.5) items.push("Reducir riesgo de perdida de cartera: una retencion baja limita LTV y recurrencia.");
  const lowKai = docroiKaiQuestions.filter((question) => Number(docroiExecutiveScore(question) || 0) > 0 && Number(docroiExecutiveScore(question)) <= 2).slice(0, 3);
  if (lowKai.length) items.push(`Reforzar capacidades KAI prioritarias: ${lowKai.map((question) => question.title).join(", ")}.`);
  if (!items.length) items.push("Mantener trazabilidad de ingresos, coste y dato para sostener el ROI en siguientes iteraciones.");
  return items;
}

function docroiKpiCard(title, value, description) {
  return `<article class="financial-card"><span>${title}</span><strong>${value}</strong><p>${description}</p></article>`;
}

function docroiFinancialChart(financial) {
  const max = Math.max(...financial.accumulated.map((value) => Math.abs(value)), 1);
  return `<section class="financial-chart"><div><h3>Cash flow acumulado</h3><p>Lectura mensual del avance hacia payback, descontando CAPEX inicial en el primer mes.</p></div><div class="financial-bars">${financial.accumulated.map((value) => `<span class="${value < 0 ? "negative" : "positive"}" style="height:${Math.max(8, Math.abs(value) / max * 150)}px" title="${money(value)}"></span>`).join("")}</div></section>`;
}

function docroiRenderFinancialSuite(result) {
  const financial = result.financial || docroiFinancialCore();
  const kai = result.kai || calculateKai();
  const decision = docroiFinancialDecision(financial, kai);
  const waccMultipleText = financial.waccMultiple === null ? "No calculable" : `${num(financial.waccMultiple)}x`;
  const cards = [
    docroiKpiCard("Ingresos declarados", docroiMoneyOrPendingFinal(financial.totalRevenue), "Suma de los ingresos introducidos en la pestaña de ingresos."),
    docroiKpiCard("Coste total", docroiMoneyOrPendingFinal(financial.totalCost), "OPEX + CAPEX declarados. Es la base de recuperacion del proyecto."),
    docroiKpiCard("ROI", docroiPercentOrPending(financial.roi, 1), "(Ingresos - OPEX - CAPEX) / (OPEX + CAPEX)."),
    docroiKpiCard("ROI sobre WACC", waccMultipleText, "Veces que el ROI cubre la referencia financiera declarada."),
    docroiKpiCard("Customer Equity ejecutivo", docroiPercentOrPending(financial.customerEquity, 1), "Excedente financiero: ROI - WACC."),
    docroiKpiCard("VAN / VNA", docroiMoneyOrPendingFinal(financial.van), "Valor actual neto de los flujos usando WACC como tasa de descuento."),
    docroiKpiCard("Payback", docroiMonthsOrPendingFinal(financial.payback), "Mes estimado en que la caja acumulada recupera la inversion."),
    docroiKpiCard("LTV diferencial", docroiMoneyOrPendingFinal(financial.ltv?.differential), "Valor extra por cliente al mejorar la retencion declarada."),
    docroiKpiCard("Riesgo de churn", financial.churnStrategy === null ? "No calculable" : docroiPercentOrPending(financial.churnStrategy, 1), "Riesgo aproximado de perdida de cartera segun la retencion con estrategia."),
    docroiKpiCard("Monetizacion del dato", docroiFormatPercentDot((kai.maturityAverage ?? docroiAverageScore()) === null ? null : (kai.maturityAverage ?? docroiAverageScore()) / 5, 0), "Promedio ejecutivo de capacidades KAI normalizado sobre 100.")
  ].join("");
  return `<div class="financial-suite"><section class="plain-note"><strong class="${decision.status}">${decision.title}</strong><p>${decision.body}</p></section><div class="financial-grid">${cards}</div>${docroiFinancialChart(financial)}<section class="plain-note"><strong>Donde mejorar para generar mas ROI</strong><ul>${docroiImprovementList(financial, kai).map((item) => `<li>${item}</li>`).join("")}</ul></section></div>`;
}

renderKpiExplain = function renderKpiExplainFinancial(result) {
  const kaiBlock = typeof docroiRadarBlock === "function" ? `<section class="report-section"><h3>Indicadores de monetizacion del dato KAI·ROI</h3>${docroiRadarBlock(result)}<div class="kai-data-grade"><span>Grado de monetizacion del dato</span><strong>${docroiFormatPercentDot(((result.kai?.maturityAverage ?? docroiAverageScore()) === null ? null : (result.kai?.maturityAverage ?? docroiAverageScore()) / 5), 0)}</strong><p>${docroiMonetizationText(((result.kai?.maturityAverage ?? docroiAverageScore()) === null ? null : (result.kai?.maturityAverage ?? docroiAverageScore()) / 5))}</p></div></section>` : "";
  return `${docroiRenderFinancialSuite(result)}${kaiBlock}`;
};

renderReport = function renderReportFinancial() {
  const result = calculate();
  const meta = `${state.meta.project || "Empresa sin nombre"} - ${state.meta.sector || "Sector"} - ${state.meta.country || "Territorio"}`;
  document.getElementById("reportMeta").textContent = meta;
  document.getElementById("reportBody").innerHTML = `<section class="report-section"><h3>Diagnostico financiero de viabilidad</h3>${docroiRenderFinancialSuite(result)}</section><section class="report-section"><h3>Indicadores de monetizacion del dato KAI·ROI</h3>${typeof docroiRadarBlock === "function" ? docroiRadarBlock(result) : ""}<div class="kai-report"><h3>Diagnostico por capacidad</h3><table class="result-table"><thead><tr><th>Dimension</th><th>Resultado</th><th>Interpretacion</th><th>Recomendacion</th></tr></thead><tbody>${docroiExecutiveSummaryRows()}</tbody></table></div></section>`;
};

renderLive = function renderLiveFinancial() {
  const result = calculate();
  const decision = docroiFinancialDecision(result.financial, result.kai);
  document.getElementById("resultTitle").textContent = decision.title;
  document.getElementById("kpiStrip").innerHTML = [
    ["ROI", docroiPercentOrPending(result.financial.roi, 1), "Retorno sobre coste total"],
    ["VAN", docroiMoneyOrPendingFinal(result.financial.van), "Valor actual neto"],
    ["Payback", docroiMonthsOrPendingFinal(result.financial.payback), "Recuperacion"],
    ["Churn", result.financial.churnStrategy === null ? "No calculable" : docroiPercentOrPending(result.financial.churnStrategy, 1), "Riesgo cartera"]
  ].map((kpi) => `<div class="kpi-card"><span>${kpi[0]}</span><strong>${kpi[1]}</strong><span>${kpi[2]}</span></div>`).join("");
  document.getElementById("executiveRead").innerHTML = `<strong class="${decision.status}">${decision.title}</strong><p>${decision.body}</p>`;
  renderChart(result.financial.accumulated);
};

renderCurrentStep();
renderLive();
renderReport();
