const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_internal.php`;

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const transferAmount = urlParams.get('transferAmount');
    const currentBalance = parseFloat(localStorage.getItem("currentBalance")).toFixed(2);

    if (accountHolderId && accountName && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('display_account_name').textContent = accountName;
        document.getElementById('display_deposit_amount').textContent = '$' + parseFloat(transferAmount).toFixed(2);
        
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = transferAmount;

        // Show current balance alert
        alert(`Your current balance: $${currentBalance}\nTransfer amount: $${parseFloat(transferAmount).toFixed(2)}\nRemaining balance after transfer: $${(parseFloat(currentBalance) - parseFloat(transferAmount)).toFixed(2)}`);
    } else {
        alert("Missing transfer information. Please go back and fill the form.");
        window.location.href = "transfer_fund_internal.html";
    }
};

document.getElementById('confirm').addEventListener('click', function() {
    let accountHolderId = document.getElementById("account_holder_id").value;
    let transferAmount = document.getElementById("deposit_amount").value;
    let loggedInUserId = localStorage.getItem("loggedInId");
    let currentBalance = parseFloat(localStorage.getItem("currentBalance"));

    if (!accountHolderId || !transferAmount) {
        alert("Missing transfer information");
        return;
    }

    if (isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    if (parseFloat(transferAmount) > currentBalance) {
        alert("Transfer amount exceeds current balance.");
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: accountHolderId,
            amount: transferAmount,
            sender_id: loggedInUserId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const serverBalance = parseFloat(data.sender_new_balance.replace(/,/g, ''));
            localStorage.setItem("currentBalance", serverBalance.toFixed(2));
            window.location.href = "thank_you_message.html";
        } else {
            alert('Transfer failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing transfer');
    });
});

document.getElementById('cancel').addEventListener('click', function() {
    if (confirm("Are you sure you want to cancel this transfer?")) {
        window.location.href = "transfer_fund_internal.html";
    }
});

document.getElementById('back_button').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = "transfer_fund_internal.html";
});