const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_internal.php`;

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById("account_id");
    const transferAmountInput = document.getElementById("transfer_amount");
    
    accountIdInput.addEventListener('input', validateForm);
    transferAmountInput.addEventListener('input', validateForm);
    
    validateForm();

    document.getElementById("transfer").addEventListener('click', submitUser);
});

function validateForm() {
    let accountHolderId = document.getElementById("account_id").value;
    let transferAmount = document.getElementById("transfer_amount").value;
    let transferButton = document.getElementById("transfer");
    
    if(accountHolderId.length && transferAmount.length){
        transferButton.disabled = false;
        transferButton.style.cursor = 'pointer';
    } else {
        transferButton.disabled = true;
        transferButton.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let transferAmount = document.getElementById("transfer_amount").value;
    let loggedInUserId = localStorage.getItem("loggedInId");
    let currentBalance = parseFloat(localStorage.getItem("currentBalance"));
    
    if (!accountHolderId || !transferAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    if (accountHolderId === loggedInUserId) {
        alert("You cannot transfer funds to yourself.");
        return;
    }

    if (currentBalance === 0) {
        alert("Transaction not allowed. Your balance is 0.");
        return;
    }

    if (parseFloat(transferAmount) > currentBalance) {
        alert("Transfer amount exceeds current balance.");
        return;
    }

    // Fetch account name before proceeding to confirmation
    fetch(`https://darkorange-cormorant-406076.hostingersite.com/php/get_account_info.php`, {
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
                transferAmount: transferAmount,
                recipientBalance: data.balance
            });
            window.location.href = "confirmation_form.html?" + params.toString();
        } else {
            alert('Account not found: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error validating account');
    });
}

function cancelButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

function backButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}