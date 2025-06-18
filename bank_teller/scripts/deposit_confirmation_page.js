document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const depositAmount = urlParams.get('depositAmount');

    if (!accountHolderId || !accountName || !depositAmount) {
        showModal('Missing required information. Returning to deposit form.', 'error', 'Error', () => {
            window.location.href = 'deposit_customer_form.html';
        });
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

function handleConfirm() {
    const confirmButton = document.getElementById('confirm');
    const accountHolderId = document.getElementById('account_holder_id').value;
    const depositAmount = document.getElementById('deposit_amount').value;

    if (!accountHolderId || !depositAmount) {
        showModal('Missing required information for deposit', 'error', 'Error');
        return;
    }

    confirmButton.disabled = true;
    confirmButton.innerHTML = '<span class="loading-spinner"></span>Processing...';

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
            showModal(`Deposit successful!\nNew Balance: $${data.new_balance}`, 'success', 'Success', () => {
                window.location.href = 'bank_teller_homepage.html';
            });
        } else {
            showModal('Deposit failed: ' + data.message, 'error', 'Error');
            confirmButton.disabled = false;
            confirmButton.innerHTML = 'Confirm';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showModal('Error processing deposit. Please try again.', 'error', 'Error');
        confirmButton.disabled = false;
        confirmButton.innerHTML = 'Confirm';
    });
}

function handleCancel() {
    showModal('Are you sure you want to cancel this deposit?', 'confirm', 'Cancel Deposit', (confirmed) => {
        if (confirmed) {
            window.location.href = 'bank_teller_homepage.html';
        }
        closeModal();
    });
}

function handleBack() {
    window.location.href = 'deposit_customer_form.html';
}