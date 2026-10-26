/**
 * Laboratorio del Anteproyecto - Módulo Principal y Orquestador
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

// ==========================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const STORAGE_KEY = "nexo_studio_state_v2026";

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
  drafts: {},
  checks: {},
  log: [],
  customTheories: []
};

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

  // 1. Conectar selectores dinámicos de Facultad, Escuela y Teorías
  setupFacultySelects(state, () => {
    saveState();
    refreshAllViews();
  });

  // 2. Inicializar Pestaña 02: Estación de Redacción (16 Semanas)
  initSectionStudio(state, 
    (secId, draftText) => {
      saveState();
      renderReportView(state);
    },
    (secId, checksArr) => {
      saveState();
      renderReportView(state);
    }
  );

  // 3. Inicializar Pestaña 03: Motor de Marcos Teóricos
  initTheoriesEngine(state, (theoryName) => {
    state.project.teo = theoryName;
    saveState();
    refreshAllViews();
  });

  // 4. Inicializar Pestaña 04: Jurado Simulado
  initJurySimulator(state, (juryEntry) => {
    if (!state.log) state.log = [];
    state.log.push(juryEntry);
    saveState();
    renderReportView(state);
  });

  // 5. Inicializar Pestaña 05: Bitácora e Informe
  initLogAndReport(state);

  // 6. Configurar eventos de exportación y respaldo
  initExporterEvents();

  // Renderizado e iconografía inicial
  refreshAllViews();
  initLucideIcons();
});

// ==========================================
// PERSISTENCIA (LOCALSTORAGE)
// ==========================================
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("No se pudo guardar el estado en localStorage", e);
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = { ...state, ...parsed };
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
  window.nexoState = state;

  // Actualizar atributo global de idioma del HTML
  document.documentElement.lang = state.lang || "es";

  // Diagnóstico de eslabones de coherencia
  const coherenceLinks = evaluateCoherenceChain(state.project, state.lang);
  renderCoherenceChainUI(
    coherenceLinks,
    document.getElementById("chain"),
    document.getElementById("scorebar"),
    document.getElementById("chainsum")
  );

  // Re-renderizado seguro de la Matriz Sankey
  try {
    renderSankeyChart("#sankey-wrapper", state);
  } catch (e) {
    console.warn("Renderizado de Sankey omitido por visibilidad:", e);
  }

  // Actualizar prompts dinámicos para ChatGPT en el idioma activo
  updateAIPromptsAndLinks();

  // Refrescar Pestaña 03 (Marcos Teóricos) en el idioma activo
  if (typeof refreshTheoriesView === "function") {
    refreshTheoriesView(state);
  }

  // Sincronizar el prompt del Jurado Simulado en el idioma activo
  if (typeof updateJuryPromptView === "function") {
    updateJuryPromptView(state);
  }

  // Actualizar informe consolidado de la pestaña 05
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

  const reportPrompt = buildReportPrompt(state);
  const gptInfBtn = document.getElementById("gpt-inf");
  if (gptInfBtn) gptInfBtn.href = formatPromptForChatGPT(reportPrompt);
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
          <li>16-week drafting section drafts will be emptied.</li>
          <li>Simulated jury logs and custom theories will be removed.</li>
        </ul>
      ` : `
        <p class="mb-2">¿Está seguro de que desea borrar todos los datos e iniciar una nueva investigación?</p>
        <ul class="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
          <li>Se limpiarán las variables, preguntas, objetivos e hipótesis de la Pestaña 01.</li>
          <li>Se vaciarán los borradores de redacción de las 16 semanas.</li>
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
  state.drafts = {};
  state.checks = {};
  state.log = [];
  state.customTheories = [];

  try {
    localStorage.removeItem(STORAGE_KEY);
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
        renderSankeyChart("#sankey-wrapper", state);
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

  // Si el estado guardado es inglés, dispara la traducción al cargar la página
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

      // Dispara el selector del widget de Google Translate y gestiona cookies
      triggerGoogleTranslate(state.lang);

      saveState();
      refreshAllViews();
    });
  }
}

/**
 * Acciona la traducción mediante cookies e interrupción del widget de Google Translate
 */
function triggerGoogleTranslate(lang) {
  const domain = window.location.hostname;
  const langPath = lang === 'en' ? '/es/en' : '/es/es';

  // 1. Asignar la cookie oficial de Google Translate
  document.cookie = `googtrans=${langPath}; path=/;`;
  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    document.cookie = `googtrans=${langPath}; path=/; domain=${domain}`;
  }

  // 2. Disparar el evento change en el combo si ya está disponible en el DOM
  const selectEl = document.querySelector(".goog-te-combo");
  if (selectEl) {
    selectEl.value = lang;
    selectEl.dispatchEvent(new Event("change"));
  } else {
    // Si el widget aún se está cargando, reintenta en 300 ms
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

      // Actualizar estados visuales de los botones en el Sidebar
      buttons.forEach(b => {
        b.setAttribute("aria-selected", "false");
        b.className = "tab-btn w-full px-3.5 py-3 font-display text-xs font-semibold rounded-xl transition flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-pointer";
      });

      btn.setAttribute("aria-selected", "true");
      btn.className = "tab-btn w-full px-3.5 py-3 font-display text-xs font-semibold rounded-xl transition flex items-center gap-3 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-l-4 border-nexo-gold shadow-sm cursor-pointer";

      // Colapsar menú móvil automáticamente si se está en pantalla pequeña
      if (window.innerWidth < 768) {
        const sidebarMenu = document.getElementById("sidebar-menu");
        if (sidebarMenu) sidebarMenu.classList.add("hidden");
      }

      // Mostrar Skeleton Loader durante la transición
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
// EXPORTACIÓN A WORD Y MANEJO DE JSON
// ==========================================
function initExporterEvents() {
  const exportDocxBtn = document.getElementById("exportdocx");
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