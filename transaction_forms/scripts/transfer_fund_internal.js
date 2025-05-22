let transferAmount = document.getElementById("transfer_amount");
let recipientId = document.getElementById("recipient_id");
let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");

function validateForm () {
    if (transferAmount.value.length && recipientId.value.length){
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
    } else {
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

validateForm();
transferAmount.addEventListener("input", validateForm);
recipientId.addEventListener("input", validateForm);