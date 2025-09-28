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
    // Keep the title static
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

// File upload logic (TXT + PDF)
const fileUpload = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');
const pdfViewer = document.getElementById('pdfViewer');
const downloadPdf = document.getElementById('downloadPdf');

fileUpload.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;

  if(file.type==='text/plain'){
    const reader = new FileReader();
    reader.onload = ()=>{
      const pre = document.createElement('pre');
      pre.textContent = reader.result;
      fileContent.innerHTML='';
      pdfViewer.style.display='none';
      downloadPdf.style.display='none';
      fileContent.appendChild(pre);
    }
    reader.readAsText(file);

  } else if(file.type==='application/pdf'){
    const reader = new FileReader();
    reader.onload = function(e){
      const blob = new Blob([e.target.result], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(blob);

      if(window.innerWidth > 768){ // Desktop preview
        pdfViewer.src = fileURL;
        pdfViewer.style.display='block';
        fileContent.innerHTML='';
      } else { // Mobile
        pdfViewer.style.display='none';
        fileContent.innerHTML = 'PDF ready. Click "Download PDF" to view.';
      }

      downloadPdf.href = fileURL;
      downloadPdf.style.display='inline';
    };
    reader.readAsArrayBuffer(file);

  } else {
    fileContent.innerHTML='Only .txt and .pdf files are supported';
    pdfViewer.style.display='none';
    downloadPdf.style.display='none';
  }
});