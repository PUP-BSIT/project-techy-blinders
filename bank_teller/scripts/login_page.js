const API_URL = "https://blindvault.site/php/login_page_teller.php";

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

function tellerUser() {
    console.log("tellerUser triggered");
    
    const loginButton = document.querySelector('.button');
    let tellerId = document.getElementById('teller_id').value;
    let password = document.getElementById('password').value;
    
    console.log("Teller ID:", tellerId, "Password length:", password.length);
    
    if (!tellerId || !password) {
        showModal('Please enter both teller ID and password.', 'warning', 'Missing Information');
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
        body: `teller_id=${encodeURIComponent(tellerId)}&password=${encodeURIComponent(password)}`
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
                sessionStorage.setItem("teller_id", data.teller_id);
                console.log("Session storage set:", sessionStorage.getItem("teller_id"));
                
                showModal('Login successful!', 'success', 'Success');
                
                setTimeout(() => {
                    window.location.href = './bank_teller_homepage.html?login_success=true';
                }, 1500);
            } else {
                showModal('Login failed: ' + (data.error || data.message || 'Unknown error'), 'error', 'Login Failed');
                
                setTimeout(() => {
                    window.location.href = "login_page.html?login_success=false";
                }, 2000);
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response was:', text);
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
            loginButton.innerHTML = 'Log in';
        }
    });
}

// Close modal when clicking outside of it
document.addEventListener('click', function(event) {
    const modal = document.getElementById('custom_modal');
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            tellerUser();
        });
    }
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                tellerUser();
            }
        });
    });

    const passwordInput = document.getElementById("password");
    const togglePasswordBtn = document.getElementById("toggle_password");
    const toggleIcon = document.getElementById("toggle_password_icon");

    if (passwordInput && togglePasswordBtn && toggleIcon) {
        togglePasswordBtn.addEventListener("click", () => {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            toggleIcon.classList.toggle("fa-eye");
            toggleIcon.classList.toggle("fa-eye-slash");
        });
    }
});