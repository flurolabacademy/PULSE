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
  
  // Convertir tabla markdown a HTML si existe
  const htmlContent = convertMarkdownToHtml(content);
  
  result.innerHTML = `<div style="overflow-x: auto;">${htmlContent}</div>`;
}

// Función principal: convierte markdown a HTML visual
function convertMarkdownToHtml(markdown) {
  // Si es tabla markdown (contiene |)
  if (markdown.includes('|') && markdown.includes('\n')) {
    return markdownTableToHtml(markdown);
  }
  
  // Si es lista numerada con formato específico
  if (markdown.includes('Nicho:') || markdown.includes('Sub-nicho:')) {
    return nichesListToHtml(markdown);
  }
  
  // Default: texto plano con formato
  return `<pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">${markdown}</pre>`;
}

// Convertir tabla markdown a HTML
function markdownTableToHtml(markdown) {
  const lines = markdown.split('\n').filter(line => line.trim());
  let html = '<table class="markdown-table"><thead>';
  let isHeader = true;
  
  lines.forEach((line) => {
    // Saltar líneas separadoras (---)
    if (line.match(/^\|?[\s\-:|]+\|?$/)) return;
    
    const cells = line.split('|').filter(cell => cell.trim());
    if (cells.length === 0) return;
    
    const tag = isHeader ? 'th' : 'td';
    if (isHeader) {
      html += '<tr>';
      cells.forEach(cell => {
        html += `<${tag}>${cell.trim()}</${tag}>`;
      });
      html += '</tr></thead><tbody>';
      isHeader = false;
    } else {
      html += '<tr>';
      cells.forEach((cell, index) => {
        const cleanCell = cell.trim();
        // Aplicar badges según contenido
        let styledCell = cleanCell;
        
        if (index === 2) { // Dificultad
          if (cleanCell.toLowerCase().includes('baja')) {
            styledCell = `<span class="difficulty-low">${cleanCell}</span>`;
          } else if (cleanCell.toLowerCase().includes('media')) {
            styledCell = `<span class="difficulty-medium">${cleanCell}</span>`;
          } else if (cleanCell.toLowerCase().includes('alta')) {
            styledCell = `<span class="difficulty-high">${cleanCell}</span>`;
          }
        }
        
        if (index === 3) { // Potencial
          if (cleanCell.toLowerCase().includes('alto')) {
            styledCell = `<span class="potential-high">${cleanCell}</span>`;
          } else if (cleanCell.toLowerCase().includes('medio')) {
            styledCell = `<span class="potential-medium">${cleanCell}</span>`;
          } else if (cleanCell.toLowerCase().includes('bajo')) {
            styledCell = `<span class="potential-low">${cleanCell}</span>`;
          }
        }
        
        html += `<${tag}>${styledCell}</${tag}>`;
      });
      html += '</tr>';
    }
  });
  
  html += '</tbody></table>';
  return html;
}

// Convertir lista de nichos a cards HTML
function nichesListToHtml(markdown) {
  const items = markdown.split(/\n(?=\d+\.|\-)/).filter(item => item.trim());
  
  let html = '<div class="niches-list">';
  
  items.forEach(item => {
    const lines = item.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    let title = '';
    let sub = '';
    let difficulty = '';
    let potential = '';
    let why = '';
    
    lines.forEach(line => {
      if (line.match(/^\d+\./)) {
        title = line.replace(/^\d+\.\s*/, '').trim();
      } else if (line.includes('Sub-nicho:')) {
        sub = line.replace('Sub-nicho:', '').trim();
      } else if (line.includes('Dificultad:')) {
        difficulty = line.replace('Dificultad:', '').trim();
      } else if (line.includes('Potencial:')) {
        potential = line.replace('Potencial:', '').trim();
      } else if (line.includes('Por qué:') || line.includes('Por qué funciona:')) {
        why = line.replace(/Por qué.*?:/, '').trim();
      }
    });
    
    // Badge classes
    let diffClass = 'difficulty-medium';
    if (difficulty.toLowerCase().includes('baja')) diffClass = 'difficulty-low';
    if (difficulty.toLowerCase().includes('alta')) diffClass = 'difficulty-high';
    
    let potClass = 'potential-medium';
    if (potential.toLowerCase().includes('alto')) potClass = 'potential-high';
    if (potential.toLowerCase().includes('bajo')) potClass = 'potential-low';
    
    html += `
      <div class="niche-card">
        <div class="niche-card-header">
          <span class="niche-card-title">${title}</span>
        </div>
        <div class="niche-card-sub">${sub}</div>
        <div class="niche-card-meta">
          <span class="${diffClass}">${difficulty}</span>
          <span class="${potClass}">${potential}</span>
        </div>
        ${why ? `<div class="niche-card-why">${why}</div>` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  return html;
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
