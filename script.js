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

// PDF + TXT upload & preview
const fileUpload = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');
const pdfContainer = document.getElementById('pdfContainer');
const downloadPdf = document.getElementById('downloadPdf');

fileUpload.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;

  // TXT file preview
  if(file.type==='text/plain'){
    const reader = new FileReader();
    reader.onload = ()=>{
      const pre = document.createElement('pre');
      pre.textContent = reader.result;
      fileContent.innerHTML='';
      pdfContainer.style.display='none';
      downloadPdf.style.display='none';
      fileContent.appendChild(pre);
    }
    reader.readAsText(file);

  // PDF file preview
  } else if(file.type==='application/pdf'){
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:pdfData}).promise;

    fileContent.innerHTML='';
    pdfContainer.innerHTML='';
    pdfContainer.style.display='block';

    for(let pageNum=1; pageNum<=pdf.numPages; pageNum++){
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({scale:1.2});
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({canvasContext: context, viewport: viewport}).promise;
      pdfContainer.appendChild(canvas);
    }

    const fileURL = URL.createObjectURL(file);
    downloadPdf.href = fileURL;
    downloadPdf.style.display='inline';

  } else {
    fileContent.innerHTML='Only .txt and .pdf files are supported';
    pdfContainer.style.display='none';
    downloadPdf.style.display='none';
  }
});

function saveNote() {
  const textarea = document.getElementById("noteInput");
  const text = textarea.value.trim();
  if (text !== "") {
    const li = document.createElement("li");

    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.marginRight = "8px";

    // Note text
    const span = document.createElement("span");
    span.textContent = text;

    li.appendChild(checkbox);
    li.appendChild(span);

    document.getElementById("notesList").appendChild(li);
    textarea.value = "";
  }
}

function deleteSelected() {
  const list = document.getElementById("notesList");
  const items = list.querySelectorAll("li");

  items.forEach(li => {
    const checkbox = li.querySelector("input[type=checkbox]");
    if (checkbox && checkbox.checked) {
      list.removeChild(li);
    }
  });
}
