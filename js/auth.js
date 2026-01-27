const SCRIPT_URL = "ttps://script.google.com/macros/s/AKfycbyzv-cSfHygdIrClWANI7B8ibNEMDVmQ3eqy3aJtNRV90Sk3owVTnfdD1OP07-C3C7nHg/exec";

function requireLogin() {
  if (!localStorage.getItem("user") || !localStorage.getItem("pass")) {
    location.href = "index.html";
  }
}

function logout() {
  localStorage.clear();
  location.href = "index.html";
}
