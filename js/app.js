const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwgx3cnrPwDuIcrqwr-y-QINtlD4ZpE1v0CeOAdsYUPcfL6kZXVaocgZC0FVfE39pxJ6Q/exec";

let lat = "", lng = "";


if (!localStorage.getItem("user") || !localStorage.getItem("pass")) {
  window.location.href = "index.html";
}


/* GPS */
navigator.geolocation.getCurrentPosition(p => {
  lat = p.coords.latitude;
  lng = p.coords.longitude;
});

/* SIGNATURE */
const canvas = document.getElementById("sign");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 2;
ctx.lineCap = "round";

let drawing = false;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
}

window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

function getPos(e) {
  const rect = canvas.getBoundingClientRect();

  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  }
  return { x: e.offsetX, y: e.offsetY };
}

function startDraw(e) {
  e.preventDefault();
  drawing = true;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();
  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function endDraw(e) {
  e.preventDefault();
  drawing = false;
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mouseleave", endDraw);

canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", endDraw);

function clearSign() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}



/* FILE → BASE64 */
function toBase64(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });
}

async function submitVisit() {

  const statusEl = document.getElementById("status");
  const locationEl = document.getElementById("locationSelect");

  statusEl.style.color = "black";
  statusEl.innerText = "Submitting...";

  try {
    if (!locationEl.value) {
      alert("Please select location");
      statusEl.innerText = "";
      return;
    }

    if (photos.files.length > 5) {
      alert("Maximum 5 photos allowed");
      statusEl.innerText = "";
      return;
    }

    const photos64 = [];
    for (let f of photos.files) {
      photos64.push(await toBase64(f));
    }

    const payload = {
      action: "submit",
      username: localStorage.getItem("user"),
      password: localStorage.getItem("pass"),
      location: locationEl.value,
      checklist: [...document.querySelectorAll(".chk:checked")].map(c => c.value),
      remarks: remarks.value,
      lat: lat || "",
      lng: lng || "",
      photos: photos64,
      signature: canvas.toDataURL(),
      syncStatus: navigator.onLine ? "ONLINE" : "OFFLINE"
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)   // ✅ NO HEADERS
    });

    const result = await response.json();

   if (result.status === "success") {
  statusEl.style.color = "green";
  statusEl.innerText = "✅ Submitted successfully";
  resetForm();
  setTimeout(() => statusEl.innerText = "", 2000);
} else {
  statusEl.style.color = "red";
  statusEl.innerText = "❌ " + (result.message || "Submission failedd");
}


  } catch (err) {
    console.error("Submit error:", err);
    statusEl.style.color = "red";
    statusEl.innerText = "❌ Network error";
  }
}


function resetForm() {
  document.getElementById("locationSelect").selectedIndex = 0;
  remarks.value = "";
  document.querySelectorAll(".chk").forEach(c => c.checked = false);
  photos.value = "";
  clearSign();
}


function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("pass");
  window.location.href = "index.html";
}




function clearStatus() {
  document.getElementById("status").innerText = "";
}

document.getElementById("locationSelect").addEventListener("change", clearStatus);
document.getElementById("remarks").addEventListener("input", clearStatus);
document.getElementById("photos").addEventListener("change", clearStatus);
