let otpVerification = document.getElementById("otp_verification");
let verifyButton = document.getElementById("verify")

function validateForm (){
    if (otpVerification.value.length) {
        verifyButton.disabled = false;
        verifyButton.style.cursor = "pointer";
    }else{
        verifyButton.disabled = true;
        verifyButton.style.cursor = "not-allowed";
    }
}

validateForm();
otpVerification.addEventListener("input", validateForm);