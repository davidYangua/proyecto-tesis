/**
 * Proyecto Tesis - Módulo de Exportación de Informes y Gestión de Respaldo
 * Archivo: js/reportExporter.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

import { THEORIES_DATA } from "../data/theoriesData.js";
import { evaluateCoherenceChain } from "./coherenceChain.js";

/**
 * Normaliza y extrae la nomenclatura Nombre_Apellido para el archivo
 */
function getCleanStudentFilename(fullName, isEn = false) {
  if (!fullName || !fullName.trim()) return isEn ? "USS_Student" : "Estudiante_USS";
  
  const clean = fullName.trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
  const parts = clean.split(/\s+/);

  if (parts.length === 1) return `${parts[0]}_USS`;
  return `${parts[0]}_${parts[1]}`;
}

/**
 * Genera y descarga el informe oficial en formato Word (.docx)
 */
export async function exportToWord(state) {
  const isEn = state?.lang === "en";

  if (!window.docx) {
    throw new Error(isEn ? "The docx.js library is not loaded." : "La librería docx.js no está cargada en la aplicación.");
  }

  const {
    Document,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    HeadingLevel,
    BorderStyle,
    Packer
  } = window.docx;

  const student = state.student || {};
  const project = state.project || {};
  const pdfSources = state.pdfSources || [];
  const drafts = state.drafts || {};
  const log = state.log || [];
  const customTheories = state.customTheories || [];

  // 1. Obtener la Teoría Asignada detallada
  const allTheories = [...THEORIES_DATA, ...customTheories];
  const assignedTheory = allTheories.find(t => t.nombre === project.teo) || null;

  // 2. Evaluar Coherencia Epistemológica
  const coherenceLinks = evaluateCoherenceChain(project, state.lang);
  const okCount = coherenceLinks.filter(l => l.status === "ok").length;

  // 3. Cálculo de Palabras Totales y Progreso
  let totalWords = 0;
  let draftedSections = 0;
  Object.values(drafts).forEach(txt => {
    if (txt && txt.trim()) {
      draftedSections++;
      totalWords += txt.trim().split(/\s+/).length;
    }
  });

  // 4. Configuración de Bordes y Colores de Tablas
  const mainBorders = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
    insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" }
  };

  const createStyledCell = (text, isHeader = false, widthPercent = 50, bgHex = null, align = AlignmentType.LEFT) => {
    let background = "FFFFFF";
    if (isHeader) background = "0A2540";
    else if (bgHex) background = bgHex;

    return new TableCell({
      width: { size: widthPercent, type: WidthType.PERCENTAGE },
      shading: { fill: background },
      margins: { top: 100, bottom: 100, left: 150, right: 150 },
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text: text || "—",
              bold: isHeader,
              color: isHeader ? "FFFFFF" : "1E293B",
              size: 18,
              font: "Arial"
            })
          ]
        })
      ]
    });
  };

  const weekTitles = isEn ? {
    w1: "Week 1: Problematic Reality and Contextualization",
    w2: "Week 2: Formulation of Questions (General and Specific)",
    w3: "Week 3: Research Objectives and Hypotheses",
    w4: "Week 4: Justification and Importance of the Study",
    w5: "Week 5: International and National Background/Antecedents",
    w6: "Week 6: Theoretical Foundations and Definition of Constructs",
    w7: "Week 7: Conceptual and Operational Definition of Variables",
    w8: "Week 8: Approach, Scope, and Methodological Design",
    w9: "Week 9: Population, Sample, and Sampling",
    w10: "Week 10: Inclusion and Exclusion Criteria",
    w11: "Week 11: Selection and Adaptation of Instruments",
    w12: "Week 12: Validity and Reliability of Instruments",
    w13: "Week 13: Data Collection Procedure",
    w14: "Week 14: Statistical Analysis Plan",
    w15: "Week 15: Ethical Aspects and Scientific Rigor",
    w16: "Week 16: Anteproject Consolidated Draft and Annexes"
  } : {
    w1: "Semana 1: Realidad Problemática y Contextualización",
    w2: "Semana 2: Formulación de Preguntas (General y Específicas)",
    w3: "Semana 3: Objetivos e Hipótesis de Investigación",
    w4: "Semana 4: Justificación e Importancia del Estudio",
    w5: "Semana 5: Antecedentes Internacionales y Nacionales",
    w6: "Semana 6: Bases Teóricas y Definición de Constructos",
    w7: "Semana 7: Definición Conceptual y Operacional de Variables",
    w8: "Semana 8: Enfoque, Alcance y Diseño Metodológico",
    w9: "Semana 9: Población, Muestra y Muestreo",
    w10: "Semana 10: Criterios de Inclusión y Exclusión",
    w11: "Semana 11: Selección y Adaptación de Instrumentos",
    w12: "Semana 12: Validez y Confiabilidad de Instrumentos",
    w13: "Semana 13: Procedimiento de Recolección de Datos",
    w14: "Semana 14: Plan de Análisis Estadístico",
    w15: "Semana 15: Aspectos Éticos y Rigor Científico",
    w16: "Semana 16: Consolidados y Anexos del Anteproyecto"
  };

  const docChildren = [];

  // CABECERA INSTITUCIONAL
  docChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "UNIVERSIDAD SEÑOR DE SIPÁN", bold: true, size: 28, color: "0A2540", font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: isEn 
          ? "VICE-RECTORATE FOR RESEARCH · PROYECTO TESIS SUITE" 
          : "VICERRECTORADO DE INVESTIGACIÓN · SUITE PROYECTO TESIS", 
        size: 16, color: "64748B", font: "Arial" 
      })],
      space: { after: 100 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ 
        text: isEn 
          ? "CONSOLIDATED PROGRESS, EPISTEMOLOGICAL AUDIT & SCOPUS EVIDENCE REPORT" 
          : "INFORME CONSOLIDADO DE AVANCE, AUDITORÍA EPISTEMOLÓGICA Y EVIDENCIA SCOPUS", 
        bold: true, size: 20, color: "C5A059", font: "Arial" 
      })],
      space: { after: 300 }
    })
  );

  // SECCIÓN 1: DATOS DEL INVESTIGADOR
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "1. Researcher Information and Academic Affiliation" : "1. Datos del Investigador y Afiliación Académica", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: mainBorders,
      rows: [
        new TableRow({ children: [createStyledCell(isEn ? "Student / Researcher" : "Estudiante / Investigador", true, 35), createStyledCell(student.nombre, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "USS Faculty" : "Facultad USS", true, 35), createStyledCell(student.facultad, false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Professional School / Graduate" : "Escuela Profesional / Posgrado", true, 35), createStyledCell(student.escuela, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "Class Section / Program" : "Sección / Programa", true, 35), createStyledCell(student.seccion, false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Research Title / Manuscript" : "Título de la Investigación", true, 35), createStyledCell(student.titulo, false, 65)] })
      ]
    }),
    new Paragraph({ text: "", space: { after: 250 } })
  );

  // SECCIÓN 2: MÉTRICAS Y RESUMEN EJECUTIVO
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "2. Executive Summary Metrics and Progress" : "2. Resumen Ejecutivo de Métricas y Progreso", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: mainBorders,
      rows: [
        new TableRow({
          children: [
            createStyledCell(isEn ? "Coherence Chain" : "Cadena de Coherencia", true, 25),
            createStyledCell(isEn ? "Scopus PDFs Loaded" : "PDFs Scopus Cargados", true, 25),
            createStyledCell(isEn ? "Total Drafted Words" : "Total Palabras Redactadas", true, 25),
            createStyledCell(isEn ? "Estimated Progress" : "Avance Estimado", true, 25)
          ]
        }),
        new TableRow({
          children: [
            createStyledCell(isEn ? `${okCount} of 6 Links OK` : `${okCount} de 6 Eslabones OK`, false, 25, "F8FAFC", AlignmentType.CENTER),
            createStyledCell(isEn ? `${pdfSources.length} articles` : `${pdfSources.length} artículos`, false, 25, "FFFFFF", AlignmentType.CENTER),
            createStyledCell(isEn ? `${totalWords} words` : `${totalWords} palabras`, false, 25, "F8FAFC", AlignmentType.CENTER),
            createStyledCell(`${Math.round((draftedSections / 16) * 100)}%`, false, 25, "FFFFFF", AlignmentType.CENTER)
          ]
        })
      ]
    }),
    new Paragraph({ text: "", space: { after: 250 } })
  );

  // SECCIÓN 3: NÚCLEO Y COHERENCIA EPISTEMOLÓGICA
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "3. Core Elements Matrix (Epistemological Coherence Thread)" : "3. Matriz de Elementos Núcleo (Hilo de Coherencia Epistemológica)", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: mainBorders,
      rows: [
        new TableRow({ children: [createStyledCell(isEn ? "Variable 1 (Associated / IV)" : "Variable 1 (Asociada / VI)", true, 35), createStyledCell(project.v1, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "Variable 2 (Outcome / DV)" : "Variable 2 (Resultado / VD)", true, 35), createStyledCell(project.v2, false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Population and Scope" : "Población y Ámbito", true, 35), createStyledCell(`${project.pob || "—"} ${isEn ? "in" : "en"} ${project.amb || "—"} (${project.per || "—"})`, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "Methodological Approach" : "Enfoque Metodológico", true, 35), createStyledCell(project.enf ? project.enf.toUpperCase() : "—", false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Scope and Design" : "Alcance y Diseño", true, 35), createStyledCell(project.dis ? project.dis.toUpperCase() : "—", false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "General Question" : "Pregunta General", true, 35), createStyledCell(project.preg, false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Main Theory" : "Teoría Principal", true, 35), createStyledCell(project.teo, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "General Objective" : "Objetivo General", true, 35), createStyledCell(project.obj, false, 65, "F8FAFC")] }),
        new TableRow({ children: [createStyledCell(isEn ? "Alternative Hypothesis, Hi" : "Hipótesis Alterna, Hi", true, 35), createStyledCell(project.hip, false, 65)] }),
        new TableRow({ children: [createStyledCell(isEn ? "Measurement Instruments" : "Instrumentos de Medición", true, 35), createStyledCell(`V1: ${project.i1 || "—"} | V2: ${project.i2 || "—"}`, false, 65, "F8FAFC")] })
      ]
    }),
    new Paragraph({ text: "", space: { after: 250 } })
  );

  // SECCIÓN 4: EVIDENCIA CIENTÍFICA Y ANTECEDENTES EXTRAÍDOS DE SCOPUS / WOS (CORREGIDO)
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "4. Extracted Scopus / WoS Scientific Evidence & Antecedents" : "4. Evidencia Científica y Antecedentes Extraídos de Scopus / WoS", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  if (pdfSources.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ 
          text: isEn ? "No Scopus/WoS PDF scientific articles imported into the manager." : "No se han importado artículos científicos en PDF de Scopus/WoS en el gestor de evidencia.", 
          italic: true, size: 18, font: "Arial" 
        })]
      })
    );
  } else {
    const pdfRows = [
      new TableRow({
        children: [
          createStyledCell(isEn ? "File / Source" : "Archivo / Fuente", true, 25),
          createStyledCell(isEn ? "Estimated Title" : "Título Estimado", true, 40),
          createStyledCell(isEn ? "Generated Citation (APA 7)" : "Cita Generada (APA 7)", true, 35)
        ]
      })
    ];

    pdfSources.forEach((src, i) => {
      // Búsqueda flexible de campos para garantizar el nombre exacto y la cita completa
      const fileName = src.filename || src.fileName || src.name || src.archivo || `PDF #${i + 1}`;
      const titleText = src.title || src.titulo || "—";
      const yearText = src.year || "2025";
      const citationText = src.apaCitation || src.citation || src.cita || (src.title ? `${titleText}. (${yearText}). Revista Científica Indizada Scopus / WoS.` : "—");

      pdfRows.push(
        new TableRow({
          children: [
            createStyledCell(fileName, false, 25, i % 2 === 0 ? "F8FAFC" : "FFFFFF"),
            createStyledCell(titleText, false, 40, i % 2 === 0 ? "F8FAFC" : "FFFFFF"),
            createStyledCell(citationText, false, 35, i % 2 === 0 ? "F8FAFC" : "FFFFFF")
          ]
        })
      );
    });

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: mainBorders,
        rows: pdfRows
      })
    );
  }

  docChildren.push(new Paragraph({ text: "", space: { after: 250 } }));

  // SECCIÓN 5: MARCO TEÓRICO
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "5. Theoretical Framework Rationale and Technical Sheet" : "5. Fundamentación y Ficha Técnica del Marco Teórico Seleccionado", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  if (assignedTheory) {
    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: mainBorders,
        rows: [
          new TableRow({ children: [createStyledCell(isEn ? "Theoretical Framework Name" : "Nombre del Marco Teórico", true, 35), createStyledCell(assignedTheory.nombre, false, 65)] }),
          new TableRow({ children: [createStyledCell(isEn ? "Author and Year" : "Autor y Año", true, 35), createStyledCell(`${assignedTheory.autor || '—'} (${assignedTheory.anio || '—'})`, false, 65, "F8FAFC")] }),
          new TableRow({ children: [createStyledCell(isEn ? "Core Postulate" : "Postulado Central", true, 35), createStyledCell(assignedTheory.postulado || assignedTheory.resumen, false, 65)] }),
          new TableRow({ children: [createStyledCell(isEn ? "Constructs / Dimensions" : "Constructos / Dimensiones", true, 35), createStyledCell(Array.isArray(assignedTheory.constructos) ? assignedTheory.constructos.join(", ") : (assignedTheory.constructos || "—"), false, 65, "F8FAFC")] }),
          new TableRow({ children: [createStyledCell(isEn ? "Theoretical Prediction" : "Predicción Teórica", true, 35), createStyledCell(assignedTheory.predice || "—", false, 65)] }),
          new TableRow({ children: [createStyledCell(isEn ? "Suggested Citation (APA 7)" : "Cita Sugerida (APA 7)", true, 35), createStyledCell(assignedTheory.ejemploCita || "—", false, 65, "F8FAFC")] }),
          new TableRow({ children: [createStyledCell(isEn ? "Full Reference" : "Referencia Completa", true, 35), createStyledCell(assignedTheory.ref || "—", false, 65)] })
        ]
      })
    );
  } else {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ 
          text: project.teo ? `${isEn ? "Declared theory" : "Teoría declarada"}: ${project.teo}` : (isEn ? "No theoretical framework selected in project." : "No se ha seleccionado una teoría en el proyecto."), 
          italic: true, size: 18, font: "Arial" 
        })]
      })
    );
  }

  docChildren.push(new Paragraph({ text: "", space: { after: 250 } }));

  // SECCIÓN 6: AUDITORÍA DE ESLABONES
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "6. Automated Epistemological Coherence Audit (6 Links)" : "6. Auditoría Autómata de Coherencia Epistemológica (6 Eslabones)", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  coherenceLinks.forEach(link => {
    const isOk = link.status === "ok";
    const isWarn = link.status === "warn";
    const badgeColor = isOk ? "059669" : isWarn ? "D97706" : "DC2626";
    const statusText = link.msg || (isOk ? (isEn ? "FIRME" : "FIRME") : isWarn ? (isEn ? "ADVERTENCIA" : "ADVERTENCIA") : (isEn ? "OBSERVADO" : "OBSERVADO"));

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${link.title}: `, bold: true, size: 18, font: "Arial" }),
          new TextRun({ text: `[${statusText.toUpperCase()}] — `, bold: true, color: badgeColor, size: 18, font: "Arial" }),
          new TextRun({ text: link.detail || "", size: 18, font: "Arial" })
        ],
        space: { after: 120 }
      })
    );
  });

  docChildren.push(new Paragraph({ text: "", space: { after: 250 } }));

  // SECCIÓN 7: BORRADORES REDACTADOS
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "7. Section Drafts (16-Week Route)" : "7. Borradores Redactados por Secciones (Ruta de 16 Semanas)", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  const draftKeys = Object.keys(drafts).filter(k => drafts[k] && drafts[k].trim());

  if (draftKeys.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ 
          text: isEn ? "No drafted sections registered in the workspace." : "No se registran borradores redactados en la estación de trabajo.", 
          italic: true, size: 18, font: "Arial" 
        })]
      })
    );
  } else {
    draftKeys.forEach(secId => {
      const text = drafts[secId];
      const title = weekTitles[secId] || `${isEn ? "Section" : "Sección"} ${secId.toUpperCase()}`;

      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: title, bold: true, size: 18, color: "C5A059", font: "Arial" })],
          space: { before: 100, after: 50 }
        }),
        new Paragraph({
          children: [new TextRun({ text: text, size: 18, font: "Arial" })],
          space: { after: 150 }
        })
      );
    });
  }

  docChildren.push(new Paragraph({ text: "", space: { after: 250 } }));

  // SECCIÓN 8: JURADO SIMULADO
  const juryEntries = log.filter(e => e.tipo === "jurado" || e.pregunta || e.foco || e.respuesta);

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "8. Oral Defense Logbook (Simulated Jury)" : "8. Bitácora de Sustentación Oral (Jurado Simulado)", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  if (juryEntries.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ 
          text: isEn ? "No simulated jury defense sessions recorded." : "No se registran simulaciones de sustentación con el jurado.", 
          italic: true, size: 18, font: "Arial" 
        })]
      })
    );
  } else {
    juryEntries.forEach((j, idx) => {
      const preg = j.pregunta || j.detalles || "—";
      const resp = j.respuesta || "—";
      const val = j.valoracion || (isEn ? "Evaluated" : "Evaluada");
      const plan = j.plan || "—";

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${isEn ? "Question" : "Pregunta"} ${idx + 1}: `, bold: true, size: 18, color: "0A2540", font: "Arial" }),
            new TextRun({ text: preg, size: 18, font: "Arial" })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${isEn ? "Formulated response: " : "Respuesta formulada: "}`, bold: true, size: 18, font: "Arial" }),
            new TextRun({ text: resp, size: 18, font: "Arial" }),
            new TextRun({ text: ` [${isEn ? "Assessment" : "Valoración"}: ${val}]`, bold: true, color: "059669", size: 18, font: "Arial" })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${isEn ? "Reinforcement plan: " : "Plan de refuerzo: "}`, bold: true, italic: true, size: 18, font: "Arial" }),
            new TextRun({ text: plan, italic: true, size: 18, font: "Arial" })
          ],
          space: { after: 150 }
        })
      );
    });
  }

  docChildren.push(new Paragraph({ text: "", space: { after: 250 } }));

  // SECCIÓN 9: BITÁCORA DE DECLARACIÓN DE IA Y GOBERNANZA
  const aiEntries = log.filter(e => e.tipo === "ia" || e.herramienta || e.dictamen || e.tool || e.sec);

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "9. Generative Artificial Intelligence Usage Logbook" : "9. Bitácora de Declaración de Inteligencia Artificial Generativa", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    })
  );

  if (aiEntries.length === 0) {
    docChildren.push(
      new Paragraph({
        children: [new TextRun({ 
          text: isEn ? "No AI log interactions recorded during this session." : "No se registran interacciones en la bitácora de IA durante la sesión.", 
          italic: true, size: 18, font: "Arial" 
        })]
      })
    );
  } else {
    aiEntries.forEach((entry, idx) => {
      const fecha = entry.fecha || entry.timestamp || new Date().toLocaleDateString(isEn ? "en-US" : "es-PE");
      const seccion = entry.seccion || entry.sec || (isEn ? "Writing Station" : "Estación de Redacción");
      const herramienta = entry.herramienta || entry.tool || "ChatGPT (OpenAI)";
      const dictamen = entry.dictamen || entry.dec || (isEn ? "Audited" : "Auditado");
      const decision = entry.decision || entry.why || (isEn ? "Dictamen processed and incorporated." : "Dictamen procesado e incorporado.");

      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${isEn ? "Record" : "Registro"} #${idx + 1} (${fecha}): `, bold: true, size: 18, font: "Arial" }),
            new TextRun({ text: `${isEn ? "Section" : "Sección"}: ${seccion} | ${isEn ? "Tool" : "Herramienta"}: ${herramienta} | ${isEn ? "Status" : "Dictamen"}: `, size: 18, font: "Arial" }),
            new TextRun({ text: `${dictamen}`, bold: true, color: "059669", size: 18, font: "Arial" })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `${isEn ? "Decision" : "Decisión"}: ${decision}`, italic: true, size: 18, font: "Arial" })
          ],
          space: { after: 120 }
        })
      );
    });
  }

  docChildren.push(new Paragraph({ text: "", space: { after: 300 } }));

  // SECCIÓN 10: ANEXO 5 DE DECLARACIÓN JURADA
  const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "es-PE", { year: "numeric", month: "long", day: "numeric" });

  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ 
        text: isEn ? "10. Annex 5: Sworn Declaration on AI Usage (USS Format)" : "10. Anexo 5: Declaración Jurada de Uso de IA (Formato USS)", 
        bold: true, size: 22, color: "0A2540", font: "Arial" 
      })],
      space: { after: 150 }
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [
        new TextRun({
          text: isEn
            ? `I, ${student.nombre || "________________________________________"}, student of ${student.escuela || "____________________"} at Señor de Sipán University, declare under oath that:`
            : `Yo, ${student.nombre || "________________________________________"}, estudiante de ${student.escuela || "____________________"} de la Universidad Señor de Sipán, declaro bajo juramento que:`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 120 }
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [
        new TextRun({
          text: isEn
            ? `1. I have used Generative Artificial Intelligence tools (ChatGPT, OpenAI) exclusively as tutoring, methodological review, and coherence audit support for drafting my research project entitled: "${student.titulo || "________________________________________________________________________________________"}".`
            : `1. He utilizado herramientas de Inteligencia Artificial Generativa (ChatGPT, OpenAI) exclusivamente como soporte de tutoría, revisión metodológica y auditoría de coherencia para la redacción de mi proyecto de investigación titulado: "${student.titulo || "________________________________________________________________________________________"}".`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 100 }
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [
        new TextRun({
          text: isEn
            ? `2. The AI tool did not write final paragraphs nor generate fictitious empirical data, findings, or bibliographic references. Its role was limited to evaluating compliance with the methodological manual criteria.`
            : `2. La herramienta de IA no redactó párrafos finales ni generó datos empíricos, hallazgos o referencias bibliográficas ficticias. Su función se limitó a la evaluación contra los criterios del manual metodológico.`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 100 }
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [
        new TextRun({
          text: isEn
            ? `3. A total of ${log.length} audit interactions were conducted and recorded in the Proyecto Tesis suite logbook.`
            : `3. Se realizaron un total de ${log.length} interacciones de auditoría registradas en la bitácora de la suite Proyecto Tesis.`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 100 }
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFY,
      children: [
        new TextRun({
          text: isEn
            ? `4. All cited sources have been verified in their original texts, assuming full intellectual and ethical responsibility for all presented content.`
            : `4. Todas las fuentes citadas han sido verificadas en sus textos originales, asumiendo la responsabilidad intelectual y ética sobre la totalidad del contenido presentado.`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 200 }
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `Chiclayo, ${dateStr}.`,
          size: 18,
          font: "Arial"
        })
      ],
      space: { after: 400 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: isEn 
            ? "__________________________________________\nStudent / Researcher Signature\nID / USS Code: ________________________"
            : "__________________________________________\nFirma del Estudiante / Investigador\nDNI / Código USS: ________________________",
          size: 18,
          font: "Arial"
        })
      ]
    })
  );

  const doc = new Document({
    sections: [{ children: docChildren }]
  });

  const blob = await Packer.toBlob(doc);
  const studentSlug = getCleanStudentFilename(student.nombre, isEn);
  
  const fileName = isEn 
    ? `Thesis_Project_Report_${studentSlug}.docx` 
    : `Informe_ProyectoTesis_${studentSlug}.docx`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportStateToJSON(state) {
  const isEn = state?.lang === "en";
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const studentSlug = getCleanStudentFilename(state?.student?.nombre, isEn);
  
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  
  const jsonName = isEn 
    ? `ProyectoTesis_Backup_${studentSlug}.json` 
    : `Respaldo_ProyectoTesis_${studentSlug}.json`;

  dlAnchor.setAttribute("download", jsonName);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
}

export function importStateFromJSON(file, onSuccess, onError) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (onSuccess) onSuccess(parsed);
    } catch (err) {
      if (onError) onError("El archivo seleccionado no tiene un formato JSON válido.");
    }
  };
  reader.readAsText(file);
}