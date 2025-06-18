const API_URL = "https://blindvault.site/php/login_page.php";

 function showModal(message, type = 'info', title = 'Login') {
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

function loginUser() {
    console.log("loginUser triggered");

    const loginButton = document.querySelector('.button');
    let accountId = document.getElementById('account_id').value;
    let password = document.getElementById('password').value;
    const captchaResponse = grecaptcha.getResponse();

    console.log("Account ID:", accountId, "Password length:", password.length);

    if (!accountId || !password) {
        showModal('Please enter both account ID and password.', 'warning', 'Missing Information');
        return;
    }

    if (captchaResponse.length === 0) {
        showModal("Please verify the CAPTCHA before logging in.", "error", "CAPTCHA Required");
        return;
    }

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerHTML = '<span class="loading-spinner"></span>Logging in...';
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: `account_holder_id=${encodeURIComponent(accountId)}&password=${encodeURIComponent(password)}&g-recaptcha-response=${encodeURIComponent(captchaResponse)}`
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log("Raw response:", text);
        try {
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);

            if (data.success) {
                sessionStorage.setItem("account_holder_id", data.account_holder_id);
                localStorage.setItem("loggedInId", data.account_holder_id);

                console.log("Session storage set:", sessionStorage.getItem("account_holder_id"));
                console.log("Local storage set:", localStorage.getItem("loggedInId"));
                
                showModal('Login successful!', 'success', 'Success');
                
                setTimeout(() => {
                    window.location.href = "account_holder_home_page.html?login_success=true";
                }, 1500);
            } else {
                showModal('Login failed: ' + (data.error || data.message || 'Unknown error'), 'error', 'Login Failed');
                
                setTimeout(() => {
                    window.location.href = "login_page_index.html?login_success=false";
                }, 2000);
            }

        } catch (e) {
            console.error('JSON parse error:', e);
            showModal('Server error: Invalid response format', 'error', 'Server Error');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showModal('Network error: ' + error.message, 'error', 'Network Error');
    })
    .finally(() => {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Login'; // Or whatever the original text was
        }
    });
}