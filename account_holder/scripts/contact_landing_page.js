const API_URL = "https://blindvault.site/php/process_contact.php";

function showModal(message, type = 'info', title = 'Thank You') {
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
        showModal(message);
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

document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById("name_input");
    const emailInput = document.getElementById("email_input");
    const numberInput = document.getElementById("number_input");
    const submitButton = document.getElementById("submit_button");
    const textInput = document.getElementById("comment_input");

    nameInput.addEventListener('input', validateForm);
    emailInput.addEventListener('input', validateForm);
    numberInput.addEventListener('input', validateForm);
    textInput.addEventListener('input', validateForm);
    submitButton.addEventListener('click', submitContactForm);

    validateForm();
});

function validateForm() {
    const nameInput = document.getElementById("name_input").value;
    const emailInput = document.getElementById("email_input").value;
    const numberInput = document.getElementById("number_input").value;
    const textInput = document.getElementById("comment_input").value;
    const submitButton = document.getElementById("submit_button");

    if (nameInput.length && emailInput.length && numberInput.length 
        && textInput.length) {
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
    } else {
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

function submitContactForm() {
    const nameInput = document.getElementById("name_input").value;
    const emailInput = document.getElementById("email_input").value;
    const numberInput = document.getElementById("number_input").value;
    const textInput = document.getElementById("comment_input").value;
    const submitButton = document.getElementById("submit_button");

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            full_name: nameInput,
            email: emailInput,
            phone_number: numberInput,
            message: textInput,
            'g-recaptcha-response': captchaResponse
        })
    })
    .then(response => response.json())
    .then(data => {
        let captchaResponse = '';
        
        if (typeof grecaptcha !== 'undefined') {
            captchaResponse = grecaptcha.getResponse();
        } else {
            showModal("reCAPTCHA not loaded. Please refresh the page and try again.", 'error', 'Captcha Error');
            return;
        }
        
        if (data.success) {
            showModal('Thank you for your message. We will get back to you soon!');
            clearForm();
        } else {
            showModal('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showModal('An error occurred while sending your message.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        validateForm();
    });
}

function clearForm() {
    document.getElementById("name_input").value = "";
    document.getElementById("email_input").value = "";
    document.getElementById("number_input").value = "";
    document.getElementById("comment_input").value = "";
    validateForm();
}