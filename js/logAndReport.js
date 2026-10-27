/**
 * Proyecto Tesis - Bitácora de Gobernanza de IA, Informe Consolidado y Anexo 5
 * Archivo: js/logAndReport.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { SECTIONS_DATA } from "../data/sectionsData.js";
import { evaluateCoherenceChain } from "./coherenceChain.js";

/**
 * Inicializa los eventos del Módulo 06 y realiza el primer renderizado de vistas
 * @param {Object} state Estado global de la aplicación
 */
export function initLogAndReport(state) {
  const copyDeclBtn = document.getElementById("copydecl");

  if (copyDeclBtn) {
    copyDeclBtn.addEventListener("click", () => {
      const declText = generateAnexo5Text(state);
      navigator.clipboard.writeText(declText).then(() => {
        const msgEl = document.getElementById("declmsg");
        const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";
        if (msgEl) {
          msgEl.textContent = isEn ? "Annex 5 text copied to clipboard!" : "¡Texto del Anexo 5 copiado al portapapeles!";
          msgEl.className = "text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold";
          setTimeout(() => { msgEl.textContent = ""; }, 3000);
        }
      });
    });
  }

  renderReportView(state);
}

/**
 * Re-renderiza todos los componentes del Módulo 06 (Métricas, Mapa de calor, Plan, Bitácora y Anexo 5)
 * @param {Object} state 
 */
export function renderReportView(state) {
  renderReportStats(state);
  renderHeatmap(state);
  renderWorkPlan(state);
  renderAILogTable(state);
  renderAnexo5Draft(state);
}

/**
 * Renderiza el Mapa de Calor Metodológico (16 Semanas)
 */
export function renderHeatmap(state) {
  const container = document.getElementById("heatmap-container");
  if (!container) return;

  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";

  container.innerHTML = "";
  const drafts = state.drafts || {};

  SECTIONS_DATA.forEach(sec => {
    const text = drafts[sec.id] || "";
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    let statusClass = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    let statusLabel = isEn ? "Not started" : "Sin iniciar";

    if (words > 0) {
      const minW = sec.ext ? sec.ext[0] : 50;
      if (words >= minW) {
        statusClass = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
        statusLabel = isEn ? "Complete" : "Completo";
      } else {
        statusClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
        statusLabel = isEn ? "In progress" : "En proceso";
      }
    }

    const titleText = isEn && sec.title_en ? sec.title_en : sec.title;

    const cell = document.createElement("div");
    cell.className = `p-3 rounded-xl border flex flex-col justify-between transition shadow-sm ${statusClass} cursor-pointer hover:scale-105 transform duration-150`;
    cell.title = `${sec.code}: ${titleText} (${words} ${isEn ? 'words' : 'palabras'} - ${statusLabel})`;
    cell.innerHTML = `
      <div class="flex items-center justify-between gap-1">
        <span class="font-mono text-[10px] font-bold uppercase">${sec.code}</span>
        <span class="text-[9px] font-mono opacity-80">${words} w</span>
      </div>
      <span class="text-[11px] font-semibold truncate mt-1.5">${escapeHtml(titleText)}</span>
    `;

    // Al hacer clic en un cuadro del mapa de calor, ir a la Estación de Redacción
    cell.addEventListener("click", () => {
      const p2Tab = document.querySelector("[aria-controls='p-red']");
      if (p2Tab) p2Tab.click();
      const routeSelectEl = document.getElementById("routeselect");
      if (routeSelectEl) {
        routeSelectEl.value = sec.id;
        routeSelectEl.dispatchEvent(new Event("change"));
      }
    });

    container.appendChild(cell);
  });
}

/**
 * Renderiza las métricas estadísticas del proyecto
 */
export function renderReportStats(state) {
  const statsContainer = document.getElementById("stats");
  if (!statsContainer) return;

  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";

  const drafts = state.drafts || {};
  const logs = state.log || [];
  const project = state.project || {};
  const pdfSources = state.pdfSources || [];

  const completedSections = Object.keys(drafts).filter(k => drafts[k] && drafts[k].trim().length > 0).length;

  let totalWords = 0;
  Object.values(drafts).forEach(text => {
    if (text) {
      const words = text.trim().split(/\s+/).filter(w => w.length > 0);
      totalWords += words.length;
    }
  });

  const coherenceLinks = evaluateCoherenceChain(project, state.lang);
  const okLinksCount = coherenceLinks.filter(l => l.status === "ok").length;
  const decisionsCount = logs.filter(l => l.dec || l.dictamen).length;

  statsContainer.innerHTML = `
    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
      <span class="text-[10px] font-mono font-bold uppercase text-slate-400 block">${isEn ? 'Started Sections' : 'Secciones Iniciadas'}</span>
      <span class="text-2xl font-extrabold font-display text-slate-900 dark:text-white">${completedSections} / 16</span>
    </div>

    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
      <span class="text-[10px] font-mono font-bold uppercase text-slate-400 block">${isEn ? 'Scopus Evidence PDFs' : 'PDFs Evidencia Scopus'}</span>
      <span class="text-2xl font-extrabold font-display text-nexo-gold">${pdfSources.length}</span>
    </div>

    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
      <span class="text-[10px] font-mono font-bold uppercase text-slate-400 block">${isEn ? 'Total Drafted Words' : 'Total Palabras Redactadas'}</span>
      <span class="text-2xl font-extrabold font-display text-slate-900 dark:text-white">${totalWords.toLocaleString(isEn ? "en-US" : "es-PE")}</span>
    </div>

    <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
      <span class="text-[10px] font-mono font-bold uppercase text-slate-400 block">${isEn ? 'Epistemological Coherence' : 'Coherencia Epistemológica'}</span>
      <span class="text-2xl font-extrabold font-display text-emerald-600 dark:text-emerald-400">${okLinksCount} / 6</span>
    </div>
  `;
}

/**
 * Genera y renderiza el Plan de Trabajo Dinámico según faltantes
 */
export function renderWorkPlan(state) {
  const planContainer = document.getElementById("plan");
  if (!planContainer) return;

  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";

  const project = state.project || {};
  const drafts = state.drafts || {};
  const checks = state.checks || {};
  const coherenceLinks = evaluateCoherenceChain(project, state.lang);

  const pendingItems = [];

  coherenceLinks.forEach(link => {
    if (link.status !== "ok") {
      pendingItems.push({
        type: isEn ? "Methodological Coherence" : "Coherencia Epistemológica",
        detail: `[${link.title}] ${link.detail}`
      });
    }
  });

  SECTIONS_DATA.forEach(sec => {
    const draftText = drafts[sec.id] || "";
    const words = draftText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const titleText = isEn && sec.title_en ? sec.title_en : sec.title;

    if (!draftText) {
      pendingItems.push({
        type: `${isEn ? 'Section' : 'Sección'} ${sec.code} (${titleText})`,
        detail: isEn ? `Draft not started. Expected deliverable: ${sec.prod_en || sec.prod}` : `Borrador no iniciado. Producto esperado: ${sec.prod}`
      });
    } else if (sec.ext) {
      const [minW] = sec.ext;
      if (words < minW) {
        pendingItems.push({
          type: `${isEn ? 'Section' : 'Sección'} ${sec.code} (${titleText})`,
          detail: isEn ? `Insufficient length (${words} words of a minimum of ${minW}).` : `Extensión insuficiente (${words} palabras de un mínimo de ${minW}).`
        });
      }
    }

    const userChecks = checks[sec.id] || [];
    const missingChecksCount = sec.crit.length - userChecks.length;
    if (missingChecksCount > 0 && draftText) {
      pendingItems.push({
        type: `${isEn ? 'Section' : 'Sección'} ${sec.code} (${titleText})`,
        detail: isEn ? `Missing ${missingChecksCount} evaluation criteria.` : `Faltan cumplir ${missingChecksCount} criterio(s) de autoevaluación.`
      });
    }
  });

  planContainer.innerHTML = `
    <h3 class="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-3 flex items-center gap-2">
      <i data-lucide="list-checks" class="w-4 h-4 text-nexo-gold"></i> ${isEn ? 'Dynamic Work Plan (Redrafting Priorities)' : 'Plan de Trabajo Dinámico (Prioridades de Redacción)'}
    </h3>
  `;

  if (pendingItems.length === 0) {
    planContainer.innerHTML += `
      <div class="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        ${isEn ? 'Excellent work! No critical coherence issues or pending drafts detected.' : '¡Excelente trabajo! No se detectan inconsistencias críticas de coherencia ni borradores pendientes.'}
      </div>
    `;
    return;
  }

  const ul = document.createElement("ul");
  ul.className = "space-y-2 text-xs";

  pendingItems.slice(0, 8).forEach(item => {
    const li = document.createElement("li");
    li.className = "p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-2.5";
    li.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></span>
      <div>
        <strong class="text-slate-800 dark:text-slate-200 block">${escapeHtml(item.type)}</strong>
        <span class="text-slate-600 dark:text-slate-400 leading-normal">${escapeHtml(item.detail)}</span>
      </div>
    `;
    ul.appendChild(li);
  });

  planContainer.appendChild(ul);

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Renderiza la tabla de bitácora de interacciones con IA
 */
export function renderAILogTable(state) {
  const tbody = document.getElementById("logbody");
  const logCountEl = document.getElementById("logcount");
  if (!tbody) return;

  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";
  const logs = state.log || [];

  if (logCountEl) logCountEl.textContent = `${logs.length} ${isEn ? 'record(s)' : 'registro(s)'}`;

  tbody.innerHTML = "";

  if (logs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="p-6 text-center text-slate-400 italic">
          ${isEn ? 'No records in logbook yet. Interactions and audits with the AI Tutor will be listed here automatically.' : 'No hay registros en la bitácora aún. Las consultas y auditorías realizadas con el Tutor IA se listarán automáticamente aquí.'}
        </td>
      </tr>
    `;
    return;
  }

  logs.slice().reverse().forEach(entry => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition";
    const dateFormatted = entry.timestamp ? new Date(entry.timestamp).toLocaleString(isEn ? "en-US" : "es-PE", { dateStyle: "short", timeStyle: "short" }) : "—";

    tr.innerHTML = `
      <td class="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">${dateFormatted}</td>
      <td class="p-3 font-semibold text-slate-800 dark:text-slate-200">${escapeHtml(entry.sec || "—")}</td>
      <td class="p-3 text-slate-600 dark:text-slate-400">${escapeHtml(entry.tool || "ChatGPT")}</td>
      <td class="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title="${escapeHtml(entry.ai || '')}">${escapeHtml(entry.ai || "—")}</td>
      <td class="p-3">
        <span class="font-bold text-nexo-gold block">${escapeHtml(entry.dec || entry.dictamen || "Consulta")}</span>
        <span class="text-[11px] text-slate-500 block leading-tight">${escapeHtml(entry.why || "")}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Genera el texto formal del Anexo 5 (Declaración Jurada de Uso de IA)
 */
export function generateAnexo5Text(state) {
  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";
  const student = state.student || {};
  const logs = state.log || [];

  const toolsUsed = [...new Set(logs.map(l => l.tool || l.herramienta))].join("; ") || "ChatGPT (OpenAI)";
  const sectionsAudited = [...new Set(logs.map(l => l.sec || l.seccion))].join("; ") || "Secciones del Capítulo I y II";
  const accepted = logs.filter(l => l.dec && (l.dec.includes("Aceptar") || l.dec.includes("Accepted") || l.dec.includes("Registrad"))).length;
  const total = logs.length;
  const todayStr = new Date().toLocaleDateString(isEn ? "en-US" : "es-PE", { day: "2-digit", month: "long", year: "numeric" });

  if (isEn) {
    return `SWORN DECLARATION ON GENERATIVE ARTIFICIAL INTELLIGENCE USAGE (ANNEX 5)

I, ${student.nombre || "________________________________________"}, student of the Professional School of ${student.escuela || "____________________"} at Señor de Sipán University, declare under oath that:

1. I have used Generative Artificial Intelligence tools (${toolsUsed}) exclusively as tutoring, methodological review, and coherence audit support for drafting my research project entitled:
"${student.titulo || "________________________________________________________________________________________"}".

2. The AI tool did not write final paragraphs nor generate fictitious empirical data, findings, or bibliographic references. Its function was strictly limited to evaluating compliance with the methodological manual criteria for the sections: ${sectionsAudited}.

3. A total of ${total} audit interactions were conducted and recorded in the Proyecto Tesis suite logbook, of which I reviewed and incorporated ${accepted} grounded observations.

4. All cited sources have been verified in their original texts, assuming full intellectual and ethical responsibility for all presented content.

Chiclayo, ${todayStr}.

__________________________________________
Student / Researcher Signature
ID / USS Code: ________________________`;
  }

  return `DECLARACIÓN JURADA DE USO DE HERRAMIENTAS DE INTELIGENCIA ARTIFICIAL (ANEXO 5)

Yo, ${student.nombre || "________________________________________"}, estudiante de la Escuela Profesional de ${student.escuela || "____________________"} de la Universidad Señor de Sipán, declaro bajo juramento que:

1. He utilizado herramientas de Inteligencia Artificial Generativa (${toolsUsed}) exclusivamente como soporte de tutoría, revisión metodológica y auditoría de coherencia para la redacción de mi proyecto de investigación titulado:
"${student.titulo || "________________________________________________________________________________________"}".

2. La herramienta de IA no redactó párrafos finales ni generó datos empíricos, hallazgos o referencias bibliográficas ficticias. Su función se limitó a la evaluación contra los criterios del manual metodológico de las secciones: ${sectionsAudited}.

3. Se realizaron un total de ${total} interacciones de auditoría registradas en la bitácora de la suite Proyecto Tesis, de las cuales acepté e incorporé ${accepted} observaciones fundamentadas.

4. Todas las fuentes citadas han sido verificadas en sus textos originales, asumiendo la responsabilidad intelectual y ética sobre la totalidad del contenido presentado.

Chiclayo, ${todayStr}.

__________________________________________
Firma del Estudiante / Investigador
DNI / Código USS: ________________________`;
}

/**
 * Renderiza la vista previa del Anexo 5
 */
export function renderAnexo5Draft(state) {
  const declEl = document.getElementById("decl");
  if (declEl) {
    declEl.textContent = generateAnexo5Text(state);
  }
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}