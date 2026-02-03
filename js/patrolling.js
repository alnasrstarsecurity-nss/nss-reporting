/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzEgF1ZhJIdgojCmCxSDdpRPAawcXyt5MZiLq8KqPVu6I6gnDVIs41dE7NcB0m8Ff6i/exec";

const form = document.getElementById("patrollingform");
const status = document.getElementById("status");

/* ===============================
  search button
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const empInput = document.getElementById("empno");
  const searchBtn = document.getElementById("searchEmpBtn");

  // safety check
  if (!empInput || !searchBtn) return;

  empInput.addEventListener("input", () => {
    searchBtn.disabled = empInput.value.trim().length === 0;
  });
});;



//signature validation
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
  EMPLOYEE MASTER
================================ */

function fetchEmployee() {
  const empNo = document.getElementById("empno").value.trim();
  const btn = document.getElementById("searchEmpBtn");

  if (!empNo) return;

  // UI state: searching
  btn.disabled = true;
  btn.textContent = "Searching...";
  showStatus("Searching employee...", null);

  google.script.run
    .withSuccessHandler(data => {
      btn.disabled = false;
      btn.textContent = "Search";
      fillEmployee(data);
    })
    .withFailureHandler(err => {
      console.error("Apps Script error:", err);

      btn.disabled = false;
      btn.textContent = "Search";

      clearEmployeeFields();
      showStatus("⚠ Error fetching employee", false);
    })
    .getEmployeeByEmpNo(empNo);
}

function fillEmployee(data) {
  if (!data) {
    clearEmployeeFields();
    showStatus("❌ Employee not found", false);
    return;
  }

  document.getElementById("name").value = data.name || "";
  document.getElementById("designation").value = data.designation || "";

  showStatus("✅ Employee found", true);
}

function clearEmployeeFields() {
  document.getElementById("name").value = "";
  document.getElementById("designation").value = "";
}

function showStatus(message, success) {
  const el = document.getElementById("empStatus");
  el.textContent = message;

  if (success === true) {
    el.style.color = "green";
  } else if (success === false) {
    el.style.color = "red";
  } else {
    el.style.color = "#555"; // neutral (searching)
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
const clearSupSignature = initSignaturePad(
  "supSignPad",
  () => submitBtn.disabled = false, // on signed
  () => submitBtn.disabled = true   // on cleared
);

// Attach clear buttons
window.clearWitnessSignature = clearWitnessSignature;
window.clearSupSignature = clearSupSignature;


/* ===============================
   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   const gpsLocation = await getGPSLocation();
   submitBtn.disabled = true;

  status.innerText = "Submitting...";
  status.style.color = "blue";

  const payload = {
  action: "submitpatrolling",

  name: form.name.value,
  empno: form.empno.value,
  designation: form.designation.value,
  location: form.location.value,
  locationRemark: form.LocationRemark.value,

  incidentType: form.IncidentType.value,
  incidentRemark: form.IncidentRemark.value,

  Images1: await fileToBase64(form.Images1),
  Images2: await fileToBase64(form.Images2),

  witnessName: form.witnessName.value,
  witnessEmployeeNo: form.WitnessEmployeeNo.value,
  witnessSign: document.getElementById("witnessSignPad").toDataURL(),

  supervisorName: form.SupervisorName.value,
  supEmpNumber: form.SupEmpNumber.value,
  supdesignation: form.Supdesignation.value,
     
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
         submitBtn.disabled = false;
        clearWitnessSignature();
        clearSupSignature();
        setTimeout(() => status.innerText = "", 3000);
      } else {
        status.innerText = "❌ Submission Failed";
        status.style.color = "red";
      }
    })
    .catch(() => {
      status.innerText = "❌ Network Error";
      status.style.color = "red";
    });
});


/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}

