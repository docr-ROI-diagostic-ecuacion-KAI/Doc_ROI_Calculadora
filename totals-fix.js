function docroiIsMoneyUnit(unit) {
  const normalized = String(unit || "").trim().toLowerCase();
  return normalized === "eur" || normalized === "euro" || normalized === "euros" || normalized === "€";
}

function docroiNumberFromInput(input) {
  return n(input?.value ?? 0);
}

function docroiQuarterTotalFromRow(row) {
  return Array.from(row.querySelectorAll("[data-quarter]")).reduce((total, input) => total + docroiNumberFromInput(input), 0);
}

function docroiRevenueTotalLabel(row) {
  const unit = row.querySelector("[data-key='unit']")?.value;
  const total = docroiQuarterTotalFromRow(row);
  return docroiIsMoneyUnit(unit) ? money(total) : num(total);
}

function docroiOpexTotalLabel(row) {
  return money(docroiQuarterTotalFromRow(row));
}

function docroiCapexTotalLabel(row) {
  const units = docroiNumberFromInput(row.querySelector("[data-key='units']"));
  const investment = docroiNumberFromInput(row.querySelector("[data-key='unitInvestment']"));
  return money(units * investment);
}

function docroiUpdateRowTotalFromDom(row) {
  if (!row) return;
  const total = row.querySelector("[data-row-total]");
  if (!total) return;
  const quarterInput = row.querySelector("[data-quarter]");
  const capexInput = row.querySelector("[data-table='capexRows']");
  if (quarterInput) total.textContent = quarterInput.dataset.quarter === "opexRows" ? docroiOpexTotalLabel(row) : docroiRevenueTotalLabel(row);
  if (capexInput) total.textContent = docroiCapexTotalLabel(row);
}

function docroiUpdateAllVisibleTotals() {
  document.querySelectorAll("[data-row-total]").forEach((total) => docroiUpdateRowTotalFromDom(total.closest("tr")));
}

renderQuarterTable = function renderQuarterTableWithLiveTotals(kind) {
  const isRevenue = kind === "revenueRows";
  const headers = isRevenue
    ? ["Canal", "Descripcion", "Unidad", ...quarters, "Total"]
    : ["Concepto", "Descripcion", "Coste unidad", "Unidades", ...quarters, "Total"];
  const rows = state[kind]
    .map((row, rowIndex) => {
      const left = isRevenue
        ? [
            tableInput(kind, rowIndex, "channel", row.channel, "text"),
            tableInput(kind, rowIndex, "description", row.description, "text"),
            tableInput(kind, rowIndex, "unit", row.unit, "text")
          ]
        : [
            tableInput(kind, rowIndex, "concept", row.concept, "text"),
            tableInput(kind, rowIndex, "description", row.description, "text"),
            tableInput(kind, rowIndex, "unitCost", row.unitCost),
            tableInput(kind, rowIndex, "units", row.units)
          ];
      const q = row.q.map((value, qIndex) => `<td><input data-quarter="${kind}" data-row="${rowIndex}" data-q="${qIndex}" type="number" value="${displayValue(value)}"></td>`);
      const total = kind === "opexRows" ? money(sum(row.q || [])) : docroiIsMoneyUnit(row.unit) ? money(sum(row.q || [])) : num(sum(row.q || []));
      return `<tr>${left.map((item) => `<td>${item}</td>`).join("")}${q.join("")}<td><strong data-row-total>${total}</strong></td></tr>`;
    })
    .join("");
  return `<table class="editable-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="table-actions"><button class="ghost-action" type="button" data-add-row="${kind}">Anadir linea</button></div>`;
};

renderCapex = function renderCapexWithLiveTotals() {
  const rows = state.capexRows
    .map((row, rowIndex) => {
      const total = n(row.units) * n(row.unitInvestment);
      return `<tr><td>${tableInput("capexRows", rowIndex, "category", row.category, "text")}</td><td>${tableInput("capexRows", rowIndex, "concept", row.concept, "text")}</td><td>${tableInput("capexRows", rowIndex, "unit", row.unit, "text")}</td><td>${tableInput("capexRows", rowIndex, "units", row.units)}</td><td>${tableInput("capexRows", rowIndex, "unitInvestment", row.unitInvestment)}</td><td><strong data-row-total>${money(total)}</strong></td></tr>`;
    })
    .join("");
  return `<table class="editable-table"><thead><tr><th>Categoria</th><th>Concepto</th><th>Unidad</th><th>Nº unidades</th><th>Inversion unidad</th><th>CAPEX</th></tr></thead><tbody>${rows}</tbody></table><div class="table-actions"><button class="ghost-action" type="button" data-add-row="capexRows">Anadir inversion</button></div>`;
};

const docroiBindInputsBeforeTotals = bindInputs;
bindInputs = function bindInputsWithLiveTotals() {
  docroiBindInputsBeforeTotals();
  docroiUpdateAllVisibleTotals();
};

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.matches("[data-quarter], [data-table='capexRows'], [data-key='unit']")) {
    docroiUpdateRowTotalFromDom(target.closest("tr"));
  }
}, true);

renderCurrentStep();
renderLive();
renderReport();
