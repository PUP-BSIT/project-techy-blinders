const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_customer.php`;

window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const transferAmount = urlParams.get('transferAmount');

    if (accountHolderId && accountName && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('display_account_name').textContent = accountName;
        document.getElementById('display_transfer_amount').textContent = '₱' + parseFloat(transferAmount).toFixed(2);

        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('transfer_amount').value = transferAmount;
    } else {
        alert("Missing transfer information. Please go back and fill the form.");
        window.location.href = "transfer_fund_internal.html";
    }
};

function submitTransfer() {
    const accountHolderId = document.getElementById("account_holder_id").value;
    const transferAmount = document.getElementById("transfer_amount").value;

    if (!accountHolderId || !transferAmount) {
        alert("Missing transfer information");
        return;
    }

    if (isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    const transferData = {
        account_holder_id: accountHolderId,
        amount: parseFloat(transferAmount)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Transfer successful! New balance: ₱' + data.new_balance);
            window.location.href = "thank_you_message.html";
        } else {
            alert('Transfer failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing the transfer');
    });
}

function cancelTransfer() {
    if (confirm("Are you sure you want to cancel this transfer?")) {
        window.location.href = "transfer_fund_internal.html";
    }
}