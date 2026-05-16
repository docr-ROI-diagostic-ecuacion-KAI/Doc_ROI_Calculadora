function docroiIsMoneyUnit(unit) {
  const normalized = String(unit || "").trim().toLowerCase();
  return normalized === "eur" || normalized === "euro" || normalized === "euros" || normalized === "€";
}

function docroiRowTotalLabel(kind, row) {
  const value = sum(row.q || []);
  if (kind === "opexRows") return money(value);
  return docroiIsMoneyUnit(row.unit) ? money(value) : num(value);
}

function docroiUpdateQuarterRowTotal(kind, rowIndex) {
  const row = state[kind]?.[rowIndex];
  if (!row) return;
  const input = document.querySelector(`[data-quarter="${kind}"][data-row="${rowIndex}"]`);
  const total = input?.closest("tr")?.querySelector("[data-row-total]");
  if (total) total.textContent = docroiRowTotalLabel(kind, row);
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
      return `<tr>${left.map((item) => `<td>${item}</td>`).join("")}${q.join("")}<td><strong data-row-total>${docroiRowTotalLabel(kind, row)}</strong></td></tr>`;
    })
    .join("");
  return `<table class="editable-table"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table><div class="table-actions"><button class="ghost-action" type="button" data-add-row="${kind}">Anadir linea</button></div>`;
};

const docroiBindInputsBeforeTotals = bindInputs;
bindInputs = function bindInputsWithLiveTotals() {
  docroiBindInputsBeforeTotals();
  document.querySelectorAll("[data-quarter]").forEach((element) => {
    element.addEventListener("input", () => {
      docroiUpdateQuarterRowTotal(element.dataset.quarter, Number(element.dataset.row));
    });
  });
  document.querySelectorAll("[data-table]").forEach((element) => {
    element.addEventListener("input", () => {
      if (element.dataset.key === "unit") docroiUpdateQuarterRowTotal(element.dataset.table, Number(element.dataset.row));
    });
  });
};
