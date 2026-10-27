/**
 * Proyecto Tesis - Base de Datos de Descriptores y Tesauro Controlado (UNESCO / IEEE / MeSH / ERIC)
 * Archivo: data/tesauroData.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

export const TESAURO_CATEGORIES = [
  { id: "f-salud", nombre: "Ciencias de la Salud", fuentesDefault: ["UNESCO", "MeSH"] },
  { id: "f-ingenieria", nombre: "Ingeniería, Arquitectura y Urbanismo", fuentesDefault: ["IEEE", "UNESCO"] },
  { id: "f-empresariales", nombre: "Ciencias Empresariales", fuentesDefault: ["UNESCO", "JEL"] },
  { id: "f-derecho", nombre: "Derecho y Humanidades", fuentesDefault: ["UNESCO", "ERIC"] }
];

export const TESAURO_DATA = [
  // ==========================================
  // FACULTAD DE CIENCIAS DE LA SALUD
  // ==========================================
  {
    id: "th_sal_01",
    termino: "Adherencia al Tratamiento",
    termino_en: "Medication Adherence",
    fuente: "MeSH / UNESCO",
    codigo: "3201.01",
    facultad: "f-salud",
    escuelas: ["Enfermería", "Medicina Humana"],
    categoria: "Ciencias Médicas y Salud Pública",
    terminos_relacionados: ["Cumplimiento del Tratamiento", "Conducta de Salud", "Autoeficacia"],
    teorias_asociadas: ["Modelo de Creencias en Salud (Rosenstock & Becker)", "Teoría de la Conducta Planificada (Ajzen)"],
    sugerencias_medicion: "Escala de Morisky-Green (MMAS-8), Test de Haynes-Sackett."
  },
  {
    id: "th_sal_02",
    termino: "Síndrome de Burnout",
    termino_en: "Burnout, Professional",
    fuente: "MeSH / UNESCO",
    codigo: "6102.04",
    facultad: "f-salud",
    escuelas: ["Psicología", "Enfermería"],
    categoria: "Psicología Clínica y Salud Ocupacional",
    terminos_relacionados: ["Agotamiento Emocional", "Despersonalización", "Estrés Laboral"],
    teorias_asociadas: ["Modelo Tridimensional de Burnout (Maslach & Jackson)", "Teoría de la Conservación de Recursos (Hobfoll)"],
    sugerencias_medicion: "Maslach Burnout Inventory (MBI-HSS, MBI-GS)."
  },
  {
    id: "th_sal_03",
    termino: "Salud Bucal y Calidad de Vida",
    termino_en: "Oral Health-Related Quality of Life",
    fuente: "MeSH",
    codigo: "3203.02",
    facultad: "f-salud",
    escuelas: ["Estomatología"],
    categoria: "Odontología y Salud Comunitaria",
    terminos_relacionados: ["Indice OHIP", "Caries Dental", "Enfermedad Periodontal"],
    teorias_asociadas: ["Modelo Socio-Dental de Salud Bucal (Locker)"],
    sugerencias_medicion: "Cuestionario OHIP-14 (Oral Health Impact Profile)."
  },

  // ==========================================
  // FACULTAD DE INGENIERÍA, ARQUITECTURA Y URBANISMO
  // ==========================================
  {
    id: "th_ing_01",
    termino: "Inteligencia Artificial en Educación",
    termino_en: "Artificial Intelligence in Education",
    fuente: "IEEE",
    codigo: "CS-EDU-01",
    facultad: "f-ingenieria",
    escuelas: ["Ingeniería de Sistemas"],
    categoria: "Ciencias de la Computación",
    terminos_relacionados: ["Aprendizaje Automático", "Sistemas Tutores Inteligentes", "Analítica del Aprendizaje"],
    teorias_asociadas: ["Modelo de Aceptación de Tecnología (TAM - Davis)", "Teoría Cognitiva del Aprendizaje Multimedia (Mayer)"],
    sugerencias_medicion: "Cuestionario TAM de Aceptación Tecnológica (12 ítems)."
  },
  {
    id: "th_ing_02",
    termino: "Hormigón de Alta Resistencia y Sostenibilidad",
    termino_en: "High-Strength Sustainable Concrete",
    fuente: "IEEE / UNESCO",
    codigo: "3305.02",
    facultad: "f-ingenieria",
    escuelas: ["Ingeniería Civil"],
    categoria: "Ingeniería Estructural y Materiales",
    terminos_relacionados: ["Resistencia a la Compresión", "Aditivos Puzolánicos", "Matriz del Hormigón"],
    teorias_asociadas: ["Teoría de Mecánica de Materiales Continuos", "Criterios de Sostenibilidad de Materiales (ACI 318)"],
    sugerencias_medicion: "Ensayos de rotura a la compresión ASTM C39 a los 7, 14 y 28 días."
  },
  {
    id: "th_ing_03",
    termino: "Optimización de Procesos Logísticos",
    termino_en: "Supply Chain Optimization",
    fuente: "IEEE / UNESCO",
    codigo: "3313.01",
    facultad: "f-ingenieria",
    escuelas: ["Ingeniería Industrial"],
    categoria: "Ingeniería de Producción y Operaciones",
    terminos_relacionados: ["Gestión de Inventarios", "Lean Manufacturing", "Cadena de Suministro"],
    teorias_asociadas: ["Teoría de Restricciones (TOC - Goldratt)", "Modelo SCOR (Supply Chain Operations Reference)"],
    sugerencias_medicion: "Indicadores Clave de Desempeño (KPIs de Rotación y Tiempo de Ciclo)."
  },

  // ==========================================
  // FACULTAD DE CIENCIAS EMPRESARIALES
  // ==========================================
  {
    id: "th_emp_01",
    termino: "Calidad de Vida Laboral y Desempeño",
    termino_en: "Quality of Working Life and Performance",
    fuente: "UNESCO / JEL",
    codigo: "6114.02",
    facultad: "f-empresariales",
    escuelas: ["Administración", "Gestión del Talento"],
    categoria: "Comportamiento Organizacional",
    terminos_relacionados: ["Clima Organizacional", "Satisfacción Laboral", "Compromiso Organizacional"],
    teorias_asociadas: ["Teoría Bifactorial de Motivación-Higiene (Herzberg)", "Modelo de Características del Puesto (Hackman & Oldham)"],
    sugerencias_medicion: "Escala CVT-GOHISALO o Cuestionario de Clima Organizacional Litwin & Stringer."
  },
  {
    id: "th_emp_02",
    termino: "Nivel de Morosidad y Liquidez Financiera",
    termino_en: "Non-Performing Loans and Liquidity",
    fuente: "JEL / UNESCO",
    codigo: "5311.02",
    facultad: "f-empresariales",
    escuelas: ["Contabilidad", "Finanzas"],
    categoria: "Análisis Financiero y Gestión del Crédito",
    terminos_relacionados: ["Riesgo Crediticio", "Capital de Trabajo", "Ratios de Liquidez"],
    teorias_asociadas: ["Teoría de las Finanzas Corporativas (Modigliani-Miller)", "Teoría del Riesgo de Crédito"],
    sugerencias_medicion: "Ficha de Análisis Documentario de Estados Financieros (Ratios Acid Test, Rotación de Cartera)."
  },
  {
    id: "th_emp_03",
    termino: "Marketing Digital y Fidelización del Cliente",
    termino_en: "Digital Marketing and Customer Retention",
    fuente: "UNESCO",
    codigo: "5311.05",
    facultad: "f-empresariales",
    escuelas: ["Negocios Internacionales", "Administración"],
    categoria: "Comercialización y Comercio Electrónico",
    terminos_relacionados: ["Engagement en Redes Sociales", "Valor del Cliente (CLV)", "Inbound Marketing"],
    teorias_asociadas: ["Teoría del Valor Percibido (Kotler)", "Modelo AIDA (Atención, Interés, Deseo, Acción)"],
    sugerencias_medicion: "Escala SERVQUAL adaptada al entorno web o Cuestionario Net Promoter Score (NPS)."
  },

  // ==========================================
  // FACULTAD DE DERECHO Y HUMANIDADES
  // ==========================================
  {
    id: "th_der_01",
    termino: "Gobernanza Digital y Derechos Fundamentales",
    termino_en: "Digital Governance and Fundamental Rights",
    fuente: "UNESCO / ERIC",
    codigo: "5902.05",
    facultad: "f-derecho",
    escuelas: ["Derecho"],
    categoria: "Derecho Constitucional y Nuevas Tecnologías",
    terminos_relacionados: ["Protección de Datos Personales", "Habeas Data", "Ciberderecho"],
    teorias_asociadas: ["Teoría Garantista del Derecho (Ferrajoli)", "Teoría de los Derechos Fundamentales (Alexy)"],
    sugerencias_medicion: "Guía de Análisis Jurisprudencial y Ficha Hermenéutica Sustantiva."
  },
  {
    id: "th_der_02",
    termino: "Desempeño Docente y Competencias Digitales",
    termino_en: "Teacher Performance and Digital Skills",
    fuente: "ERIC / UNESCO",
    codigo: "5801.03",
    facultad: "f-derecho",
    escuelas: ["Educación Inicial", "Educación Primaria"],
    categoria: "Investigación Educativa y Pedagogía",
    terminos_relacionados: ["Competencia Digital Docente", "Estrategia Didáctica", "Evaluación Formativa"],
    teorias_asociadas: ["Teoría del Aprendizaje Socio-Constructivista (Vygotsky)", "Modelo TPACK (Mishra & Koehler)"],
    sugerencias_medicion: "Cuestionario DigCompEdu o Rúbrica de Desempeño Docente Minedu."
  },
  {
    id: "th_der_03",
    termino: "Consumo de Medios Digitales e Identidad Cultural",
    termino_en: "Digital Media Consumption and Cultural Identity",
    fuente: "UNESCO",
    codigo: "5901.01",
    facultad: "f-derecho",
    escuelas: ["Ciencias de la Comunicación"],
    categoria: "Comunicación Social y Cultura Digital",
    terminos_relacionados: ["Prosumidores", "Redes Sociales", "Narrativas Transmedia"],
    teorias_asociadas: ["Teoría de los Usos y Gratificaciones (Katz & Blumler)", "Teoría de la Mediatización (Verón)"],
    sugerencias_medicion: "Escala de Hábitos de Consumo Mediático y Ficha de Análisis de Contenido Transmedia."
  }
];