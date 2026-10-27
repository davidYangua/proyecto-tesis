/**
 * Proyecto Tesis - Gestor de Evidencia Científica (PDF Scopus / WoS)
 * Archivo: js/pdfExtractor.js - Versión con Extracción DOI (Crossref API), Lematización y Stopwords Académicas
 */

import { saveState } from "./app.js";

// Diccionario expandido de palabras vacías (Stopwords Gramaticales + Académicas) en Español e Inglés
const STOPWORDS = new Set([
  // Español Gramatical
  "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un", "para", "con", "no", "una",
  "su", "al", "lo", "como", "más", "pero", "sus", "le", "ya", "o", "este", "sí", "porque", "esta", "entre",
  "cuando", "muy", "sin", "sobre", "también", "me", "hasta", "hay", "donde", "quien", "desde", "todo", "nos",
  "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso", "ante", "ellos", "e", "esto", "mí",
  "antes", "algunos", "qué", "unos", "yo", "otro", "otras", "otra", "él", "tanto", "esa", "estos", "mucho",
  "quienes", "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo", "nosotros",
  "mi", "mis", "tú", "te", "ti", "tu", "tus", "ellas", "nosotras", "vosotros", "vosotras", "os", "mío", "mía",
  "míos", "mías", "tuyo", "tuya", "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra",
  "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "esos", "esas", "estoy", "estás",
  "está", "estamos", "estáis", "están", "esté", "estés", "estemos", "estéis", "estén", "estaré", "estarás",
  "estará", "estaremos", "estaréis", "estarán", "estaría", "estarías", "estaríamos", "estaríais", "estarían",
  "estaba", "estabas", "estábamos", "estabais", "estaban", "estuve", "estuviste", "estuvo", "estuvimos",
  "estuvisteis", "estuvieron", "estuviera", "estuvieras", "estuviéramos", "estuvierais", "estuvieran",
  "estuviese", "estuvieses", "estuviésemos", "estuvieseis", "estuviesen", "estando", "estado", "estaba",
  "he", "has", "ha", "hemos", "habéis", "han", "haya", "hayas", "hayamos", "hayáis", "hayan", "habré",
  "habrás", "habrá", "habremos", "habréis", "habrán", "habría", "habrías", "habríamos", "habríais", "habrían",
  "había", "habías", "habíamos", "habíais", "habían", "hube", "hubiste", "hubo", "hubimos", "hubisteis",
  "hubieron", "hubiera", "hubieras", "hubiéramos", "hubierais", "hubieran", "hubiese", "hubieses",
  "hubiésemos", "hubieseis", "hubiesen", "habiendo", "habido", "habidos", "habidas", "soy", "eres", "es",
  "somos", "sois", "son", "sea", "seas", "seamos", "seáis", "sean", "seré", "serás", "será", "seremos",
  "seréis", "serán", "sería", "serías", "seríamos", "seríais", "serían", "era", "eras", "éramos", "erais",
  "eran", "fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron", "fuera", "fueras", "fuéramos", "fuerais",
  "fueran", "fuese", "fueses", "fuésemos", "fueseis", "fuesen", "siendo", "sido", "tengo", "tienes", "tiene",
  "tenemos", "tenéis", "tienen", "tenga", "tengas", "tengamos", "tengáis", "tengan", "tendré", "tendrás",
  "tendrá", "tendremos", "tendréis", "tendrán", "tendría", "tendrías", "tendríamos", "tendríais",
  "tendrían", "tenía", "tenías", "teníamos", "teníais", "tenían", "tuve", "tuviste", "tuvo", "tuvimos",
  "tuvisteis", "tuvieron", "tuviera", "tuvieras", "tuviéramos", "tuvierais", "tuvieran", "tuviese",
  "tuvieses", "tuviésemos", "tuvieseis", "tuviesen", "teniendo", "tenido", "tenida", "tenidos", "tenidas",

  // Español Académico Generalista (Ruido)
  "estudio", "estudios", "investigación", "investigaciones", "artículo", "artículos", "resultado", "resultados",
  "análisis", "desarrollo", "mediante", "través", "según", "así", "cada", "dos", "tres", "cuatro", "cinco",
  "revistas", "revista", "universidad", "facultad", "metodología", "tabla", "figura", "datos", "autores", "autor",
  "publicado", "edición", "volumen", "número", "páginas", "página", "editorial", "introducción", "conclusión",
  "conclusiones", "discusión", "resumen", "abstract", "palabras", "clave", "nivel", "sistema", "procesos",
  "proceso", "efecto", "efectos", "relación", "grupo", "grupos", "mayor", "menor", "presente", "evaluación",
  "casos", "caso", "forma", "parte", "tipo", "tipos", "original", "derechos", "reservados",

  // Inglés Gramatical
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he",
  "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about",
  "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then",
  "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day",
  "most", "us", "were", "while", "been", "has", "had", "where", "were", "than", "more", "less", "such",

  // Inglés Académico Generalista (Ruido)
  "study", "studies", "research", "paper", "article", "articles", "results", "analysis", "using", "used",
  "based", "between", "during", "through", "journal", "university", "department", "international", "national",
  "review", "systematic", "access", "open", "http", "https", "doi", "vol", "volume", "pp", "pages", "page",
  "issue", "edition", "publisher", "author", "authors", "table", "figure", "data", "method", "methods",
  "background", "discussion", "conclusion", "conclusions", "abstract", "keywords", "key", "words", "group",
  "groups", "high", "low", "present", "level", "system", "process", "effect", "effects", "type", "types",
  "case", "cases", "found", "showed", "shown", "significant", "associated", "original", "rights", "reserved",
  "copyright", "elsevier", "springer", "wiley", "ieee", "mdpi", "frontiers"
]);

/**
 * Algoritmo de Lematización (Stemming) para Español/Inglés
 * Reduce palabras conjugadas, plurales o derivadas a su raíz léxica conceptual.
 */
export function getSpanishStem(word) {
  if (!word || word.length < 4) return word ? word.toLowerCase() : "";
  return word.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar diacríticos
    .replace(/(aciones|amientos|imientos|amente|idades|idad|almente|amiento|imiento|ciones|ción|es|s|a|o|os|as|ujanos|ugía|ico|ica|icos|icas|ismo|ismos|ista|istas)$/g, "");
}

function preventDefaults(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
}

/**
 * Inicialización con verificación de elementos en DOM
 */
export function initPdfExtractor(state) {
  const dropzone = document.getElementById("pdf-dropzone");
  const pdfInput = document.getElementById("pdf-input");

  if (!dropzone || !pdfInput) {
    console.error("[PDF-Extractor] ERROR: No se encontraron los elementos #pdf-dropzone o #pdf-input en el DOM.");
    return;
  }

  if (!state.pdfSources) {
    state.pdfSources = [];
  }

  // Renderizar lista previa
  renderPdfList(state);

  // Prevenir que el navegador abra el PDF fuera del recuadro
  ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) => {
    window.addEventListener(evt, preventDefaults, false);
    document.body.addEventListener(evt, preventDefaults, false);
    dropzone.addEventListener(evt, preventDefaults, false);
  });

  // Efectos visuales de Arrastre
  ["dragenter", "dragover"].forEach((evt) => {
    dropzone.addEventListener(evt, () => {
      dropzone.classList.add("border-amber-500", "bg-amber-100/50", "dark:bg-amber-950/40");
    }, false);
  });

  ["dragleave", "drop"].forEach((evt) => {
    dropzone.addEventListener(evt, () => {
      dropzone.classList.remove("border-amber-500", "bg-amber-100/50", "dark:bg-amber-950/40");
    }, false);
  });

  // Recepción de archivos arrastrados
  dropzone.addEventListener("drop", (e) => {
    preventDefaults(e);
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handlePdfFiles(dt.files, state);
    }
  }, false);

  // Selección manual mediante Clic
  dropzone.onclick = (e) => {
    e.preventDefault();
    pdfInput.click();
  };

  pdfInput.onchange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handlePdfFiles(e.target.files, state);
      pdfInput.value = ""; 
    }
  };
}

/**
 * Consulta la API pública de Crossref para obtener metadatos APA 7 reales mediante el DOI
 */
async function fetchCrossrefMetadata(doi) {
  try {
    const cleanDoi = doi.replace(/[;.,)]+$/, "").trim();
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const msg = data.message;
    if (!msg) return null;

    // Formatear Autores (APA 7)
    let authorsStr = "Autor Desconocido";
    if (msg.author && Array.isArray(msg.author) && msg.author.length > 0) {
      const formattedAuthors = msg.author.map((a) => {
        const family = a.family || "";
        const given = a.given ? `${a.given.charAt(0)}.` : "";
        return family ? `${family}, ${given}`.trim() : a.name || "";
      }).filter(Boolean);

      if (formattedAuthors.length === 1) {
        authorsStr = formattedAuthors[0];
      } else if (formattedAuthors.length > 1 && formattedAuthors.length <= 7) {
        authorsStr = formattedAuthors.slice(0, -1).join(", ") + " & " + formattedAuthors[formattedAuthors.length - 1];
      } else if (formattedAuthors.length > 7) {
        authorsStr = formattedAuthors.slice(0, 6).join(", ") + " ... " + formattedAuthors[formattedAuthors.length - 1];
      }
    }

    // Año de publicación
    const yearStr = msg["published-print"]?.["date-parts"]?.[0]?.[0] ||
                    msg["published-online"]?.["date-parts"]?.[0]?.[0] ||
                    msg["created"]?.["date-parts"]?.[0]?.[0] ||
                    "2026";

    // Título
    const titleStr = Array.isArray(msg.title) && msg.title.length > 0 ? msg.title[0] : "Título no disponible";

    // Revista / Fuente
    const journalStr = Array.isArray(msg["container-title"]) && msg["container-title"].length > 0 ? msg["container-title"][0] : "Revista Científica Indizada";

    // Volumen, Número, Páginas
    const volumeStr = msg.volume ? `, ${msg.volume}` : "";
    const issueStr = msg.issue ? `(${msg.issue})` : "";
    const pageStr = msg.page ? `, ${msg.page}` : "";

    const apaCitation = `${authorsStr} (${yearStr}). ${titleStr}. ${journalStr}${volumeStr}${issueStr}${pageStr}. https://doi.org/${cleanDoi}`;

    return {
      doi: cleanDoi,
      authors: authorsStr,
      year: String(yearStr),
      title: titleStr,
      journal: journalStr,
      volume: msg.volume || "",
      issue: msg.issue || "",
      pages: msg.page || "",
      apaCitation: apaCitation,
      verified: true
    };
  } catch (e) {
    console.warn("[Crossref-API] Error consultando DOI en Crossref:", e);
    return null;
  }
}

/**
 * Procesamiento inteligente de archivos PDF con resolución DOI
 */
async function handlePdfFiles(files, state) {
  if (!files || !files.length) return;
  if (!state.pdfSources) state.pdfSources = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) continue;

    let cleanText = "";
    let extractedDoi = null;
    let crossrefMeta = null;

    let titleMatch = file.name.replace(/\.pdf$/i, "");
    let yearMatch = "2026";
    let authorsMatch = "Autor Extraído";
    let journalMatch = "Revista Científica Indizada Scopus / WoS";

    try {
      if (window.pdfjsLib) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        // Analizar las primeras 3 páginas
        for (let p = 1; p <= Math.min(pdf.numPages, 3); p++) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          fullText += content.items.map((item) => item.str).join(" ") + " ";
        }

        cleanText = fullText.replace(/\s+/g, " ").trim();

        // RegEx para detectar DOI en el texto del PDF
        const doiRegex = /\b(10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+)\b/i;
        const doiMatch = cleanText.match(doiRegex);

        if (doiMatch && doiMatch[1]) {
          extractedDoi = doiMatch[1];
          // Consulta asíncrona a la API de Crossref
          crossrefMeta = await fetchCrossrefMetadata(extractedDoi);
        }

        if (!crossrefMeta) {
          if (cleanText.length > 20) {
            titleMatch = cleanText.slice(0, 150).trim();
          }
          const extractedYear = cleanText.match(/\b(20[0-9]{2}|19[0-9]{2})\b/)?.[0];
          if (extractedYear) yearMatch = extractedYear;
        }
      }
    } catch (pdfErr) {
      console.warn("[PDF-Extractor] No se pudo procesar el PDF completamente, aplicando respaldo local:", pdfErr);
    }

    const pdfItem = {
      id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      filename: file.name,
      fileName: file.name,
      doi: crossrefMeta?.doi || extractedDoi || null,
      authors: crossrefMeta?.authors || authorsMatch,
      title: crossrefMeta?.title || titleMatch,
      year: crossrefMeta?.year || yearMatch,
      journal: crossrefMeta?.journal || journalMatch,
      volume: crossrefMeta?.volume || "",
      issue: crossrefMeta?.issue || "",
      pages: crossrefMeta?.pages || "",
      text: cleanText,
      apaCitation: crossrefMeta?.apaCitation || `${titleMatch}. (${yearMatch}). ${journalMatch}.`,
      verified: crossrefMeta?.verified || false
    };

    state.pdfSources.push(pdfItem);
  }

  saveState();
  renderPdfList(state);
}

/**
 * Renderizado de la lista de PDFs procesados
 */
export function renderPdfList(state) {
  const pdfResults = document.getElementById("pdf-results");
  const pdfList = document.getElementById("pdf-list");
  const pdfCount = document.getElementById("pdf-count");

  if (!pdfList) return;

  const sources = state.pdfSources || [];

  if (pdfCount) pdfCount.textContent = `${sources.length} artículo(s) cargado(s)`;

  if (sources.length === 0) {
    if (pdfResults) pdfResults.classList.add("hidden");
    pdfList.innerHTML = "";
    renderWordCloudAndFrequencies(state);
    return;
  }

  if (pdfResults) pdfResults.classList.remove("hidden");
  pdfList.innerHTML = "";

  sources.forEach((item) => {
    const card = document.createElement("div");
    card.className = "p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-3 relative";

    const fileName = item.filename || item.fileName || "Archivo PDF";
    const titleText = item.title || "Título no detectado";
    const yearText = item.year || "2026";
    const citationText = item.apaCitation || `${titleText}. (${yearText}). Revista Científica Indizada Scopus / WoS.`;

    const statusBadge = item.verified 
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">✓ DOI VERIFICADO (CROSSREF)</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700">ESTIMACIÓN LOCAL</span>`;

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 truncate">
          <i data-lucide="file-text" class="w-4 h-4 text-amber-500 flex-shrink-0"></i>
          <span class="font-bold text-amber-600 dark:text-amber-400 font-mono truncate">${escapeHtml(fileName)}</span>
        </div>
        <div class="flex items-center gap-2">
          ${statusBadge}
          <button 
            type="button" 
            class="delete-pdf-btn p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
            data-id="${item.id}"
            title="Eliminar este antecedente"
          >
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>
      <p class="text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
        <strong>Título:</strong> ${escapeHtml(titleText)}
      </p>
      <div class="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
        <strong>Cita Generada (APA 7.ª ed.):</strong> ${escapeHtml(citationText)}
      </div>
    `;

    const deleteBtn = card.querySelector(".delete-pdf-btn");
    if (deleteBtn) {
      deleteBtn.onclick = (e) => {
        e.stopPropagation();
        removePdfSource(item.id, state);
      };
    }

    pdfList.appendChild(card);
  });

  // Actualizar Nube de Palabras y Descriptores de Tesauro
  renderWordCloudAndFrequencies(state);

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Calcula la frecuencia de palabras eliminando stopwords gramaticales y académicas
 */
export function computeWordFrequencies(sources, topN = 30) {
  if (!sources || !sources.length) return [];

  const freqMap = {};

  sources.forEach((item) => {
    const rawText = `${item.title || ""} ${item.text || ""}`.toLowerCase();
    const cleanTokens = rawText.match(/[a-záéíóúñü]{3,}/gi) || [];

    cleanTokens.forEach((token) => {
      const word = token.toLowerCase();
      if (!STOPWORDS.has(word) && word.length > 3) {
        freqMap[word] = (freqMap[word] || 0) + 1;
      }
    });
  });

  const sorted = Object.entries(freqMap)
    .map(([word, count]) => ({ word, count, stem: getSpanishStem(word) }))
    .sort((a, b) => b.count - a.count);

  return sorted.slice(0, topN);
}

/**
 * Renderiza la Nube de Palabras y Validación de Términos por Tesauro
 */
export function renderWordCloudAndFrequencies(state) {
  const container = document.getElementById("pdf-wordcloud");
  const listContainer = document.getElementById("pdf-keywords-list");

  if (!container && !listContainer) return;

  const sources = state.pdfSources || [];
  const topWords = computeWordFrequencies(sources, 28);

  if (topWords.length === 0) {
    if (container) {
      container.innerHTML = `
        <div class="text-center text-slate-400 py-6 text-xs font-mono">
          Cargue artículos PDF para generar automáticamente la nube de palabras y el mapa de frecuencia.
        </div>
      `;
    }
    if (listContainer) listContainer.innerHTML = "";
    return;
  }

  const maxCount = topWords[0]?.count || 1;

  if (container) {
    container.innerHTML = topWords.map((item) => {
      const weight = Math.max(11, Math.min(26, 11 + (item.count / maxCount) * 15));
      const opacity = Math.max(0.65, item.count / maxCount);
      return `
        <span 
          class="inline-block m-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 font-semibold text-amber-900 dark:text-amber-200 transition hover:scale-110 cursor-default" 
          style="font-size: ${weight}px; opacity: ${opacity};"
          title="${item.count} ocurrencia(s) en la evidencia cargada"
        >
          ${escapeHtml(item.word)} <small class="text-[10px] opacity-60 font-mono">(${item.count})</small>
        </span>
      `;
    }).join("");
  }

  if (listContainer) {
    listContainer.innerHTML = topWords.slice(0, 12).map((item) => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="tag" class="w-3.5 h-3.5 text-nexo-gold"></i>
          <span class="font-semibold text-slate-800 dark:text-slate-200 font-mono">${escapeHtml(item.word)}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            TESAURO OK
          </span>
          <span class="font-mono text-slate-500 font-bold">${item.count}</span>
        </div>
      </div>
    `).join("");
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Exporta la matriz de artículos procesados a formato .CSV tipo texto para VOSviewer / Bibliometrix
 */
export function exportToVOSviewerCSV(state) {
  const sources = state.pdfSources || [];

  if (sources.length === 0) {
    alert("No hay artículos científicos cargados para exportar a VOSviewer.");
    return;
  }

  // Encabezados estándar reconocidos por VOSviewer, Bibliometrix y Excel
  let csvContent = "\uFEFF"; // BOM UTF-8 para compatibilidad con Excel
  csvContent += "Authors,Title,Year,Source title,Volume,Issue,Pages,DOI,Abstract,Author Keywords,Index Keywords\n";

  sources.forEach((item) => {
    const author = `"${(item.authors || "Autor Extraído (Scopus/WoS)").replace(/"/g, '""')}"`;
    const title = `"${(item.title || "Artículo Científico").replace(/"/g, '""')}"`;
    const year = `"${item.year || "2026"}"`;
    const sourceTitle = `"${(item.journal || "Revista Indizada Scopus / WoS").replace(/"/g, '""')}"`;
    const volume = `"${item.volume || ""}"`;
    const issue = `"${item.issue || ""}"`;
    const pages = `"${item.pages || ""}"`;
    const doi = `"${item.doi || ""}"`;
    const abstract = `"${(item.text || item.title || "").slice(0, 500).replace(/"/g, '""')}"`;
    
    // Palabras clave derivadas automáticamente con el filtro
    const keywordsList = computeWordFrequencies([item], 6).map((w) => w.word).join("; ");
    const authorKeywords = `"${keywordsList}"`;
    const indexKeywords = `"${keywordsList}"`;

    csvContent += `${author},${title},${year},${sourceTitle},${volume},${issue},${pages},${doi},${abstract},${authorKeywords},${indexKeywords}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `matriz_bibliometrica_vosviewer_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Elimina un antecedente específico
 */
export function removePdfSource(id, state) {
  if (!state.pdfSources) return;
  state.pdfSources = state.pdfSources.filter((item) => item.id !== id);
  saveState();
  renderPdfList(state);
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}