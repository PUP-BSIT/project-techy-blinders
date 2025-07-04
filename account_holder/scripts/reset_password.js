const API_URL = "https://blindvault.site/php/password_reset.php";

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

    function validateForm() {
        const accountId = accountIdInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!accountId || !newPassword || !confirmPassword) {
            showMessage('Please fill in all fields.', 'error');
            return false;
        }

        if (!/^\d+$/.test(accountId)) {
            showMessage('Account number must contain only numbers.', 'error');
            return false;
        }

        if (newPassword.length < 8) {
            showMessage('Password must be at least 8 characters long.', 'error');
            return false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
        if (!passwordRegex.test(newPassword)) {
            showMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.', 'error');
            return false;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return false;
        }

        return true;
    }

    function showMessage(message, type) {
        const modal = document.getElementById('custom_modal');
        const modalTitle = document.getElementById('modal_title');
        const modalIcon = document.getElementById('modal_icon');
        const modalMessage = document.getElementById('modal_message');
        
        if (type === 'error') {
            modalTitle.textContent = 'Error';
            modalIcon.className = 'modal-icon fas fa-exclamation-circle';
            modalIcon.style.color = '#c62828';
        } else if (type === 'success') {
            modalTitle.textContent = 'Success';
            modalIcon.className = 'modal-icon fas fa-check-circle';
            modalIcon.style.color = '#2e7d32';
        } else {
            modalTitle.textContent = 'Alert';
            modalIcon.className = 'modal-icon fas fa-info-circle';
            modalIcon.style.color = '#1976d2';
        }
        
        modalMessage.textContent = message;
        modal.style.display = 'flex';
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

    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            const formData = new FormData();
            formData.append('account_holder_id', accountIdInput.value.trim());
            formData.append('new_password', newPasswordInput.value);
            formData.append('confirm_password', confirmPasswordInput.value);

            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Password reset successful! You can now login with your new password.', 'success');
                
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
            } else {
                showMessage(result.message || 'Password reset failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again later.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
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