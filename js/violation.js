

/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcA2gmTDHvpTNmydp8YSb56_vdeRIzQ43_T9KssvVIzxUB9Kkt3TrzaGv6Mdi52AFqhQ/exec";


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
  const container = document.getElementById("employeeInfo");
  container.innerHTML = `
    <p><strong>Name:</strong> ${emp.Full_Name || ""}</p>
    <p><strong>Designation:</strong> ${emp.Designation || ""}</p>
    <p><strong>Join Date:</strong> ${emp.Join_Date || ""}</p>
    <p><strong>Gender:</strong> ${emp.Gender || ""}</p>
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
    </tr>`;
  });

  html += "</table>";
  container.innerHTML = html;
}

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}
