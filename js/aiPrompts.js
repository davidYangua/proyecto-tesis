/**
 * Proyecto Tesis - Generador de Prompts Bilingües de IA (ChatGPT)
 * Archivo: js/aiPrompts.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { SECTIONS_DATA } from "../data/sectionsData.js";
import { MODELS_DATA } from "../data/modelsData.js";
import { evaluateCoherenceChain } from "./coherenceChain.js";

// ==========================================
// DETECTOR ROBUSTO DE IDIOMA ACTIVO
// ==========================================
export function isEnglish(state = {}) {
  if (typeof document !== "undefined") {
    // 1. Selector del widget de Google Translate
    const googCombo = document.querySelector(".goog-te-combo");
    if (googCombo && googCombo.value) {
      if (googCombo.value === "en") return true;
      if (googCombo.value === "es") return false;
    }

    // 2. Cookie oficial de Google Translate
    if (document.cookie.includes("googtrans=/es/en") || document.cookie.includes("googtrans=/auto/en")) {
      return true;
    }
    if (document.cookie.includes("googtrans=/es/es") || document.cookie.includes("googtrans=/auto/es")) {
      return false;
    }
  }

  // 3. Estado local o global del sistema
  const currentLang = state?.lang || window.proyectoTesisState?.lang || window.nexoState?.lang || (typeof document !== "undefined" && document.documentElement.lang) || "es";
  return currentLang === "en";
}

// ==========================================
// ROLES DEL TUTOR IA (SISTEMA) EN ES / EN
// ==========================================
const SYSTEM_ROLE_ES = `Actúa como tutor de metodología de la investigación científica de la Universidad Señor de Sipán (Perú). Tu objetivo es fomentar el pensamiento crítico, la rigurosidad epistemológica y la integridad científica en el estudiante, evaluando objetivamente su trabajo.

REGLAS DE EVALUACIÓN:
- No reescribas la sección ni entregues párrafos listos para copiar y pegar. Señala, cita textualmente y explica.
- Apoya cada juicio en una cita textual del borrador presentado.
- Respeta los criterios del manual metodológico y los productos esperados.
- Responde siempre en español, con un trato profesional y académico.`;

const SYSTEM_ROLE_EN = `Act as a scientific research methodology tutor at Señor de Sipán University (Peru). Your goal is to foster critical thinking, epistemological rigor, and scientific integrity in the student by objectively evaluating their work.

EVALUATION RULES:
- Do not rewrite the section or provide ready-made copy-paste paragraphs. Point out, quote textually, and explain.
- Support every judgment with a direct textual quote from the presented draft.
- Adhere strictly to the criteria of the methodological manual and expected deliverables.
- Always respond in English, maintaining a professional and academic tone.`;

/**
 * Genera los metadatos globales del proyecto en formato JSON bilingüe para la IA
 * @param {Object} state 
 * @returns {Object}
 */
export function buildMetadataJSON(state = {}) {
  const isEn = isEnglish(state);
  const student = state.student || {};
  const project = state.project || {};
  const pdfSources = state.pdfSources || [];

  if (isEn) {
    return {
      institution: "Señor de Sipán University (USS)",
      course: "Scientific Research Methodology - Thesis Project",
      student: {
        name: student.nombre || "Not specified",
        faculty: student.facultad || "Not specified",
        school: student.escuela || "Not specified",
        section: student.seccion || "Not specified",
        preliminary_title: student.titulo || "Not specified"
      },
      core_elements: {
        variable_1: project.v1 || "Not declared",
        variable_2_outcome: project.v2 || "Not declared",
        population: project.pob || "Not declared",
        scope_location: project.amb || "Not declared",
        period: project.per || "Not declared",
        methodological_approach: project.enf || "cuanti",
        general_question: project.preg || "Not declared",
        main_theory: project.teo || "Not declared",
        general_objective: project.obj || "Not declared",
        alternative_hypothesis: project.hip || "Not declared",
        scope_design: project.dis || "Not declared",
        instrument_v1: project.i1 || "Not declared",
        instrument_v2: project.i2 || "Not declared"
      },
      scopus_evidence_count: pdfSources.length,
      evaluation_date: new Date().toLocaleDateString("en-US")
    };
  }

  return {
    institucion: "Universidad Señor de Sipán (USS)",
    curso: "Metodología de la Investigación Científica - Proyecto Tesis",
    estudiante: {
      nombre: student.nombre || "No especificado",
      facultad: student.facultad || "No especificada",
      escuela: student.escuela || "No especificada",
      seccion: student.seccion || "No especificada",
      titulo_preliminar: student.titulo || "No especificado"
    },
    elementos_nucleo: {
      variable_1: project.v1 || "No declarada",
      variable_2_resultado: project.v2 || "No declarada",
      poblacion: project.pob || "No declarada",
      ambito: project.amb || "No declarado",
      periodo: project.per || "No declarado",
      enfoque_metodologico: project.enf || "cuanti",
      pregunta_general: project.preg || "No declarada",
      teoria_principal: project.teo || "No declarada",
      objetivo_general: project.obj || "No declarado",
      hipotesis_alterna: project.hip || "No declarada",
      alcance_diseno: project.dis || "No declarado",
      instrumento_v1: project.i1 || "No declarado",
      instrumento_v2: project.i2 || "No declarado"
    },
    evidencia_scopus_cargada: pdfSources.length,
    fecha_evaluacion: new Date().toLocaleDateString("es-PE")
  };
}

/**
 * Genera el prompt para auditar la Coherencia Epistemológica (Módulo 01)
 * @param {Object} state 
 * @returns {string}
 */
export function buildHiloPrompt(state = {}) {
  const isEn = isEnglish(state);
  const systemRole = isEn ? SYSTEM_ROLE_EN : SYSTEM_ROLE_ES;
  const metadata = buildMetadataJSON(state);
  const coherenceEvaluation = evaluateCoherenceChain(state.project || {}, isEn ? "en" : "es");

  if (isEn) {
    return `${systemRole}

TASK: Audit the internal epistemological coherence of the core elements of the research protocol.

PROJECT METADATA AND CORE ELEMENTS (JSON):
${JSON.stringify(metadata, null, 2)}

AUTOMATED LINK EVALUATION:
${JSON.stringify(coherenceEvaluation, null, 2)}

STRUCTURE OF YOUR RESPONSE:
1. Logical Coherence Audit: Review alignment between General Question, Main Theory, General Objective, Hypothesis, and Methodological Design.
2. Inconsistencies Detected: List up to 3 critical inconsistencies in terms, variables, or scope.
3. Key Reflection Question: Formulate the main question the student must resolve before moving forward.`;
  }

  return `${systemRole}

TAREA: Audita la coherencia epistemológica interna de los elementos núcleo del protocolo de investigación.

METADATOS Y ELEMENTOS NÚCLEO (JSON):
${JSON.stringify(metadata, null, 2)}

EVALUACIÓN AUTOMÁTICA DE ESLABONES:
${JSON.stringify(coherenceEvaluation, null, 2)}

ESTRUCTURA DE TU RESPUESTA:
1. Auditoría de Coherencia Lógica: Revisa la alineación entre Pregunta General, Teoría Principal, Objetivo General, Hipótesis y Diseño Metodológico.
2. Inconsistencias Detectadas: Enumera hasta 3 incoherencias críticas de términos, variables o alcance.
3. Pregunta Clave de Reflexión: Plantea la pregunta principal que el estudiante debe resolver antes de avanzar.`;
}

/**
 * Genera el prompt para auditar una sección específica de la ruta de redacción (Módulo 03)
 * @param {string} secId 
 * @param {Object} state 
 * @returns {string}
 */
export function buildSectionPrompt(secId, state = {}) {
  const isEn = isEnglish(state);
  const systemRole = isEn ? SYSTEM_ROLE_EN : SYSTEM_ROLE_ES;

  const sec = SECTIONS_DATA.find(s => s.id === secId);
  const model = MODELS_DATA ? MODELS_DATA[secId] : null;
  const draft = (state.drafts && state.drafts[secId]) || "";
  const metadata = buildMetadataJSON(state);

  if (!sec) return isEn ? "Section not found." : "Sección no encontrada.";

  const titleText = isEn && sec.title_en ? sec.title_en : sec.title;
  const prodText = isEn && sec.prod_en ? sec.prod_en : sec.prod;
  const testText = isEn && sec.test_en ? (sec.test_en || sec.prueba) : sec.prueba;
  const criteriaArr = isEn && sec.crit_en ? sec.crit_en : sec.crit;

  if (isEn) {
    return `${systemRole}

SECTION TO AUDIT: [${sec.code}] ${titleText} (${sec.wk})
EXPECTED DELIVERABLE: ${prodText}
CRITICAL VALIDATION TEST: ${testText}

PROJECT METADATA (JSON):
${JSON.stringify(metadata, null, 2)}

MANUAL EVALUATION CRITERIA:
${criteriaArr.map((c, i) => `${i + 1}.${c}`).join("\n")}

${model && model.steps ? `EXPECTED PARAGRAPH SEQUENCE:\n${model.steps.map((s, i) => `${i + 1}. ${s[0]}: ${s[1]}`).join("\n")}` : ""}

STUDENT'S PRESENTED DRAFT:
"""
${draft || "(The student has not drafted this section yet)"}
"""

DELIVER YOUR RESPONSE IN THIS EXACT FORMAT:
1. Criteria Table: No. | Criterion | Status (Complies / Partial / Does not comply) | Direct Textual Evidence Quote | Observation
2. Structure Analysis: Evaluation of thematic paragraph sequence.
3. Priority Corrections (Max 3): Location, concrete issue, and recommended action (without writing the draft for the student).
4. Mandatory Final Line (Dictamen in exact format):
DICTAMEN: 1=C; 2=P; 3=N... (One status value for each of the ${criteriaArr.length} criteria).`;
  }

  return `${systemRole}

SECCIÓN A AUDITAR: [${sec.code}] ${titleText} (${sec.wk})
PRODUCTO ESPERADO: ${prodText}
PRUEBA CRÍTICA: ${testText}

METADATOS DEL PROYECTO (JSON):
${JSON.stringify(metadata, null, 2)}

CRITERIOS DE EVALUACIÓN DEL MANUAL:
${criteriaArr.map((c, i) => `${i + 1}.${c}`).join("\n")}

${model && model.steps ? `ORDEN ESPERADO DE PÁRRAFOS:\n${model.steps.map((s, i) => `${i + 1}. ${s[0]}: ${s[1]}`).join("\n")}` : ""}

BORRADOR PRESENTADO POR EL ESTUDIANTE:
"""
${draft || "(El estudiante aún no ha redactado el borrador de esta sección)"}
"""

ENTREGA TU RESPUESTA CON ESTE FORMATO EXACTO:
1. Tabla de Criterios: N° | Criterio | Estado (Cumple / Parcial / No cumple) | Cita Textual de Evidencia | Observación
2. Análisis de Estructura: Evaluación de la secuencia temática de los párrafos.
3. Correcciones Prioritarias (Máx 3): Ubicación, problema concreto y acción recomendada (sin redactar por el estudiante).
4. Línea Final Obligatoria (Dictamen en formato exacto):
DICTAMEN: 1=C; 2=P; 3=N... (Un valor por cada uno de los ${criteriaArr.length} criterios).`;
}

/**
 * Genera el prompt para consultar teorías y términos de Tesauro sobre una variable (Módulo 04)
 * @param {string} variableName 
 * @param {Object} state 
 * @returns {string}
 */
export function buildTheoryQueryPrompt(variableName, state = {}) {
  const isEn = isEnglish(state);
  const systemRole = isEn ? SYSTEM_ROLE_EN : SYSTEM_ROLE_ES;
  const faculty = state.student?.facultad || (isEn ? "Not specified" : "No especificada");
  const school = state.student?.escuela || (isEn ? "Not specified" : "No especificada");
  const targetVar = variableName || (isEn ? "General Variable" : "Variable General");

  if (isEn) {
    return `${systemRole}

TASK: Suggest scientific theories, UNESCO/IEEE thesaurus terms, and seminal authors for a research variable.

TARGET VARIABLE: "${targetVar}"
FACULTY / SCHOOL: ${faculty} - ${school}

Please provide:
1. Top 3-4 recognized scientific theories or explanatory conceptual models for this variable.
2. Seminal Author(s) and seminal publication year for each theory.
3. Recommended UNESCO/IEEE thesaurus terms and descriptors.
4. Main dimensions or components measured by each model.
5. Recommendation on how to operationalize this variable in an empirical study.`;
  }

  return `${systemRole}

TAREA: Recomienda teorías científicas, términos de Tesauro (UNESCO/IEEE) y autores fundamentales para la siguiente variable.

VARIABLE DE INTERÉS: "${targetVar}"
FACULTAD / ESCUELA: ${faculty} - ${school}

Por favor proporciona:
1. Las 3 a 4 principales teorías científicas o modelos conceptuales reconocidos que sustenten esta variable.
2. Autores principales y año de publicación seminal para cada teoría.
3. Descriptores y términos de Tesauro recomendados (UNESCO/IEEE).
4. Dimensiones o componentes clave que componen cada modelo.
5. Recomendación sobre cómo operacionalizar esta variable en un estudio empírico.`;
}

/**
 * Genera el prompt para la Defensa Epistemológica con Jurado Simulado (Módulo 05)
 * @param {string} focus 
 * @param {string} level 
 * @param {Object} state 
 * @returns {string}
 */
export function buildJuryPrompt(focus = "general", level = "exigente", state = {}) {
  const isEn = isEnglish(state);
  const metadata = buildMetadataJSON(state);

  const focusMapEn = {
    "Coherencia General": "General Epistemological Coherence",
    "Planteamiento del Problema": "Problem Statement & Contextualization",
    "Marco Teórico": "Theoretical Framework & Conceptual Models",
    "Metodología y Diseño": "Methodology, Design & Sampling",
    "Instrumentos de Medición": "Data Collection Instruments & Validity"
  };

  const currentFocus = isEn ? (focusMapEn[focus] || focus) : focus;
  const levelText = isEn
    ? (level === "exigente" ? "High Degree Defense (Demanding)" : "Formative Assessment (Guiding)")
    : (level === "exigente" ? "Defensa Real de Grado (Exigente)" : "Evaluación Formativa (Guía)");

  if (isEn) {
    return `Act as a strict and expert Methodological Jury Panel member at Señor de Sipán University.
Evaluation level: ${levelText}.
Focus area: ${currentFocus}.

PROJECT METADATA (JSON):
${JSON.stringify(metadata, null, 2)}

INSTRUCTIONS FOR THE JURY SIMULATION:
1. Formulate Round 1 with 2 incisive methodological questions questioning the coherence between problem, objectives, and methodology.
2. Wait for my response before proceeding to Round 2 and Round 3.
3. Maintain a formal academic tone throughout the defense. Speak in English.`;
  }

  return `Actúa como un Jurado Evaluador Metodológico estricto de la Universidad Señor de Sipán.
Nivel de exigencia: ${levelText}.
Foco prioritario de evaluación: ${focus}.

METADATOS DEL PROYECTO (JSON):
${JSON.stringify(metadata, null, 2)}

INSTRUCCIONES PARA LA SIMULACIÓN:
1. Formula la Ronda 1 con 2 preguntas metodológicas incisivas cuestionando la coherencia entre el problema, los objetivos y el diseño.
2. Espera mi respuesta antes de avanzar a las Rondas 2 y 3.
3. Mantén un tono formal, académico y riguroso. Responde en español.`;
}

/**
 * Genera el prompt para la auditoría integral y gobernanza de IA (Módulo 06)
 * @param {Object} state 
 * @returns {string}
 */
export function buildReportPrompt(state = {}) {
  const isEn = isEnglish(state);
  const systemRole = isEn ? SYSTEM_ROLE_EN : SYSTEM_ROLE_ES;
  const metadata = buildMetadataJSON(state);
  const drafts = state.drafts || {};
  const pdfSources = state.pdfSources || [];

  if (isEn) {
    return `${systemRole}

TASK: Perform a comprehensive audit and governance evaluation of the entire research project.

PROJECT METADATA (JSON):
${JSON.stringify(metadata, null, 2)}

SCOPUS PDF EVIDENCE COUNT: ${pdfSources.length}

AVAILABLE DRAFTS:
${JSON.stringify(drafts, null, 2)}

STRUCTURE OF YOUR EVALUATION:
1. General Project Diagnosis: Epistemological strengths and methodological gaps.
2. Traceability and Flow Conservation: Correspondence between Problem, Theory, and Design.
3. Prioritized Action Plan: Urgent recommendations ordered by academic impact.`;
  }

  return `${systemRole}

TAREA: Realiza una auditoría integral y evaluación de gobernanza de todo el proyecto de investigación.

METADATOS DEL PROYECTO (JSON):
${JSON.stringify(metadata, null, 2)}

EVIDENCIA PDF SCOPUS CARGADA: ${pdfSources.length} artículo(s)

BORRADORES DISPONIBLES:
${JSON.stringify(drafts, null, 2)}

ESTRUCTURA DE TU EVALUACIÓN:
1. Diagnóstico General del Proyecto: Fortalezas epistemológicas y brechas metodológicas.
2. Trazabilidad y Conservación de Flujo: Correspondencia entre Problema, Teoría y Diseño.
3. Plan Prioritizado de Correcciones: Acciones urgentes recomendadas ordenadas por impacto académico.`;
}

/**
 * Formatea un prompt para ser enviado mediante URL a ChatGPT
 * @param {string} prompt 
 * @returns {string}
 */
export function formatPromptForChatGPT(prompt) {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}