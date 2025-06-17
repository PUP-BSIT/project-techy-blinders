const API_URL = "https://blindvault.site/php/login_page.php";

 function showModal(message, type = 'info', title = 'Alert') {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    
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
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        const closeButton = modal.querySelector('.modal-button.primary');
        closeButton.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

document.getElementById('custom_modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('custom_modal').style.display === 'block') {
        closeModal();
    }
});

function loginUser() {
    console.log("loginUser triggered");

    const loginButton = document.querySelector('.button');
    let accountId = document.getElementById('account_id').value;
    let password = document.getElementById('password').value;

    console.log("Account ID:", accountId, "Password length:", password.length);

    if (!accountId || !password) {
        showModal('Please enter both account ID and password.', 'warning', 'Missing Information');
        return;
    }

    loginButton.disabled = true;
    loginButton.innerHTML = '<span class="loading-spinner"></span>Logging in...';

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: `account_holder_id=${encodeURIComponent(accountId)}&password=${encodeURIComponent(password)}`
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
                alert('Login successful!');
                window.location.href = "account_holder_home_page.html?login_success=true";
            } else {
                alert('Login failed: ' + (data.error || data.message || 'Unknown error'));
                window.location.href = "login_page_index.html?login_success=false";
            }

        } catch (e) {
            console.error('JSON parse error:', e);
            alert('Server error: Invalid response format');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Network error: ' + error.message);
    });
}