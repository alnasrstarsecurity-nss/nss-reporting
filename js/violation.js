

/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsR9k4GRmtLZyM3qtk8scP8UTYG769KpvcPt9W3STCfc1jjcn2ZHV5deNzxCpheNxJ/exec";


document.addEventListener("DOMContentLoaded", () => {
  const empInput = document.getElementById("empno");
  const searchBtn = document.getElementById("searchEmpBtn");
  const status = document.getElementById("empStatus");

  if (!empInput || !searchBtn) return;

  // Enable search button when input has value
  empInput.addEventListener("input", e => {
    const hasValue = e.target.value.trim().length > 0;
    searchBtn.disabled = !hasValue;

    // Clear previous employee info and offences
    document.getElementById("employeeInfo").innerHTML = "";
    document.getElementById("offenceTable").innerHTML = "";
    status.textContent = "";
  });

  // Attach fetchEmployee safely
  searchBtn.addEventListener("click", fetchEmployee);
});

/* ===============================
   FETCH EMPLOYEE & OFFENCE
================================ */
async function fetchEmployee() {
  const empNo = document.getElementById("empno").value.trim();
  const status = document.getElementById("empStatus");

  if (!empNo) return;

  status.textContent = "🔍 Searching...";
  status.style.color = "#555";

  try {
    const res = await fetch(`${SCRIPT_URL}?empno=${empNo}`);
    const data = await res.json();

    if (!data.employee) {
      status.textContent = "❌ Employee not found";
      status.style.color = "red";
      return;
    }

    status.textContent = "✅ Employee found";
    status.style.color = "green";

    renderEmployee(data.employee);
    renderOffences(data.offences || []);
    renderOffenceImages(data.offences || []); 

  } catch (e) {
    console.error(e);
    status.textContent = "⚠ Error fetching report";
    status.style.color = "red";
  }
}

/* ===============================
   RENDER EMPLOYEE INFO
================================ */
function renderEmployee(emp) {
  document.getElementById("employeeInfo").innerHTML = `
    <p><b>Name:</b> ${emp.name}</p>
    <p><b>Designation:</b> ${emp.designation}</p>
    <p><b>Join Date:</b> ${emp.joinDate || "-"}</p>
    <p><b>Gender:</b> ${emp.gender || "-"}</p>
  `;
}

/* ===============================
   RENDER OFFENCES TABLE
================================ */
function renderOffences(offences) {
  const container = document.getElementById("offenceTable");

  if (!offences.length) {
    container.innerHTML = "<p>No offences found for this employee.</p>";
    return;
  }

  let html = `<table border="1" cellpadding="5" cellspacing="0">
    <tr>
      <th>Report No</th>
      <th>Date</th>
      <th>Designation</th>
      <th>Location/Project</th>
      <th>Offence Type</th>
      <th>Sup Name</th>
      <th>Ops Action</th>
      <th>Images</th>
    </tr>`;

  offences.forEach(o => {
    html += `<tr>
      <td>${o["Report No"] || ""}</td>
      <td>${o.Date || ""}</td>
      <td>${o["Emp Designation"] || ""}</td>
      <td>${o["Location/Project"] || ""}</td>
      <td>${o["Offence Type"] || ""}</td>
      <td>${o["Sup Name"] || ""}</td>
      <td>${o["Ops Action"] || ""}</td>
        <td>
        ${renderImageThumb(o["IMAGE 1"])}
        ${renderImageThumb(o["IMAGE 2"])}
        </td>
    </tr>`;
  });

  html += "</table>";
  container.innerHTML = html;
}


/* ===============================
   driveToDirect
================================ */
function driveToDirect(url) {
  if (!url) return "";
  const match = url.match(/[-\w]{25,}/);
  return match
    ? `https://drive.google.com/uc?export=view&id=${match[0]}`
    : url;
}
/* ===============================
   renderImageThumb
================================ */

function renderImageThumb(url) {
  if (!url) return "";

  const imgUrl = convertDriveUrl(url);

  return `
    <img src="${imgUrl}"
         class="img-thumb"
         onclick="openImgModal('${imgUrl}')">
  `;
}

function convertDriveUrl(url) {
  if (url.includes("drive.google.com")) {
    const id = url.match(/[-\w]{25,}/);
    if (id) {
      return `https://drive.google.com/uc?id=${id[0]}`;
    }
  }
  return url;
}

function openImgModal(src) {
  const modal = document.getElementById("imgModal");
  const img = document.getElementById("imgModalContent");
  img.src = src;
  modal.style.display = "flex";
}

function closeImgModal() {
  document.getElementById("imgModal").style.display = "none";
}



/* ===============================
   renderOffenceImages
================================ */

function renderOffenceImages(offences) {
  const container = document.getElementById("offenceImages");
  container.innerHTML = "";

  const grouped = {};

  offences.forEach(o => {
    const report = o["Report No"] || "Unknown";
    if (!grouped[report]) grouped[report] = [];

    if (o["IMAGE 1"]) grouped[report].push(driveToDirect(o["IMAGE 1"]));
    if (o["IMAGE 2"]) grouped[report].push(driveToDirect(o["IMAGE 2"]));
  });

  if (!Object.keys(grouped).length) {
    container.innerHTML = "<p>No images available.</p>";
    return;
  }

  Object.entries(grouped).forEach(([report, images]) => {
    const block = document.createElement("div");
    block.style.marginBottom = "12px";
    block.innerHTML = `<b>Report No: ${report}</b><br>`;

    images.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      img.className = "img-thumb";
      img.onclick = () => openImage(url);
      block.appendChild(img);
    });

    container.appendChild(block);
  });
}


/* ===============================
   openImage
================================ */
function openImage(url) {
  const modal = document.getElementById("imgModal");
  document.getElementById("imgModalContent").src = url;
  modal.style.display = "flex";
}

function closeImage() {
  document.getElementById("imgModal").style.display = "none";
}

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}
