document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const depositAmount = urlParams.get('depositAmount');

    if (!accountHolderId || !accountName || !depositAmount) {
        alert('Missing required information. Returning to deposit form.');
        window.location.href = 'deposit_customer_form.html';
        return;
    }

    document.getElementById('account_holder_id').value = accountHolderId;
    document.getElementById('deposit_amount').value = depositAmount;

    document.getElementById('display_account_holder_id').textContent = accountHolderId;
    document.getElementById('display_account_name').textContent = accountName;
    document.getElementById('display_deposit_amount').textContent = '$' + depositAmount;

    document.getElementById('confirm').addEventListener('click', handleConfirm);
    document.getElementById('cancel').addEventListener('click', handleCancel);
    document.getElementById('back_button').addEventListener('click', handleBack);
});

function handleConfirm() {
    const confirmButton = document.getElementById('confirm');
    const accountHolderId = document.getElementById('account_holder_id').value;
    const depositAmount = document.getElementById('deposit_amount').value;

    if (!accountHolderId || !depositAmount) {
        alert('Missing required information for deposit');
        return;
    }

    confirmButton.disabled = true;
    confirmButton.textContent = 'Processing...';

    fetch('https://blindvault.site/php/deposit_customer.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: accountHolderId,
            amount: parseFloat(depositAmount)
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Deposit successful!\nNew Balance: $${data.new_balance}`);
            window.location.href = 'bank_teller_homepage.html';
        } else {
            alert('Deposit failed: ' + data.message);
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error processing deposit. Please try again.');
        confirmButton.disabled = false;
        confirmButton.textContent = 'Confirm';
    });
}

function handleCancel() {
    if (confirm('Are you sure you want to cancel this deposit?')) {
        window.location.href = 'bank_teller_homepage.html';
    }
}

function handleBack() {
    window.location.href = 'deposit_customer_form.html';
}