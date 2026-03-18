const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXkv7coSuHWlzt9ykJ6ygdrR4KPnA1W2GGf8eX1ABg5CNo2V2BEncWYXkTOBy9RZ_b/exec";


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

    renderReport(data.data);

    status.innerText = "✅ Loaded";
    status.style.color = "green";

  } catch (err) {
    status.innerText = "❌ Error fetching data";
    status.style.color = "red";
    console.error(err);
  }

});

/* RENDER */
function renderReport(data) {

  container.innerHTML = "";

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
        <tr><td><b>Project wise Manpower</b></td><td style="white-space:pre-line">${item.project}</td></tr>
        <tr><td><b>New Joiners</b></td><td>${item.joiners}</td></tr>
        <tr><td><b>New Joiner Details</b></td><td>${item.joinDetails}</td></tr>
        <tr><td><b>Standby Employees</b></td><td>${item.standby}</td></tr>
        <tr><td><b>Standby Employee Details</b></td><td>${item.standbyDetails}</td></tr>
        <tr><td><b>Total</b></td><td>${item.total}</td></tr>
      </table>
    `;

    rowDiv.appendChild(section);

  });

}
