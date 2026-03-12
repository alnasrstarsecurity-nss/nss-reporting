
/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "";

const form = document.getElementById("opscomment");
const status = document.getElementById("status");

/* ===============================
  search button
================================ */
const empInput = document.getElementById("offenceno");
const searchBtn = document.getElementById("searchOffBtn");

if (empInput && searchBtn) {
  empInput.addEventListener("input", e => {
    const hasValue = e.target.value.trim().length > 0;
    searchBtn.disabled = !hasValue;
  });
}


   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   
   submitBtn.disabled = true;

  status.innerText = "Submitting...";
  status.style.color = "blue";

  const payload = {
  action: "submitopscomment",

  opscomment: form.opscomment.value,
  
};


  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(payload)
  })
    .then(r => r.json())
    .then(res => {
      if (res.status === "success") {
        status.innerText = "✅ Submitted Successfully";
        status.style.color = "green";
        form.reset();
         document.getElementById("offstatus").textContent = "";
         submitBtn.disabled = false;
        setTimeout(() => status.innerText = "", 3000);

    } else {

      status.innerText = "❌ Submission Failed";
      status.style.color = "red";
      submitBtn.disabled = false;

    }

  })
  .catch(() => {
    status.innerText = "❌ Network Error";
    status.style.color = "red";
    submitBtn.disabled = false;
  });
}); 

/* ===============================
   LOGOUT
================================ */
function logout() {
  localStorage.clear();
  location.href = "index.html";
}
