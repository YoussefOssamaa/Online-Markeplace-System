document.addEventListener("DOMContentLoaded", () => {
    const nameInput = document.getElementById("name");
    const descInput = document.getElementById("desc");
    const priceInput = document.getElementById("price");
    const form = document.getElementById("editForm");
  
    // Get index of item to edit from URL (e.g., edit-item.html?index=2)
    const urlParams = new URLSearchParams(window.location.search);
    const index = parseInt(urlParams.get("index"), 10);
  
    let items = JSON.parse(localStorage.getItem("products")) || [];
  
    // If item index is valid, fill the form
    // if (!isNaN(index) && items[index]) {
    //   const item = items[index];
    //   nameInput.value = item.name;
    //   descInput.value = item.desc;
    //   priceInput.value = item.price;
    // } else {
    //   alert("Invalid item.");
    //   window.location.href = "myProducts.html";
    // }
  
    // Submit updated item

    function showAlert(message) {
      const alertBox = document.getElementById("customAlert");
      const alertMessage = document.getElementById("customAlertMessage");
    
      alertMessage.textContent = message;
      alertBox.classList.remove("hidden");
    }
    
    // Close the alert when "OK" is clicked
    document.getElementById("alertOkBtn").addEventListener("click", () => {
      document.getElementById("customAlert").classList.add("hidden");
      window.close();
    });
    
    
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      items[index] = {
        name: nameInput.value.trim(),
        desc: descInput.value.trim(),
        price: parseFloat(priceInput.value),
      };
  
      localStorage.setItem("products", JSON.stringify(items));
  
      // alert("Item updated successfully!");
      showAlert("Your item was updated successfully!");
    });
  });
  