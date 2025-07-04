document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mobileNav.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && mobileNav.classList.contains('active')) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
    
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
});

const API_URL = "https://blindvault.site/php/process_contact.php";

function showModal(message, type = 'info', title = 'Thank You') {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');

    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements missing:', { modal, modalTitle, modalMessage, modalIcon });
        alert(message);
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;

    modalIcon.className = 'modal-icon'; // Reset icon classes

    switch (type) {
        case 'success':
            modalIcon.classList.add('success', 'fas', 'fa-check-circle');
            break;
        case 'error':
            modalIcon.classList.add('error', 'fas', 'fa-times-circle');
            break;
        case 'warning':
            modalIcon.classList.add('warning', 'fas', 'fa-exclamation-triangle');
            break;
        default:
            modalIcon.classList.add('info', 'fas', 'fa-info-circle');
    }

    modal.style.display = 'block';
    requestAnimationFrame(() => modal.classList.add('show'));

    setTimeout(() => {
        const closeButton = modal.querySelector('.modal-button.primary');
        if (closeButton) closeButton.focus();
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

document.addEventListener('DOMContentLoaded', () => {
    ['name_input', 'email_input', 'number_input', 'comment_input'].forEach(id => {
        document.getElementById(id).addEventListener('input', validateForm);
    });

    document.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        submitContactForm();
    });

    validateForm();
});

function validateForm() {
    const name = document.getElementById("name_input").value.trim();
    const email = document.getElementById("email_input").value.trim();
    const phone = document.getElementById("number_input").value.trim();
    const message = document.getElementById("comment_input").value.trim();
    const submitButton = document.getElementById("submit_button");

    const isFormValid = name && email && phone && message;
    submitButton.disabled = !isFormValid;
    submitButton.style.cursor = isFormValid ? "pointer" : "not-allowed";
}

function submitContactForm() {
    const name = document.getElementById("name_input").value.trim();
    const email = document.getElementById("email_input").value.trim();
    const phone = document.getElementById("number_input").value.trim();
    const message = document.getElementById("comment_input").value.trim();
    const submitButton = document.getElementById("submit_button");

    let captchaResponse = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : '';

    if (!captchaResponse) {
        showModal("Please complete the reCAPTCHA verification.", 'warning', 'Verification Required');
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            full_name: name,
            email: email,
            phone_number: phone,
            message: message,
            'g-recaptcha-response': captchaResponse
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showModal(data.message || 'Message sent successfully.', 'success', 'Thank You');
            clearForm();
        } else {
            showModal(data.message || 'Something went wrong.', 'error', 'Error');
        }
    })
    .catch(err => {
        console.error("Submission error:", err);
        showModal("Unable to submit the form. Please try again later.", 'error', 'Network Error');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        validateForm();
    });
}

function clearForm() {
    ["name_input", "email_input", "number_input", "comment_input"].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function logoutSession() {
    const logoutBtn = document.querySelectorAll('.logout_button');
    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>Logging out...';
    }

    fetch("https://blindvault.site/php/logout_session.php", {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout response:", data);
        
        localStorage.clear();
        sessionStorage.clear();
        
        window.location.replace("../index.html");
    })
    .catch(error => {
        console.error("Logout error:", error);
        
        localStorage.clear();
        sessionStorage.clear();
        
        window.location.replace("../index.html");
    });
}