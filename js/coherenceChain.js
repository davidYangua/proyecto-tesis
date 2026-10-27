/**
 * Proyecto Tesis - Evaluador de la Cadena de Coherencia Epistemológica
 * Archivo: js/coherenceChain.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { FACULTIES_DATA } from "../data/facultiesData.js";
import { THEORIES_DATA } from "../data/theoriesData.js";

/**
 * Normaliza y limpia cadenas para comparaciones flexibles
 * @param {string} str 
 * @returns {string}
 */
function normalizeText(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Inicializa y vincula dinámicamente los selectores de Facultad, Escuela y Teoría
 * @param {Object} state Estado global de la aplicación
 * @param {Function} onStateChange Callback invocado al cambiar alguna selección
 */
export function setupFacultySelects(state, onStateChange) {
  const facSelect = document.getElementById("st-fac");
  const escSelect = document.getElementById("st-esc");
  const teoSelect = document.getElementById("f-teo");

  if (!facSelect) return;

  const isEn = state.lang === "en";

  // 1. Poblado inicial del selector de Facultades
  facSelect.innerHTML = `<option value="">${isEn ? "Select Faculty…" : "Seleccione Facultad…"}</option>`;
  FACULTIES_DATA.forEach(fac => {
    const opt = document.createElement("option");
    opt.value = fac.id;
    opt.textContent = fac.nombre;
    if (state.student && (state.student.facultad === fac.id || state.student.facultad === fac.nombre)) {
      opt.selected = true;
    }
    facSelect.appendChild(opt);
  });

  // 2. Función para actualizar Escuelas y Teorías en cascada
  const updateSubSelects = (facId, selectedEsc = "", selectedTeo = "") => {
    const faculty = FACULTIES_DATA.find(f => f.id === facId || f.nombre === facId);

    // Actualizar selector de Escuelas Profesionales
    if (escSelect) {
      escSelect.innerHTML = `<option value="">${isEn ? "Select School…" : "Seleccione Escuela…"}</option>`;
      
      if (faculty) {
        const schoolList = faculty.schools || faculty.escuelas || [];
        
        schoolList.forEach(sch => {
          const opt = document.createElement("option");
          const schName = typeof sch === "string" ? sch : (sch.name || sch.nombre);
          opt.value = schName;
          opt.textContent = schName;
          
          if (selectedEsc && (selectedEsc === schName || selectedEsc === sch.id)) {
            opt.selected = true;
          }
          escSelect.appendChild(opt);
        });
      }
    }

    // Actualizar selector de Marcos Teóricos en Módulo 01
    if (teoSelect) {
      const currentTeoVal = teoSelect.value;
      teoSelect.innerHTML = `<option value="">${isEn ? "Select Theory or Model…" : "Seleccione Teoría o Modelo…"}</option>`;
      
      const targetFacId = faculty ? faculty.id : facId;
      const allTheories = [...THEORIES_DATA, ...(state.customTheories || [])];
      
      const filteredTheories = targetFacId 
        ? allTheories.filter(t => t.facultad === targetFacId)
        : allTheories;

      filteredTheories.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.nombre;
        opt.textContent = `${t.nombre} (${t.autor}, ${t.anio})`;
        if (selectedTeo === t.nombre || currentTeoVal === t.nombre) {
          opt.selected = true;
        }
        teoSelect.appendChild(opt);
      });

      const targetTeo = selectedTeo || currentTeoVal;
      if (targetTeo) {
        const optionExists = Array.from(teoSelect.options).some(opt => opt.value === targetTeo);
        if (!optionExists) {
          const opt = document.createElement("option");
          opt.value = targetTeo;
          opt.textContent = `${targetTeo} (${isEn ? "Assigned/Custom" : "Asignada/Personalizada"})`;
          opt.selected = true;
          teoSelect.appendChild(opt);
        }
      }
    }
  };

  const currentFac = state.student ? state.student.facultad : "";
  const currentEsc = state.student ? state.student.escuela : "";
  const currentTeo = state.project ? state.project.teo : "";
  
  updateSubSelects(currentFac, currentEsc, currentTeo);

  facSelect.onchange = (e) => {
    const selectedFac = e.target.value;
    if (state.student) {
      state.student.facultad = selectedFac;
      state.student.escuela = "";
    }
    updateSubSelects(selectedFac, "", state.project ? state.project.teo : "");
    if (onStateChange) onStateChange();
  };

  if (escSelect) {
    escSelect.onchange = (e) => {
      if (state.student) {
        state.student.escuela = e.target.value;
      }
      if (onStateChange) onStateChange();
    };
  }

  if (teoSelect) {
    teoSelect.onchange = (e) => {
      if (state.project) {
        state.project.teo = e.target.value;
      }
      if (onStateChange) onStateChange();
    };
  }
}

/**
 * Evalúa los 6 eslabones de la cadena de coherencia epistemológica con soporte bilingüe (ES / EN)
 * @param {Object} data Datos del proyecto
 * @param {string} [lang] Idioma opcional ("es" | "en")
 */
export function evaluateCoherenceChain(data = {}, lang = null) {
  const currentLang = lang || data.lang || window.proyectoTesisState?.lang || window.nexoState?.lang || "es";
  const isEn = currentLang === "en";

  const {
    v1 = "",
    v2 = "",
    pob = "",
    amb = "",
    per = "",
    dis = "",
    preg = "",
    teo = "",
    obj = "",
    hip = "",
    i1 = "",
    i2 = ""
  } = data;

  const nV1 = normalizeText(v1);
  const nV2 = normalizeText(v2);
  const nPob = normalizeText(pob);
  const nAmb = normalizeText(amb);
  const nPer = normalizeText(per);
  const nPreg = normalizeText(preg);
  const nObj = normalizeText(obj);
  const nHip = normalizeText(hip);
  const nI1 = normalizeText(i1);

  const links = [];

  // ESLABÓN 1: Declaración de Núcleo Temático
  const link1 = {
    id: 1,
    title: isEn ? "Link 1: Thematic Core Declaration" : "Eslabón 1: Declaración de Núcleo Temático",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!nV1 || !nPob || !nAmb || !nPer) {
    link1.status = "bad";
    link1.msg = isEn ? "Incomplete" : "Incompleto";
    link1.detail = isEn
      ? "Missing key core fields: make sure to complete at least Variable 1, Population, Scope, and Period."
      : "Faltan declarar campos clave del núcleo: asegúrese de completar al menos la Variable 1, Población, Ámbito y Periodo.";
  } else if (!nV2) {
    link1.status = "warn";
    link1.msg = isEn ? "Univariate / Descriptive Study" : "Estudio Univariado / Descriptivo";
    link1.detail = isEn
      ? "Only one variable (V1) registered. If your study is correlational or explanatory, Variable 2 must be declared."
      : "Se ha registrado solo una variable (V1). Si su estudio es correlacional o explicativo, debe declarar la Variable 2.";
  } else {
    link1.status = "ok";
    link1.msg = isEn ? "Complete Bivariate Core" : "Núcleo Bivariado Completo";
    link1.detail = isEn
      ? `Variables (${v1} ${v2 ? "and " + v2 : ""}), bounded in ${pob}, ${amb} (${per}).`
      : `Variables (${v1} ${v2 ? "y " + v2 : ""}), delimitadas en ${pob}, ${amb} (${per}).`;
  }
  links.push(link1);

  // ESLABÓN 2: Pregunta General de Investigación
  const link2 = {
    id: 2,
    title: isEn ? "Link 2: General Research Question" : "Eslabón 2: Pregunta General de Investigación",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!nPreg) {
    link2.status = "bad";
    link2.msg = isEn ? "No General Question" : "Sin Pregunta General";
    link2.detail = isEn
      ? "Enter the general research question (section 1.3)."
      : "Ingrese la pregunta general de investigación (sección 1.3).";
  } else {
    const hasV1 = nV1 && nPreg.includes(nV1);
    const hasV2 = !nV2 || nPreg.includes(nV2);
    const isInterrogative = preg.trim().startsWith("¿") || preg.trim().startsWith("?") || preg.trim().endsWith("?");

    if (hasV1 && hasV2 && isInterrogative) {
      link2.status = "ok";
      link2.msg = isEn ? "Aligned Question" : "Pregunta Alineada";
      link2.detail = isEn
        ? "The question properly states the variables and interrogative structure."
        : "La pregunta formula adecuadamente las variables y estructura interrogativa.";
    } else if (!isInterrogative) {
      link2.status = "warn";
      link2.msg = isEn ? "Missing Question Mark" : "Falta Signo Interrogativo";
      link2.detail = isEn
        ? "The general question must include proper question marks ('?' or '¿')."
        : "La pregunta general debe iniciar con «¿» y cerrar con «?».";
    } else {
      link2.status = "warn";
      link2.msg = isEn ? "Term Discrepancy" : "Discrepancia de Términos";
      link2.detail = isEn
        ? "Ensure the question contains the exact names of the declared variables."
        : "Asegúrese de que la pregunta contenga exactamente los nombres de las variables declaradas.";
    }
  }
  links.push(link2);

  // ESLABÓN 3: Marco Teórico
  const link3 = {
    id: 3,
    title: isEn ? "Link 3: Main Theoretical Foundation" : "Eslabón 3: Fundamentación Teórica Principal",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!teo) {
    link3.status = "bad";
    link3.msg = isEn ? "No Theoretical Framework Selected" : "Sin Marco Teórico Seleccionado";
    link3.detail = isEn
      ? "Select a main theory or conceptual model supporting the research (section 1.4)."
      : "Seleccione una teoría o modelo conceptual principal que respalde la investigación (sección 1.4).";
  } else {
    link3.status = "ok";
    link3.msg = isEn ? "Assigned Theoretical Support" : "Sostén Teórico Asignado";
    link3.detail = isEn
      ? `Assigned Theory/Model: «${teo}». Remember to write the construct-variable translation paragraph in section 1.4.`
      : `Teoría/Modelo asignado: «${teo}». Recuerde redactar el párrafo de traducción constructo-variable en la sección 1.4.`;
  }
  links.push(link3);

  // ESLABÓN 4: Objetivo General vs Pregunta
  const link4 = {
    id: 4,
    title: isEn ? "Link 4: Question - General Objective Alignment" : "Eslabón 4: Alineación Pregunta - Objetivo General",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!nObj) {
    link4.status = "bad";
    link4.msg = isEn ? "No General Objective" : "Sin Objetivo General";
    link4.detail = isEn
      ? "Declare the general objective (section 1.5)."
      : "Declare el objetivo general (sección 1.5).";
  } else {
    const verbs = ["determinar", "evaluar", "analizar", "identificar", "establecer", "describir", "comparar", "demostrar", "determine", "evaluate", "analyze", "identify", "establish", "describe", "compare", "demonstrate"];
    const startsWithVerb = verbs.some(v => nObj.startsWith(v));
    const hasV1InObj = nV1 && nObj.includes(nV1);

    if (startsWithVerb && hasV1InObj) {
      link4.status = "ok";
      link4.msg = isEn ? "Coherent Objective" : "Objetivo Coherente";
      link4.detail = isEn
        ? "The general objective begins with an appropriate infinitive verb and maintains the study variables."
        : "El objetivo general inicia con un verbo en infinitivo adecuado y mantiene las variables de estudio.";
    } else if (!startsWithVerb) {
      link4.status = "warn";
      link4.msg = isEn ? "Missing Infinitive Verb" : "Verbo Infinitivo Ausente";
      link4.detail = isEn
        ? "The general objective must start with an infinitive verb (e.g., Determine, Identify, Evaluate)."
        : "El objetivo general debe iniciar con un verbo en infinitivo (ej. Determinar, Identificar, Evaluar).";
    } else {
      link4.status = "warn";
      link4.msg = isEn ? "Possible Misalignment" : "Posible Desalineación";
      link4.detail = isEn
        ? "Verify that the variables in the general objective literally match the research question."
        : "Verifique que las variables en el objetivo general coincidan literalmente con la pregunta de investigación.";
    }
  }
  links.push(link4);

  // ESLABÓN 5: Diseño Metodológico vs Alcance
  const link5 = {
    id: 5,
    title: isEn ? "Link 5: Methodological Scope and Design" : "Eslabón 5: Alcance y Diseño Metodológico",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!dis) {
    link5.status = "bad";
    link5.msg = isEn ? "No Design Assigned" : "Sin Diseño Asignado";
    link5.detail = isEn
      ? "Select the methodological scope and design (section 2.1)."
      : "Seleccione el alcance y diseño metodológico (sección 2.1).";
  } else {
    if (dis === "corr" && nObj && !nObj.includes("relacion") && !nObj.includes("asociac") && !nObj.includes("determinar") && !nObj.includes("relationship") && !nObj.includes("association")) {
      link5.status = "warn";
      link5.msg = isEn ? "Verb - Scope Incoherence" : "Incoherencia Verbo - Alcance";
      link5.detail = isEn
        ? "A correlational scope requires verbs or phrases of association like 'Determine the relationship between...' or 'Determine association...'."
        : "Un alcance correlacional exige verbos o frases de asociación como «Determinar la relación entre…» o «Determinar la asociación…».";
    } else {
      link5.status = "ok";
      link5.msg = isEn ? "Consistent Methodology" : "Metodología Consistente";
      link5.detail = isEn
        ? `Selected Scope/Design: [${dis.toUpperCase()}]. Matches the nature of the study.`
        : `Alcance/Diseño seleccionado: [${dis.toUpperCase()}]. Coincide con la naturaleza del estudio.`;
    }
  }
  links.push(link5);

  // ESLABÓN 6: Hipótesis e Instrumentos
  const link6 = {
    id: 6,
    title: isEn ? "Link 6: Hypothesis and Measurement Instruments" : "Eslabón 6: Hipótesis e Instrumentos de Medición",
    status: "bad",
    msg: "",
    detail: ""
  };

  if (!nHip && dis !== "desc") {
    link6.status = "bad";
    link6.msg = isEn ? "Missing Alternative Hypothesis" : "Falta Hipótesis Alterna";
    link6.detail = isEn
      ? "Correlational or explanatory studies require explicit alternative hypothesis (Hi) statement."
      : "Los estudios correlacionales o explicativos requieren la declaración explícita de la hipótesis alterna (Hi).";
  } else if (!nI1) {
    link6.status = "warn";
    link6.msg = isEn ? "Missing Variable 1 Instrument" : "Falta Instrumento de Variable 1";
    link6.detail = isEn
      ? "Declare the questionnaire, scale, or checklist to measure Variable 1."
      : "Declare el cuestionario, escala o lista de cotejo para medir la Variable 1.";
  } else {
    link6.status = "ok";
    link6.msg = isEn ? "Operationalization & Hypothesis Validated" : "Operacionalización e Hipótesis Validadas";
    link6.detail = isEn
      ? `Assigned instruments: ${i1} ${i2 ? "and " + i2 : ""}. ${nHip ? "Hypothesis formulated." : "Descriptive design exempt from hypothesis."}`
      : `Instrumentos asignados: ${i1} ${i2 ? "y " + i2 : ""}. ${nHip ? "Hipótesis formulada." : "Diseño descriptivo exento de hipótesis."}`;
  }
  links.push(link6);

  return links;
}

/**
 * Renderiza la interfaz de tarjetas del Hilo de Coherencia en el DOM
 */
export function renderCoherenceChainUI(links, containerEl, scoreBarEl, scoreSummaryEl) {
  if (!containerEl) return;

  const isEn = (window.proyectoTesisState?.lang || window.nexoState?.lang) === "en";

  containerEl.innerHTML = "";
  if (scoreBarEl) scoreBarEl.innerHTML = "";

  let okCount = 0;

  links.forEach(link => {
    if (link.status === "ok") okCount++;

    let statusClass = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800";
    let iconName = "alert-circle";

    if (link.status === "ok") {
      statusClass = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
      iconName = "check-circle-2";
    } else if (link.status === "warn") {
      statusClass = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
      iconName = "alert-triangle";
    }

    const card = document.createElement("div");
    card.className = "p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 transition shadow-sm space-y-1.5";

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <h3 class="text-xs font-bold font-display text-slate-800 dark:text-slate-200">${link.title}</h3>
        <span class="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md border ${statusClass}">
          <i data-lucide="${iconName}" class="w-3.5 h-3.5"></i>
          <span>${link.msg}</span>
        </span>
      </div>
      <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">${link.detail}</p>
    `;

    containerEl.appendChild(card);

    if (scoreBarEl) {
      const seg = document.createElement("div");
      seg.className = `h-2 flex-1 rounded-full transition-all duration-300 ${
        link.status === "ok" ? "bg-emerald-500" : link.status === "warn" ? "bg-amber-400" : "bg-rose-400"
      }`;
      scoreBarEl.appendChild(seg);
    }
  });

  if (scoreSummaryEl) {
    scoreSummaryEl.textContent = isEn ? `${okCount} of 6 solid links` : `${okCount} de 6 eslabones firmes`;
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}