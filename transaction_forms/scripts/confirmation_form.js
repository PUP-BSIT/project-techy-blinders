const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/deposit_customer.php`;
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const depositAmount = urlParams.get('depositAmount');

    if (accountHolderId && accountName && depositAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('display_account_name').textContent = accountName;
        document.getElementById('display_deposit_amount').textContent = '$' + parseFloat(depositAmount).toFixed(2);
        
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = depositAmount;
    } else {
        alert("Missing deposit information. Please go back and fill the form.");
        window.location.href = "deposit_internal.html";
    }
};

function submitDeposit() {
    let accountHolderId = document.getElementById("account_holder_id").value;
    let depositAmount = document.getElementById("deposit_amount").value;

    if (!accountHolderId || !depositAmount) {
        alert("Missing deposit information");
        return;
    }

    if (isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    const depositData = {
        account_holder_id: accountHolderId,
        amount: parseFloat(depositAmount)
    };

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(depositData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Deposit successful! New balance: $' + data.new_balance);
            window.location.href = "thank_you_message.html";
        } else {
            alert('Deposit failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing the deposit');
    });
}

function cancelDeposit() {
    if (confirm("Are you sure you want to cancel this deposit?")) {
        window.location.href = "deposit_customer_form.html";
    }
}