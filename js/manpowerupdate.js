/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-uXPYscxhXWJ87xzEfvZzlDQj5d_Az7nnhp4nmSJjm1hPGGS7udkVeWC5kSJlN7ZYqA/exec";

const form = document.getElementById("manpower");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");

/* ===============================
   SESSION CHECK
================================ */
const loginName = sessionStorage.getItem("LOGIN_NAME");
const loginempnumber = sessionStorage.getItem("EMP_NO");
const logindesi = sessionStorage.getItem("DESI");

if (!loginName) {
  alert("Session expired. Please login again.");
  window.location.replace("index.html");
}

// Auto-fill reporter
document.getElementById("supervisorName").value = loginName;
document.getElementById("supEmpNumber").value = loginempnumber;
document.getElementById("supdesignation").value = logindesi;

/* ===============================
   PROJECT ROWS
================================ */
let maxProject = 14;

function toggleAddButton(select) {
  const row = select.parentElement;
  const addBtn = row.querySelector(".addBtn");
  const removeBtn = row.querySelector(".removeBtn");

  if (select.value !== "") {
    addBtn.style.display = "inline-block";
    removeBtn.style.display = "inline-block";
  } else {
    addBtn.style.display = "none";
  }
}

function addProject(btn) {
  const container = document.getElementById("projectContainer");
  const rows = container.querySelectorAll(".projectRow");

  if (rows.length >= maxProject) {
    alert("Maximum 14 Project allowed");
    return;
  }

  const newRow = rows[0].cloneNode(true);
  newRow.querySelector("select").value = "";
  newRow.querySelector(".projectCount").value = "";

  newRow.querySelector(".addBtn").style.display = "none";
  newRow.querySelector(".removeBtn").style.display = "inline-block";

  container.appendChild(newRow);
  calculateTotal();
}

function removeProject(btn) {
  const container = document.getElementById("projectContainer");
  if (container.querySelectorAll(".projectRow").length > 1) {
    btn.parentElement.remove();
    calculateTotal();
  }
}

function resetProjectRows() {
  const container = document.getElementById("projectContainer");
  const rows = container.querySelectorAll(".projectRow");
  rows.forEach((row, index) => {
    if (index === 0) {
      row.querySelector("select").value = "";
      row.querySelector(".projectCount").value = "";
      row.querySelector(".addBtn").style.display = "none";
      row.querySelector(".removeBtn").style.display = "none";
    } else {
      row.remove();
    }
  });
}

/* ===============================
   AUTO TOTAL COUNT
================================ */
function calculateTotal() {
  let projectTotal = 0;
  document.querySelectorAll(".projectCount").forEach(input => {
    const val = parseInt(input.value) || 0;
    projectTotal += val;
  });

  const joiners = parseInt(document.getElementById("joinerscount").value) || 0;
  const standby = parseInt(document.getElementById("standbycount").value) || 0;

  document.getElementById("totalcount").value = projectTotal + joiners + standby;
}

document.addEventListener("input", function (e) {
  if (e.target.classList.contains("projectCount") ||
      e.target.id === "joinerscount" ||
      e.target.id === "standbycount") {
    calculateTotal();
  }
});

/* ===============================
   SIGNATURE PAD
================================ */
function initSignaturePad(canvasId, onSigned, onCleared) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  let drawing = false;
  let hasSignature = false;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function startDraw(e) {
    e.preventDefault();
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

const clearSupSignature = initSignaturePad(
  "supSignPad",
  () => submitBtn.disabled = false,
  () => submitBtn.disabled = true
);

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
    projectType: Array.from(document.querySelectorAll(".projectRow"))
      .map(row => {
        const project = row.querySelector(".projectType").value;
        const count = row.querySelector(".projectCount").value;
        if (project && count) return `${project} : ${count}`;
      })
      .filter(Boolean)
      .join("\n"),
    joinerscount: form.joinerscount.value,
    joinersdetails: form.joinersdetails.value,
    standbycount: form.standbycount.value,
    standbydetails: form.standbydetails.value,
    totalcount: form.totalcount.value,
    supervisorName: form.supervisorName.value,
    supEmpNumber: form.supEmpNumber.value,
    supdesignation: form.supdesignation.value,
    supSign: document.getElementById("supSignPad").toDataURL()
  };

  console.log("Payload:", payload); // debug

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "success") {
      status.innerText = "✅ Submitted Successfully";
      status.style.color = "green";
      form.reset();
      document.getElementById("supervisorName").value = loginName;
      document.getElementById("supEmpNumber").value = loginempnumber;
      document.getElementById("supdesignation").value = logindesi;
      submitBtn.disabled = false;
      resetProjectRows();
      clearSupSignature();
      setTimeout(() => status.innerText = "", 3000);
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
