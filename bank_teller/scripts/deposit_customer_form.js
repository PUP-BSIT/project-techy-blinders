const API_URL = `https://blindvault.site/php/deposit_customer.php`;

document.addEventListener('DOMContentLoaded', function() {
    const depositButton = document.getElementById('deposit');
    const cancelButton = document.getElementById('cancel');
    const accountIdInput = document.getElementById('account_id');
    const depositAmountInput = document.getElementById('deposit_amount');

    depositButton.addEventListener('click', handleDeposit);
    cancelButton.addEventListener('click', handleCancel);
    accountIdInput.addEventListener('input', validateForm);
    depositAmountInput.addEventListener('input', validateForm);

    validateForm();
});

let modalCallback = null;

function showModal(message, type = 'info', title = 'Alert', callback = null) {
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
    const depositAmount = document.getElementById('deposit_amount').value.trim();
    const depositButton = document.getElementById('deposit');

    if (accountId && depositAmount) {
        depositButton.disabled = false;
        depositButton.style.opacity = '1';
        depositButton.style.cursor = 'pointer';
    } else {
        depositButton.disabled = true;
        depositButton.style.opacity = '0.6';
        depositButton.style.cursor = 'not-allowed';
    }
}

function handleDeposit() {
    const accountId = document.getElementById('account_id').value.trim();
    const depositAmount = document.getElementById('deposit_amount').value.trim();
    const depositButton = document.getElementById('deposit');
    const originalText = depositButton.textContent;

    if (!accountId || !depositAmount) {
        showModal('Please fill in all required fields', 'error', 'Error');
        resetDepositButton(depositButton, originalText);
        return;
    }

    const amount = parseFloat(depositAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amount) || amount <= 0) {
        showModal('Please enter a valid positive deposit amount', 'error', 'Error');
        resetDepositButton(depositButton, originalText);
        return;
    }

    depositButton.disabled = true;
    depositButton.textContent = 'Processing...';

    fetch('https://blindvault.site/php/get_account_info.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_holder_id: accountId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const params = new URLSearchParams({
                accountHolderId: accountId,
                accountName: data.account_name,
                depositAmount: amount.toFixed(2)
            });
            window.location.href = "deposit_confirmation_page.html?" + params.toString();
        } else {
            showModal('Account not found: ' + data.message, 'error', 'Error');
            resetDepositButton(depositButton, originalText);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showModal('Error validating account. Please try again.', 'error', 'Error');
        resetDepositButton(depositButton, originalText);
    });
}

function resetDepositButton(depositButton, originalText) {
    depositButton.disabled = false;
    depositButton.textContent = originalText;
    depositButton.style.opacity = '1';
    depositButton.style.cursor = 'pointer';
}

function handleCancel() {
    showModal('Are you sure you want to cancel this deposit?', 'confirm', 'Cancel Deposit', (confirmed) => {
        if (confirmed) {
            navigateToHomepage();
        }
        closeModal();
    });
}

function handleBack() {
    navigateToHomepage();
}

function navigateToHomepage() {
    window.location.href = "bank_teller_homepage.html";
}