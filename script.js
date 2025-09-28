// Day/Night toggle logic
(function(){
  const switchEl = document.getElementById('switch');
  const title = document.getElementById('title');
  const metaTheme = document.getElementById('meta-theme-color');
  const STORAGE_KEY = 'dayNight:isNight';

  let isNight = localStorage.getItem(STORAGE_KEY) === '1' ||
                (localStorage.getItem(STORAGE_KEY) === null && window.matchMedia('(prefers-color-scheme: dark)').matches);

  function applyMode(night){
    if(night){
      document.body.classList.add('dark');
      switchEl.classList.add('on');
      switchEl.setAttribute('aria-checked','true');
      metaTheme.setAttribute('content','#071227');
    } else {
      document.body.classList.remove('dark');
      switchEl.classList.remove('on');
      switchEl.setAttribute('aria-checked','false');
      metaTheme.setAttribute('content','#ffffff');
    }
    title.textContent = 'Day Night Notes App';
    localStorage.setItem(STORAGE_KEY, night ? '1' : '0');
  }

  function toggle(){
    isNight = !isNight;
    applyMode(isNight);
  }

  switchEl.addEventListener('click', toggle);
  switchEl.addEventListener('keydown', e=>{
    if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }
  });

  applyMode(isNight);
})();

// Notes logic
const saveBtn = document.getElementById('saveNote');
const noteInput = document.getElementById('noteInput');
const notesList = document.getElementById('notesList');

function loadNotes(){
  const notes = JSON.parse(localStorage.getItem('notes')||'[]');
  notesList.innerHTML = '';
  notes.forEach(note=>{
    const li = document.createElement('li');
    li.textContent = note;
    notesList.appendChild(li);
  });
}
saveBtn.addEventListener('click', ()=>{
  const notes = JSON.parse(localStorage.getItem('notes')||'[]');
  if(noteInput.value.trim()!==''){
    notes.push(noteInput.value);
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    loadNotes();
  }
});
loadNotes();

// File upload logic (TXT + PDF using PDF.js)
const fileUpload = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');
const pdfCanvas = document.getElementById('pdfViewer');
const downloadPdf = document.getElementById('downloadPdf');

fileUpload.addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type === 'text/plain') {
    const reader = new FileReader();
    reader.onload = () => {
      const pre = document.createElement('pre');
      pre.textContent = reader.result;
      fileContent.innerHTML = '';
      pdfCanvas.style.display = 'none';
      downloadPdf.style.display = 'none';
      fileContent.appendChild(pre);
    };
    reader.readAsText(file);

  } else if (file.type === 'application/pdf') {
    const fileURL = URL.createObjectURL(file);
    downloadPdf.href = fileURL;
    downloadPdf.style.display = 'inline';
    fileContent.innerHTML = '';

    // Render PDF using PDF.js
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data: pdfData}).promise;

    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.2 });
    const context = pdfCanvas.getContext('2d');
    pdfCanvas.height = viewport.height;
    pdfCanvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    pdfCanvas.style.display = 'block';

  } else {
    fileContent.innerHTML = 'Only .txt and .pdf files are supported';
    pdfCanvas.style.display = 'none';
    downloadPdf.style.display = 'none';
  }
});
