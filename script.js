/* Toggle styling */
.toggle {
  display:inline-flex;
  align-items:center;
  gap:12px;
  padding:8px 16px;
  border-radius:999px;
  background:var(--card);
  border: 1px solid rgba(0,0,0,0.05);
}
.switch {
  width:54px; height:30px; border-radius:999px; position:relative;
  background:rgba(0,0,0,0.06);
  transition: all 220ms ease;
  box-shadow: inset 0 -3px 6px rgba(0,0,0,0.06);
}
.knob {
  width:24px; height:24px; border-radius:50%;
  position:absolute; top:3px; left:3px;
  background:white; transition: all 220ms ease;
  box-shadow:0 4px 10px rgba(2,6,23,0.12);
}
.switch.on { background: var(--accent); }
.switch.on .knob { left:27px; background: white; }

/* Notes & upload */
textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}
button {
  padding: 8px 16px;
  background: var(--accent);
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
button:hover { opacity: 0.9; }
ul { text-align: left; padding-left: 20px; }
pre { white-space: pre-wrap; background: var(--card); padding: 10px; border-radius: 8px; }

/* PDF canvas */
#pdfContainer canvas {
  width: 100% !important; /* responsive */
  border-radius: 6px;
  margin-bottom: 10px;
}

// ---------------- Day/Night Toggle ----------------
(function(){
  const switchEl = document.getElementById('switch');
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

// ---------------- Notes Logic ----------------
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

// ---------------- File Upload Logic (TXT + PDF.js) ----------------
const fileUpload = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');
const pdfContainer = document.getElementById('pdfViewer');
const downloadPdf = document.getElementById('downloadPdf');

fileUpload.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;

  fileContent.innerHTML = '';
  pdfContainer.innerHTML = '';
  pdfContainer.style.display = 'none';
  downloadPdf.style.display = 'none';

  if(file.type==='text/plain'){
    const reader = new FileReader();
    reader.onload = ()=>{
      const pre = document.createElement('pre');
      pre.textContent = reader.result;
      fileContent.appendChild(pre);
    }
    reader.readAsText(file);

  } else if(file.type==='application/pdf'){
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:pdfData}).promise;

    pdfContainer.style.display='block';

    const containerWidth = pdfContainer.clientWidth;

    for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({scale:1});
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({scale});

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = scaledViewport.height;
      canvas.width = scaledViewport.width;

      await page.render({canvasContext: context, viewport: scaledViewport}).promise;
      pdfContainer.appendChild(canvas);
    }

    const fileURL = URL.createObjectURL(file);
    downloadPdf.href = fileURL;
    downloadPdf.style.display='inline';
  } else {
    fileContent.innerHTML='Only .txt and .pdf files are supported';
  }
});
