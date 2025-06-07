const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_external.php`;
const BALANCE_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/get_balance.php`;

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
    
    // Prepare data for transfer
    const transferData = {
        transaction_amount: parseFloat(amount),
        sender_id: loggedInUserId,
        recipient_account_no: parseInt(recipient),
        source_bank_code: 'Blind Vault'
    };

    console.log('Sending transfer data:', transferData); // Debug log

    // Make the transfer request
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update local balance
            const newBalance = parseFloat(data.sender_new_balance);
            localStorage.setItem("currentBalance", newBalance.toString());
            totalBalanceElement.textContent = `₱${newBalance.toFixed(2)}`;
            
            alert('Transfer completed successfully!');
            window.location.href = "../account_holder/account_holder_home_page.html";
        } else {
            alert('Transfer failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Network error. Please try again.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    });
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