// js/app.js — PULSE para Vercel (api/ en lugar de netlify/functions)

// Variables globales
let currentEbookContent = '';
let currentEbookTitle = '';

// === GENERAR EBOOK ===
document.getElementById('ebookForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const topic = document.getElementById('topic').value;
  const niche = document.getElementById('niche').value;
  const pages = document.getElementById('pages').value;
  const tone = document.getElementById('tone').value;
  
  // Mostrar loading
  showLoading('ebookSection', 'loading');
  
  try {
    const response = await fetch('/api/generate-ebook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, niche, pages, tone })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentEbookContent = data.content;
      currentEbookTitle = data.title;
      
      showResult('ebookSection', 'loading', 'result', data.content, data.title);
    } else {
      showError('ebookSection', 'loading', data.error);
    }
  } catch (error) {
    showError('ebookSection', 'loading', error.message);
  }
});

// === GENERAR TITULOS ===
document.getElementById('titlesForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const topic = document.getElementById('titleTopic').value;
  
  showLoading('titlesSection', 'loadingTitles');
  
  try {
    const response = await fetch('/api/generate-titles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic, niche: 'general' })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showTextResult('titlesSection', 'loadingTitles', 'titlesResult', data.titles);
    } else {
      showError('titlesSection', 'loadingTitles', data.error);
    }
  } catch (error) {
    showError('titlesSection', 'loadingTitles', error.message);
  }
});

// === GENERAR NICHOS ===
document.getElementById('nichesForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const category = document.getElementById('nicheCategory').value;
  
  showLoading('nichesSection', 'loadingNiches');
  
  try {
    const response = await fetch('/api/generate-niches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ category, count: 20 })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showTextResult('nichesSection', 'loadingNiches', 'nichesResult', data.niches);
    } else {
      showError('nichesSection', 'loadingNiches', data.error);
    }
  } catch (error) {
    showError('nichesSection', 'loadingNiches', error.message);
  }
});

// === FUNCIONES AUXILIARES ===

function showLoading(sectionId, loadingId) {
  const section = document.getElementById(sectionId);
  const loading = document.getElementById(loadingId);
  const results = section.querySelectorAll('.pulse-result');
  
  loading.classList.remove('hidden');
  results.forEach(r => r.classList.add('hidden'));
}

function showResult(sectionId, loadingId, resultId, content, title) {
  const loading = document.getElementById(loadingId);
  const result = document.getElementById(resultId);
  const textarea = result.querySelector('textarea');
  const titleEl = result.querySelector('#resultTitle');
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
  
  if (titleEl) titleEl.textContent = title || 'Ebook generado';
  if (textarea) textarea.value = content;
}

function showTextResult(sectionId, loadingId, resultId, content) {
  const loading = document.getElementById(loadingId);
  const result = document.getElementById(resultId);
  
  loading.classList.add('hidden');
  result.classList.remove('hidden');
  result.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">${content}</pre>`;
}

function showError(sectionId, loadingId, message) {
  const loading = document.getElementById(loadingId);
  loading.classList.add('hidden');
  alert('Error: ' + message);
}

// === COPIAR CONTENIDO ===
function copyContent() {
  const textarea = document.getElementById('resultContent');
  textarea.select();
  document.execCommand('copy');
  
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = '✅ Copiado';
  setTimeout(() => btn.textContent = originalText, 2000);
}

// === GENERAR PDF ===
function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Portada
  doc.setFillColor(255, 107, 157);
  doc.rect(0, 0, 210, 297, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(currentEbookTitle || 'Ebook PULSE', 105, 100, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Creado con PULSE', 105, 120, { align: 'center' });
  doc.text('danieldosantoslibertad.com', 105, 130, { align: 'center' });
  
  // Contenido
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  
  const content = document.getElementById('resultContent').value;
  const lines = doc.splitTextToSize(content, 150); // Márgenes más grandes
  
  let y = 20;
  const lineHeight = 6;
  const pageHeight = 280;
  
  for (let i = 0; i < lines.length; i++) {
    if (y > pageHeight) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines[i], 15, y);
    y += lineHeight;
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`PULSE | Daniel Dosantos Libertad | Pagina ${i}`, 105, 290, { align: 'center' });
  }
  
  doc.save(`${(currentEbookTitle || 'ebook').replace(/\s+/g, '_')}.pdf`);
}
