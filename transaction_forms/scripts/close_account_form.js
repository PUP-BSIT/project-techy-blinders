let accoundIdInput = document.getElementById("account_id");
let reasonInput = document.getElementById("reason");
let cancelButton = document.getElementById("cancel");
let submitButton = document.getElementById("submit");

function validateForm() {
    if (accoundIdInput.value.length && reasonInput.value.length) {
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
    }else{
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

validateForm()

accoundIdInput.addEventListener("input", validateForm);
reasonInput.addEventListener("input", validateForm);