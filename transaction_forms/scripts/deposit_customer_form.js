const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/get_account_info.php`;

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById("account_id");
    const depositAmountInput = document.getElementById("deposit_amount");
    
    accountIdInput.addEventListener('input', validateForm);
    depositAmountInput.addEventListener('input', validateForm);
    
    validateForm();
});

function validateForm() {
    let accountHolderId = document.getElementById("account_id").value;
    let depositAmount = document.getElementById("deposit_amount").value;
    let depositButton = document.getElementById("deposit");

    if(accountHolderId.length && depositAmount.length){
        depositButton.disabled = false;
        depositButton.style.cursor = 'pointer';
    } else {
        depositButton.disabled = true;
        depositButton.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let depositAmount = document.getElementById("deposit_amount").value;
    validateForm();

    if (!accountHolderId || !depositAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    fetch(API_URL, {
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
                depositAmount: depositAmount
            });

            window.location.href = "confirmation_form.html?" + params.toString();
        } else {
            alert('Account not found: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error fetching account information');
    });
}

function cancelButton() {
    window.location.href = "../bank_teller/bank_teller_homepage.html";
}

function backButton() {
    window.location.href = "../bank_teller/bank_teller_homepage.html";
}