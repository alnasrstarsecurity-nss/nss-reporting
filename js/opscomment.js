const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6p8AnhhmDYGloZ8ISh9xqgFR3ysKx9tY-Cz_yZtJTaLXe1ak3hR319iTlg2viPrch/exec";

const form = document.getElementById("opscomment");
const status = document.getElementById("status");
const submitBtn = document.getElementById("submitBtn");
const offNoInput = document.getElementById("offenceno");
const searchBtn = document.getElementById("searchOffBtn");
const offStatus = document.getElementById("offstatus");
const opsCommentInput = document.getElementById("LocationRemark");

searchBtn.addEventListener("click", async () => {
  const reportNo = offNoInput.value.trim();
  if (!reportNo) return;

  offStatus.textContent = "Searching...";
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "fetchOffence", reportNo }),
    });
    const data = await res.json();
    if (data.status === "success") {
      offStatus.textContent = "✅ Offence Found";
      opsCommentInput.value = data.data["Ops Action"] || "";
      submitBtn.disabled = false;
    } else {
      offStatus.textContent = "❌ " + data.message;
      submitBtn.disabled = true;
      opsCommentInput.value = "";
    }
  } catch {
    offStatus.textContent = "❌ Network Error";
  }
});

// Submit Ops Comment
form.addEventListener("submit", async e => {
  e.preventDefault();
  submitBtn.disabled = true;
  status.textContent = "Submitting...";
  status.style.color = "blue";

  try {
    const payload = {
      action: "submitopscomment",
      reportNo: offNoInput.value.trim(),
      opscomment: opsCommentInput.value.trim()
    };
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.status === "success") {
      status.textContent = "✅ Submitted Successfully";
      status.style.color = "green";
      submitBtn.disabled = false;
    } else {
      status.textContent = "❌ " + data.message;
      status.style.color = "red";
      submitBtn.disabled = false;
    }
  } catch {
    status.textContent = "❌ Network Error";
    status.style.color = "red";
    submitBtn.disabled = false;
  }
});
