const API_URL = `https://blindvault.site/php/deposit_customer.php`;

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById("account_id");
    const depositAmountInput = document.getElementById("deposit_amount");
    const depositButton = document.getElementById("deposit");
    const cancelButton = document.getElementById("cancel");
    const backButton = document.getElementById("back_button");
    
    accountIdInput.addEventListener('input', validateForm);
    depositAmountInput.addEventListener('input', validateForm);
    
    depositButton.addEventListener('click', submitDeposit);
    cancelButton.addEventListener('click', handleCancel);
    backButton.addEventListener('click', handleBack);
    
    depositAmountInput.addEventListener('blur', function() {
    const value = this.value.trim();
    if (!isNaN(value) && value !== "") {
        // Do nothing to preserve input as-is
    }
    });


    validateForm();
});

function validateForm() {
    const accountHolderId = document.getElementById("account_id").value.trim();
    const depositAmount = document.getElementById("deposit_amount").value.trim();
    const depositButton = document.getElementById("deposit");
    
    const isValid = accountHolderId.length > 0 && 
                   depositAmount.length > 0 && 
                   !isNaN(parseFloat(depositAmount)) && 
                   parseFloat(depositAmount) > 0;
    
    depositButton.disabled = !isValid;
    depositButton.style.cursor = isValid ? 'pointer' : 'not-allowed';
}

function submitDeposit() {
    const accountHolderId = document.getElementById("account_id").value.trim();
    const depositAmount = document.getElementById("deposit_amount").value.trim();
    const depositButton = document.getElementById("deposit");
    
    if (!accountHolderId || !depositAmount) {
        alert("Please complete all fields");
        return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    depositButton.disabled = true;
    depositButton.textContent = 'Processing...';

    fetch(`https://blindvault.site/php/get_account_info.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: accountHolderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const params = new URLSearchParams({
                accountHolderId: accountHolderId,
                accountName: data.account_name,
                depositAmount: amount.toFixed(2)
            });
            window.location.href = "deposit_confirmation_page.html?" + params.toString();
        } else {
            alert('Account not found: ' + data.message);
            depositButton.disabled = false;
            depositButton.textContent = 'Deposit';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error validating account. Please try again.');
        depositButton.disabled = false;
        depositButton.textContent = 'Deposit';
    });
}

function handleCancel() {
    if (confirm('Are you sure you want to cancel this deposit?')) {
        navigateToHomepage();
    }
}

function handleBack() {
    navigateToHomepage();
}

function navigateToHomepage() {
    window.location.href = "bank_teller_homepage.html";
}