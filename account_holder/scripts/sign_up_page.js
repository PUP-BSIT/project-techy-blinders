let API_URL = "https://blindvault.site/php/process_registration.php";

document.addEventListener("DOMContentLoaded", function () {
    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("toggle_password");
    const togglePasswordIcon = document.getElementById("toggle_password_icon");

    if (passwordInput && togglePasswordBtn && togglePasswordIcon) {
        togglePasswordBtn.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            togglePasswordIcon.classList.toggle("fa-eye");
            togglePasswordIcon.classList.toggle("fa-eye-slash");
        });
    }

    const confirmPasswordInput = document.getElementById("confirm_password");
    const toggleConfirmBtn = document.getElementById("toggle_confirm_password");
    const toggleConfirmIcon = document.getElementById("toggle_confirm_password_icon");

    if (confirmPasswordInput && toggleConfirmBtn && toggleConfirmIcon) {
        toggleConfirmBtn.addEventListener("click", () => {
            const isHidden = confirmPasswordInput.type === "password";
            confirmPasswordInput.type = isHidden ? "text" : "password";
            toggleConfirmIcon.classList.toggle("fa-eye");
            toggleConfirmIcon.classList.toggle("fa-eye-slash");
        });
    }

    const form = document.querySelector("form");
    form.addEventListener("submit", function (e) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            e.preventDefault(); // Stop form from submitting
            alert("Passwords do not match!");
        }
    });

    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    const closeMenu = () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('active');
    };

    hamburger.onclick = () => {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
    };

    document.onclick = e => {
        if (
        mobileNav.classList.contains('active') &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
        ) closeMenu();
    };

    mobileNav.querySelectorAll('a').forEach(link =>
        link.onclick = closeMenu
    );

    window.onresize = () => {
        if (window.innerWidth > 768) closeMenu();
    };
});

function getFormData() {
    return {
        firstName: document.getElementById("first_name")?.value?.trim() || '',
        lastName: document.getElementById("last_name")?.value?.trim() || '',
        middleName: document.getElementById("middle_name")?.value?.trim() || '',
        phoneNumber: document.getElementById("phone_number")?.value?.trim() || '',
        email: document.getElementById("email")?.value?.trim() || '',
        password: document.getElementById("password")?.value || '',
        confirmPassword: document.getElementById("confirm_password")?.value || ''
    };
}

function showModal(message, type = 'info', title = 'Alert') {
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
    modalMessage.innerHTML = message;
    
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

function copyAccountId() {
    const input = document.getElementById("accountIdInput");
    input.select();
    input.setSelectionRange(0, 99999); 

    navigator.clipboard.writeText(input.value).then(() => {
        showModal("Account ID copied to clipboard!");
    }).catch(err => {
        console.error("Failed to copy:", err);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const customModal = document.getElementById('custom_modal');
    if (customModal) {
        customModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    const fieldIds = ["first_name", "last_name", "middle_name", "phone_number", "email", "password", "confirm_password"];
    const allFieldsExist = fieldIds.every(id => document.getElementById(id));
    
    if (allFieldsExist) {
        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.addEventListener('input', validateForm);
            }
        });
        validateForm();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('custom_modal')?.style.display === 'block') {
        closeModal();
    }
});

function validateForm() {
    const formData = getFormData();
    const createAccount = document.querySelector('.create');
    
    if (!createAccount) return;
    
    const allFieldsFilled = Object.values(formData).every(value => value.length > 0);
    
    if (allFieldsFilled) {
        createAccount.disabled = false;
        createAccount.style.cursor = 'pointer';
    } else {
        createAccount.disabled = true;
        createAccount.style.cursor = "not-allowed";
    }
}

function submitUser() {
    const formData = getFormData();
    
    let captchaResponse = '';
    if (typeof grecaptcha !== 'undefined') {
        captchaResponse = grecaptcha.getResponse();
    } else {
        showModal("reCAPTCHA not loaded. Please refresh the page and try again.", 'error', 'Captcha Error');
        return;
    }

    const phonePattern = /^[0-9]{10,15}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validateForm();
    
    if (!formData.firstName || !formData.lastName || !formData.middleName) {
        showModal("Please complete all required fields.", 'warning', 'Missing Information');
        return;
    }

    if (!phonePattern.test(formData.phoneNumber)) {
        showModal("Phone number must be 10–15 digits.", 'warning', 'Invalid Phone Number');
        return;
    }

    if (!emailPattern.test(formData.email)) {
        showModal("Please enter a valid email address.", 'warning', 'Invalid Email');
        return;
    }

    if (formData.password.length < 6) {
        showModal("Password must be at least 6 characters.", 'warning', 'Password Too Short');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showModal("Passwords do not match.", 'warning', 'Password Mismatch');
        return;
    }

    if (captchaResponse.length === 0) {
        showModal("Please verify the CAPTCHA before proceeding.", "error", "CAPTCHA Required");
        return;
    }

    const submitButton = document.querySelector('.create');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="loading-spinner"></span>Creating Account...';
    }

    const formPayload = new URLSearchParams({
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        password: formData.password,
        'g-recaptcha-response': captchaResponse
    });

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formPayload.toString()
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then((responseText) => {
        console.log("Server response:", responseText);
        
        if (responseText.toLowerCase().includes("success") || 
            responseText.toLowerCase().includes("created") ||
            responseText.toLowerCase().includes("registered")) {
            
            let accountId = extractAccountId(responseText);
            
            if (accountId) {
                showModal(`
                    <p>Account successfully created!</p>
                    <p>Your Account ID is:</p>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="text" id="accountIdInput" value="${accountId}" readonly style="padding: 5px; font-weight: bold; width: 200px;" />
                        <button onclick="copyAccountId()">Copy</button>
                    </div>
                    <p>Please save this ID as you will need it to log in.</p>
                `, 'success', 'Account Created');
            } else {
                showModal("Account successfully created! Please check your email for your Account ID.", 'success', 'Account Created');
            }
            
            clearForm();
            
            setTimeout(() => {
                window.location.href = "login_page_index.html?account_successfully_created=true" + (accountId ? "&account_id=" + encodeURIComponent(accountId) : '');
            }, 3000);
            
        } else {
            try {
                const errorData = JSON.parse(responseText);
                showModal(errorData.message || errorData.error || responseText, 'error', 'Registration Failed');
            } catch (e) {
                showModal(responseText, 'error', 'Registration Failed');
            }
        }
    })
    .catch((error) => {
        console.error("Error submitting user:", error);
        showModal("A network error occurred. Please check your connection and try again.", 'error', 'Network Error');
    })
    .finally(() => {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
        
        if (typeof grecaptcha !== 'undefined') {
            grecaptcha.reset();
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
    
    const numberMatches = responseText.match(/\b\d{6,}\b/g);
    if (numberMatches && numberMatches.length > 0) {
        return numberMatches[0]; 
    }
    
    return null; 
}

function clearForm() {
    const form = document.getElementById("signup_form");
    if (form) {
        form.reset();
    }
    
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
    }
    
    validateForm();
}