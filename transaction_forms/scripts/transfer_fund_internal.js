const API_URL = `https://blindvault.site/php/transfer_internal.php`;

document.addEventListener('DOMContentLoaded', function () {
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

    if (accountHolderId.length && transferAmount.length) {
        transferButton.disabled = false;
        transferButton.style.cursor = 'pointer';
    } else {
        transferButton.disabled = true;
        transferButton.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let rawTransferAmount = document.getElementById("transfer_amount").value;
    let transferAmount = parseFloat(rawTransferAmount);
    let loggedInUserId = localStorage.getItem("loggedInId");
    let rawCurrentBalance = localStorage.getItem("currentBalance");
    let currentBalance = parseFloat(rawCurrentBalance);

    // Debug logs
    console.log('Raw transfer amount:', rawTransferAmount);
    console.log('Parsed transfer amount:', transferAmount, 'Type:', typeof transferAmount);
    console.log('Raw current balance:', rawCurrentBalance);
    console.log('Parsed current balance:', currentBalance, 'Type:', typeof currentBalance);

    if (!accountHolderId || !transferAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    if (accountHolderId === loggedInUserId) {
        alert("You cannot transfer funds to yourself.");
        return;
    }

    if (isNaN(currentBalance) || currentBalance === 0) {
        alert("Transaction not allowed. Your balance is 0.");
        return;
    }

    console.log('Comparing balance:', currentBalance, '<', transferAmount, '=', currentBalance < transferAmount);

    if (currentBalance < transferAmount) {
        alert("Not enough Balance.");
        return;
    }

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
                transferAmount: transferAmount,
                recipientBalance: data.balance
            });
            window.location.href = "confirmation_form.html?" + params.toString();
        } else {
            alert("Account not found.");
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
