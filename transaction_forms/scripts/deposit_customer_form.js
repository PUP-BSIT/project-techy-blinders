let accoundIdInput = document.getElementById("account_id");
let depositAmount = document.getElementById("deposit_ammount");
let cancelButton = document.getElementById("cancel");
let depositButton = document.getElementById("deposit");

function validateForm () {
    if (accoundIdInput.value.length && depositAmount.value.length){
        depositButton.disabled = false;
        depositButton.style.cursor = "pointer";
    }else {
        depositButton.disabled = true;
        depositButton.style.cursor = "not-allowed";
    }
}

validateForm();

accoundIdInput.addEventListener("input", validateForm);
depositAmount.addEventListener("input", validateForm);