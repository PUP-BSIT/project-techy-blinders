const API_URL = `https://blindvault.site/php/deposit_customer.php`;

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById("account_id");
    const depositAmountInput = document.getElementById("deposit_amount");
    const depositButton = document.getElementById("deposit");
    const cancelButton = document.getElementById("cancel");
    const backButton = document.getElementById("back_button");
    
    accountIdInput.addEventListener('input', validateForm);
    depositAmountInput.addEventListener('input', validateForm);
    
    depositButton.addEventListener('click', submitDeposit);
    cancelButton.addEventListener('click', handleCancel);
    backButton.addEventListener('click', handleBack);
    
    depositAmountInput.addEventListener('blur', function() {
        const value = this.value.trim();
        if (!isNaN(value) && value !== "") {
            // Do nothing to preserve input as-is
        }
    });

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
    const accountHolderId = document.getElementById("account_id").value.trim();
    const depositAmount = document.getElementById("deposit_amount").value.trim();
    const depositButton = document.getElementById("deposit");
    
    const isValid = accountHolderId.length > 0 && 
                   depositAmount.length > 0 && 
                   !isNaN(parseFloat(depositAmount)) && 
                   parseFloat(depositAmount) > 0;
    
    depositButton.disabled = !isValid;
    depositButton.style.cursor = isValid ? 'pointer' : 'not-allowed';
}

function submitDeposit() {
    const accountHolderId = document.getElementById("account_id").value.trim();
    const depositAmount = document.getElementById("deposit_amount").value.trim();
    const depositButton = document.getElementById("deposit");
    
    if (!accountHolderId || !depositAmount) {
        showModal("Please complete all fields", 'error', 'Error');
        return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
        showModal("Please enter a valid positive amount", 'error', 'Error');
        return;
    }

    depositButton.disabled = true;
    depositButton.innerHTML = '<span class="loading-spinner"></span>Processing...';

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
                depositAmount: amount.toFixed(2)
            });
            window.location.href = "deposit_confirmation_page.html?" + params.toString();
        } else {
            showModal('Account not found: ' + data.message, 'error', 'Error');
            depositButton.disabled = false;
            depositButton.innerHTML = 'Deposit';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showModal('Error validating account. Please try again.', 'error', 'Error');
        depositButton.disabled = false;
        depositButton.innerHTML = 'Deposit';
    });
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