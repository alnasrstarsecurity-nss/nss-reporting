

/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcA2gmTDHvpTNmydp8YSb56_vdeRIzQ43_T9KssvVIzxUB9Kkt3TrzaGv6Mdi52AFqhQ/exec";

const form = document.getElementById("violation");


/* ===============================
  search button
================================ */
const empInput = document.getElementById("empno");
const searchBtn = document.getElementById("searchEmpBtn");

if (empInput && searchBtn) {
  empInput.addEventListener("input", e => {
    const hasValue = e.target.value.trim().length > 0;
    searchBtn.disabled = !hasValue;

    /* Clear previous employee info and status
    document.getElementById("name").value = "";
    document.getElementById("designation").value = "";
    document.getElementById("empStatus").textContent = "";*/
  });
}





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
    renderOffences(data.offences);

  } catch (e) {
    console.error(e);
    status.textContent = "⚠ Error fetching report";
    status.style.color = "red";
  }
}

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}

