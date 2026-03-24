const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwlt4QxEjMpL1D6QooqpictMcm_rQ41ffdnHDfG7JdOtGhnYt7ZJpROCbDugMhRtoCDOQ/exec";

let isEditMode = false;

// DOM elements
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

// ------------------
// Page load
// ------------------
window.addEventListener("DOMContentLoaded", () => {
  newProduct();
});

// ------------------
// Enable / Disable Form
// ------------------
function enableForm() {
  [itemName, category, size, unit, minStock, status, productImage].forEach(el => el.disabled=false);
  itemCode.disabled = true;
}

function disableForm() {
  [itemName, category, size, unit, minStock, status, productImage].forEach(el => el.disabled=true);
  itemCode.disabled = true;
}

// ------------------
// Generate next item code
// ------------------
function generateItemCode() {
  return fetch(SCRIPT_URL, { method:"POST", body:JSON.stringify({action:"getLastItemCode"}) })
    .then(res => res.json())
    .then(data => {
      let lastCode = data.lastCode || "NSS00000";
      let num = parseInt(lastCode.replace("NSS","")) + 1;
      return "NSS" + num.toString().padStart(5,"0");
    });
}

// ------------------
// New Product
// ------------------
function newProduct() {
  isEditMode = false;
  clearForm();
  enableForm();

  generateItemCode().then(code => itemCode.value = code);
}

// ------------------
// Edit Mode
// ------------------
function enableEdit() {
  if (!itemCode.value) return alert("Search a product first");
  isEditMode = true;
  enableForm();
}

// ------------------
// Search Product
// ------------------
function searchProduct() {
  const code = searchCode.value.trim();
  if (!code) return alert("Enter Item Code");

  fetch(SCRIPT_URL, { method:"POST", body:JSON.stringify({ action:"getProduct", itemCode: code }) })
    .then(res=>res.json())
    .then(data=>{
      if(!data || data.status==="NOT_FOUND") return alert("Product not found");

      itemCode.value = data.itemCode;
      itemName.value = data.itemName;
      category.value = data.category;
      size.value = data.size;
      unit.value = data.unit;
      minStock.value = data.minStock;
      status.value = data.status;
      previewImage.src = data.imageUrl || "";

      disableForm();
    });
}

// ------------------
// Image Preview
// ------------------
productImage.addEventListener("change", function(){
  const file = this.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = e => previewImage.src = e.target.result;
  reader.readAsDataURL(file);
});

// ------------------
// Save Product
// ------------------
document.getElementById("productForm").addEventListener("submit", function(e){
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
  if(file){
    const reader = new FileReader();
    reader.onload = function(){ formData.image = reader.result; sendData(formData); };
    reader.readAsDataURL(file);
  } else sendData(formData);
});

// ------------------
// Send Data
// ------------------
function sendData(data){
  fetch(SCRIPT_URL,{method:"POST",body:JSON.stringify(data)})
    .then(res=>res.json())
    .then(res=>{
      msg.innerText = "✅ Saved Successfully";
      newProduct(); // reset + generate next code
    })
    .catch(err=>{
      console.error(err);
      msg.innerText = "❌ Error saving";
    });
}

// ------------------
// Clear Form
// ------------------
function clearForm(){
  document.getElementById("productForm").reset();
  previewImage.src="";
  searchCode.value="";
}
