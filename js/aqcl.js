

/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKOmxXp7o1TM9aJ1IM9u57It-OXJV2E4fn_dfScxC3ugtFJYMvYmAOcT9HESNSZ0ck/exec";

const form = document.getElementById("aqclForm");
const status = document.getElementById("status");

/* ===============================
   MAX_IMAGES  10
================================ */
const MAX_IMAGES = 10;
const attach1Input = document.getElementById("attach1");
const attach1Error = document.getElementById("attach1Error");

attach1Input.addEventListener("change", function () {
  if (this.files.length > MAX_IMAGES) {
    attach1Error.textContent = `⚠️ Maximum ${MAX_IMAGES} images allowed`;
    this.value = ""; // clear selection
  } else {
    attach1Error.textContent = "";
  }
});



/* ===============================
   user full name
================================ */
const loginName = sessionStorage.getItem("LOGIN_NAME");
const qaidnumber = sessionStorage.getItem("QAID");

if (!loginName) {
  alert("Session expired. Please login again.");
  window.location.replace("index.html");
}

// 🔹 Auto-fill supervisor name
document.getElementById("patrollingSupervisor").value = loginName;
document.getElementById("serialNumber").value = qaidnumber;

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
  Limit character
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



/* NEW SIGNATURE CODE*/
function initSignaturePad(canvasId) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
   
//disable sibmit button
   const submitBtn = document.getElementById("submitBtn");
   let signed = false;
//disable sibmit button
   
  // Match internal canvas size to CSS size (only once)
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000000";

  let drawing = false;
   // disabled initially
   submitBtn.disabled = true; 
   // disabled initially
   
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
     //focus issue
       blurActiveInputSafely();
      //focus issue
    drawing = true;

      signed = true;
      submitBtn.disabled = false;
     
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
    if (!drawing) return;
    e.preventDefault();
    drawing = false;
  }

  // Mouse events
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);

  // Touch events
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", endDraw);

  // Clear function
  return () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  signed = false;
  submitBtn.disabled = true;};
}

// Initialize ONE signature pad
const clearAqclSignature = initSignaturePad("sign");

// Expose clear button function if you have one
window.clearAqclSignature = clearAqclSignature;


/* ===============================
   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   submitBtn.disabled = true;

  status.innerText = "Submitting...";
  status.style.color = "blue";

  /* ---- GUARD CAG COMBINATION ---- */
  const guard1CAG = [
    radio("g1_comm"),
    radio("g1_awar"),
    radio("g1_groom")
  ].filter(Boolean).join(" ");

  const guard2CAG = [
    radio("g2_comm"),
    radio("g2_awar"),
    radio("g2_groom")
  ].filter(Boolean).join(" ");

  /* ---- PAYLOAD (MATCHES APPS SCRIPT 100%) ---- */
  const payload = {
    action: "submitAQCL",

    accName: accName.value,
    guardPosition: radio("guardPosition"),
    numGuards: numGuards.value,
    guardAppearance: guardAppearance.value,
    deskAppearance: deskAppearance.value,
    guardContact: guardContact.value,
    walkPatrol: radio("walkPatrol"),
    patrolEffective: radio("patrolEffective"),
    changesMade: changesMade.value,
    qrCheck: radio("qrCheck"),
    supervisorLastVisit: toDDMMYYYY(supervisorLastVisit.value),
    //supervisorLastVisit: supervisorLastVisit.value,
    supervisorName: supervisorName.value,
    supervisors7Days: supervisors7Days.value,
    keyCabinet: radio("keyCabinet"),
    keyLog: radio("keyLog"),
    keysAudited: keysAudited.value,
    camerasWorking: radio("camerasWorking"),
    numCameras: numCameras.value,
    acsFunctional: acsFunctional.value,
    perimeterSecure: perimeterSecure.value,
    apartmentInspection: apartmentInspection.value,
    apartmentRemark: apartmentRemark.value,
    actionsTaken: actionsTaken.value,

    guard1CAG: guard1CAG,
    guard2CAG: guard2CAG,

  attach1: await filesToBase64(form.attach1, 10),
  attach2: await fileToBase64(form.attach2),
  attach3: await fileToBase64(form.attach3),
  attach4: await fileToBase64(form.attach4),

    patrollingSupervisor: patrollingSupervisor.value,
    serialNumber: serialNumber.value,
    buildingSecurityName: buildingSecurityName.value,
    securityStaffNumber: securityStaffNumber.value,

    signature: document.getElementById("sign").toDataURL(),
    buildingLandline: buildingLandline.value,
    securityDutyMobile: securityDutyMobile.value
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
         document.getElementById("patrollingSupervisor").value = loginName;
         document.getElementById("serialNumber").value = qaidnumber;
        clearAqclSignature();
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

