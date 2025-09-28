// Day/Night toggle
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

  function toggle(){ isNight = !isNight; applyMode(isNight); }
  switchEl.addEventListener('click', toggle);
  switchEl.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggle(); }});
  applyMode(isNight);
})();

// Notes logic
const noteInput = document.getElementById("noteInput");
const notesList = document.getElementById("notesList");
const saveBtn = document.getElementById("saveNote");
const deleteBtn = document.getElementById("deleteNotes");

function loadNotes(){
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notesList.innerHTML = "";
  notes.forEach(note => {
    const li = document.createElement("li");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    const span = document.createElement("span");
    span.textContent = note;

    li.appendChild(checkbox);
    li.appendChild(span);
    notesList.appendChild(li);
  });
}

function saveNoteFunc(){
  const text = noteInput.value.trim();
  if(text === "") return;
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  notes.push(text);
  localStorage.setItem("notes", JSON.stringify(notes));
  noteInput.value = "";
  loadNotes();
}

function deleteSelected(){
  const notes = JSON.parse(localStorage.getItem("notes") || "[]");
  const items = notesList.querySelectorAll("li");
  const updatedNotes = [];
  items.forEach((li, index)=>{
    const checkbox = li.querySelector("input[type=checkbox]");
    if(!(checkbox && checkbox.checked)) updatedNotes.push(notes[index]);
  });
  localStorage.setItem("notes", JSON.stringify(updatedNotes));
  loadNotes();
}

saveBtn.addEventListener("click", saveNoteFunc);
deleteBtn.addEventListener("click", deleteSelected);
loadNotes();

// PDF + TXT upload
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
      fileContent.innerHTML=''; pdfContainer.style.display='none'; downloadPdf.style.display='none';
      fileContent.appendChild(pre);
    }
    reader.readAsText(file);

  } else if(file.type==='application/pdf'){
    const pdfData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({data:pdfData}).promise;
    fileContent.innerHTML=''; pdfContainer.innerHTML=''; pdfContainer.style.display='block';
    for(let i=1;i<=pdf.numPages;i++){
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({scale:1.2});
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height; canvas.width = viewport.width;
      await page.render({canvasContext: context, viewport}).promise;
      pdfContainer.appendChild(canvas);
    }
    const fileURL = URL.createObjectURL(file);
    download
