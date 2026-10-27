/**
 * Proyecto Tesis - Diagrama de Operacionalización y Conservación de Flujo (Matriz Sankey)
 * Archivo: js/sankeyChart.js
 * Autor / Dirección Metodológica: Ing. Percy Castro Mejía
 * Institución: Universidad Señor de Sipán
 */

let googleChartsLoaded = false;

/**
 * Carga asíncrona de la librería Google Charts (Sankey)
 */
function loadGoogleCharts() {
  return new Promise((resolve, reject) => {
    if (googleChartsLoaded || (window.google && window.google.visualization && window.google.visualization.Sankey)) {
      googleChartsLoaded = true;
      return resolve();
    }

    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://www.gstatic.com/charts/loader.js";
      script.onload = () => {
        window.google.charts.load("current", { packages: ["sankey"] });
        window.google.charts.setOnLoadCallback(() => {
          googleChartsLoaded = true;
          resolve();
        });
      };
      script.onerror = () => reject(new Error("No se pudo cargar Google Charts CDN"));
      document.head.appendChild(script);
    } else {
      window.google.charts.load("current", { packages: ["sankey"] });
      window.google.charts.setOnLoadCallback(() => {
        googleChartsLoaded = true;
        resolve();
      });
    }
  });
}

/**
 * Genera la matriz de relaciones [Origen, Destino, Peso] respetando la jerarquía Variable ➔ Dimensiones ➔ Ítems
 * @param {Object} state Estado global de la aplicación
 * @returns {Array<Array>} Filas de datos para el gráfico Sankey
 */
export function buildSankeyDataFromState(state = {}) {
  const project = state.project || {};
  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";

  const v1Name = project.v1 ? project.v1.trim() : (isEn ? "Variable 1" : "Variable 1");
  const v2Name = project.v2 ? project.v2.trim() : (isEn ? "Variable 2" : "Variable 2");

  // Parsear número total estimado de ítems o asignar pesos base
  const itemsV1Total = parseInt(project.i1, 10) || 12;
  const itemsV2Total = parseInt(project.i2, 10) || 12;

  // Estructura de dimensiones por variable (desagregación proporcional)
  const operData = project.operacionalizacion || {
    v1: {
      nombre: `V1: ${v1Name}`,
      dimensiones: [
        { nombre: `D1.1 (Cognitiva - ${v1Name})`, peso: Math.ceil(itemsV1Total * 0.4) },
        { nombre: `D1.2 (Procedimental - ${v1Name})`, peso: Math.floor(itemsV1Total * 0.35) },
        { nombre: `D1.3 (Actitudinal - ${v1Name})`, peso: Math.max(1, itemsV1Total - Math.ceil(itemsV1Total * 0.4) - Math.floor(itemsV1Total * 0.35)) }
      ]
    },
    v2: {
      nombre: `V2: ${v2Name}`,
      dimensiones: [
        { nombre: `D2.1 (Eficacia - ${v2Name})`, peso: Math.ceil(itemsV2Total * 0.5) },
        { nombre: `D2.2 (Eficiencia - ${v2Name})`, peso: Math.max(1, itemsV2Total - Math.ceil(itemsV2Total * 0.5)) }
      ]
    }
  };

  const rows = [];

  // Mapear Variable 1 ➔ Dimensiones ➔ Ítems / Indicadores
  if (operData.v1 && operData.v1.dimensiones) {
    operData.v1.dimensiones.forEach(dim => {
      const itemLabel = `${dim.peso} ${isEn ? 'Item(s)' : 'Ítem(s)'} [${dim.nombre.split(' ')[0]}]`;
      // Enlace 1: Variable ➔ Dimensión
      rows.push([operData.v1.nombre, dim.nombre, dim.peso]);
      // Enlace 2: Dimensión ➔ Indicadores / Ítems
      rows.push([dim.nombre, itemLabel, dim.peso]);
    });
  }

  // Mapear Variable 2 ➔ Dimensiones ➔ Ítems / Indicadores
  if (operData.v2 && operData.v2.dimensiones) {
    operData.v2.dimensiones.forEach(dim => {
      const itemLabel = `${dim.peso} ${isEn ? 'Item(s)' : 'Ítem(s)'} [${dim.nombre.split(' ')[0]}]`;
      // Enlace 1: Variable ➔ Dimensión
      rows.push([operData.v2.nombre, dim.nombre, dim.peso]);
      // Enlace 2: Dimensión ➔ Indicadores / Ítems
      rows.push([dim.nombre, itemLabel, dim.peso]);
    });
  }

  return rows;
}

/**
 * Renderiza el diagrama Sankey universal de operacionalización
 * @param {string|HTMLElement} containerSelector 
 * @param {Object} state 
 */
export async function renderSankeyChart(containerSelector, state = {}) {
  const container = typeof containerSelector === "string" 
    ? document.querySelector(containerSelector) 
    : containerSelector;

  if (!container) return;

  const isEn = (state.lang || window.proyectoTesisState?.lang) === "en";

  try {
    await loadGoogleCharts();

    const dataRows = buildSankeyDataFromState(state);

    if (!dataRows || dataRows.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs font-mono text-slate-400">
          ${isEn ? 'Enter variables in Module 01 to generate the operationalization matrix.' : 'Ingrese las variables en el Módulo 01 para visualizar la matriz de operacionalización.'}
        </div>
      `;
      return;
    }

    const dataTable = new window.google.visualization.DataTable();
    dataTable.addColumn("string", isEn ? "Source" : "Origen");
    dataTable.addColumn("string", isEn ? "Target" : "Destino");
    dataTable.addColumn("number", isEn ? "Items / Indicators Count" : "Cantidad de Ítems / Indicadores");
    dataTable.addRows(dataRows);

    const isDark = document.documentElement.classList.contains("dark");

    const options = {
      width: "100%",
      height: 320,
      sankey: {
        node: {
          colors: [
            "#0A2540", // USS Navy
            "#1E3A8A", // Deep Blue
            "#C5A059", // Gold
            "#059669", // Emerald
            "#0284C7", // Sky Blue
            "#D97706", // Amber
            "#6366F1"  // Indigo
          ],
          label: {
            fontName: "Inter, system-ui, sans-serif",
            fontSize: 11,
            color: isDark ? "#F8FAFC" : "#0F172A",
            bold: true
          },
          nodePadding: 18,
          width: 14,
          interactivity: true
        },
        link: {
          colorMode: "gradient",
          fillOpacity: isDark ? 0.4 : 0.25
        }
      }
    };

    container.innerHTML = "";
    const chart = new window.google.visualization.Sankey(container);
    chart.draw(dataTable, options);

  } catch (err) {
    console.error("Error al renderizar la Matriz Sankey:", err);
    container.innerHTML = `
      <div class="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-300">
        ${isEn ? 'Error generating operationalization chart.' : 'Error al generar el gráfico de operacionalización.'}
      </div>
    `;
  }
}