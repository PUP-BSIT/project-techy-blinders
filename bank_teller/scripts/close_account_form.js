document.addEventListener('DOMContentLoaded', function () {
    const accountIdInput = document.getElementById('account_id');
    const reasonInput = document.getElementById('closure_reason');
    const cancelButton = document.getElementById('cancel');
    const submitButton = document.getElementById('submit');

    function validateForm() {
        const accountHolderId = accountIdInput.value.trim();
        const reasonText = reasonInput.value.trim();

        submitButton.disabled = !(accountHolderId && reasonText);
        submitButton.style.cursor = submitButton.disabled ? 'not-allowed' : 'pointer';
    }

    validateForm();
    accountIdInput.addEventListener('input', validateForm);
    reasonInput.addEventListener('input', validateForm);

    cancelButton.addEventListener('click', function () {
        showModal('Are you sure you want to cancel? Any unsaved changes will be lost.', 'confirm', 'Cancel Confirmation', (confirmed) => {
            if (confirmed) {
                accountIdInput.value = '';
                reasonInput.value = '';
                window.location.href = 'accout_management_page.html';
            }
            closeModal();
        }, true);
    });

    submitButton.addEventListener('click', function () {
        const accountId = accountIdInput.value.trim();
        const reason = reasonInput.value.trim();

        if (!accountId) {
            showModal('Please enter an Account ID', 'error', 'Error');
            accountIdInput.focus();
            return;
        }

        if (!reason) {
            showModal('Please provide a reason for account closure', 'error', 'Error');
            reasonInput.focus();
            return;
        }

        showModal(`Are you sure you want to close account ${accountId}? This action cannot be undone.`, 'confirm', 'Confirm Closure', (confirmed) => {
            if (!confirmed) {
                return;
            }

            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';

            const requestData = {
                account_id: accountId,
                reason: reason
            };

            fetch('https://blindvault.site/php/teller_close_account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text().then(text => {
                        if (!text) throw new Error('Empty response from server');
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            throw new Error('Invalid JSON response: ' + text);
                        }
                    });
                })
                .then(data => {
                    if (data.success) {
                        showModal(`Account closed successfully!\n\nAccount: ${data.account_name || accountId}\nClosure Date: ${data.close_date}\nTransaction ID: ${data.transaction_id}`, 'success', 'Success', () => {
                            accountIdInput.value = '';
                            reasonInput.value = '';
                            window.location.href = "close_account_form.html?close_success=true&" + accountId;
                        }, false);
                    } else {
                        showModal('Error: ' + data.message, 'error', 'Error', () => {
                            submitButton.disabled = false;
                            submitButton.textContent = 'Submit';
                            closeModal();
                        }, false);
                    }
                })
                .catch(error => {
                    console.error('Detailed error:', error);
                    showModal('Error details: ' + error.message, 'error', 'Error', () => {
                        submitButton.disabled = false;
                        submitButton.textContent = 'Submit';
                        closeModal();
                    }, false);
                });
        }, true);
    });
});

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
    window.modalCallback = callback; // Store callback globally
    modalCancel.style.display = showCancel ? 'inline-block' : 'none';
    
    modalIcon.className = 'modal-icon';
    
    switch(type) {
        case 'success':
            modalIcon.className += ' success fas fa-check-circle';
            break;
        case 'error':
            modalIcon.className += ' error fas fa-times-circle';
            break;
        case 'confirm':
            modalIcon.className += ' info fas fa-question-circle';
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
        window.modalCallback = null; // Clear callback after closing
    }, 300);
}

function handleModalOk() {
    console.log('handleModalOk triggered, callback exists:', !!window.modalCallback);
    if (window.modalCallback) {
        window.modalCallback(true);
    } else {
        closeModal();
    }
}