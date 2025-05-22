let transferAmountExternal = document.getElementById("transfer_amount_external");
let recipientId = document.getElementById("recipient_id_external");
let selectBank = document.getElementsByClassName("select-external-option")[0];
let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");

function validateForm() {
    if (transferAmountExternal.value.length && recipientId.value.length &&
        selectBank.value.length ){
            submitButton.disabled = false;
            submitButton.style.cursor = "pointer";
        } else {
            submitButton.disabled = true;
            submitButton.style.cursor ="not-allowed";
        }
}

validateForm()
transferAmountExternal.addEventListener("input", validateForm);
recipientId.addEventListener("input", validateForm);
selectBank.addEventListener("input", validateForm);