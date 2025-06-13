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

// Function to fetch and update balance
function loadCurrentBalance() {
    const loggedInUserId = localStorage.getItem("loggedInId");
    console.log('Current loggedInId:', loggedInUserId);

    if (!loggedInUserId) {
        console.error("No logged in user found");
        // Try to get user ID from session
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
                
                // Store initial balance
                if (data.account_balance) {
                    const balance = parseFloat(data.account_balance.replace(/,/g, ''));
                    if (!isNaN(balance)) {
                        localStorage.setItem("currentBalance", balance.toString());
                        console.log('Initial balance stored:', balance);
                    }
                }
                
                // Fetch latest balance
                fetchBalance(data.account_holder_id);
            } else {
                console.error("Failed to get user ID from session:", data);
                alert("Session expired. Please login again.");
                window.location.href = "../login_page_index.html";
            }
        })
        .catch(error => {
            console.error("Error validating session:", error);
            alert("Session expired. Please login again.");
            window.location.href = "../login_page_index.html";
        });
        return;
    }
    
    fetchBalance(loggedInUserId);
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
        if (data.success) {
            const balance = parseFloat(data.balance);
            if (isNaN(balance)) {
                console.error('Invalid balance received:', data.balance);
                alert('Error: Invalid balance received from server');
                return;
            }
            // Update localStorage with the latest balance
            localStorage.setItem("currentBalance", balance.toString());
            // Update UI with the balance
            totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
            console.log('Balance updated:', balance);
        } else {
            if (data.error === 'session_expired') {
                alert("Session expired. Please login again.");
                window.location.href = "../login_page_index.html";
            } else {
                console.error("Failed to load balance:", data.message);
                alert("Failed to load balance. Please try again.");
            }
        }
    })
    .catch(error => {
        console.error('Error fetching balance:', error);
        alert("Error loading balance. Please try again.");
    });
}

// Refresh balance every 30 seconds
function startBalanceRefresh() {
    loadCurrentBalance(); // Initial load
    setInterval(loadCurrentBalance, 30000); // Refresh every 30 seconds
}

function validateForm() {
    if (transferAmountExternal.value.length && 
        recipientId.value.length && 
        selectBank.value !== "default") {
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
    } else {
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

function validateAmount(amount) {
    const currentBalance = parseFloat(localStorage.getItem("currentBalance"));
    const transferAmount = parseFloat(amount);
    
    if (isNaN(transferAmount) || transferAmount <= 0) {
        alert("Please enter a valid positive amount");
        return false;
    }
    
    if (isNaN(currentBalance)) {
        console.log('Balance not available, attempting to reload...');
        alert("Unable to verify your balance. Please try again.");
        loadCurrentBalance(); // Try to reload balance
        return false;
    }
    
    if (transferAmount > currentBalance) {
        alert("Transfer amount exceeds current balance");
        return false;
    }
    
    return true;
}

function submitTransfer() {
    const amount = transferAmountExternal.value;
    const recipient = recipientId.value;
    const bankName = selectBank.value;
    const loggedInUserId = localStorage.getItem("loggedInId");
    
    if (!validateAmount(amount)) {
        return;
    }
    
    if (recipient === loggedInUserId) {
        alert("You cannot transfer funds to yourself");
        return;
    }

    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';

    // Store transfer details for confirmation page
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

function cancelTransfer() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

// Check session validity on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded, checking session...');
    // Verify session is valid
    fetch("https://blindvault.site/php/account_holder_home_page.php", {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Initial session check:', data);
        if (!data.success) {
            alert("Session expired. Please login again.");
            window.location.href = "../login_page_index.html";
            return;
        }
        
        // Store user ID if available
        if (data.account_holder_id) {
            console.log('Setting initial loggedInId:', data.account_holder_id);
            localStorage.setItem("loggedInId", data.account_holder_id);
            
            // Store initial balance
            if (data.account_balance) {
                const balance = parseFloat(data.account_balance.replace(/,/g, ''));
                if (!isNaN(balance)) {
                    localStorage.setItem("currentBalance", balance.toString());
                    totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
                    console.log('Initial balance stored:', balance);
                }
            }
        }
        
        // Load current balance first
        loadCurrentBalance();
        
        // Session is valid, initialize the form
        if (transferAmountExternal && recipientId && selectBank) {
            transferAmountExternal.addEventListener('input', validateForm);
            recipientId.addEventListener('input', validateForm);
            selectBank.addEventListener('change', validateForm);
            validateForm();
        } else {
            console.error('Form elements not found');
        }

        if (submitButton && cancelButton) {
            submitButton.addEventListener('click', submitTransfer);
            cancelButton.addEventListener('click', cancelTransfer);
        } else {
            console.error('Buttons not found');
        }
    })
    .catch(error => {
        console.error("Session validation error:", error);
        alert("Error validating session. Please try again.");
        window.location.href = "../login_page_index.html";
    });
});