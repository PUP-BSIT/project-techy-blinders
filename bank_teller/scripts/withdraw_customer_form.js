const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/withdraw_funds.php`;
const ACCOUNT_INFO_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/get_account_info.php`;

document.addEventListener('DOMContentLoaded', function () {
    const withdrawButton = document.getElementById('withdraw');
    const cancelButton = document.getElementById('cancel');
    const accountIdInput = document.getElementById('account_id');
    const withdrawAmountInput = document.getElementById('withdraw_ammount');

    withdrawButton.addEventListener('click', handleWithdraw);
    cancelButton.addEventListener('click', handleCancel);

    accountIdInput.addEventListener('input', validateForm);
    withdrawAmountInput.addEventListener('input', validateForm);

    validateForm();
});

function validateForm() {
    const accountId = document.getElementById('account_id').value.trim();
    const withdrawAmount = document.getElementById('withdraw_ammount').value.trim();
    const withdrawButton = document.getElementById('withdraw');

    if (accountId && withdrawAmount) {
        withdrawButton.disabled = false;
        withdrawButton.style.opacity = '1';
        withdrawButton.style.cursor = 'pointer';
    } else {
        withdrawButton.disabled = true;
        withdrawButton.style.opacity = '0.6';
        withdrawButton.style.cursor = 'not-allowed';
    }
}

function handleCancel() {
    document.getElementById('account_id').value = '';
    document.getElementById('withdraw_ammount').value = '';
    validateForm();

    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
        window.location.href = '../bank_teller/bank_teller_homepage.html';
    }
}

async function handleWithdraw() {
    const accountId = document.getElementById('account_id').value.trim();
    const withdrawAmountInput = document.getElementById('withdraw_ammount').value.trim();

    if (!accountId || !withdrawAmountInput) {
        alert('Please fill in all required fields');
        return;
    }

    const withdrawal = parseFloat(withdrawAmountInput.replace(/[^0-9.]/g, ''));
    if (isNaN(withdrawal) || withdrawal <= 0) {
        alert('Please enter a valid positive withdrawal amount');
        return;
    }

    const withdrawButton = document.getElementById('withdraw');
    const originalText = withdrawButton.textContent;
    withdrawButton.disabled = true;
    withdrawButton.textContent = 'Processing...';

    try {
        const accountResponse = await fetch(ACCOUNT_INFO_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ account_holder_id: accountId })
        });

        const accountData = await accountResponse.json();
        console.log("Raw accountData:", accountData);

        if (!accountData.success) {
            alert('Account verification failed: ' + accountData.message);
            return;
        }

        const currentBalance = parseFloat(accountData.current_balance.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(currentBalance)) {
            alert('Invalid balance data received. Please try again.');
            return;
        }

        console.log("DEBUG - currentBalance:", currentBalance);
        console.log("DEBUG - withdrawal:", withdrawal);

        if (withdrawal > currentBalance) {
            alert("Not enough balance to withdraw that amount.");
            return;
        }

        const confirmMessage = `Account Details:\nName: ${accountData.account_name}\nCurrent Balance: $${currentBalance}\n\nWithdraw Amount: $${withdrawal}\n\nProceed with withdrawal?`;
        if (!confirm(confirmMessage)) {
            return;
        }

        const tellerTransactionId = 'WTH' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        const withdrawResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account_id: accountId,
                withdraw_amount: withdrawal,
                teller_transaction_id: tellerTransactionId,
                withdraw_type: 'teller_withdrawal'
            })
        });

        const withdrawData = await withdrawResponse.json();

        if (withdrawData.success) {
            alert(`Withdrawal Successful!\n\nTransaction Details:\nTransaction ID: ${tellerTransactionId}\nAccount: ${withdrawData.account_name}\nWithdrawn Amount: $${withdrawData.withdrawn_amount}\nNew Balance: $${withdrawData.new_balance}`);
            document.getElementById('account_id').value = '';
            document.getElementById('withdraw_ammount').value = '';
            validateForm();

            if (confirm('Withdrawal completed successfully. Would you like to process another withdrawal?')) {
                window.location.href = 'withdraw_funds.html?teller_transactionsuccess=true&' + tellerTransactionId;
            } else {
                window.location.href = '../bank_teller/bank_teller_homepage.html';
            }
        } else {
            alert('Withdrawal Failed: ' + withdrawData.message);
            window.location.href = '../bank_teller/bank_teller_homepage.html';
        }

    } catch (error) {
        console.error('Error processing withdrawal:', error);
        alert('An error occurred while processing the withdrawal. Please try again.');
    } finally {
        withdrawButton.disabled = false;
        withdrawButton.textContent = originalText;
        validateForm();
    }
}