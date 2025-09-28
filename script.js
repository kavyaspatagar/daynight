// Toggle Mode
const toggle = document.getElementById('modeToggle');
const body = document.body;

// Load saved mode
if (localStorage.getItem('dayNight:isNight') === 'true') {
  body.classList.add('dark');
  toggle.classList.add('on');
}

toggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  toggle.classList.toggle('on');
  localStorage.setItem('dayNight:isNight', body.classList.contains('dark'));
});

// File Upload
const fileInput = document.getElementById('fileInput');
const pdfContainer = document.getElementById('pdfContainer');
const textPreview = document.getElementById('textPreview');
const downloadLink = document.getElementById('downloadPdf');

fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  pdfContainer.innerHTML = '';
  textPreview.textContent = '';
  downloadLink.style.display = 'none';

  const fileURL = URL.createObjectURL(file);

  if (file.type === 'application/pdf') {
    renderPDF(fileURL);

    // Show download button
    downloadLink.href = fileURL;
    downloadLink.download = file.name;
    downloadLink.style.display = 'inline-block';
  } 
  else if (file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = (e) => {
      textPreview.textContent = e.target.result;
    };
    reader.readAsText(file);
  }
});

// Render PDF with PDF.js
async function renderPDF(url) {
  const pdf = await pdfjsLib.getDocument(url).promise;
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const scale = pdfContainer.clientWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;
    pdfContainer.appendChild(canvas);

    await page.render({
      canvasContext: context,
      viewport: scaledViewport
    }).promise;
  }
}

// Notes saving
const saveBtn = document.getElementById('saveNote');
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');

saveBtn.addEventListener('click', () => {
  const note = noteInput.value.trim();
  if (!note) return;
  const li = document.createElement('li');
  li.textContent = note;
  notesList.appendChild(li);
  noteInput.value = '';
});
