/**
 * Proyecto Tesis - Generador de Esquema Dublin Core (XML)
 * Interoperabilidad para Repositorios Institucionales (DSpace / OJS / OAI-PMH)
 * Archivo: js/exportDublinCore.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

/**
 * Genera y descarga el esquema Dublin Core en XML a partir del estado de la aplicación
 * @param {Object} appState Estado global de Proyecto Tesis
 */
export function exportToDublinCoreXML(appState = {}) {
  const xmlContent = buildDublinCoreXML(appState);
  
  const studentName = appState.student?.nombre || "Estudiante_USS";
  const cleanSlug = studentName.trim().replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `dublin_core_${cleanSlug}_${Date.now()}.xml`;

  const blob = new Blob([xmlContent], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Construye la estructura de etiquetas del estándar Qualified Dublin Core / OAI-PMH
 * @param {Object} appState 
 * @returns {string} XML formateado
 */
export function buildDublinCoreXML(appState = {}) {
  const student = appState.student || {};
  const project = appState.project || {};
  const pdfSources = appState.pdfSources || [];
  const drafts = appState.drafts || {};

  const title = student.titulo || "Proyecto de Investigación Sin Título Registrado";
  const creator = student.nombre || "Autor Desconocido";
  const faculty = student.facultad || "Facultad No Específicada";
  const school = student.escuela || "Escuela Profesional No Especificada";
  const publisher = "Universidad Señor de Sipán";

  // Ensamblar Descriptores / Palabras Clave desde las Variables
  const keywords = [
    project.v1,
    project.v2,
    project.pob,
    project.amb,
    project.teo
  ].filter(Boolean).join("; ");

  // Descripción o Resumen Ejecutivo
  const description = project.preg 
    ? `Pregunta General de Investigación: ${project.preg} | Objetivo General: ${project.obj || 'No declarado'}`
    : "Anteproyecto y Protocolo de Investigación Científica.";

  const year = new Date().getFullYear().toString();
  const lang = appState.lang === "en" ? "en" : "es";

  // Identificar el tipo de documento según la sección de clase
  let docType = "info:eu-repo/semantics/bachelorThesis";
  if (student.seccion && student.seccion.toLowerCase().includes("maestría")) {
    docType = "info:eu-repo/semantics/masterThesis";
  } else if (student.seccion && student.seccion.toLowerCase().includes("doctorado")) {
    docType = "info:eu-repo/semantics/doctoralThesis";
  } else if (student.seccion && student.seccion.toLowerCase().includes("artículo")) {
    docType = "info:eu-repo/semantics/article";
  }

  // Estructura XML Dublin Core
  return `<?xml version="1.0" encoding="UTF-8"?>
<qualifieddc 
  xmlns:dc="http://purl.org/dc/elements/1.1/" 
  xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:doc="http://www.lyncode.com/xoai">

  <!-- METADATOS BÁSICOS DUBLIN CORE -->
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>${escapeXml(creator)}</dc:creator>
  <dc:publisher>${escapeXml(publisher)}</dc:publisher>
  <dc:publisher>${escapeXml(faculty)} - ${escapeXml(school)}</dc:publisher>
  <dc:date>${year}</dc:date>
  <dc:language>${lang}</dc:language>

  <!-- MATERIAS / PALABRAS CLAVE DEL TESAURO -->
  <dc:subject>${escapeXml(keywords)}</dc:subject>

  <!-- DESCRIPCIÓN EPISTEMOLÓGICA Y ALCANCE -->
  <dc:description>${escapeXml(description)}</dc:description>
  <dcterms:abstract>${escapeXml(project.obj || description)}</dcterms:abstract>

  <!-- ESPECIFICACIONES TÉCNICAS Y REPOSICIÓN INSTITUCIONAL -->
  <dc:type>${docType}</dc:type>
  <dc:format>application/pdf</dc:format>
  <dc:rights>info:eu-repo/semantics/openAccess</dc:rights>
  <dc:rights>Derechos reservados © ${year} ${escapeXml(publisher)}</dc:rights>

  <!-- ELEMENTOS DE EVIDENCIA CIENTÍFICA (SCOPUS / WOS) -->
  <dcterms:bibliographicCitation>${pdfSources.length} artículos científicos indizados en Scopus/WoS procesados en la matriz de evidencia.</dcterms:bibliographicCitation>
  
  <!-- TRAZABILIDAD Y COHERENCIA METODOLÓGICA -->
  <dcterms:provenance>Generado electrónicamente mediante Proyecto Tesis (Suite de Analítica Epistemológica, USS).</dcterms:provenance>
</qualifieddc>`;
}

/**
 * Escapa caracteres especiales para evitar errores de sintaxis en el archivo XML
 * @param {string} str 
 * @returns {string} Cadena segura en XML
 */
function escapeXml(str) {
  if (!str) return "";
  return str.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
}