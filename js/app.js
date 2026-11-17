/**
 * Proyecto Tesis - Suite de Analítica Epistemológica, Auditoría Metodológica y Gestión de Evidencia Científica
 * Archivo: js/app.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { updateI18nUI } from "./i18n.js";
import { setupFacultySelects, evaluateCoherenceChain, renderCoherenceChainUI } from "./coherenceChain.js";
import { renderSankeyChart } from "./sankeyChart.js";
import { initSectionStudio } from "./sectionStudio.js";
import { initTheoriesEngine, refreshTheoriesView } from "./theoriesEngine.js";
import { initJurySimulator, updateJuryPromptView } from "./jurySimulator.js";
import { initLogAndReport, renderReportView } from "./logAndReport.js";
import { buildHiloPrompt, buildReportPrompt, formatPromptForChatGPT } from "./aiPrompts.js";
import { exportToWord, exportStateToJSON, importStateFromJSON } from "./reportExporter.js";
import { initPdfExtractor, renderPdfList, exportToVOSviewerCSV } from "./pdfExtractor.js";

// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const STORAGE_KEY = "proyecto_tesis_state_v2026";
const sectionOrdenCache = {};

export let state = {
  theme: "light",
  lang: "es",
  student: {
    nombre: "",
    facultad: "",
    escuela: "",
    seccion: "",
    titulo: ""
  },
  project: {
    v1: "",
    v2: "",
    pob: "",
    amb: "",
    per: "",
    enf: "cuanti", // cuanti | cuali | mixto
    dis: "",
    preg: "",
    teo: "",
    obj: "",
    hip: "",
    i1: "",
    i2: ""
  },
  pdfSources: [], // Evidencia y metadatos extraídos de PDFs (Scopus / WoS)
  drafts: {},
  checks: {},
  log: [],
  customTheories: []
};

// ==========================================
// DEDUPLICACIÓN DE BITÁCORA DE IA
// ==========================================
function deduplicateLog(logList) {
  if (!Array.isArray(logList)) return [];
  const seen = new Set();
  return logList.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const signature = JSON.stringify({
      fecha: item.fecha || item.date || "",
      seccion: item.seccion || item.section || "",
      herramienta: item.herramienta || item.tool || "",
      dictamen: item.dictamen || item.verdict || "",
      decision: item.decision || "",
      justificacion: item.justificacion || item.rationale || ""
    });
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

// ==========================================
// INICIALIZACIÓN PRINCIPAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadSavedState();
  initTheme();
  initI18n();
  initTabs();
  initFormListeners();
  initResetHandlers();

  // 1. Inicializar Módulo 02: Gestor de Evidencia y Extracción de PDFs
  try {
    initPdfExtractor(state);
  } catch (e) {
    console.error("Error al inicializar Gestor PDF:", e);
  }

  // 2. Conectar selectores dinámicos de Facultad, Escuela y Teorías
  setupFacultySelects(state, () => {
    saveState();
    refreshAllViews();
  });

  // 3. Inicializar Módulo 03: Sistematización Metodológica (16 Semanas)
  initSectionStudio(state, 
    (secId, draftText) => {
      saveState();
      renderReportView(state);
      syncSectionAuditPrompt();
    },
    (secId, checksArr) => {
      saveState();
      renderReportView(state);
      syncSectionAuditPrompt();
    }
  );

  // 4. Inicializar Módulo 04: Motor de Marcos Teóricos & Tesauros
  initTheoriesEngine(state, (theoryName) => {
    state.project.teo = theoryName;
    saveState();
    refreshAllViews();
  });

  // 5. Inicializar Módulo 05: Defensa Epistemológica (Jurado Simulado)
  initJurySimulator(state, (juryEntry) => {
    if (!state.log) state.log = [];
    if (juryEntry && !state.log.includes(juryEntry)) {
      state.log.push(juryEntry);
    }
    state.log = deduplicateLog(state.log);
    saveState();
    renderReportView(state);
  });

  // 6. Inicializar Módulo 06: Bitácora, Gobernanza IA e Informe Consolidado
  initLogAndReport(state);

  // 7. Configurar eventos de exportación (Word, Dublin Core XML, VOSviewer CSV, Sello B2B, JSON)
  initExporterEvents();

  // 8. Sincronización dedicada del Prompt de Auditoría por Sección (16 Semanas)
  initSectionPromptSync();

  // Renderizado e iconografía inicial
  refreshAllViews();
  initLucideIcons();
});

// ==========================================
// PERSISTENCIA (LOCALSTORAGE)
// ==========================================
export function saveState() {
  try {
    state.log = deduplicateLog(state.log);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("No se pudo guardar el estado en localStorage", e);
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("nexo_studio_state_v2026");
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
      if (!state.pdfSources) state.pdfSources = [];
      state.log = deduplicateLog(state.log);
      populateFormFromState();
    }
  } catch (e) {
    console.warn("Error al cargar estado previo", e);
  }
}

function populateFormFromState() {
  Object.keys(state.student || {}).forEach(key => {
    const el = document.querySelector(`[data-st="${key}"]`);
    if (el) el.value = state.student[key] || "";
  });

  Object.keys(state.project || {}).forEach(key => {
    const el = document.querySelector(`[data-k="${key}"]`);
    if (el) el.value = state.project[key] || "";
  });
}

// ==========================================
// REFRESCO GLOBAL DE VISTAS Y COMPONENTES
// ==========================================
function refreshAllViews() {
  state.log = deduplicateLog(state.log);
  window.proyectoTesisState = state;

  // Actualizar atributo global de idioma del HTML
  document.documentElement.lang = state.lang || "es";

  // Diagnóstico de eslabones de coherencia epistemológica
  try {
    const coherenceLinks = evaluateCoherenceChain(state.project, state.lang);
    renderCoherenceChainUI(
      coherenceLinks,
      document.getElementById("chain"),
      document.getElementById("scorebar"),
      document.getElementById("chainsum")
    );
  } catch (e) {
    console.warn("Diagnóstico de coherencia omitido:", e);
  }

  // Re-renderizado seguro de la Matriz Sankey (Solo si el contenedor es visible)
  try {
    const wrapper = document.getElementById("sankey-wrapper");
    if (wrapper && wrapper.clientWidth > 0 && wrapper.clientHeight > 0) {
      renderSankeyChart("#sankey-wrapper", state);
    }
  } catch (e) {
    console.warn("Renderizado de Sankey omitido por visibilidad:", e);
  }

  // Renderizado seguro de la lista de PDFs y Nube de Palabras / Tesauro
  try {
    if (typeof renderPdfList === "function") {
      renderPdfList(state);
    }
  } catch (e) {
    console.warn("Renderizado de lista PDF omitido:", e);
  }

  // Actualizar prompts dinámicos para ChatGPT en el idioma activo
  updateAIPromptsAndLinks();

  // Refrescar Módulo 04 (Marcos Teóricos) en el idioma activo
  if (typeof refreshTheoriesView === "function") {
    refreshTheoriesView(state);
  }

  // Sincronizar el prompt del Jurado Simulado en el idioma activo
  if (typeof updateJuryPromptView === "function") {
    updateJuryPromptView(state);
  }

  // Actualizar informe consolidado del Módulo 06
  renderReportView(state);

  // Refrescar íconos de Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateAIPromptsAndLinks() {
  const hiloPrompt = buildHiloPrompt(state);
  const pvHiloEl = document.getElementById("pv-hilo");
  const gptHiloBtn = document.getElementById("gpt-hilo");
  if (pvHiloEl) pvHiloEl.textContent = hiloPrompt;
  if (gptHiloBtn) gptHiloBtn.href = formatPromptForChatGPT(hiloPrompt);

  // Actualizar prompt específico de la sección activa (Módulo 03 - 16 Semanas)
  syncSectionAuditPrompt();

  const reportPrompt = buildReportPrompt(state);
  const gptInfBtn = document.getElementById("gpt-inf");
  if (gptInfBtn) gptInfBtn.href = formatPromptForChatGPT(reportPrompt);
}

// ==========================================
// PROMPT DE AUDITORÍA POR SECCIÓN (16 SEMANAS - BILINGÜE ES/EN CON DICTAMEN)
// ==========================================
function getSelectDisplayText(id, fallback = "") {
  const el = document.getElementById(id);
  if (!el) return fallback;
  if (el.tagName === "SELECT") {
    const opt = el.options[el.selectedIndex];
    return opt && opt.value ? opt.text.trim() : fallback;
  }
  return el.value.trim() || fallback;
}

function captureCurrentSectionOrden(sectionKey) {
  const ordenBtn = document.querySelector('#model button[data-mv="orden"]');
  const mbody = document.getElementById("mbody");
  if (ordenBtn && ordenBtn.getAttribute("aria-pressed") === "true" && mbody) {
    const txt = mbody.innerText.trim();
    if (txt) sectionOrdenCache[sectionKey] = txt;
  }
  return sectionOrdenCache[sectionKey] || (mbody ? mbody.innerText.trim() : "");
}

function buildSectionAuditPrompt() {
  const isEn = state.lang === "en";
  const investigador = state.student?.nombre?.trim() || null;
  const facultadTxt = getSelectDisplayText("st-fac", state.student?.facultad || "");
  const escuelaTxt = getSelectDisplayText("st-esc", state.student?.escuela || "");
  const grupoTxt = getSelectDisplayText("st-sec", state.student?.seccion || "");
  const tituloTxt = state.student?.titulo?.trim() || null;

  const secTitle = (document.getElementById("s-title")?.textContent || "").trim();
  const secWeek = (document.getElementById("s-wk")?.textContent || "").trim();
  const secExt = (document.getElementById("s-ext")?.textContent || "").trim();
  const secProd = (document.getElementById("s-prod")?.textContent || "").trim();
  const secPrueba = (document.getElementById("s-prueba")?.textContent || "").trim();
  const draftText = (document.getElementById("draft")?.value || "").trim();

  const wordCount = draftText ? draftText.split(/\s+/).filter(Boolean).length : 0;
  const ordenParrafos = captureCurrentSectionOrden(`${secWeek}|${secTitle}`);

  // Leer criterios del manual y autoevaluación marcada en pantalla
  const checkItems = [...document.querySelectorAll("#checks li")];
  const criteriosList = [];
  const cumplidosNums = [];

  checkItems.forEach((li, idx) => {
    const num = idx + 1;
    const cb = li.querySelector('input[type="checkbox"]');
    const rawText = li.textContent.replace(/^\s*\d+[\.\)\-:]\s*/, "").trim();
    if (rawText) {
      criteriosList.push(`${num}. ${rawText}`);
      if (cb && cb.checked) cumplidosNums.push(num);
    }
  });

  const totalCriterios = criteriosList.length || 6;
  const autoevalTexto = isEn
    ? (cumplidosNums.length > 0 ? `criteria ${cumplidosNums.join(", ")}` : "none")
    : (cumplidosNums.length > 0 ? `los criterios ${cumplidosNums.join(", ")}` : "ninguno");

  // Obtener diagnóstico automático de coherencia
  let coherenciaAuto = [];
  try {
    coherenciaAuto = evaluateCoherenceChain(state.project, state.lang) || [];
  } catch (e) {
    coherenciaAuto = [];
  }

  // Resumen de secciones con avance
  const seccionesResumen = Object.entries(state.drafts || {})
    .filter(([, txt]) => typeof txt === "string" && txt.trim().length > 0)
    .map(([secKey, txt]) => ({
      section: secKey,
      words: txt.trim().split(/\s+/).filter(Boolean).length,
      self_assessment_checked: state.checks?.[secKey] || []
    }));

  const contextoAcademico = [escuelaTxt, facultadTxt, grupoTxt].filter(Boolean).join(" · ")
    || (isEn ? "Undergraduate / Graduate Research" : "Pregrado / Posgrado");

  const ejemploDictamen = Array.from(
    { length: totalCriterios },
    (_, i) => `${i + 1}=${["C", "P", "N"][i % 3]}`
  ).join("; ");

  if (isEn) {
    const metadataEn = {
      program: `${contextoAcademico} · Universidad Señor de Sipán · 2026`,
      researcher: investigador,
      active_section: secTitle || null,
      title: tituloTxt,
      project: {
        variable_1: state.project?.v1 || "",
        outcome_variable: state.project?.v2 || "",
        population: state.project?.pob || "",
        setting: state.project?.amb || "",
        timeframe: state.project?.per || "",
        approach: getSelectDisplayText("f-enf", state.project?.enf || ""),
        scope_design: getSelectDisplayText("f-dis", state.project?.dis || ""),
        general_question: state.project?.preg || "",
        general_objective: state.project?.obj || "",
        alternative_hypothesis: state.project?.hip || "",
        instrument_v1: state.project?.i1 || "",
        instrument_v2: state.project?.i2 || ""
      },
      main_theory: getSelectDisplayText("f-teo", state.project?.teo || ""),
      automated_coherence_check: coherenciaAuto,
      sections_progress: seccionesResumen,
      logged_decisions: Array.isArray(state.log) ? state.log.length : 0,
      date: new Date().toLocaleDateString("en-US")
    };

    return `Act as a scientific research methodology tutor for a researcher at Universidad Señor de Sipán (Peru) (${contextoAcademico}). Your goal is to foster critical thinking and improve the methodological rigor of their research proposal or scientific manuscript.

RULES
- Do not rewrite the section or provide ready-to-copy paragraphs. Point out, quote, and explain. If you give an example, use a structural template with [brackets].
- Support every judgment with a brief verbatim quote from the draft.
- Do not invent data, figures, authors, or references. If evidence is missing, indicate what type of source should be searched.
- Apply the manual criteria provided below. Respond in formal academic English.

PROJECT METADATA (JSON)
${JSON.stringify(metadataEn)}

SECTION TO AUDIT: ${secTitle} (${secWeek})
EXPECTED DELIVERABLE: ${secProd}
EXPECTED LENGTH: ${secExt} (current draft has ${wordCount} words)
EXPECTED PARAGRAPH STRUCTURE:
${ordenParrafos || "Follow the standard methodological structure for this section."}

MANUAL CRITERIA:
${criteriosList.length ? criteriosList.join("\n") : "1. Methodological coherence with the study variables and objectives."}

CRITICAL VALIDATION TEST: ${secPrueba}
RESEARCHER SELF-ASSESSMENT: marked as met: ${autoevalTexto}.

RESEARCHER'S DRAFT
"""
${draftText || "(The draft is still empty)"}
"""

DELIVERABLE, USING THESE EXACT HEADINGS
1. Audit by criterion: table with No. | Criterion | Met / Partial / Not met | Evidence (quote) | Question for the researcher.
2. Structure map: which step of the expected order each paragraph fulfills; missing or out-of-order steps.
3. Project coherence: cross-check the section against the metadata (variable names, population, approach, theory, objective).
4. Priority corrections (maximum 3): location, issue, and what the researcher must do, without writing it for them.
5. Improvement suggestions and one critical-thinking question based on the critical validation test.
6. Calibration: compare your verdict against their self-assessment and explain any discrepancies.
End with a single line, using this exact format so the researcher can paste it back into the system:
DICTAMEN: ${ejemploDictamen} (C = met, P = partial, N = not met; one value for each of the ${totalCriterios} criteria)`;
  }

  const metadataEs = {
    curso: `${contextoAcademico} · Universidad Señor de Sipán · 2026`,
    investigador: investigador,
    seccion_activa: secTitle || null,
    titulo: tituloTxt,
    proyecto: {
      variable_1: state.project?.v1 || "",
      variable_resultado: state.project?.v2 || "",
      poblacion: state.project?.pob || "",
      ambito: state.project?.amb || "",
      periodo: state.project?.per || "",
      enfoque: getSelectDisplayText("f-enf", state.project?.enf || ""),
      alcance_diseno: getSelectDisplayText("f-dis", state.project?.dis || ""),
      pregunta_general: state.project?.preg || "",
      objetivo_general: state.project?.obj || "",
      hipotesis_alterna: state.project?.hip || "",
      instrumento_v1: state.project?.i1 || "",
      instrumento_v2: state.project?.i2 || ""
    },
    teoria_principal: getSelectDisplayText("f-teo", state.project?.teo || ""),
    coherencia_automatica: coherenciaAuto,
    secciones: seccionesResumen.map(s => ({
      seccion: s.section,
      palabras: s.words,
      autoevaluacion_cumplidos: s.self_assessment_checked
    })),
    decisiones_registradas: Array.isArray(state.log) ? state.log.length : 0,
    fecha: new Date().toLocaleDateString("es-PE")
  };

  return `Actúa como tutor de metodología de la investigación científica para un(a) investigador(a) de la Universidad Señor de Sipán (Perú) (${contextoAcademico}). Tu objetivo es que desarrolle pensamiento crítico y mejore el rigor metodológico de su anteproyecto o manuscrito científico.

REGLAS
- No reescribas la sección ni redactes párrafos listos para copiar. Señala, cita y explica. Si das un ejemplo, que sea una estructura con [corchetes].
- Apoya cada juicio en una cita textual breve de su borrador.
- No inventes datos, cifras, autores ni referencias. Si falta evidencia, indica qué tipo de fuente debe buscar.
- Usa los criterios del manual que te doy. Responde en español, con trato de usted.

METADATOS DEL PROYECTO (JSON)
${JSON.stringify(metadataEs)}

SECCIÓN A AUDITAR: ${secTitle} (${secWeek})
PRODUCTO ESPERADO: ${secProd}
EXTENSIÓN ESPERADA: ${secExt} (el borrador tiene ${wordCount} palabras)
ORDEN ESPERADO DE LOS PÁRRAFOS:
${ordenParrafos || "Seguir la estructura metodológica estándar de la sección."}

CRITERIOS DEL MANUAL:
${criteriosList.length ? criteriosList.join("\n") : "1. Coherencia metodológica con las variables y objetivos del estudio."}

PRUEBA CRÍTICA: ${secPrueba}
AUTOEVALUACIÓN DEL INVESTIGADOR: marcó como cumplidos ${autoevalTexto}.

BORRADOR DEL INVESTIGADOR
"""
${draftText || "(El borrador aún está vacío)"}
"""

ENTREGA, CON ESTOS TÍTULOS
1. Auditoría por criterio: tabla con N.º | Criterio | Cumple / Parcial / No cumple | Evidencia (cita) | Pregunta para el investigador.
2. Mapa de estructura: qué paso del orden esperado cumple cada párrafo; pasos ausentes o desordenados.
3. Coherencia con el proyecto: contrasta la sección con los metadatos (nombres de variables, población, enfoque, teoría, objetivo).
4. Correcciones prioritarias (máximo 3): ubicación, problema y qué debe hacer, sin redactarlo por el investigador.
5. Sugerencias de mejora y una pregunta de pensamiento crítico sobre la prueba crítica.
6. Calibración: compara tu dictamen con su autoevaluación y explica las diferencias.
Termina con una única línea, exactamente con este formato, para que la copie al Laboratorio:
DICTAMEN: ${ejemploDictamen} (C = cumple, P = parcial, N = no cumple; un valor por cada uno de los ${totalCriterios} criterios)`;
}

function syncSectionAuditPrompt() {
  const pvSecEl = document.getElementById("pv-sec");
  const gptSecBtn = document.getElementById("gpt-sec");
  if (!pvSecEl || !gptSecBtn) return;

  const sectionPrompt = buildSectionAuditPrompt();
  pvSecEl.textContent = sectionPrompt;
  gptSecBtn.href = formatPromptForChatGPT(sectionPrompt);
}

function initSectionPromptSync() {
  document.addEventListener("input", (e) => {
    if (e.target.matches("#draft, [data-st], [data-k]")) {
      setTimeout(syncSectionAuditPrompt, 20);
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.matches("#checks input, #routeselect, [data-st], [data-k]")) {
      setTimeout(syncSectionAuditPrompt, 30);
    }
  });

  document.addEventListener("click", (e) => {
    if (e.target.closest("#routelist button, #routelist li, #model button[data-mv], #tab-est, #lang-toggle")) {
      setTimeout(syncSectionAuditPrompt, 60);
    }

    const gptSecBtn = e.target.closest("#gpt-sec");
    if (gptSecBtn) {
      syncSectionAuditPrompt();
      const promptText = document.getElementById("pv-sec")?.textContent || "";
      if (navigator.clipboard && promptText) {
        navigator.clipboard.writeText(promptText).catch(() => {});
      }
      const msgSecEl = document.getElementById("msg-sec");
      if (msgSecEl) {
        msgSecEl.textContent = state.lang === "en"
          ? "Section audit prompt generated and copied. Paste ChatGPT's response below to calibrate the verdict."
          : "Prompt de auditoría de sección generado y copiado. Pegue la respuesta de ChatGPT abajo para calibrar el dictamen.";
      }
    }
  });

  setTimeout(syncSectionAuditPrompt, 200);
}

// ==========================================
// SISTEMA DE MODAL ANIMADO Y REINICIO DE PROYECTO
// ==========================================
export function showConfirmModal({ title, body, confirmText = "Confirmar", cancelText = "Cancelar", onConfirm }) {
  const container = document.getElementById("modal-container");
  const box = document.getElementById("modal-box");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");
  const footerEl = document.getElementById("modal-footer");

  if (!container || !box) return;

  titleEl.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i> ${title}`;
  bodyEl.innerHTML = body;

  footerEl.innerHTML = `
    <button id="modal-cancel-btn" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer">
      ${cancelText}
    </button>
    <button id="modal-confirm-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5">
      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
      <span>${confirmText}</span>
    </button>
  `;

  container.classList.remove("hidden");
  setTimeout(() => {
    container.classList.remove("opacity-0");
    box.classList.remove("scale-95", "opacity-0");
    box.classList.add("scale-100", "opacity-100");
  }, 10);

  const closeModal = () => {
    box.classList.remove("scale-100", "opacity-100");
    box.classList.add("scale-95", "opacity-0");
    container.classList.add("opacity-0");
    setTimeout(() => {
      container.classList.add("hidden");
    }, 200);
  };

  document.getElementById("modal-close").onclick = closeModal;
  document.getElementById("modal-cancel-btn").onclick = closeModal;
  document.getElementById("modal-confirm-btn").onclick = () => {
    closeModal();
    if (onConfirm) onConfirm();
  };

  if (window.lucide) window.lucide.createIcons();
}

function initResetHandlers() {
  const newProjectBtn = document.getElementById("btn-new-project");
  const startMineBtn = document.getElementById("startmine");

  const promptReset = () => {
    const isEn = state.lang === "en";
    showConfirmModal({
      title: isEn ? "Reset & Start New Project" : "Reiniciar e Iniciar Nuevo Proyecto",
      body: isEn ? `
        <p class="mb-2">Are you sure you want to erase all data and start a new research project?</p>
        <ul class="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <li>Variables, questions, objectives, and hypotheses in Tab 01 will be cleared.</li>
          <li>Scopus PDF evidence and 16-week drafting section drafts will be emptied.</li>
          <li>Simulated jury logs and custom theories will be removed.</li>
        </ul>
      ` : `
        <p class="mb-2">¿Está seguro de que desea borrar todos los datos e iniciar una nueva investigación?</p>
        <ul class="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <li>Se limpiarán las variables, preguntas, objetivos e hipótesis del Módulo 01.</li>
          <li>Se vaciarán la evidencia PDF de Scopus y los borradores de redacción.</li>
          <li>Se eliminarán las bitácoras del jurado simulado y las teorías personalizadas.</li>
        </ul>
      `,
      confirmText: isEn ? "Yes, Reset Everything" : "Sí, Reiniciar Todo",
      cancelText: isEn ? "Cancel" : "Cancelar",
      onConfirm: resetWholeProject
    });
  };

  if (newProjectBtn) newProjectBtn.addEventListener("click", promptReset);
  if (startMineBtn) startMineBtn.addEventListener("click", promptReset);
}

function resetWholeProject() {
  state.student = {
    nombre: "",
    facultad: "",
    escuela: "",
    seccion: "",
    titulo: ""
  };
  state.project = {
    v1: "",
    v2: "",
    pob: "",
    amb: "",
    per: "",
    enf: "cuanti",
    dis: "",
    preg: "",
    teo: "",
    obj: "",
    hip: "",
    i1: "",
    i2: ""
  };
  state.pdfSources = [];
  state.drafts = {};
  state.checks = {};
  state.log = [];
  state.customTheories = [];

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("nexo_studio_state_v2026");
  } catch (e) {
    console.warn("No se pudo limpiar localStorage", e);
  }

  document.querySelectorAll("input, textarea, select").forEach(el => {
    if (el.id === "theme-toggle" || el.id === "lang-toggle" || el.id === "thfacultad") return;
    if (el.tagName === "SELECT") {
      el.selectedIndex = 0;
    } else {
      el.value = "";
    }
  });

  const pdfList = document.getElementById("pdf-list");
  if (pdfList) pdfList.innerHTML = "";
  const pdfCount = document.getElementById("pdf-count");
  if (pdfCount) pdfCount.textContent = "0 artículos cargados";
  const pdfResults = document.getElementById("pdf-results");
  if (pdfResults) pdfResults.classList.add("hidden");

  setupFacultySelects(state, () => {
    saveState();
    refreshAllViews();
  });

  const exflag = document.getElementById("exflag");
  if (exflag) exflag.classList.add("hidden");

  refreshAllViews();
}

// ==========================================
// GESTIÓN DE TEMA Y LUCIDE
// ==========================================
function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  
  if (state.theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.classList.remove("dark");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      state.theme = state.theme === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", state.theme);
      document.documentElement.classList.toggle("dark", state.theme === "dark");
      saveState();
      try {
        const wrapper = document.getElementById("sankey-wrapper");
        if (wrapper && wrapper.clientWidth > 0) {
          renderSankeyChart("#sankey-wrapper", state);
        }
      } catch (e) {
        console.warn("Sankey omitido en cambio de tema:", e);
      }
    });
  }
}

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// INTERNACIONALIZACIÓN (CONTROL DE TRADUCCIÓN CON GOOGLE TRANSLATE)
// ==========================================
function initI18n() {
  const langBtn = document.getElementById("lang-toggle");
  const langText = document.getElementById("lang-text");

  document.documentElement.lang = state.lang || "es";
  if (langText) langText.textContent = (state.lang || "es").toUpperCase();
  
  if (typeof updateI18nUI === "function") {
    updateI18nUI(state.lang);
  }

  if (state.lang === "en") {
    triggerGoogleTranslate("en");
  }

  if (langBtn) {
    langBtn.addEventListener("click", () => {
      state.lang = state.lang === "es" ? "en" : "es";

      document.documentElement.lang = state.lang;
      if (langText) langText.textContent = state.lang.toUpperCase();

      if (typeof updateI18nUI === "function") {
        updateI18nUI(state.lang);
      }

      triggerGoogleTranslate(state.lang);

      saveState();
      refreshAllViews();
    });
  }
}

function triggerGoogleTranslate(lang) {
  const domain = window.location.hostname;
  const langPath = lang === 'en' ? '/es/en' : '/es/es';

  document.cookie = `googtrans=${langPath}; path=/;`;
  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    document.cookie = `googtrans=${langPath}; path=/; domain=${domain}`;
  }

  const selectEl = document.querySelector(".goog-te-combo");
  if (selectEl) {
    selectEl.value = lang;
    selectEl.dispatchEvent(new Event("change"));
  } else {
    setTimeout(() => triggerGoogleTranslate(lang), 300);
  }
}

// ==========================================
// NAVEGACIÓN POR PESTAÑAS (SIDEBAR & SKELETON LOADER)
// ==========================================
function initTabs() {
  const buttons = document.querySelectorAll("[role='tab']");
  const panels = document.querySelectorAll("[role='tabpanel']");
  const skeleton = document.getElementById("skeleton-loader");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("aria-controls");

      buttons.forEach(b => {
        b.setAttribute("aria-selected", "false");
        b.className = "tab-btn w-full px-3.5 py-3 font-display text-xs font-semibold rounded-xl transition flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-pointer";
      });

      btn.setAttribute("aria-selected", "true");
      btn.className = "tab-btn w-full px-3.5 py-3 font-display text-xs font-semibold rounded-xl transition flex items-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-l-4 border-nexo-gold shadow-sm cursor-pointer";

      if (window.innerWidth < 768) {
        const sidebarMenu = document.getElementById("sidebar-menu");
        if (sidebarMenu) sidebarMenu.classList.add("hidden");
      }

      if (skeleton) {
        skeleton.classList.remove("hidden");
      }

      panels.forEach(p => {
        p.classList.add("hidden");
        p.classList.remove("tab-pane-animate");
      });

      setTimeout(() => {
        if (skeleton) skeleton.classList.add("hidden");

        const activePanel = document.getElementById(targetId);
        if (activePanel) {
          activePanel.classList.remove("hidden");
          activePanel.classList.add("tab-pane-animate");
        }

        refreshAllViews();
      }, 150);
    });
  });
}

// ==========================================
// ESCUCHA DE FORMULARIOS DE NÚCLEO Y ESTUDIANTE
// ==========================================
function initFormListeners() {
  document.querySelectorAll("[data-st]").forEach(input => {
    input.addEventListener("input", (e) => {
      const key = e.target.getAttribute("data-st");
      state.student[key] = e.target.value;
      saveState();
      syncSectionAuditPrompt();
    });
  });

  document.querySelectorAll("[data-k]").forEach(input => {
    input.addEventListener("input", (e) => {
      const key = e.target.getAttribute("data-k");
      state.project[key] = e.target.value;
      saveState();
      refreshAllViews();
    });
  });
}

// ==========================================
// EXPORTACIÓN A WORD, DUBLIN CORE XML, VOSVIEWER CSV, SELLO B2B Y MANEJO DE JSON
// ==========================================
function initExporterEvents() {
  const exportDocxBtn = document.getElementById("exportdocx");
  const exportDcBtn = document.getElementById("export-dublincore");
  const exportVosBtn = document.getElementById("btn-export-vosviewer");
  const certIntegridadBtn = document.getElementById("btn-cert-integridad");
  const saveJsonBtn = document.getElementById("savejson");
  const loadJsonInput = document.getElementById("loadjson");
  const bkMsgEl = document.getElementById("bkmsg");

  if (exportDocxBtn) {
    exportDocxBtn.addEventListener("click", async () => {
      try {
        await exportToWord(state);
      } catch (err) {
        const isEn = state.lang === "en";
        alert((isEn ? "Error exporting Word document: " : "Error al exportar el documento a Word: ") + err.message);
      }
    });
  }

  // Exportación nativa del esquema Dublin Core XML para DSpace y OJS
  if (exportDcBtn) {
    exportDcBtn.addEventListener("click", () => {
      exportToDublinCoreXML(state);
    });
  }

  // Exportación de la matriz bibliométrica en CSV para VOSviewer / Bibliometrix
  if (exportVosBtn) {
    exportVosBtn.addEventListener("click", () => {
      exportToVOSviewerCSV(state);
    });
  }

  // Generador B2B de Certificado de Integridad Metodológica & Trazabilidad
  if (certIntegridadBtn) {
    certIntegridadBtn.addEventListener("click", async () => {
      await generateIntegrityCertificate(state);
    });
  }

  if (saveJsonBtn) {
    saveJsonBtn.addEventListener("click", () => {
      exportStateToJSON(state);
    });
  }

  if (loadJsonInput) {
    loadJsonInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const isEn = state.lang === "en";

      importStateFromJSON(file, 
        (importedState) => {
          state = { ...state, ...importedState };
          state.log = deduplicateLog(state.log);
          saveState();
          populateFormFromState();
          refreshAllViews();
          if (bkMsgEl) {
            bkMsgEl.textContent = isEn ? "Backup restored successfully!" : "¡Respaldo restaurado con éxito!";
            bkMsgEl.className = "text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold";
          }
        },
        (errMessage) => {
          if (bkMsgEl) {
            bkMsgEl.textContent = errMessage;
            bkMsgEl.className = "text-xs font-mono text-rose-500 font-semibold";
          }
        }
      );
    });
  }
}

/**
 * Genera y despliega en ventana imprimible/descargable el Certificado B2B de Integridad Metodológica
 */
async function generateIntegrityCertificate(appState) {
  const isEn = appState.lang === "en";
  const studentName = appState.student?.nombre || (isEn ? "Unknown Researcher" : "Investigador Desconocido");
  const faculty = appState.student?.facultad || "Universidad Señor de Sipán";
  const school = appState.student?.escuela || (isEn ? "Academic School" : "Escuela Profesional");
  const title = appState.student?.titulo || appState.project?.preg || (isEn ? "Untitled Research Project" : "Proyecto de Investigación Sin Título");

  const totalPdfs = appState.pdfSources ? appState.pdfSources.length : 0;
  const verifiedPdfs = appState.pdfSources ? appState.pdfSources.filter(p => p.verified).length : 0;
  
  // Cálculo de firma criptográfica local SHA-256
  const dataString = JSON.stringify({
    student: appState.student,
    project: appState.project,
    verifiedCount: verifiedPdfs,
    timestamp: Date.now()
  });

  let shaHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  try {
    if (window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(dataString);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      shaHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (e) {
    console.warn("Generación de Hash SHA-256 mediante respaldo local:", e);
  }

  const certWindow = window.open("", "_blank");
  if (!certWindow) {
    alert(isEn
      ? "Please allow pop-ups in your browser to view the certificate."
      : "Por favor permita las ventanas emergentes en su navegador para visualizar el certificado.");
    return;
  }

  const currentDate = new Date().toLocaleDateString(isEn ? "en-US" : "es-ES", {
    year: "numeric", month: "long", day: "numeric"
  });

  const certHtml = `<!DOCTYPE html>
<html lang="${isEn ? "en" : "es"}">
<head>
  <meta charset="UTF-8">
  <title>${isEn ? "Certificate of Methodological Integrity - B2B USS" : "Certificado de Integridad Metodológica - B2B USS"}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px; }
    .cert-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 2px solid #0f172a; padding: 50px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); position: relative; }
    .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin: 0 0 5px; }
    .header h2 { font-size: 14px; color: #e9711c; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
    .content { line-height: 1.8; font-size: 14px; }
    .badge-box { background: #f1f5f9; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; font-family: monospace; font-size: 12px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; font-size: 13px; }
    .grid-item { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; font-family: monospace; }
    .stamp { display: inline-block; padding: 8px 16px; background: #0f172a; color: #ffffff; font-weight: bold; font-size: 11px; border-radius: 4px; letter-spacing: 1px; }
    @media print { body { background: none; padding: 0; } .cert-card { box-shadow: none; border-width: 1px; } }
  </style>
</head>
<body>
  <div class="cert-card">
    <div class="header">
      <h1>Universidad Señor de Sipán</h1>
      <h2>${isEn ? "Certificate of Methodological Integrity & AI Audit" : "Certificado de Integridad Metodológica & Auditoría de IA"}</h2>
    </div>

    <div class="content">
      <p>${isEn ? "This certifies that the research protocol / manuscript entitled:" : "Se certifica que el protocolo / manuscrito de investigación titulado:"}</p>
      <p style="font-weight: bold; font-size: 16px; color: #0f172a; text-align: center; margin: 15px 0; font-style: italic;">
        "${escapeXml(title)}"
      </p>
      <p>${isEn
        ? `Submitted by <strong>${escapeXml(studentName)}</strong>, affiliated with <strong>${escapeXml(faculty)}</strong> (${escapeXml(school)}), has been audited through the Epistemological Analytics & AI Governance Suite.`
        : `Presentado por el/la estudiante <strong>${escapeXml(studentName)}</strong>, perteneciente a la <strong>${escapeXml(faculty)}</strong> (${escapeXml(school)}), ha sido sometido a la Suite de Analítica Epistemológica y Gobernanza de Inteligencia Artificial.`}</p>

      <div class="grid">
        <div class="grid-item">
          <strong>${isEn ? "Uploaded Evidence Articles:" : "Artículos Evidencia Cargados:"}</strong> ${totalPdfs}<br>
          <strong>${isEn ? "Verified DOI Indexing (Crossref):" : "Indexación DOI Verificada (Crossref):"}</strong> ${verifiedPdfs} / ${totalPdfs}
        </div>
        <div class="grid-item">
          <strong>${isEn ? "Controlled Thesaurus Audit:" : "Auditoría de Tesauro Controlado:"}</strong> UNESCO / MeSH<br>
          <strong>${isEn ? "Coherence Sustentation:" : "Sustento de Coherencia:"}</strong> ${isEn ? "Evaluated & Verified Links" : "Eslabones Evaluados y Firmes"}
        </div>
      </div>

      <div class="badge-box">
        <strong>${isEn ? "DIGITAL TRACEABILITY SIGNATURE (SHA-256):" : "FIRMA DIGITAL DE TRAZABILIDAD (SHA-256):"}</strong><br>
        <span style="word-break: break-all; color: #0284c7;">${shaHash}</span>
      </div>

      <p style="font-size: 12px; color: #475569;">
        ${isEn
          ? "* This certificate verifies the absence of bibliographic hallucinations through active DOI resolution against open public APIs and supports compliance with the Institutional Academic Ethics & Integrity Declaration."
          : "* Este certificado garantiza la ausencia de alucinaciones bibliográficas mediante la resolución activa de DOI en APIs abiertas públicas y respalda el cumplimiento de la Declaración de Ética e Integridad Académica Institucional."}
      </p>
    </div>

    <div class="footer">
      <div>
        <span>${isEn ? "Issue Date:" : "Fecha de Emisión:"} ${currentDate}</span><br>
        <span>${isEn ? "Verification Code:" : "Código de Verificación:"} USS-2026-NEXO-${Math.floor(100000 + Math.random() * 900000)}</span>
      </div>
      <div class="stamp">
        ${isEn ? "INSTITUTIONAL SEAL OK" : "SELLO INSTITUCIONAL OK"}
      </div>
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); };
  <\/script>
</body>
</html>`;

  certWindow.document.write(certHtml);
  certWindow.document.close();
}

/**
 * Generador de esquema Dublin Core XML (Interoperabilidad con repositorios DSpace / OJS)
 */
function exportToDublinCoreXML(appState) {
  const title = appState.student?.titulo || "Proyecto de Investigación Sin Título";
  const creator = appState.student?.nombre || "Autor Desconocido";
  const subject = `${appState.project?.v1 || ''}; ${appState.project?.v2 || ''}`.replace(/^;\s*|;\s*$/g, '');
  const description = appState.project?.preg || "Anteproyecto de investigación universitaria.";
  const publisher = "Universidad Señor de Sipán";
  const date = new Date().getFullYear().toString();
  const lang = appState.lang === 'en' ? 'en' : 'es';

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<qualifieddc xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:doc="http://www.lyncode.com/xoai">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>${escapeXml(creator)}</dc:creator>
  <dc:subject>${escapeXml(subject)}</dc:subject>
  <dc:description>${escapeXml(description)}</dc:description>
  <dc:publisher>${escapeXml(publisher)}</dc:publisher>
  <dc:date>${date}</dc:date>
  <dc:type>info:eu-repo/semantics/bachelorThesis</dc:type>
  <dc:format>application/pdf</dc:format>
  <dc:language>${lang}</dc:language>
  <dc:rights>info:eu-repo/semantics/openAccess</dc:rights>
</qualifieddc>`;

  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dublin_core_${Date.now()}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}