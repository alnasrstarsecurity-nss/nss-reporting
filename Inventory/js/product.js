// ==============================
// CONFIG
// ==============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJDGV1zL_WREIz6FGEpIqOlmOrdI11RaWaecB-AeaiyMDufd7xPVHjPuoMc9F84MXEyQ/exec";

// ==============================
// GLOBAL STATE
// ==============================
let isEditMode = false;

// ==============================
// DOM ELEMENTS
// ==============================
const itemCode = document.getElementById("itemCode");
const itemName = document.getElementById("itemName");
const category = document.getElementById("category");
const size = document.getElementById("size");
const unit = document.getElementById("unit");
const minStock = document.getElementById("minStock");
const status = document.getElementById("status");
const productImage = document.getElementById("productImage");
const previewImage = document.getElementById("previewImage");
const msg = document.getElementById("msg");
const searchCode = document.getElementById("searchCode");

// ==============================
// ON LOAD
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  newProduct(); // Auto-generate on page load
});

// ==============================
// FORM CONTROL
// ==============================
function disableForm() {
  document.querySelectorAll(".left-form input, .left-form select").forEach(el => {
    if (el !== searchCode) el.disabled = true;
  });
  itemCode.disabled = true;
}

function enableForm() {
  document.querySelectorAll(".left-form input, .left-form select").forEach(el => {
    el.disabled = false;
  });
  itemCode.disabled = true; // Item code always non-editable
}

// ==============================
// NEW PRODUCT
// ==============================
function newProduct() {
  isEditMode = false;
  clearForm();
  enableForm();

  generateItemCode().then(code => {
    itemCode.value = code;
  });
}

// ==============================
// EDIT MODE
// ==============================
function enableEdit() {
  if (!itemCode.value) {
    alert("Search a product first");
    return;
  }
  isEditMode = true;
  enableForm();
}

// ==============================
// SEARCH PRODUCT
// ==============================
function searchProduct() {
  const code = searchCode.value.trim();
  if (!code) return alert("Enter Item Code");

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getProduct", itemCode: code })
  })
  .then(res => res.json())
  .then(data => {
    if (!data || data.status === "NOT_FOUND") {
      alert("Product not found");
      return;
    }

    // Fill form
    itemCode.value = data.itemCode;
    itemName.value = data.itemName;
    category.value = data.category;
    size.value = data.size;
    unit.value = data.unit;
    minStock.value = data.minStock;
    status.value = data.status;

    // Show image
    previewImage.src = data.imageUrl || "";

    disableForm();
  })
  .catch(err => {
    console.error(err);
    alert("Error loading product");
  });
}

// ==============================
// IMAGE PREVIEW
// ==============================
productImage.addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => previewImage.src = e.target.result;
  reader.readAsDataURL(file);
});

// ==============================
// SAVE (CREATE / UPDATE)
// ==============================
document.getElementById("productForm").addEventListener("submit", function(e) {
  e.preventDefault();
  msg.innerText = "Saving...";

  const formData = {
    action: isEditMode ? "updateProduct" : "createProduct",
    itemCode: itemCode.value,
    itemName: itemName.value,
    category: category.value,
    size: size.value,
    unit: unit.value,
    minStock: minStock.value,
    status: status.value
  };

  const file = productImage.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function() {
      formData.image = reader.result;
      sendData(formData);
    };
    reader.readAsDataURL(file);
  } else {
    sendData(formData);
  }
});

// ==============================
// SEND DATA
// ==============================
function sendData(data) {
  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    msg.innerText = "✅ Saved Successfully";

    clearForm();
    generateItemCode().then(code => itemCode.value = code);
    isEditMode = false;
  })
  .catch(err => {
    console.error(err);
    msg.innerText = "❌ Error saving";
  });
}

// ==============================
// CLEAR FORM
// ==============================
function clearForm() {
  document.getElementById("productForm").reset();
  previewImage.src = "";
  searchCode.value = "";
}

// ==============================
// GENERATE ITEM CODE
// ==============================
function generateItemCode() {
  return fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getLastItemCode" })
  })
  .then(res => res.json())
  .then(data => {
    let lastCode = data.lastCode || "NSS00000";
    let num = parseInt(lastCode.replace("NSS", "")) + 1;
    return "NSS" + num.toString().padStart(5, "0");
  });
}
