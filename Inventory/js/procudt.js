
/* ===============================
   CONFIG
================================ */
const SCRIPT_URL = "";

const form = document.getElementById("productForm");
const status = document.getElementById("status");


/* ===============================
  limit the input number
================================ */
document.addEventListener("input", function (e) {
  const el = e.target;

  /* 🔹 NUMBER inputs → digit limit */
  if (el.tagName === "INPUT" && el.type === "number" && el.dataset.maxdigits) {
    let value = el.value.replace(/\D/g, "");
    el.value = value.slice(0, el.dataset.maxdigits);
  }

  /* 🔹 TEXT inputs + TEXTAREA → character limit */
  if (
    (el.tagName === "INPUT" && el.type === "text") ||
    el.tagName === "TEXTAREA"
  ) {
    if (el.dataset.maxchars) {
      el.value = el.value.slice(0, el.dataset.maxchars);
    }
  }
});


/* ===============================
   FORM SUBMISSION
================================ */
form.addEventListener("submit", async e => {
  e.preventDefault();
   
   submitBtn.disabled = true;

  status.innerText = "Saving...";
  status.style.color = "blue";

  const payload = {
  action: "product",

  fromplace: form.fromplace.value,
  toplace: form.toplace.value,
  purpose: form.purpose.value,
  instructed: form.instructed.value,
  remark: form.remark.value,
  supervisorName: form.SupervisorName.value,
  supdesignation: form.Supdesignation.value,  
  supEmpNumber: form.SupEmpNumber.value,
  supSign: document.getElementById("supSignPad").toDataURL(),  
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
         document.getElementById("SupervisorName").value = loginName;
         document.getElementById("SupEmpNumber").value = loginempnumber;
         document.getElementById("Supdesignation").value = logindesi;
         
         submitBtn.disabled = false;
        
        clearSupSignature();
        setTimeout(() => status.innerText = "", 3000)
         

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
