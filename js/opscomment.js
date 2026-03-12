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
offNoInput.addEventListener("input", e => {
  searchBtn.disabled = e.target.value.trim() === "";
  submitBtn.disabled = true; // disable submit until search is done
  opsCommentInput.value = ""; // clear previous comment
  offStatus.textContent = "";
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
    <strong>Report Number:</strong> ${data.data["Report No"] || ""}<br>
    <strong>Date:</strong> ${data.data["Date"] || ""}<br>
    <strong>Time:</strong> ${data.data["Time"] || ""}<br>
    <strong>Employee Number:</strong> ${data.data["Emp Number"] || ""}<br>
    <strong>Name:</strong> ${data.data["Employee Name"] || ""}<br>
    <strong>Designation:</strong> ${data.data["Emp Designation"] || ""}<br>
    <strong>Location:</strong> ${data.data["Location/Project"] || ""}<br>
    <strong>Supervisor Name:</strong> ${data.data["Sup Name"] || ""}<br>
    <strong>Offence:</strong> ${data.data["Offence Type"] || ""}<br>
    <strong>Other Offence:</strong> ${data.data["Other Offence"] || ""}<br>
    <strong>Ops Comment:</strong> ${data.data["Ops Action"] || ""}
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
  status.textContent = "Submitting...";
  status.style.color = "blue";

  const reportNo = offNoInput.value.trim();
  const opscomment = opsCommentInput.value.trim();

  if (!reportNo || !opscomment) {
    status.textContent = "❌ Please fill in all fields";
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
      status.textContent = "✅ Submitted Successfully";
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
