const API_URL = "https://blindvault.site/php/password_reset.php";

function showModal(message, type = 'info', title = 'Reset Password') {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    
    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found:', {
            modal: !!modal,
            modalTitle: !!modalTitle,
            modalMessage: !!modalMessage,
            modalIcon: !!modalIcon
        });
        alert(message);
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
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
        case 'info':
            modalIcon.className += ' info fas fa-info-circle';
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
        const closeButton = modal.querySelector('.modal-button.primary');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

async function resetPasswordFunction(accountId, newPassword, confirmPassword) {
    const submitButton = document.getElementById('submit_button');
    const accountIdInput = document.getElementById('account_id');
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    
    if (!accountId || !newPassword || !confirmPassword) {
        showModal('Please fill in all fields.', 'error');
        return false;
    }

    if (!/^\d+$/.test(accountId)) {
        showModal('Account number must contain only numbers.', 'error');
        return false;
    }

    if (newPassword.length < 8) {
        showModal('Password must be at least 8 characters long.', 'error');
        return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(newPassword)) {
        showModal('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 'error');
        return false;
    }

    if (newPassword !== confirmPassword) {
        showModal('Passwords do not match.', 'error');
        return false;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const formData = new FormData();
        formData.append('account_holder_id', accountId.trim());
        formData.append('new_password', newPassword);
        formData.append('confirm_password', confirmPassword);

        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
            showModal('Password reset successful! You can now login with your new password.', 'success');
            
            accountIdInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            setTimeout(() => {
                const modal = document.getElementById('custom_modal');
                const modalButton = modal.querySelector('.modal-button');
                modalButton.onclick = function() {
                    closeModal();
                    window.location.href = './login_page_index.html';
                };
            }, 100);
            
            return true;
        } else {
            showModal(result.message || 'Password reset failed. Please try again.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        showModal('An error occurred. Please try again later.', 'error');
        return false;
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById('account_id');
    const newPasswordInput = document.getElementById('new_password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const submitButton = document.getElementById('submit_button');
    const cancelButton = document.getElementById('cancel_button');
    
    const toggleNewPasswordBtn = document.querySelector('#toggle_password_icon_new').parentElement;
    const toggleConfirmPasswordBtn = document.querySelector('#toggle_password_icon_confirm').parentElement;
    const toggleNewPasswordIcon = document.getElementById('toggle_password_icon_new');
    const toggleConfirmPasswordIcon = document.getElementById('toggle_password_icon_confirm');

    toggleNewPasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(newPasswordInput, toggleNewPasswordIcon);
    });

    toggleConfirmPasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(confirmPasswordInput, toggleConfirmPasswordIcon);
    });

    function togglePasswordVisibility(inputField, iconElement) {
        if (inputField.type === 'password') {
            inputField.type = 'text';
            iconElement.classList.remove('fa-eye');
            iconElement.classList.add('fa-eye-slash');
        } else {
            inputField.type = 'password';
            iconElement.classList.remove('fa-eye-slash');
            iconElement.classList.add('fa-eye');
        }
    }

    window.closeModal = function() {
        const modal = document.getElementById('custom_modal');
        modal.style.display = 'none';
    }

    document.getElementById('custom_modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    window.resetPassword = async function() {
        const accountId = accountIdInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        await resetPasswordFunction(accountId, newPassword, confirmPassword);
    };

    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const accountId = accountIdInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        await resetPasswordFunction(accountId, newPassword, confirmPassword);
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitButton.click();
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            confirmPasswordInput.style.borderColor = '#c62828';
        } else {
            confirmPasswordInput.style.borderColor = '';
        }
    });

    newPasswordInput.addEventListener('input', function() {
        const password = newPasswordInput.value;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        
        if (password.length >= 8 && passwordRegex.test(password)) {
            newPasswordInput.style.borderColor = '#2e7d32';
        } else if (password.length > 0) {
            newPasswordInput.style.borderColor = '#ff9800';
        } else {
            newPasswordInput.style.borderColor = '';
        }
    });
});