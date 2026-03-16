

/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "";

const form = document.getElementById("manpower");
const status = document.getElementById("status");


/* ===============================
   Add Multiple Project 
================================ */
let maxProject = 14;

function toggleAddButton(select){

const row = select.parentElement;
const addBtn = row.querySelector(".addBtn");
const removeBtn = row.querySelector(".removeBtn");

if(select.value !== ""){
addBtn.style.display = "inline-block";
removeBtn.style.display = "inline-block";
}else{
addBtn.style.display = "none";
}

}

function addProject(btn){

const container = document.getElementById("projectContainer");
const rows = container.querySelectorAll(".projectRow");

if(rows.length >= maxProject){
alert("Maximum 14 Project allowed");
return;
}

const newRow = rows[0].cloneNode(true);

const select = newRow.querySelector("select");
select.value="";

newRow.querySelector(".addBtn").style.display="none";
newRow.querySelector(".removeBtn").style.display="inline-block";

container.appendChild(newRow);

}

function removeProject(btn){

const row = btn.parentElement;
const container = document.getElementById("projectContainer");

if(container.querySelectorAll(".offenceRow").length > 1){

row.remove();

}

} 
/* ===============================
  resetOffenceRows
================================ */

function resetProjectRows() {
  const container = document.getElementById("projectContainer");
  const rows = container.querySelectorAll(".offenceRow");

  rows.forEach((row, index) => {
    if (index === 0) {
      // keep first row but clear value
      const select = row.querySelector("select");
      if (select) select.value = "";
    } else {
      // remove extra rows
      row.remove();
    }
  });
}
/* ===============================
  signature resize
================================ */
function resizeSignatureCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  // Re-apply drawing styles after resize
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";
}

/* ===============================
  //signature validation
================================ */
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;
//signature validation


/* ===============================
   RADIO HELPER
================================ */
function radio(name) {
  const r = document.querySelector(`input[name="${name}"]:checked`);
  return r ? r.value : "";
}

function resizeCanvasToDisplaySize(canvas) {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

function blurActiveInputSafely() {
  const el = document.activeElement;
  if (!el) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    setTimeout(() => el.blur(), 0);
  }
}

/* ===============================
   user full name
================================ */
const loginName = sessionStorage.getItem("LOGIN_NAME");
const loginempnumber = sessionStorage.getItem("EMP_NO");
const logindesi = sessionStorage.getItem("DESI");


if (!loginName) {
  alert("Session expired. Please login again.");
  window.location.replace("index.html");
}

// 🔹 Auto-fill supervisor name
document.getElementById("SupervisorName").value = loginName;
document.getElementById("SupEmpNumber").value = loginempnumber;
document.getElementById("Supdesignation").value = logindesi;



/* ===============================
   attachment HELPER
================================ */
function fileToBase64(fileInput) {
  const file = fileInput.files[0];
  return new Promise(resolve => {
    if (!file) return resolve("");

    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

/* ===============================
  limit the input number
================================ */
document.addEventListener("input", function (e) {
  const el = e.target;

  /* 🔹 NUMBER inputs → digit limit */
  if (el.tagName === "INPUT" && el.type === "number" && el.dataset.maxdigits) {
    let value = el.value.replace(/\D/g, "");
    el.value = value.slice(0, el.dataset.maxdigits);
  }

  /* 🔹 TEXT inputs + TEXTAREA → character limit */
  if (
    (el.tagName === "INPUT" && el.type === "text") ||
    el.tagName === "TEXTAREA"
  ) {
    if (el.dataset.maxchars) {
      el.value = el.value.slice(0, el.dataset.maxchars);
    }
  }
});


/* ===============================
   date format
================================ */
function toDDMMYYYY(dateValue) {
  if (!dateValue) return "";

  // normalize separator ( / or - )
  const parts = dateValue.includes("/")
    ? dateValue.split("/")
    : dateValue.split("-");

  // parts = [yyyy, mm, dd]
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];

  return `${d}/${m}/${y}`;
}

function blurActiveInputSafely() {
  const el = document.activeElement;
  if (!el) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    setTimeout(() => el.blur(), 0);
  }
}

/* ===============================
   SIGNATURE PAD (MOUSE + TOUCH)
================================ */
function initSignaturePad(canvasId, onSigned, onCleared) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";

  let drawing = false;
  let hasSignature = false;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - r.left,
        y: e.touches[0].clientY - r.top
      };
    }
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    blurActiveInputSafely();

    drawing = true;

    if (!hasSignature) {
      hasSignature = true;
      onSigned && onSigned();
    }

    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function endDraw(e) {
    drawing = false;
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  return () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasSignature = false;
    onCleared && onCleared();
  };
}

// Initialize both pads
const clearSupSignature = initSignaturePad(
  "supSignPad",
  () => submitBtn.disabled = false, // on signed
  () => submitBtn.disabled = true   // on cleared
);

// Attach clear buttons
window.clearSupSignature = clearSupSignature;


/* ===============================
   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   
   submitBtn.disabled = true;

  status.innerText = "Submitting...";
  status.style.color = "blue";


  const payload = {
  action: "submitmanpower",

  accomodation: form.accomodation.value,
   ProjectType: Array.from(document.querySelectorAll(".ProjectType"))
    .map(o => o.value)
    .filter(v => v !== "")
    .join(", "),
  joinerscount: form.joinerscount.value,
  joinersdetails: form.joinersdetails.value,
  standbycount: form.standbycount.value,
  standbydetails: form.standbydetails.value,
  totalcount: form.totalcount.value,
 
  SupervisorName: form.SupervisorName.value,
  SupEmpNumber: form.SupEmpNumber.value,
  Supdesignation: form.Supdesignation.value,
  
  supSign: document.getElementById("supSignPad").toDataURL(),
     
};


  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(res => {
      if (res.status === "success") {
        status.innerText = "✅ Submitted Successfully";
        status.style.color = "green";
        form.reset();
         document.getElementById("SupervisorName").value = loginName;
         document.getElementById("SupEmpNumber").value = loginempnumber;
         document.getElementById("Supdesignation").value = logindesi;
         
         submitBtn.disabled = false;
         resetProjectRows();
        clearSupSignature();
        setTimeout(() => status.innerText = "", 3000);
         
       //  Generate PDF in background 
         fetch(SCRIPT_URL, {
         method: "POST",
         body: JSON.stringify({
         action: "generatepdf",
         row: res.row,
         })
         }).catch(err => console.log("PDF generation error:", err));
         

    } else {

      status.innerText = "❌ Submission Failed";
      status.style.color = "red";
      submitBtn.disabled = false;

    }

  })
  .catch(() => {
    status.innerText = "❌ Network Error";
    status.style.color = "red";
    submitBtn.disabled = false;
  });
}); 

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}
