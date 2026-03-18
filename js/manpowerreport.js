const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDLH1lJFys4HYoOxxWO65l-YXW3iZ9yXW2Ly3ua18GdHS3AO0dtMCeCJ4NehyqPf7m/exec";

document.getElementById("searchBtn").addEventListener("click", fetchReport);


const searchDate = document.getElementById("searchDate");
const searchBtn = document.getElementById("searchBtn");

searchDate.addEventListener("change", () => {
  searchBtn.disabled = !searchDate.value;
});

function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}


function fetchReport() {

  const date = document.getElementById("searchDate").value;

  if (!date) {
    alert("Select date");
    return;
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getManpowerReport",
      date: date
    })
  })
  .then(res => res.json())
  .then(data => renderReport(data))
  .catch(() => alert("Error fetching data"));
}

function renderReport(data) {

  const container = document.getElementById("reportContainer");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No records found</p>";
    return;
  }

  let rowDiv;

  data.forEach((item, index) => {

    if (index % 2 === 0) {
      rowDiv = document.createElement("div");
      rowDiv.className = "details-grid";
      container.appendChild(rowDiv);
    }

    const section = document.createElement("div");
    section.className = "section";

    section.innerHTML = `
      <h3>${item.accomodation}</h3>

      <table class="report-table">
        <tr><td><b>Date</b></td><td>${item.date}</td></tr>
        <tr><td><b>Time</b></td><td>${item.time}</td></tr>
        <tr><td><b>Project Count</b></td><td style="white-space:pre-line">${item.project}</td></tr>
        <tr><td><b>Joiners</b></td><td>${item.joiners}</td></tr>
        <tr><td><b>Joiner Details</b></td><td>${item.joinersdetails}</td></tr>
        <tr><td><b>Standby</b></td><td>${item.standby}</td></tr>
        <tr><td><b>Standby Details</b></td><td>${item.standbydetails}</td></tr>
        <tr><td><b>Total</b></td><td>${item.total}</td></tr>
        <tr><td><b>Reporter</b></td><td>${item.name}</td></tr>
      </table>
    `;

    searchBtn.addEventListener("click", async () => {

  const rawDate = searchDate.value;
  const formattedDate = formatDateToDDMMYYYY(rawDate);

  const status = document.getElementById("status");
  const container = document.getElementById("reportContainer");

  if (!formattedDate) {
    status.innerText = "❌ Select date";
    return;
  }

  status.innerText = "Loading...";
  status.style.color = "blue";

  try {

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getManpowerReport",
        date: formattedDate
      })
    });

    const data = await res.json();

    if (data.status !== "success") {
      status.innerText = "❌ No data found";
      return;
    }

    renderReport(data.data);

    status.innerText = "✅ Loaded";
    status.style.color = "green";

  } catch (err) {
    status.innerText = "❌ Error loading data";
    status.style.color = "red";
  }

});

    rowDiv.appendChild(section);

  });
}
