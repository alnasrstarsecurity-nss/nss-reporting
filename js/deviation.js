
/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgYMK7yRKS69tqoy9UckIjLVLcr6H9kiay0p1NQxC86byEV6I_iA93IfTwSvVOfdYTmw/exec";

const form = document.getElementById("deviationform");
const status = document.getElementById("status");





/* ===============================
  //signature validation
================================ */
const submitBtn = document.getElementById("submitBtn");
submitBtn.disabled = true;
//signature validation



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
  action: "submitdeviation",

  fromplace: form.fromplace.value,
  toplace: form.toplace.value,
  purpose: form.purpose.value,
  instructed: form.instructed.value,
  remark: form.remark.value,
  supervisorName: form.SupervisorName.value,
  supdesignation: form.Supdesignation.value,  
  supEmpNumber: form.SupEmpNumber.value,
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
        
        clearSupSignature();
        setTimeout(() => status.innerText = "", 3000)
         

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
