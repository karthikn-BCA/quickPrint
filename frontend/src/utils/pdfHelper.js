import * as pdfjsLib from 'pdfjs-dist';

// Use standard CDN or worker fallback so no external file bundling is required
if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Reads a File object in the browser and determines its exact page count.
 * @param {File} file
 * @returns {Promise<number>}
 */
export async function detectPdfPages(file) {
  if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
    return 1;
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const pages = pdf.numPages;
    return pages && pages > 0 ? pages : 1;
  } catch (err) {
    console.warn('[PDF Detection] Client-side fallback:', err.message);
    return 1;
  }
}
