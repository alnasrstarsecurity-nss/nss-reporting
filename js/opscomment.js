// opscomment.js

const SCRIPT_URL = "YOUR_DEPLOYED_WEB_APP_URL"; // <-- Replace with your Web App URL

const form = document.getElementById("opscomment");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const offNoInput = document.getElementById("offenceno");
const searchBtn = document.getElementById("searchOffBtn");
const offStatus = document.getElementById("offstatus");
const opsCommentInput = document.getElementById("LocationRemark");

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
    } else {
      offStatus.textContent = "❌ " + data.message;
      offStatus.style.color = "red";
      opsCommentInput.value = "";
      submitBtn.disabled = true;
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
