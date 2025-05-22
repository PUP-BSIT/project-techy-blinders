let accountIdInput = document.getElementById("account_id");
let withdrawInput = document.getElementById("withdraw_ammount");
let withdrawButton = document.getElementById("withdraw");
let cancelButton = document.getElementById("cancel");

function validateForm() {
    if (accountIdInput.value.length && withdrawInput.value.length) {
        withdrawButton.disabled = false;
        withdrawButton.style.cursor = "pointer";
    }else {
        withdrawButton.disabled = true;
        withdrawButton.style.cursor = "not-allowed";
    }
}

validateForm()
accountIdInput.addEventListener("input", validateForm);
withdrawInput.addEventListener("input", validateForm);