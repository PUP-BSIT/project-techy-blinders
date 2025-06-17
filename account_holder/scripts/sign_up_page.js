let API_URL = "https://blindvault.site/php/process_registration.php";

function showModal(message, type = 'info', title = 'Alert') {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    
    // Check if all elements exist
    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found:', {
            modal: !!modal,
            modalTitle: !!modalTitle,
            modalMessage: !!modalMessage,
            modalIcon: !!modalIcon
        });
        // Fallback to browser alert if modal elements don't exist
        alert(message);
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Reset classes first
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
    
    // Remove any existing show class first
    modal.classList.remove('show');
    
    // Force display and trigger reflow
    modal.style.display = 'block';
    modal.offsetHeight; // Force reflow
    
    // Add show class
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    // Focus the close button after animation
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

document.addEventListener('DOMContentLoaded', function() {
    // Add modal event listeners only if modal exists
    const customModal = document.getElementById('custom_modal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Form validation setup
    const firstName = document.getElementById("first_name");
    const lastName = document.getElementById("last_name");
    const middleName = document.getElementById("middle_name");
    const phoneNumber = document.getElementById("phone_number");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");

    if (firstName && lastName && middleName && phoneNumber && email && password && confirmPassword) {
        firstName.addEventListener('input', validateForm);
        lastName.addEventListener('input', validateForm);
        middleName.addEventListener('input', validateForm);
        phoneNumber.addEventListener('input', validateForm);
        email.addEventListener('input', validateForm);
        password.addEventListener('input', validateForm);
        confirmPassword.addEventListener('input', validateForm);

        validateForm();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('custom_modal')?.style.display === 'block') {
        closeModal();
    }
});

function validateForm() {
    const firstName = document.getElementById("first_name")?.value || '';
    const lastName = document.getElementById("last_name")?.value || '';
    const middleName = document.getElementById("middle_name")?.value || '';
    const phoneNumber = document.getElementById("phone_number")?.value || '';
    const email = document.getElementById("email")?.value || '';
    const password = document.getElementById("password")?.value || '';
    const confirmPassword = document.getElementById("confirm_password")?.value || '';
    let createAccount = document.querySelector('.create');
    
    if (!createAccount) return;
    
    if(firstName.length && lastName.length && middleName.length &&
        phoneNumber.length && email.length && password.length
        && confirmPassword.length ){
        createAccount.disabled = false;
        createAccount.style.cursor = 'pointer';
    } else {
        createAccount.disabled = true;
        createAccount.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let firstName = document.getElementById("first_name")?.value || '';
    let lastName = document.getElementById("last_name")?.value || '';
    let middleInitial = document.getElementById("middle_name")?.value || '';
    let phoneNumber = document.getElementById("phone_number")?.value || '';
    let email = document.getElementById("email")?.value || '';
    let password = document.getElementById("password")?.value || '';
    let confirmationPassword = document.getElementById("confirm_password")?.value || '';
    
    const phonePattern = /^[0-9]{10,15}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validateForm();
    
    if (!firstName || !lastName || !middleInitial) {
        showModal("Please complete the form.", 'warning', 'Missing Information');
        return;
    }

    if (!phonePattern.test(phoneNumber)) {
        showModal("Phone number must be 10–15 digits.", 'warning', 'Invalid Phone Number');
        return;
    }

    if (!emailPattern.test(email)) {
        showModal("Please enter a valid email address.", 'warning', 'Invalid Email');
        return;
    }

    if (password.length < 6) {
        showModal("Password must be at least 6 characters.", 'warning', 'Password Too Short');
        return;
    }

    if (password !== confirmationPassword) {
        showModal("Passwords do not match.", 'warning', 'Password Mismatch');
        return;
    }

    const submitButton = document.querySelector('.create');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span>Creating Account...';
    }

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "first_name=" + encodeURIComponent(firstName) + "&" +
              "last_name=" + encodeURIComponent(lastName) + "&" +
              "middle_name=" + encodeURIComponent(middleInitial) + "&" +
              "phone_number=" + encodeURIComponent(phoneNumber) + "&" +
              "email=" + encodeURIComponent(email) + "&" +
              "password=" + encodeURIComponent(password)
    })
    .then((response) => response.text())
    .then((responseText) => {
        console.log("Server response:", responseText);
        
        if (responseText.toLowerCase().includes("success") || 
            responseText.toLowerCase().includes("created") ||
            responseText.toLowerCase().includes("registered")) {
            
            let accountId = extractAccountId(responseText);
            
            if (accountId) {
                showModal(`Account successfully created! Your Account ID is: ${accountId}\n\nPlease save this ID as you will need it to log in.`, 'success', 'Account Created');
            } else {
                showModal("Account successfully created! Please check the server response for your Account ID.", 'success', 'Account Created');
            }
            
            clearForm();
            
            setTimeout(() => {
                window.location.href = "login_page_index.html?account_successfully_created=true&account_id=" + (accountId || '');
            }, 3000);
            
        } else {
            showModal(responseText, 'error', 'Registration Failed');
        }
    })
    .catch((error) => {
        console.error("Error submitting user:", error);
        showModal("An error occurred. Please try again.", 'error', 'Network Error');
    })
    .finally(() => {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account'; // Or whatever the original text was
        }
    });
}

function extractAccountId(responseText) {
    try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.account_id || jsonData.accountId || jsonData.id) {
            return jsonData.account_id || jsonData.accountId || jsonData.id;
        }
    } catch (e) {
    }
    
    const numberMatches = responseText.match(/\b\d{6,}\b/g);
    if (numberMatches && numberMatches.length > 0) {
        return numberMatches[0]; 
    }
    
    const patterns = [
        /account\s*id[:\s]*(\d+)/i,
        /id[:\s]*(\d+)/i,
        /account[:\s]*(\d+)/i
    ];
    
    for (let pattern of patterns) {
        const match = responseText.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null; 
}

function clearForm() {
    const form = document.getElementById("signup_form");
    if (form) {
        form.reset();
    }
    validateForm();
}