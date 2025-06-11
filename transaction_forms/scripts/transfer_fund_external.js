const API_URL = `https://blindvault.site/php/transfer_external.php`;
const BALANCE_URL = `https://blindvault.site/php/get_balance.php`;
const OTP_GENERATE_URL = `https://blindvault.site/php/external_transfer_otp_generate.php`;
const OTP_VERIFY_URL = `https://blindvault.site/php/verify_external_transfer_otp.php`;

let transferAmountExternal = document.getElementById("transfer_amount_external");
let recipientId = document.getElementById("recipient_id_external");
let selectBank = document.getElementsByClassName("select-external-option")[0];
let submitButton = document.getElementById("submit");
let cancelButton = document.getElementById("cancel");
let totalBalanceElement = document.querySelector(".total-balance-external");

// Load and display current balance
function loadCurrentBalance() {
    const loggedInUserId = localStorage.getItem("loggedInId");
    if (!loggedInUserId) {
        console.error("No logged in user found");
        return;
    }

    // Fetch balance from database
    fetch(BALANCE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: loggedInUserId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const balance = parseFloat(data.balance);
            totalBalanceElement.textContent = `₱${balance.toFixed(2)}`;
            // Update localStorage with the latest balance
            localStorage.setItem("currentBalance", balance.toString());
        } else {
            console.error("Failed to load balance:", data.message);
            totalBalanceElement.textContent = "Error loading balance";
        }
    })
    .catch(error => {
        console.error('Error fetching balance:', error);
        totalBalanceElement.textContent = "Error loading balance";
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    startBalanceRefresh(); // Start balance refresh cycle
    validateForm();
    
    transferAmountExternal.addEventListener("input", validateForm);
    recipientId.addEventListener("input", validateForm);
    selectBank.addEventListener("change", validateForm);
    
    submitButton.addEventListener("click", submitTransfer);
    cancelButton.addEventListener("click", cancelTransfer);
});