const API_URL = `https://blindvault.site/php/transfer_internal.php`;
const BALANCE_URL = `https://blindvault.site/php/get_balance.php`;

let transferAmountInput = document.getElementById("transfer_amount");
let accountIdInput = document.getElementById("account_id");
let transferButton = document.getElementById("transfer");
let cancelButtonElem = document.getElementById("cancel");
let totalBalanceElement = document.querySelector(".total-balance");

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
                        if (totalBalanceElement) totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
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

function handleSessionExpired() {
    localStorage.clear();
    sessionStorage.clear();
    alert("Session expired. Please login again.");
    window.location.href = "../login_page_index.html";
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
                alert('Error: Invalid balance received from server');
                return;
            }
            localStorage.setItem("currentBalance", balance.toString());
            if (totalBalanceElement) totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
            console.log('Balance updated:', balance);
        } else {
            console.error("Failed to load balance:", data.message);
            alert("Failed to load balance. Please try again.");
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
    if (transferAmountInput.value.length && accountIdInput.value.length) {
        transferButton.disabled = false;
        transferButton.style.cursor = "pointer";
    } else {
        transferButton.disabled = true;
        transferButton.style.cursor = "not-allowed";
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

function submitUser() {
    let accountHolderId = accountIdInput.value;
    let rawTransferAmount = transferAmountInput.value;
    let transferAmount = parseFloat(rawTransferAmount);
    let loggedInUserId = localStorage.getItem("loggedInId");
    let rawCurrentBalance = localStorage.getItem("currentBalance");
    let currentBalance = parseFloat(rawCurrentBalance);

    // Debug logs
    console.log('Raw transfer amount:', rawTransferAmount);
    console.log('Parsed transfer amount:', transferAmount, 'Type:', typeof transferAmount);
    console.log('Raw current balance:', rawCurrentBalance);
    console.log('Parsed current balance:', currentBalance, 'Type:', typeof currentBalance);
    console.log('Logged in user ID:', loggedInUserId);

    if (!validateAmount(rawTransferAmount)) {
        return;
    }

    if (accountHolderId === loggedInUserId) {
        alert("You cannot transfer funds to yourself.");
        return;
    }

    // Disable submit button and show loading state
    transferButton.disabled = true;
    transferButton.textContent = 'Processing...';

    // Fetch account name first
    fetch(`https://blindvault.site/php/account_holder_home_page.php`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.name) {
            // Store transfer details for confirmation page
            const params = new URLSearchParams({
                transferType: 'internal',
                accountHolderId: accountHolderId,
                accountName: data.name,
                transferAmount: transferAmount,
                senderId: loggedInUserId
            });
            window.location.href = `confirmation_form.html?${params.toString()}`;
        } else {
            alert("Error: Could not verify recipient account. Please try again.");
            transferButton.disabled = false;
            transferButton.textContent = 'Transfer';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Network error. Please try again.");
        transferButton.disabled = false;
        transferButton.textContent = 'Transfer';
    });
}

function cancelButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

function backButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

// Check session validity on page load
// Now also start periodic balance refresh and initialize form

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
                if (!isNaN(balance)) {
                    localStorage.setItem("currentBalance", balance.toString());
                    if (totalBalanceElement) totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
                }
            }
        }
        // Now load current balance and initialize form
        startBalanceRefresh();
        if (transferAmountInput && accountIdInput) {
            transferAmountInput.addEventListener('input', validateForm);
            accountIdInput.addEventListener('input', validateForm);
            validateForm();
        }
        if (transferButton && cancelButtonElem) {
            transferButton.addEventListener('click', submitUser);
            cancelButtonElem.addEventListener('click', cancelButton);
        }
    })
    .catch(error => {
        handleSessionExpired();
    });
});
