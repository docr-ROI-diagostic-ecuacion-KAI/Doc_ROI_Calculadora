const docroiStepGuides = [
  {
    title: "Marco de decision",
    kicker: "Antes de calcular",
    lead: "El ROI no empieza en una formula: empieza en una decision que alguien debe defender.",
    cards: [
      ["Que se decide", "Invertir, optimizar, pausar o redisenar una iniciativa."],
      ["Que se compara", "Retorno esperado, coste atribuible y umbral financiero."],
      ["Clave CFO", "Una campana crea valor cuando el ROI supera la referencia financiera o WACC."]
    ],
    note: "Escribe el contexto como si lo fueras a explicar en comite: que escenario se evalua, que mercado toca y que hipotesis se quiere probar."
  },
  {
    title: "Audiencia, conversion y ARPU",
    kicker: "Del mercado al ingreso",
    lead: "Aqui se transforma una audiencia en clientes atribuibles y los clientes en ingresos estimados.",
    cards: [
      ["Secuencia", "Alcance, sesiones utiles, conversion, clientes y ARPU."],
      ["No confundas", "Actividad no es ingreso. Solo cuenta lo que conecta con una hipotesis de conversion."],
      ["Pregunta de clase", "Si alguien cuestiona la conversion, que benchmark, historico o evidencia mostrarias?"]
    ],
    note: "La logica que trabajamos en clase es sencilla: Ingresos estimados = clientes atribuibles x ARPU."
  },
  {
    title: "Ingresos atribuibles",
    kicker: "Recurrente vs incremental",
    lead: "El C-Level necesita distinguir el ingreso que protege del ingreso nuevo que demuestra la campana.",
    cards: [
      ["Recurrente", "Ingreso ya esperado que la iniciativa ayuda a proteger o sostener."],
      ["Incremental", "Venta nueva atribuible a audiencias, leads, recuperacion, upselling o personalizacion."],
      ["Trazabilidad", "Sin UTM, CRM, pedido, ERP o facturacion, el ingreso queda como hipotesis."]
    ],
    note: "No atribuyas a la campana ventas organicas que habrian ocurrido igualmente. La calidad del ROI depende de esta frontera."
  },
  {
    title: "OPEX de campana",
    kicker: "Coste operativo",
    lead: "El OPEX recoge el coste de ejecutar, mantener y sostener la campana durante el periodo.",
    cards: [
      ["Que entra", "Paid media, agencia, creatividad, contenido, CRM, herramientas, fees y operacion recurrente."],
      ["Como se lee", "Es el coste que el retorno debe recuperar antes de hablar de excedente."],
      ["Decision", "Si el ROI queda corto, revisa coste, conversion, ARPU o atribucion."]
    ],
    note: "En performance marketing, el OPEX se trata como coste a recuperar via ingresos atribuibles."
  },
  {
    title: "CAPEX e inversion inicial",
    kicker: "Activos y horizonte",
    lead: "CAPEX aparece cuando hay tecnologia, infraestructura o activos que habilitan el proyecto mas alla del periodo inmediato.",
    cards: [
      ["Que entra", "Software, hardware, integraciones, automatizaciones, infraestructura o desarrollo activable."],
      ["Criterio", "No todo coste es CAPEX. Si es gasto operativo de campana, normalmente es OPEX."],
      ["Lectura", "El CAPEX exige pensar en desembolso, amortizacion y horizonte temporal."]
    ],
    note: "Clasificar bien el coste evita que el ROI parezca mejor o peor de lo que realmente es."
  },
  {
    title: "LTV y valor de cartera",
    kicker: "Mas alla de la venta",
    lead: "El LTV mira cuanto valor puede generar un cliente durante su relacion con la empresa.",
    cards: [
      ["Variables", "Ticket medio, frecuencia de compra, vida media y margen."],
      ["Uso directivo", "Ayuda a decidir cuanto invertir en captacion, retencion y crecimiento."],
      ["Cuidado", "No es una promesa exacta: es una referencia para priorizar mejor."]
    ],
    note: "Cuando la satisfaccion y la recurrencia mejoran, el impacto no se queda en una venta: afecta al valor futuro de la cartera."
  },
  {
    title: "Customer Equity y KAI·ROI",
    kicker: "Capacidad y valor",
    lead: "KAI mide capacidad estructural; ROI y Customer Equity miden lectura financiera del escenario.",
    cards: [
      ["No mezclar", "KAI no descuenta automaticamente el dinero declarado."],
      ["Formula ejecutiva", "Customer Equity = ROI - WACC."],
      ["Base economica", "Retorno bruto = (I x R) + (E x Q). Si falta un dato, no se calcula."]
    ],
    note: "El objetivo es saber si la organizacion puede convertir decision, dato, cliente, oferta y productividad en valor repetible."
  },
  {
    title: "Informe ejecutivo",
    kicker: "Cierre",
    lead: "Ahora si tiene sentido ver el informe: ya hay contexto, hipotesis, costes, retorno y capacidades KAI.",
    cards: [
      ["Que mirar primero", "ROI, Customer Equity, retorno bruto, coste, payback y madurez KAI."],
      ["Decision", "Escalar, optimizar, pausar o redisenar."],
      ["Defensa", "Un buen informe explica que significa el numero, por que sale asi y que palanca lo mejora."]
    ],
    note: "El resultado final debe ayudar a defender una decision, no solo a decorar una pagina con indicadores."
  }
];

function docroiSetReportVisibility() {
  const report = document.getElementById("report");
  if (!report) return;
  report.style.display = currentStep === steps.length - 1 ? "block" : "none";
}

function docroiRenderGuidePanel() {
  const guide = docroiStepGuides[currentStep] || docroiStepGuides[0];
  const resultTitle = document.getElementById("resultTitle");
  const strip = document.getElementById("kpiStrip");
  const read = document.getElementById("executiveRead");
  const mini = document.querySelector(".mini-chart");
  if (!resultTitle || !strip || !read) return;
  resultTitle.textContent = guide.title;
  strip.innerHTML = guide.cards.map((card) => `<article class="learning-card"><span>${card[0]}</span><p>${card[1]}</p></article>`).join("");
  read.className = "executive-read learning-read";
  read.innerHTML = `<strong>${guide.kicker}</strong><p>${guide.lead}</p><small>${guide.note}</small>`;
  if (mini) mini.style.display = "none";
}

const docroiRenderLiveBase = renderLive;
renderLive = function renderLiveWithTrainingPanel() {
  if (currentStep !== steps.length - 1) {
    docroiRenderGuidePanel();
    docroiSetReportVisibility();
    return;
  }
  const mini = document.querySelector(".mini-chart");
  if (mini) mini.style.display = "block";
  docroiRenderLiveBase();
  docroiSetReportVisibility();
};

const docroiRenderReportBase = renderReport;
renderReport = function renderReportOnlyOnFinalStep() {
  docroiSetReportVisibility();
  if (currentStep !== steps.length - 1) return;
  docroiRenderReportBase();
};

const docroiRenderCurrentStepBase = renderCurrentStep;
renderCurrentStep = function renderCurrentStepWithTrainingPanel() {
  docroiRenderCurrentStepBase();
  docroiSetReportVisibility();
  renderLive();
  renderReport();
};

renderCurrentStep();
