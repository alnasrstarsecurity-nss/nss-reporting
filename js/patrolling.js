/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyFQU8CrBrbchYyqiF0kpk5Rbby3TCMtRs3vExI18p4IczZvCzTIyi5qPImj9O4T60b/exec";

const form = document.getElementById("patrollingform");
const status = document.getElementById("status");

/* ===============================
  search button
================================ */
const empInput = document.getElementById("empno");
const searchBtn = document.getElementById("searchEmpBtn");

if (empInput && searchBtn) {
  empInput.addEventListener("input", e => {
    const hasValue = e.target.value.trim().length > 0;
    searchBtn.disabled = !hasValue;

    // Clear previous employee info and status
    document.getElementById("name").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("empStatus").textContent = "";
  });
}



/* ===============================
   other Offence mandatory logic
================================ */

document.addEventListener("change", function(e){

if(e.target.classList.contains("OffenceType")){

const otherOffence = document.getElementById("OtherOffence");

if(e.target.value === "Other offence detrimental to the image of the company or State of Qatar"){

otherOffence.style.display = "block";
otherOffence.required = true;

}else{

otherOffence.style.display = "none";
otherOffence.required = false;
otherOffence.value = "";

}
}
});



/* ===============================
   Add Multiple Offence 
================================ */
let maxOffence = 10;

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

function addOffence(btn){

const container = document.getElementById("offenceContainer");
const rows = container.querySelectorAll(".offenceRow");

if(rows.length >= maxOffence){
alert("Maximum 10 offences allowed");
return;
}

const newRow = rows[0].cloneNode(true);

const select = newRow.querySelector("select");
select.value="";

newRow.querySelector(".addBtn").style.display="none";
newRow.querySelector(".removeBtn").style.display="inline-block";

container.appendChild(newRow);

}

function removeOffence(btn){

const row = btn.parentElement;
const container = document.getElementById("offenceContainer");

if(container.querySelectorAll(".offenceRow").length > 1){

row.remove();

}

} 
/* ===============================
  resetOffenceRows
================================ */

function resetOffenceRows() {
  const container = document.getElementById("offenceContainer");
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
  hide offence section
================================ */
function showOffenceSection(){

document.getElementById("offenceSection").style.display="block";

setTimeout(() => {
resizeSignatureCanvas("empSignPad");
resizeSignatureCanvas("witnessSignPad");
},50);

document.querySelector(".OffenceType").setAttribute("required","required");
document.getElementById("Comments").setAttribute("required","required");
document.querySelectorAll('input[name="empDeclaration"]').forEach(r => r.required = true);  
}

function hideOffenceSection(){

document.getElementById("offenceSection").style.display="none";
document.querySelectorAll(".OffenceType").forEach(o=>o.removeAttribute("required"));
document.getElementById("Comments").removeAttribute("required");
document.querySelectorAll('input[name="empDeclaration"]').forEach(r => r.required = false);
}

/* ===============================
  //signature validation
================================ */
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;
//signature validation

/* ===============================
  GPS
================================ */
function getGPSLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      return resolve("");
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        resolve(`${lat},${lng}`);
      },
      err => {
        resolve(""); // permission denied or error
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

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
  EMPLOYEE MASTER
================================ */
async function fetchEmployee() {
  const empNo = document.getElementById("empno").value.trim();
  const searchBtn = document.getElementById("searchEmpBtn");
  const statusEl = document.getElementById("empStatus");

  if (!empNo) {
    alert("Please enter Employee Number");
    return;
  }

  // UI state: searching
  searchBtn.disabled = true;
  statusEl.textContent = "🔄 Searching...";
  statusEl.style.color = "#555";

  try {
    const res = await fetch(`${SCRIPT_URL}?empno=${encodeURIComponent(empNo)}`);
    const data = await res.json();

    searchBtn.disabled = false;

    if (data) {
      document.getElementById("name").value = data.name || "";
      document.getElementById("designation").value = data.designation || "";

      statusEl.textContent = "✅ Employee found";
      statusEl.style.color = "green";
    } else {
      document.getElementById("name").value = "";
      document.getElementById("designation").value = "";

      statusEl.textContent = "❌ Employee not found";
      statusEl.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    searchBtn.disabled = false;

    statusEl.textContent = "⚠ Error fetching employee";
    statusEl.style.color = "red";
  }
}


/* ===============================
   user full name
================================ */
const loginName = sessionStorage.getItem("LOGIN_NAME");
const loginempnumber = sessionStorage.getItem("EMP_NO");
const logindesi = sessionStorage.getItem("DESI");
const loginphone = sessionStorage.getItem("PHONE");

if (!loginName) {
  alert("Session expired. Please login again.");
  window.location.replace("index.html");
}

// 🔹 Auto-fill supervisor name
document.getElementById("SupervisorName").value = loginName;
document.getElementById("SupEmpNumber").value = loginempnumber;
document.getElementById("Supdesignation").value = logindesi;
document.getElementById("Phone").value = loginphone;


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
  10 image attachment HELPER
================================ */
async function filesToBase64(fileInput, maxFiles = 10) {
  const files = Array.from(fileInput.files || []).slice(0, maxFiles);

  const results = [];
  for (const file of files) {
    const base64 = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    results.push(base64);
  }
  return results;
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
const clearWitnessSignature = initSignaturePad("witnessSignPad");
const clearempSignature = initSignaturePad("empSignPad");
const clearSupSignature = initSignaturePad(
  "supSignPad",
  () => submitBtn.disabled = false, // on signed
  () => submitBtn.disabled = true   // on cleared
);

// Attach clear buttons
window.clearWitnessSignature = clearWitnessSignature;
window.clearempSignature = clearempSignature;
window.clearSupSignature = clearSupSignature;


/* ===============================
   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   
   submitBtn.disabled = true;

  status.innerText = "Submitting...";
  status.style.color = "blue";

  const gpsLocation = await getGPSLocation();

  const payload = {
  action: "submitpatrolling",

  name: form.name.value,
  empno: form.empno.value,
  designation: form.designation.value,
  location: form.location.value,
  locationRemark: form.LocationRemark.value,
  observation: form.Observation.value,

  foundoffence: radio("foundoffence"),
  //offenceType: form.OffenceType.value,

    offenceType: Array.from(document.querySelectorAll(".OffenceType"))
    .map(o => o.value)
    .filter(v => v !== "")
    .join(", "),
  otheroffence: form.OtherOffence.value,
  comments: form.Comments.value,
  empComments: form.empComments.value,
  empSign: document.getElementById("empSignPad").toDataURL(),
  empDeclaration: radio("empDeclaration"),

  Images1: await fileToBase64(form.Images1),
  Images2: await fileToBase64(form.Images2),

  witnessName: form.witnessName.value,
  witnessEmployeeNo: form.WitnessEmployeeNo.value,
  witnessSign: document.getElementById("witnessSignPad").toDataURL(),

  supervisorName: form.SupervisorName.value,
  supEmpNumber: form.SupEmpNumber.value,
  supdesignation: form.Supdesignation.value,
   phone: form.Phone.value,
     
  supSign: document.getElementById("supSignPad").toDataURL(),

  gps_Location: gpsLocation   
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
         document.getElementById("Phone").value = loginphone;
         document.getElementById("empStatus").textContent = "";
         submitBtn.disabled = false;
         offenceSection.style.display = "none";
         resetOffenceRows();
        clearWitnessSignature();
        clearempSignature();
        clearSupSignature();
        setTimeout(() => status.innerText = "", 3000);
         
       //  Generate PDF in background 
         fetch(SCRIPT_URL, {
         method: "POST",
         body: JSON.stringify({
         action: "generatepdf",
         row: res.row,
         offenceRow: res.offenceRow
         })
         }).catch(err => console.log("PDF generation error:", err));
         
    /*  fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "generatepdf",
          row: res.row
        })
      }).catch(err => console.log("PDF generation error:", err));*/

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

