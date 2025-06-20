const API_URL = `https://blindvault.site/php/transfer_external.php`;
const BALANCE_URL = `https://blindvault.site/php/get_balance.php`;
const OTP_URL = `https://blindvault.site/php/generate_otp.php`;
const VERIFY_OTP_URL = `https://blindvault.site/php/verify_otp.php`;

let transferAmountExternal = document.getElementById("transfer_amount_external");
let recipientId = document.getElementById("recipient_id_external");
let selectBank = document.getElementsByClassName("select-external-option")[0];
let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");
let totalBalanceElement = document.querySelector(".total-balance-external");

function showModal(message, type = 'info', title = 'Transaction External') {
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
            modalIcon.className += ' warning fa fa-exclamation-triangle';
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

// Function to fetch and update balance
function loadCurrentBalance() {
    const loggedInUserId = localStorage.getItem("loggedInId");
    console.log('Current loggedInId:', loggedInUserId);

    if (!loggedInUserId) {
        console.error("No logged in user found");
        fetch("https://blindvault.site/php/account_holder_home_page.php", {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Session data:', data);
            if (data.success && data.account_holder_id) {
                console.log('Setting loggedInId:', data.account_holder_id);
                localStorage.setItem("loggedInId", data.account_holder_id);
                
                if (data.account_balance) {
                    const balance = parseFloat(data.account_balance.replace(/,/g, ''));
                    if (!isNaN(balance)) {
                        localStorage.setItem("currentBalance", balance.toString());
                        if (totalBalanceElement) {
                            totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
                        }
                        console.log('Initial balance stored:', balance);
                    }
                }
                
                fetchBalance(data.account_holder_id);
            } else {
                console.error("Failed to get user ID from session:", data);
                showModal("Session expired. Please login again.", 'error');
                setTimeout(() => {
                    window.location.href = "../login_page_index.html";
                }, 2000);
            }
        })
        .catch(error => {
            console.error("Error validating session:", error);
            showModal("Session expired. Please login again.", 'error');
            setTimeout(() => {
                window.location.href = "../login_page_index.html";
            }, 2000);
        });
        return;
    }
    
    fetchBalance(loggedInUserId);
}

function handleSessionExpired() {
    localStorage.clear();
    sessionStorage.clear();
    showModal("Session expired. Please login again.", 'error');
    setTimeout(() => {
        window.location.href = "../login_page_index.html";
    }, 2000);
}

function fetchBalance(userId) {
    console.log('Fetching balance for user:', userId);
    fetch(BALANCE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => {
        console.log('Balance response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Balance data:', data);
        if (data.error === 'session_expired') {
            handleSessionExpired();
            return;
        }
        if (data.success) {
            const balance = parseFloat(data.balance);
            if (isNaN(balance)) {
                console.error('Invalid balance received:', data.balance);
                showModal('Error: Invalid balance received from server', 'error');
                return;
            }
            localStorage.setItem("currentBalance", balance.toString());
            if (totalBalanceElement) {
                totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
            }
            console.log('Balance updated:', balance);
        } else {
            console.error("Failed to load balance:", data.message);
            showModal("Failed to load balance. Please try again.", 'error');
        }
    })
    .catch(error => {
        console.error('Error fetching balance:', error);
        showModal("Error loading balance. Please try again.", 'error');
    });
}

// Refresh balance every 30 seconds
function startBalanceRefresh() {
    loadCurrentBalance(); // Initial load
    setInterval(loadCurrentBalance, 30000); // Refresh every 30 seconds
}

function validateForm() {
    if (transferAmountExternal && recipientId && selectBank &&
        transferAmountExternal.value.trim().length && 
        recipientId.value.trim().length && 
        selectBank.value !== "default") {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.cursor = "pointer";
        }
    } else {
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.style.cursor = "not-allowed";
        }
    }
}

function validateAmount(amount) {
    const currentBalance = parseFloat(localStorage.getItem("currentBalance"));
    const transferAmount = parseFloat(amount);

    if (isNaN(transferAmount) || transferAmount <= 0) {
        showModal("Please enter a valid positive amount", 'error');
        return false;
    }

    if (isNaN(currentBalance)) {
        console.log('Balance not available, attempting to reload...');
        showModal("Unable to verify your balance. Please try again.", 'error');
        loadCurrentBalance(); // Try to reload balance
        return false;
    }

    if (transferAmount > currentBalance) {
        showModal("Transaction external Transfer amount exceeds current balance", 'error');
        return false;
    }

    return true;
}

function submitTransfer(event) {
    event.preventDefault();
    if (submitButton && submitButton.disabled) {
        return;
    }

    if (!transferAmountExternal || !recipientId || !selectBank) {
        showModal("Form elements not properly initialized", 'error');
        return;
    }

    const amount = transferAmountExternal.value.trim();
    const recipient = recipientId.value.trim();
    const bankName = selectBank.value;
    const loggedInUserId = localStorage.getItem("loggedInId");

    if (!amount || !recipient || !bankName || bankName === "default") {
        showModal("Please fill in all required fields", 'error');
        return;
    }

    if (!validateAmount(amount)) {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
        return;
    }

    if (recipient === loggedInUserId) {
        showModal("You cannot transfer funds to yourself", 'error');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
        return;
    }

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';
    }

    const params = new URLSearchParams({
        transferType: 'external',
        accountHolderId: recipient,
        accountName: recipient,
        transferAmount: amount,
        bankName: bankName,
        senderId: loggedInUserId
    });
    window.location.href = `confirmation_form.html?${params.toString()}`;
}

function cancelTransfer(event) {
    event.preventDefault();
    window.location.href = "../account_holder/account_holder_home_page.html";
}

document.addEventListener('DOMContentLoaded', function () {
    fetch("https://blindvault.site/php/account_holder_home_page.php", {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success || data.error === 'session_expired') {
            handleSessionExpired();
            return;
        }
        if (data.account_holder_id) {
            localStorage.setItem("loggedInId", data.account_holder_id);
            if (data.account_balance) {
                const balance = parseFloat(data.account_balance.replace(/,/g, ''));
                if (!isNaN(balance) && totalBalanceElement) {
                    localStorage.setItem("currentBalance", balance.toString());
                    totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
                }
            }
        }

        transferAmountExternal = document.getElementById("transfer_amount_external");
        recipientId = document.getElementById("recipient_id_external");
        selectBank = document.getElementsByClassName("select-external-option")[0];
        submitButton = document.getElementById("submit");
        cancelButton = document.getElementById("cancel");
        totalBalanceElement = document.querySelector(".total-balance-external");

        loadCurrentBalance();
        startBalanceRefresh();

        if (transferAmountExternal && recipientId && selectBank) {
            transferAmountExternal.addEventListener('input', validateForm);
            recipientId.addEventListener('input', validateForm);
            selectBank.addEventListener('change', validateForm);
            validateForm();
        }

        if (submitButton) {
            submitButton.addEventListener('click', submitTransfer);
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', cancelTransfer);
        }
    })
    .catch(error => {
        console.error("Session validation error:", error);
        handleSessionExpired();
    });
});