// opscomment.js

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6p8AnhhmDYGloZ8ISh9xqgFR3ysKx9tY-Cz_yZtJTaLXe1ak3hR319iTlg2viPrch/exec";

const form = document.getElementById("opscomment");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const offNoInput = document.getElementById("offenceno");
const searchBtn = document.getElementById("searchOffBtn");
const offStatus = document.getElementById("offstatus");
const opsCommentInput = document.getElementById("LocationRemark");
const offenceDetailsDiv = document.getElementById("offenceDetails");

// Enable search button when user types something
// Enable search button only if input has value
offNoInput.addEventListener("input", e => {
  const hasValue = e.target.value.trim() !== "";
  searchBtn.disabled = !hasValue;       // enable/disable search button
  submitBtn.disabled = true;            // disable submit until search is done
  opsCommentInput.value = "";           // clear previous comment
  offStatus.textContent = "";           // clear status
  offenceDetailsDiv.innerHTML = "";     // clear offence details
});

// Search button click
searchBtn.addEventListener("click", async () => {
  const reportNo = offNoInput.value.trim();
  if (!reportNo) return;

  offStatus.textContent = "Searching...";
  offStatus.style.color = "blue";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "fetchOffence", reportNo }),
    });
    const data = await res.json();

    if (data.status === "success") {
      offStatus.textContent = "✅ Offence Found";
      offStatus.style.color = "green";
      opsCommentInput.value = data.data["Ops Action"] || "";
      submitBtn.disabled = false;

      /*offence table */
     offenceDetailsDiv.innerHTML = `
  <div><span style="display:inline-block; width:150px;"><strong>Report Number</strong>:</span> ${data.data["Report No"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Date</strong>:</span> ${data.data["Date"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Time</strong>:</span> ${data.data["Time"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Employee Number</strong>:</span> ${data.data["Emp Number"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Name</strong>:</span> ${data.data["Employee Name"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Designation</strong>:</span> ${data.data["Emp Designation"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Location</strong>:</span> ${data.data["Location/Project"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Supervisor Name</strong>:</span> ${data.data["Sup Name"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Offence</strong>:</span> ${data.data["Offence Type"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Other Offence</strong>:</span> ${data.data["Other Offence"] || ""}</div>
  <div><span style="display:inline-block; width:150px;"><strong>Ops Comment</strong>:</span> ${data.data["Ops Action"] || ""}</div>
`;
          /*offence table */ 
    } else {
      offStatus.textContent = "❌ " + data.message;
      offStatus.style.color = "red";
      opsCommentInput.value = "";
      submitBtn.disabled = true;
      offenceDetailsDiv.innerHTML = "";
    }
  } catch (err) {
    offStatus.textContent = "❌ Network Error";
    offStatus.style.color = "red";
    console.error(err);
  }
});

// Form submit
form.addEventListener("submit", async e => {
  e.preventDefault();
  submitBtn.disabled = true;
  status.textContent = "Please Wait...";
  status.style.color = "blue";

  const reportNo = offNoInput.value.trim();
  const opscomment = opsCommentInput.value.trim();

  if (!reportNo || !opscomment) {
    status.textContent = "❌ Please fill Ops Comment";
    status.style.color = "red";
    submitBtn.disabled = false;
    return;
  }

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "submitopscomment",
        reportNo,
        opscomment
      })
    });
    const data = await res.json();
    if (data.status === "success") {
      status.textContent = "✅ Saved Successfully";
      status.style.color = "green";
      submitBtn.disabled = false;
      opsCommentInput.value = "";
      offNoInput.value = "";
      offStatus.textContent = "";
      setTimeout(() => status.textContent = "", 3000);
    } else {
      status.textContent = "❌ " + data.message;
      status.style.color = "red";
      submitBtn.disabled = false;
    }
  } catch (err) {
    status.textContent = "❌ Network Error";
    status.style.color = "red";
    submitBtn.disabled = false;
    console.error(err);
  }
});
