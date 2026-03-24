// ==============================
// CONFIG
// ==============================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyJDGV1zL_WREIz6FGEpIqOlmOrdI11RaWaecB-AeaiyMDufd7xPVHjPuoMc9F84MXEyQ/exec";

// ==============================
// GLOBAL STATE
// ==============================
let isEditMode = false;

// ==============================
// ON LOAD
// ==============================
window.onload = () => {
  disableForm();
};

// ==============================
// FORM CONTROL
// ==============================
function disableForm() {
  document.querySelectorAll(".left-form input, .left-form select").forEach(el => {
    if (el.id !== "searchCode") {
      el.disabled = true;
    }
  });
}

  document.getElementById("itemCode").disabled = true;
}

function enableForm() {
  document.querySelectorAll(".left-form input, .left-form select").forEach(el => {
    el.disabled = false;
  });

  document.getElementById("itemCode").disabled = true;
}

// ==============================
// NEW PRODUCT
// ==============================
function newProduct() {
  isEditMode = false;

  clearForm();
  enableForm();

  generateItemCode().then(code => {
    document.getElementById("itemCode").value = code;
  });
}

window.onload = () => {
  newProduct();   // 👈 auto generate
};
// ==============================
// EDIT MODE
// ==============================
function enableEdit() {
  if (!document.getElementById("itemCode").value) {
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
  const code = document.getElementById("searchCode").value;

  if (!code) {
    alert("Enter Item Code");
    return;
  }

  fetch(SCRIPT_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getProduct",
      itemCode: code
    })
  })
  .then(res => res.json())
  .then(data => {

    if (!data || data.status === "NOT_FOUND") {
      alert("Product not found");
      return;
    }

    // Fill form
    document.getElementById("itemCode").value = data.itemCode;
    document.getElementById("itemName").value = data.itemName;
    document.getElementById("category").value = data.category;
    document.getElementById("size").value = data.size;
    document.getElementById("unit").value = data.unit;
    document.getElementById("minStock").value = data.minStock;
    document.getElementById("status").value = data.status;

    // Show image
    if (data.imageUrl) {
      document.getElementById("previewImage").src = data.imageUrl;
    } else {
      document.getElementById("previewImage").src = "";
    }

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
document.getElementById("productImage").addEventListener("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("previewImage").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ==============================
// SAVE (CREATE / UPDATE)
// ==============================
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const msg = document.getElementById("msg");
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

    reader.onload = function () {
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

    document.getElementById("msg").innerText = "✅ Saved Successfully";

    clearForm();

    // 👇 get next code again
    generateItemCode().then(code => {
      document.getElementById("itemCode").value = code;
    });

    isEditMode = false;

  })
  .catch(err => {
    console.error(err);
    document.getElementById("msg").innerText = "❌ Error saving";
  });
}

// ==============================
// CLEAR FORM
// ==============================
function clearForm() {
  document.getElementById("productForm").reset();
  document.getElementById("previewImage").src = "";
}

// ==============================
// item code
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
