const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_internal.php`;

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

            const params = new URLSearchParams({
                accountHolderId: accountHolderId,
                accountName: data.account_name,
                transferAmount: transferAmount
            });

            window.location.href = "transfer_confirmation.html?" + params.toString();
        } else {
            alert('Transfer failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing transfer');
    });
}

function cancelButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

function backButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}