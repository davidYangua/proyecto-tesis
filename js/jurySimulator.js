/**
 * Proyecto Tesis - Simulador de Jurado Evaluador y Defensa Epistemológica Oral
 * Archivo: js/jurySimulator.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { SECTIONS_DATA } from "../data/sectionsData.js";

/**
 * Inicializa el Simulador de Jurado y configura los eventos de registro
 * @param {Object} state Estado global de la aplicación
 * @param {Function} onSaveJuryLog Callback ejecutado al guardar una ronda de defensa
 */
export function initJurySimulator(state, onSaveJuryLog) {
  const focusSelectEl = document.getElementById("jfocus");
  const levelSelectEl = document.getElementById("jlevel");
  const saveBtn = document.getElementById("jsave");
  const copyBtn = document.getElementById("copy-jur") || document.getElementById("btn-copy-jur");
  const qEl = document.getElementById("jq");
  const aEl = document.getElementById("ja");
  const vEl = document.getElementById("jv");
  const lEl = document.getElementById("jl");
  const msgEl = document.getElementById("jmsg");

  populateJuryFocusOptions(focusSelectEl, state);

  if (focusSelectEl) {
    focusSelectEl.addEventListener("change", () => updateJuryPromptView(state));
  }
  if (levelSelectEl) {
    levelSelectEl.addEventListener("change", () => updateJuryPromptView(state));
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const isEn = (state?.lang || window.proyectoTesisState?.lang) === "en";
      const promptText = buildJuryPrompt(state);
      navigator.clipboard.writeText(promptText).then(() => {
        const origText = copyBtn.textContent;
        copyBtn.textContent = isEn ? "Copied!" : "¡Copiado!";
        setTimeout(() => { copyBtn.textContent = origText; }, 2000);
      }).catch(err => {
        console.error("Error al copiar prompt: ", err);
      });
    });
  }

  if (saveBtn) {
    saveBtn.onclick = () => {
      const isEn = (state?.lang || window.proyectoTesisState?.lang) === "en";
      const question = qEl ? qEl.value.trim() : "";
      const answer = aEl ? aEl.value.trim() : "";
      const valuation = vEl ? vEl.value : "";
      const plan = lEl ? lEl.value.trim() : "";

      if (!question && !answer) {
        if (msgEl) {
          msgEl.textContent = isEn
            ? "Please enter the jury question or your formulated answer."
            : "Complete la pregunta del jurado o su respuesta formulada.";
          msgEl.className = "text-xs font-mono text-rose-500 font-bold";
        }
        return;
      }

      const focusText = focusSelectEl && focusSelectEl.selectedOptions[0] 
        ? focusSelectEl.selectedOptions[0].text 
        : (isEn ? "General Defense" : "Defensa General");

      const juryEntry = {
        tipo: "jurado",
        id: `jur_${Date.now()}`,
        fecha: new Date().toLocaleDateString(isEn ? "en-US" : "es-PE") + " " + new Date().toLocaleTimeString(isEn ? "en-US" : "es-PE", { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        foco: focusText,
        sec: focusText,
        pregunta: question || (isEn ? "Defense question formulated by jury" : "Pregunta de sustentación formulada por el jurado"),
        respuesta: answer || (isEn ? "Response under argumentation" : "Respuesta en proceso de argumentación"),
        valoracion: valuation || (isEn ? "Evaluated" : "Evaluada"),
        plan: plan || (isEn ? "Review of methodological concepts and theoretical framework" : "Repaso de conceptos metodológicos y marco teórico"),
        detalles: question || answer,
        tool: isEn ? "Simulated Jury (Oral Defense)" : "Jurado Simulado (Sustentación Oral)",
        ai: `${isEn ? "Question" : "Pregunta"}: "${question}" | ${isEn ? "Valuation" : "Valoración"}: [${valuation || (isEn ? "Evaluated" : "Evaluada")}]`,
        dec: `${isEn ? "Defense Logged" : "Defensa Registrada"} (${valuation || (isEn ? "Evaluated" : "Evaluada")})`,
        why: `${isEn ? "Response" : "Respuesta"}: "${answer}"${plan ? (isEn ? " | Action plan: " : " | Plan de mejora: ") + plan : ""}`
      };

      if (!state.log) state.log = [];
      state.log.push(juryEntry);

      if (onSaveJuryLog) {
        onSaveJuryLog(juryEntry);
      }

      if (qEl) qEl.value = "";
      if (aEl) aEl.value = "";
      if (vEl) vEl.value = "";
      if (lEl) lEl.value = "";

      if (msgEl) {
        msgEl.textContent = isEn
          ? "Defense round logged successfully in the logbook!"
          : "¡Ronda de sustentación registrada con éxito en la bitácora!";
        msgEl.className = "text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold";
        setTimeout(() => { if (msgEl) msgEl.textContent = ""; }, 4000);
      }
    };
  }

  updateJuryPromptView(state);
}

/**
 * Puebla el elemento select con todas las secciones evaluables de la investigación
 * @param {HTMLSelectElement} selectEl 
 * @param {Object} state
 */
export function populateJuryFocusOptions(selectEl, state = {}) {
  if (!selectEl) return;

  const isEn = (state?.lang || window.proyectoTesisState?.lang) === "en";
  selectEl.innerHTML = "";

  const optAll = document.createElement("option");
  optAll.value = "all";
  optAll.textContent = isEn
    ? "Full Defense (Complete Epistemological Chain)"
    : "Defensa Integral (Todo el Hilo de Coherencia)";
  selectEl.appendChild(optAll);

  if (Array.isArray(SECTIONS_DATA)) {
    SECTIONS_DATA.forEach(sec => {
      const opt = document.createElement("option");
      opt.value = sec.id;
      const titleText = isEn && sec.title_en ? sec.title_en : sec.title;
      opt.textContent = `[${sec.code}] ${titleText} (${sec.wk})`;
      selectEl.appendChild(opt);
    });
  }
}

/**
 * Construye el prompt estructurado para la IA en el rol de Jurado (Soporte ES / EN)
 * @param {Object} state Estado global de la aplicación
 * @returns {string} Prompt completo formateado
 */
export function buildJuryPrompt(state = {}) {
  const isEn = (state?.lang || window.proyectoTesisState?.lang) === "en";
  const focusSelectEl = document.getElementById("jfocus");
  const levelSelectEl = document.getElementById("jlevel");

  const focusId = focusSelectEl ? focusSelectEl.value : "all";
  const isExigente = levelSelectEl ? levelSelectEl.value === "exigente" : true;

  const project = state.project || {};
  const student = state.student || {};

  if (isEn) {
    const levelDirective = isExigente
      ? "Demanding and rigorous as in an official degree defense. Do not accept generic responses or emotional appeals. Demand theoretical and methodological grounding."
      : "Formative and guiding. If the answer is incomplete or weak, formulate guiding follow-up questions leading the student to the correct answer.";

    let focusContext = "Examine integral coherence between question, theoretical framework, objective, design, and instruments.";
    if (focusId !== "all" && Array.isArray(SECTIONS_DATA)) {
      const sec = SECTIONS_DATA.find(s => s.id === focusId);
      if (sec) {
        const titleText = sec.title_en || sec.title;
        const prodText = sec.prod_en || sec.prod;
        const testText = sec.test_en || sec.prueba;
        focusContext = `Focus specifically on section ${sec.code} (${titleText}). Expected deliverable: ${prodText}. Critical test: ${testText}`;
      }
    }

    return `Act as a METHODOLOGICAL JURY EVALUATOR for thesis projects at Señor de Sipán University (Peru).

REQUIREMENT LEVEL: ${levelDirective}
EVALUATION FOCUS: ${focusContext}

STUDENT PROJECT METADATA:
- Student: ${student.nombre || "Not specified"}
- Faculty: ${student.facultad || "Not specified"}
- Professional School: ${student.escuela || "Not specified"}
- Preliminary Title: "${student.titulo || "Not specified"}"
- Variable 1: ${project.v1 || "Not declared"}
- Variable 2 (Outcome): ${project.v2 || "Not declared"}
- Population & Scope: ${project.pob || "Not declared"} in ${project.amb || "Not declared"} (${project.per || "Period not specified"})
- General Question: ${project.preg || "Not declared"}
- Main Theory / Model: ${project.teo || "Not declared"}
- General Objective: ${project.obj || "Not declared"}
- Scope and Design: ${project.dis || "Not declared"}
- Variable 1 Instrument: ${project.i1 || "Not declared"}
- Variable 2 Instrument: ${project.i2 || "Not declared"}

SESSION INSTRUCTIONS:
1. Ask ONE direct question at a time and wait for the student's response.
2. Inquire about methodological coherence, theoretical support, or instrument feasibility; NEVER ask for memorized theoretical definitions.
3. After the student responds, briefly evaluate (Solid / Partial / Weak) and ask follow-up questions targeting methodological gaps over 3 rounds.
4. At the conclusion of the third round, provide a summary of strengths, vulnerabilities, and the 3 key questions they must prepare for the official defense.

Begin by briefly introducing yourself as the Jury Evaluator and start with your FIRST QUESTION. Respond in English.`;
  }

  // FORMATO EN ESPAÑOL
  const levelDirective = isExigente
    ? "Exigente y riguroso como en una sustentación real de grado. No aceptes respuestas genéricas ni apelaciones emocionales. Exige fundamentación teórica y metodológica."
    : "Formativo y orientador. Si la respuesta es incompleta o débil, formula repreguntas orientadoras guiando al estudiante a la respuesta correcta.";

  let focusContext = "Examinar la coherencia integral entre pregunta, marco teórico, objetivo, diseño e instrumentos.";
  if (focusId !== "all" && Array.isArray(SECTIONS_DATA)) {
    const sec = SECTIONS_DATA.find(s => s.id === focusId);
    if (sec) {
      focusContext = `Centrarse específicamente en la sección ${sec.code} (${sec.title}). Producto esperado: ${sec.prod}. Prueba crítica: ${sec.prueba}`;
    }
  }

  return `Actúa como JURADO EVALUADOR de proyectos de tesis e investigación científica de la Universidad Señor de Sipán (Perú).

NIVEL DE EXIGENCIA: ${levelDirective}
FOCO DE LA EVALUACIÓN: ${focusContext}

DATOS DEL PROYECTO DEL ESTUDIANTE:
- Estudiante: ${student.nombre || "No especificado"}
- Facultad: ${student.facultad || "No especificada"}
- Escuela Profesional: ${student.escuela || "No especificada"}
- Título preliminar: "${student.titulo || "No especificado"}"
- Variable 1: ${project.v1 || "No declarada"}
- Variable 2 (Resultado): ${project.v2 || "No declarada"}
- Población y Ámbito: ${project.pob || "No declarada"} en ${project.amb || "No declarado"} (${project.per || "Periodo no especificado"})
- Pregunta General: ${project.preg || "No declarada"}
- Teoría / Modelo Principal: ${project.teo || "No declarada"}
- Objetivo General: ${project.obj || "No declarado"}
- Alcance y Diseño: ${project.dis || "No declarado"}
- Instrumento Variable 1: ${project.i1 || "No declarado"}
- Instrumento Variable 2: ${project.i2 || "No declarado"}

INSTRUCCIONES PARA LA SESIÓN:
1. Haz UNA SOLA PREGUNTA directa a la vez y espera la respuesta del estudiante.
2. Interroga sobre la coherencia metodológica, el soporte teórico o la viabilidad del instrumento; NUNCA pidas definiciones teóricas de memoria.
3. Tras la respuesta del estudiante, evalúa de forma concisa (Sólida / Parcial / Débil) y repregunta buscando la brecha metodológica durante 3 rondas.
4. Al concluir la tercera ronda, ofrece un resumen de fortalezas, vulnerabilidades y las 3 preguntas clave que debe preparar para la sustentación oficial.

Comienza presentándote brevemente como el Jurado Evaluador e inicia con tu PRIMERA PREGUNTA. Responde en español.`;
}

/**
 * Actualiza la vista previa del prompt y el enlace directo hacia ChatGPT
 * @param {Object} state 
 */
export function updateJuryPromptView(state = {}) {
  const pvEl = document.getElementById("pv-jur");
  const gptLinkEl = document.getElementById("gpt-jur");

  const promptText = buildJuryPrompt(state);

  if (pvEl) {
    pvEl.textContent = promptText;
  }

  if (gptLinkEl) {
    const encodedPrompt = encodeURIComponent(promptText);
    gptLinkEl.href = `https://chatgpt.com/?q=${encodedPrompt}`;
  }
}