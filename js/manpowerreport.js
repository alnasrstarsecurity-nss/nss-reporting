const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzW8sdvq_kmZ6PIvCji6UX7YuS6SA56L3Sj7iuiSCr_yiAi5COTJmMgH7Lw8BcJRro/exec";


const searchDate = document.getElementById("searchDate");
const searchBtn = document.getElementById("searchBtn");
const status = document.getElementById("status");
const container = document.getElementById("reportContainer");

/* ENABLE BUTTON */
searchDate.addEventListener("change", () => {
  searchBtn.disabled = !searchDate.value;
});

/* DATE FORMAT FIX */
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

/* SEARCH CLICK */
searchBtn.addEventListener("click", async () => {

  const formattedDate = formatDateToDDMMYYYY(searchDate.value);

  if (!formattedDate) {
    status.innerText = "❌ Select date";
    return;
  }

  status.innerText = "Loading...";
  status.style.color = "blue";

  container.innerHTML = "";

  try {

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "getManpowerReport",
        date: formattedDate
      })
    });

    const data = await res.json();

    if (data.status !== "success" || !data.data.length) {
      status.innerText = "❌ No data found";
      return;
    }
     renderToday(res.today);   // 🔹 GRID
     renderWeek(res.week);     // 🔹 TABLE

    status.innerText = "✅ Loaded";
    status.style.color = "green";

  } catch (err) {
    status.innerText = "❌ Error fetching data";
    status.style.color = "red";
    console.error(err);
  }

});

/* RENDER */
function renderToday(data) {

  const container = document.getElementById("reportContainer");
  container.innerHTML = "<h3>Selected Date Report</h3>";

  if (!data.length) {
    container.innerHTML += "<p>No data for selected date</p>";
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
        <tr><td><b>Project</b></td><td style="white-space:pre-line">${item.project}</td></tr>
        <tr><td><b>Joiners</b></td><td>${item.joiners}</td></tr>
        <tr><td><b>Standby</b></td><td>${item.standby}</td></tr>
        <tr><td><b>Total</b></td><td>${item.total}</td></tr>
      </table>
    `;

    rowDiv.appendChild(section);
  });
}


function renderWeek(data) {

  const container = document.getElementById("reportContainer");

  let html = `
    <h3 style="margin-top:30px;">Last 7 Days Report</h3>
    <div class="table-wrapper">
    <table class="report-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Accomodation</th>
          <th>Project</th>
          <th>Joiners</th>
          <th>Standby</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(item => {
    html += `
      <tr>
        <td>${item.date}</td>
        <td>${item.accomodation}</td>
        <td>${item.project}</td>
        <td>${item.joiners}</td>
        <td>${item.standby}</td>
        <td>${item.total}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    </div>
  `;

  container.innerHTML += html;
}
