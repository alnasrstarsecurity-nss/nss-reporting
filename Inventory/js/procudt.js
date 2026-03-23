document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("productForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
      formType: "product",
      itemCode: document.getElementById("itemCode").value.trim(),
      itemName: document.getElementById("itemName").value.trim(),
      category: document.getElementById("category").value,
      size: document.getElementById("size").value,
      unit: document.getElementById("unit").value,
      minStock: document.getElementById("minStock").value,
      status: document.getElementById("status").value
    };

    // Basic validation
    if (!data.itemCode || !data.itemName) {
      showMessage("Please fill all required fields", "red");
      return;
    }

    // Send to Apps Script
    google.script.run
  .withSuccessHandler(function (res) {
    showMessage("Product saved successfully!", "green");
    form.reset();
  })
  .withFailureHandler(function (err) {
    showMessage("Error: " + err.message, "red");
  })
  .addProduct(data);

  });

});


function showMessage(message, color) {
  const msg = document.getElementById("msg");
  msg.innerText = message;
  msg.style.color = color;
}
