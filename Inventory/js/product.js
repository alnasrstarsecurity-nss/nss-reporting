const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTiLt43kqSm2aFe-IGyNTYKRdloeflTDllNCOl5NTk2Qc62nedzxpOkYhoCGHtFfPQew/exec";

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

const searchContainer = document.querySelector(".search-name-container");
const loadItemsBtn = document.getElementById("loadItemsBtn");

// ------------------
// Page load
// ------------------

window.addEventListener("DOMContentLoaded", () => { 
  newProduct();
});



// ------------------
// search by name
// ------------------
const searchName = document.getElementById("searchName");
const loadItemsBtn = document.getElementById("loadItemsBtn");
const autocompleteList = document.getElementById("autocompleteList");

let allItemNames = [];
let isLoaded = false;

// --------------------
// Load items on demand
// --------------------
/*loadItemsBtn.addEventListener("click", () => {
    
  if (isLoaded) {
    searchName.disabled = false;
    searchName.focus();
    return;
  }

  loadItemsBtn.innerText = "Loading";
  loadItemsBtn.disabled = true;

  fetch(SCRIPT_URL, { 
    method: "POST", 
    body: JSON.stringify({ action: "getItemNames" }) 
  })
  .then(res => res.json())
  .then(data => {
    allItemNames = data.names || [];
    isLoaded = true;
    searchName.disabled = false;
    searchName.focus();
    loadItemsBtn.innerText = "Search Item";  // restore button text
    loadItemsBtn.disabled = false;
  })
  .catch(err => {
    console.error(err);
    alert("Error loading items");
    loadItemsBtn.innerText = "Search Item";
    loadItemsBtn.disabled = false;
  });
});*/
loadItemsBtn.addEventListener("click", () => {

  // ✅ FORCE SHOW (strong override)
searchContainer.classList.add("show");

  // 🔥 DEBUG (remove later)
  console.log("Search container shown");

  if (isLoaded) {
    searchName.disabled = false;
    searchName.focus();
    return;
  }

  loadItemsBtn.innerText = "Loading...";
  loadItemsBtn.disabled = true;

  fetch(SCRIPT_URL, { 
    method: "POST", 
    body: JSON.stringify({ action: "getItemNames" }) 
  })
  .then(res => res.json())
  .then(data => {
    allItemNames = data.names || [];
    isLoaded = true;

    searchName.disabled = false;
    searchName.focus();

    loadItemsBtn.innerText = "Search";
    loadItemsBtn.disabled = false;
  })
  .catch(err => {
    console.error(err);
    alert("Error loading items");

    loadItemsBtn.innerText = "Search";
    loadItemsBtn.disabled = false;
  });
});

// --------------------
// Autocomplete logic
// --------------------

// When clicking a list item

searchName.addEventListener("input", function() {
  const query = this.value.toLowerCase();
  autocompleteList.innerHTML = "";

  // 🔹 Clear status when typing
  searchStatus.innerText = "";

  if (!query) {
    autocompleteList.style.display = "none";
    return;
  }

  const matches = allItemNames.filter(name => name.toLowerCase().startsWith(query));

  matches.slice(0, 10).forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;

    li.addEventListener("click", () => {
      searchName.value = name;
      autocompleteList.style.display = "none";

      // ✅ SHOW SEARCHING STATUS
      searchStatus.innerText = "Loading...";
      searchStatus.className = "search-status loading";

      // ✅ Load product details by name
      fetch(SCRIPT_URL, { 
        method: "POST", 
        body: JSON.stringify({ action: "getProductByName", itemName: name }) 
      })
      .then(res => res.json())
      .then(data => {

        if (!data || data.status === "NOT_FOUND") {
          searchStatus.innerText = "Product not found";
          searchStatus.className = "search-status error";
          return;
        }

        // ✅ Populate form fields
        itemCode.value = data.itemCode;
        itemName.value = data.itemName;
        category.value = data.category;
        size.value = data.size;
        unit.value = data.unit;
        minStock.value = data.minStock;
        status.value = data.status;
        previewImage.src = data.imageUrl || "";

        // Disable editing by default
        disableForm();

        // ✅ SUCCESS STATUS
        searchStatus.innerText = "Details found";
        searchStatus.className = "search-status success";
      })
      .catch(err => {
        console.error(err);

        searchStatus.innerText = "Error loading data";
        searchStatus.className = "search-status error";
      });
    });

    autocompleteList.appendChild(li);
  });

  autocompleteList.style.display = matches.length ? "block" : "none";
});
// --------------------
// Hide dropdown when clicking outside
// --------------------
document.addEventListener("click", function(e) {
  if (!searchName.contains(e.target) && !autocompleteList.contains(e.target) && e.target !== loadItemsBtn) {
    autocompleteList.style.display = "none";
  }
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
// searchProductByName
// ------------------

function searchProductByName(itemName) {
  fetch(SCRIPT_URL, { 
    method: "POST", 
    body: JSON.stringify({ action: "getProductByName", itemName: itemName }) 
  })
  .then(res => res.json())
  .then(data => {
    if (!data || data.status === "NOT_FOUND") return alert("Product not found");

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
// Clear Form
// ------------------
function clearForm(){
  document.getElementById("productForm").reset();
  previewImage.src="";
  searchCode.value="";
}
