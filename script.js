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
const noteInput = document.getElementById("noteInput");
const notesList = document.getElementById("notesList");

// Load saved notes
function loadNotes(){
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notesList.innerHTML = "";
  notes.forEach(noteObj => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.style.marginRight = "8px";

    const span = document.createElement("span");
    span.textContent = noteObj.text;

    li.appendChild(checkbox);
    li.appendChild(span);
    notesList.appendChild(li);
  });
}

function saveNote() {
  const text = noteInput.value.trim();
  if (text !== "") {
    const notes = JSON.parse(localStorage.getItem("notes") || "[]");
    notes.push({ text });
    localStorage.setItem("notes", JSON.stringify(notes));
    noteInput.value = "";
    loadNotes();
  }
}

function deleteSelected() {
  let notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const items = notesList.querySelectorAll("li");
  const updatedNotes = [];

  items.forEach((li, index) => {
    const checkbox = li.querySelector("input[type=checkbox]");
    if (!(checkbox && checkbox.checked)) {
      updatedNotes.push(notes[index]); // keep unchecked notes
    }
  });

  localStorage.setItem("notes", JSON.stringify(updatedNotes));
  loadNotes();
}

loadNotes(); // initial load

// PDF + TXT upload & preview
const fileUpload = document.getElementById('fileUpload');
const fileContent = document.getElementById('fileContent');
const pdfContainer = document.getElementById('pdfContainer');
const downloadPdf = document.getElementById('downloadPdf');

fileUpload.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;

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
