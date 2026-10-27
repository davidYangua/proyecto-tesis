/**
 * Proyecto Tesis - Diccionario de Internacionalización (i18n)
 * Archivo: js/i18n.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

export const TRANSLATIONS = {
  es: {
    title: "Proyecto Tesis | Universidad Señor de Sipán",
    subtitle: "Suite multidisciplinaria de analítica epistemológica, auditoría metodológica y gestión de evidencia científica.",
    tab1: "Coherencia Epistemológica",
    tab_pdf: "Gestor de PDF & Citas Scopus",
    tab2: "Sistematización Metodológica",
    tab3: "Marcos Teóricos & Tesauros",
    tab4: "Defensa Epistemológica",
    tab5: "Bitácora & Gobernanza IA",
    faculty: "Facultad USS",
    school: "Escuela Profesional / Posgrado",
    approach: "Enfoque Metodológico",
    title_label: "Título preliminar de la investigación / Manuscrito",
    v1_label: "Variable 1 (Asociada / Independiente)",
    v2_label: "Variable 2 (De resultado / Dependiente)",
    sankey_title: "Matriz de Operacionalización y Conservación de Flujo",
    sankey_subtitle: "Desagregación proporcional: Variables / Categorías ➔ Dimensiones / Subcategorías ➔ Ítems / Indicadores",
    export_docx: "Exportar Informe en Word (.docx)",
    export_dublincore: "Dublin Core (XML)",
    audit_chatgpt: "Auditar Coherencia en ChatGPT"
  },
  en: {
    title: "Thesis Project | Señor de Sipán University",
    subtitle: "Multidisciplinary suite for epistemological analytics, methodological audit, and scientific evidence management.",
    tab1: "Epistemological Coherence",
    tab_pdf: "PDF Manager & Scopus Citations",
    tab2: "Methodological Systematization",
    tab3: "Theoretical Frameworks & Thesauri",
    tab4: "Epistemological Defense",
    tab5: "Log & AI Governance",
    faculty: "USS Faculty",
    school: "Professional School / Graduate Program",
    approach: "Methodological Approach",
    title_label: "Preliminary Research Title / Manuscript",
    v1_label: "Variable 1 (Associated / Independent)",
    v2_label: "Variable 2 (Outcome / Dependent)",
    sankey_title: "Operationalization Matrix & Flow Conservation",
    sankey_subtitle: "Proportional breakdown: Variables / Categories ➔ Dimensions / Subcategories ➔ Items / Indicators",
    export_docx: "Export Report to Word (.docx)",
    export_dublincore: "Dublin Core (XML)",
    audit_chatgpt: "Audit Coherence in ChatGPT"
  }
};

/**
 * Actualiza dinámicamente los textos traducibles de la interfaz según el idioma seleccionado
 * @param {string} lang Código del idioma ("es" | "en")
 */
export function updateI18nUI(lang = "es") {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.es;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = dict[key];
      } else {
        // Preservar íconos de Lucide si existen dentro del elemento
        const icon = el.querySelector("i[data-lucide]");
        if (icon) {
          const iconHTML = icon.outerHTML;
          el.innerHTML = `${iconHTML} <span>${dict[key]}</span>`;
        } else {
          el.textContent = dict[key];
        }
      }
    }
  });

  // Re-inicializar la iconografía vectorial tras actualizar el DOM
  if (window.lucide) {
    window.lucide.createIcons();
  }
}