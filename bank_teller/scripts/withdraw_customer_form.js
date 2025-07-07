const API_URL = `https://blindvault.site/php/withdraw_funds.php`;
const ACCOUNT_INFO_URL = `https://blindvault.site/php/get_account_info.php`;

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

let modalCallback = null;

function showModal(message, type = 'info', title = 'Alert', callback = null, showCancel = false) {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    const modalCancel = document.getElementById('modal_cancel');
    const modalOk = document.getElementById('modal_ok');
    
    if (!modal || !modalTitle || !modalMessage || !modalIcon || !modalCancel || !modalOk) {
        console.error('Modal elements not found');
        alert(message);
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCallback = callback;
    modalCancel.style.display = showCancel ? 'inline-block' : 'none';
    
    modalIcon.className = 'modal-icon';
    
    switch(type) {
        case 'success':
            modalIcon.className += ' success fas fa-check-circle';
            modalTitle.textContent = title || 'Success';
            break;
        case 'error':
            modalIcon.className += ' error fas fa-times-circle';
            modalTitle.textContent = title || 'Error';
            break;
        case 'warning':
            modalIcon.className += ' warning fas fa-exclamation-triangle';
            modalTitle.textContent = title || 'Warning';
            break;
        case 'confirm':
            modalIcon.className += ' info fas fa-question-circle';
            modalTitle.textContent = title || 'Confirm';
            modalCancel.style.display = 'inline-block';
            break;
        default:
            modalIcon.className += ' info fas fa-info-circle';
    }
    
    modal.classList.remove('show');
    
    modal.style.display = 'block';
    modal.offsetHeight; 
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    setTimeout(() => {
        modalOk.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    const modalCancel = document.getElementById('modal_cancel');
    if (!modal || !modalCancel) return;
    
    modal.classList.remove('show');
    modalCancel.style.display = 'none';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function handleModalOk() {
    if (modalCallback) {
        modalCallback(true);
    } else {
        closeModal();
    }
}

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

    showModal('Are you sure you want to cancel this withdraw?', 'confirm', 'Cancel Withdraw', (confirmed) => {
        if (confirmed) {
            window.location.href = '../bank_teller/bank_teller_homepage.html';
        }
        closeModal();
    });
}

function resetWithdrawButton(withdrawButton, originalText) {
    withdrawButton.disabled = false;
    withdrawButton.textContent = originalText;
    console.log('Button reset to:', withdrawButton.textContent, 'disabled:', withdrawButton.disabled);
}

async function handleWithdraw() {
    const accountId = document.getElementById('account_id').value.trim();
    const withdrawAmountInput = document.getElementById('withdraw_ammount').value.trim();
    const withdrawButton = document.getElementById('withdraw');
    const originalText = withdrawButton.textContent;

    if (!accountId || !withdrawAmountInput) {
        showModal('Please fill in all required fields', 'error', 'Error');
        resetWithdrawButton(withdrawButton, originalText);
        return;
    }

    const withdrawal = parseFloat(withdrawAmountInput.replace(/[^0-9.]/g, ''));
    if (isNaN(withdrawal) || withdrawal <= 0) {
        showModal('Please enter a valid positive withdrawal amount', 'error', 'Error');
        resetWithdrawButton(withdrawButton, originalText);
        return;
    }

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
            showModal('Account verification failed: ' + accountData.message, 'error', 'Error');
            resetWithdrawButton(withdrawButton, originalText);
            return;
        }

        const currentBalance = parseFloat(accountData.current_balance.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(currentBalance)) {
            showModal('Invalid balance data received. Please try again.', 'error', 'Error');
            resetWithdrawButton(withdrawButton, originalText);
            return;
        }

        console.log("DEBUG - currentBalance:", currentBalance);
        console.log("DEBUG - withdrawal:", withdrawal);

        if (withdrawal > currentBalance) {
            showModal("Not enough balance to withdraw that amount.", 'error', 'Error');
            resetWithdrawButton(withdrawButton, originalText);
            return;
        }

        const confirmMessage = `Account Details:\nName: ${accountData.account_name}\nCurrent Balance: $${currentBalance}\n\nWithdraw Amount: $${withdrawal}\n\nProceed with withdrawal?`;
        showModal(confirmMessage, 'confirm', 'Confirm Withdrawal', (confirmed) => {
            if (!confirmed) {
                window.location.href = '../bank_teller/bank_teller_homepage.html';
                return;
            }

            const tellerTransactionId = 'WTH' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

            fetch(API_URL, {
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
            })
            .then(withdrawResponse => withdrawResponse.json())
            .then(withdrawData => {
                if (withdrawData.success) {
                    showModal(`Withdrawal Successful!\n\nTransaction Details:\nTransaction ID: ${tellerTransactionId}\nAccount: ${withdrawData.account_name}\nWithdrawn Amount: $${withdrawData.withdrawn_amount}\nNew Balance: $${withdrawData.new_balance}`, 'success', 'Success', () => {
                        document.getElementById('account_id').value = '';
                        document.getElementById('withdraw_ammount').value = '';
                        validateForm();
                        window.location.href = '../bank_teller/bank_teller_homepage.html';
                    }, false);
                } else {
                    showModal('Withdrawal Failed: ' + withdrawData.message, 'error', 'Error');
                    resetWithdrawButton(withdrawButton, originalText);
                    window.location.href = '../bank_teller/bank_teller_homepage.html';
                }
            })
            .catch(error => {
                console.error('Error processing withdrawal:', error);
                showModal('An error occurred while processing the withdrawal. Please try again.', 'error', 'Error');
                resetWithdrawButton(withdrawButton, originalText);
            });
        });
    } catch (error) {
        console.error('Error processing withdrawal:', error);
        showModal('An error occurred while processing the withdrawal. Please try again.', 'error', 'Error');
        resetWithdrawButton(withdrawButton, originalText);
    }
}