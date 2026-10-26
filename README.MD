# 🎓 Laboratorio del Anteproyecto

[![Licencia MIT](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Estado](https://img.shields.io/badge/Estado-Activo-brightgreen.svg)]()
[![Idioma](https://img.shields.io/badge/Idioma-ES%20%2F%20EN-blue.svg)]()

> **Plataforma web multidisciplinaria para el diseño metodológico, auditoría de coherencia científica, gestión de marcos teóricos por facultades y simulación de sustentaciones orales.**

---

## 📑 Tabla de Contenidos

- [📌 Visión General](#-visión-general)
- [✨ Estaciones Metodológicas](#-estaciones-metodológicas)
  - [1. 🔗 Hilo de Coherencia Metodológica](#1--hilo-de-coherencia-metodológica)
  - [2. ✍️ Estación de Redacción (Ruta de 16 Semanas)](#2--estación-de-redacción-ruta-de-16-semanas)
  - [3. 📚 Marcos Teóricos por Facultad](#3--marcos-teóricos-por-facultad)
  - [4. ⚖️ Jurado Simulado (Sustentación Oral)](#4--jurado-simulado-sustentación-oral)
  - [5. 📋 Bitácora e Informe Consolidado](#5--bitácora-e-informe-consolidado)
- [🌐 Sistema Bilingüe e Integración con IA](#-sistema-bilingüe-e-integración-con-ia)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [📂 Arquitectura y Estructura del Proyecto](#-arquitectura-y-estructura-del-proyecto)
- [🚀 Instalación y Uso Local](#-instalación-y-uso-local)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 📌 Visión General

El **Laboratorio del Anteproyecto** es un entorno interactivo y bilingüe (**Español / Inglés**) desarrollado para guiar a estudiantes e investigadores de nivel universitario y posgrado en la estructuración, redacción y defensa de anteproyectos de tesis e investigación científica.

La plataforma integra herramientas de análisis visual de flujo, auditoría lógica asistida por Inteligencia Artificial (Tutor IA / ChatGPT) y un motor de exportación ejecutiva a documentos editables Word (`.docx`), garantizando la trazabilidad y la alineación lógica entre el problema, los objetivos, la teoría y la metodología.

---

## ✨ Estaciones Metodológicas

La plataforma está estructurada en **5 módulos interactivos** accesibles desde la barra de navegación principal:

### 1. 🔗 Hilo de Coherencia Metodológica
* **Matriz de Núcleo Temático:** Configuración dinámica de Variables, Población, Ámbito, Periodo, Enfoque (Cuantitativo, Cualitativo, Mixto), Alcance y Diseño.
* **Auditoría Automática de 6 Eslabones:** Evaluación reactiva del grado de alineación entre la pregunta de investigación, la teoría principal, el objetivo general, la hipótesis y los instrumentos.
* **Diagrama Sankey de Trazabilidad:** Visualización interactiva que muestra la conservación de flujo desde el Nivel Macro (Variables) hasta el Nivel Micro (Ítems e Indicadores) con renderizado seguro SVG.
* **Generador de Prompts IA:** Creación automatizada de prompts estructurados en formato JSON optimizados para auditar la coherencia global en ChatGPT o Claude.

### 2. ✍️ Estación de Redacción (Ruta de 16 Semanas)
* **Navegación Guiada:** Planificador semanal estructurado para redactar progresivamente el Planteamiento del Problema y el Marco Metodológico.
* **Modelos y Plantillas:** Fórmulas de redacción, secuencias de párrafos y ejemplos anotados por tipo de estudio.
* **Lienzo de Redacción:** Editor con persistencia de datos local en el navegador (`LocalStorage`).
* **Checklists de Calidad Metodológica:** Criterios de autoevaluación paso a paso.
* **Calibración de Dictámenes IA:** Lector automatizado de respuestas para clasificar observaciones en criterios Cumplidos (`C`), Parciales (`P`) o No Cumplidos (`N`).

### 3. 📚 Marcos Teóricos por Facultad
* **Catálogo Multidisciplinario:** Base de datos de teorías y modelos conceptuales clasificados por facultades (Salud, Ingeniería, Empresariales, Derecho y Humanidades).
* **Recomendador Inteligente:** Sugerencia de modelos teóricos según las variables de estudio ingresadas.
* **Gestor de Teorías Personalizadas:** Módulo para incorporar marcos teóricos específicos adaptados por el investigador.
* **Asistente de Búsqueda IA:** Generación dinámica de prompts bilingües para consultar bibliografía no catalogada.

### 4. ⚖️ Jurado Simulado (Sustentación Oral)
* **Simulador de Defensa:** Entrenamiento mediante rondas de preguntas según áreas específicas del anteproyecto (Planteamiento, Marco Teórico, Metodología, Instrumentos o Coherencia General).
* **Modalidades de Evaluación:** Selección entre modo *Formativo* (orientador) o modo *Exigente* (tribunal de grado).
* **Bitácora de Sustentación:** Registro sistemático de interrogantes, respuestas, nivel de solidez demostrado y plan de mejora pre-defensa.

### 5. 📋 Bitácora e Informe Consolidado
* **Mapa de Calor (*Heatmap*):** Diagnóstico visual del nivel de avance en la redacción a lo largo de las 16 semanas.
* **Declaración de Uso de IA (Anexo 5):** Generación automática del borrador normativo de transparencia en el uso de herramientas conversacionales.
* **Respaldo Local JSON:** Exportación e importación completa del estado del proyecto para trabajar entre distintos dispositivos.
* **Exportador Nativo a Word (`.docx`):** Descarga del informe final bilingüe con tablas formateadas, auditoría de eslabones y registros de bitácora.

---

## 🌐 Sistema Bilingüe e Integración con IA

* **Conmutador Reactivo (ES / EN):** Cambio instantáneo de idioma desde el encabezado mediante cookies nativas de Google Translate (`googtrans`), manipulación del atributo `lang` en el DOM y lógica personalizada en JavaScript.
* **Prompts de IA Adaptativos:** Todas las consultas enviadas a ChatGPT traducen dinámicamente sus metadatos, instrucciones y rúbricas al idioma seleccionado.
* **Reportes Adaptativos:** La exportación a `.docx` genera automáticamente encabezados, estados y tablas en el idioma activo.

---

## 🛠️ Tecnologías Utilizadas

| Componente | Tecnología | Descripción / Uso |
| :--- | :--- | :--- |
| **Frontend Base** | HTML5 / JS (ES Modules) | Arquitectura modular orientada a eventos sin dependencias de frameworks pesados |
| **Estilos UI** | Tailwind CSS (via CDN) | Diseño responsivo, sistema de grid y soporte nativo para modo oscuro |
| **Tipografía** | Google Fonts | *Plus Jakarta Sans*, *Source Sans 3* e *IBM Plex Mono* para alta legibilidad |
| **Iconografía** | Lucide Icons | Conjunto de íconos vectoriales modernos e intuitivos |
| **Visualización** | Google Charts API | Motor para el renderizado dinámico del Diagrama Sankey |
| **Exportación** | Docx.js (v8.5.0 UMD) | Librería del cliente para estructurar y descargar reportes `.docx` |
| **Traducción** | Google Translate Element API | Motor principal para la internacionalización reactiva |

---

## 📂 Arquitectura y Estructura del Proyecto

```text
├── index.html                  # Interfaz principal SPA (Single Page Application)
├── css/
│   ├── custom.css              # Estilos personalizados y componentes de UI
│   └── variables.css           # Variables globales de diseño (colores, fuentes, sombras)
├── js/
│   ├── app.js                  # Módulo principal y orquestador del estado global
│   ├── aiPrompts.js            # Generador de prompts bilingües para ChatGPT/IA
│   ├── coherenceChain.js       # Evaluador de la cadena de coherencia metodológica
│   ├── i18n.js                 # Diccionario y traducciones locales de la interfaz
│   ├── jurySimulator.js        # Lógica del módulo Jurado Simulado
│   ├── logAndReport.js         # Lógica del informe consolidado y mapa de calor
│   ├── reportExporter.js       # Motor de exportación a documentos Word (.docx) y JSON
│   ├── sankeyChart.js          # Lógica de renderizado del diagrama Sankey
│   ├── sectionStudio.js        # Editor y navegador de la ruta de 16 semanas
│   └── theoriesEngine.js       # Buscador y recomendador de marcos teóricos
└── data/
    ├── facultiesData.js        # Catálogo de facultades y escuelas profesionales
    ├── modelsData.js           # Plantillas y fórmulas de redacción metodológica
    ├── sectionsData.js         # Estructura de las 16 semanas y rúbricas
    └── theoriesData.js         # Base de datos de teorías y modelos conceptuales
```

---

## 🚀 Instalación y Uso Local

No se requiere de un entorno Node.js o proceso de compilación previo, ya que el proyecto utiliza módulos nativos de JavaScript (ES Modules) y Tailwind via CDN.

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/laboratorio-anteproyecto.git
   ```

2. **Acceder al directorio:**
   ```bash
   cd laboratorio-anteproyecto
   ```

3. **Ejecutar la aplicación:**
   * **Opción A (Servidor Local - Recomendado):** Abre el directorio en VS Code y utiliza la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
   * **Opción B (Servidor Python):**
     ```bash
     python -m http.server 8000
     ```
     Luego abre `http://localhost:8000` en tu navegador.
   * **Opción C (Directo en navegador):** Abre el archivo `index.html` haciendo doble clic sobre él.

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Si deseas aportar nuevas teorías al catálogo, sugerir mejoras metodológicas o reportar un error:

1. Haz un **Fork** del repositorio.
2. Crea una rama para tu contribución (`git checkout -b feature/NuevaFuncion`).
3. Realiza los cambios y confirma los cambios (`git commit -m 'Añade nueva funcionalidad'`).
4. Envía los cambios a tu repositorio remoto (`git push origin feature/NuevaFuncion`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Consulta el archivo `LICENSE` para más información.