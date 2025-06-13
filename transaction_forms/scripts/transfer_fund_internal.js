const API_URL = `https://blindvault.site/php/transfer_internal.php`;
const BALANCE_URL = `https://blindvault.site/php/get_balance.php`;

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
            document.querySelector(".total-balance").textContent = `$${balance.toFixed(2)}`;
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
                    document.querySelector(".total-balance").textContent = `$${balance.toFixed(2)}`;
                    console.log('Initial balance stored:', balance);
                }
            }
        }
        
        // Load current balance first
        loadCurrentBalance();
        
        // Session is valid, initialize the form
        const transferAmountInput = document.getElementById("transfer_amount");
        const accountIdInput = document.getElementById("account_id");

        if (transferAmountInput && accountIdInput) {
            transferAmountInput.addEventListener('input', validateForm);
            accountIdInput.addEventListener('input', validateForm);
            validateForm();
        } else {
            console.error('Form elements not found');
        }

        const transferButton = document.getElementById("transfer");
        if (transferButton) {
            transferButton.addEventListener('click', submitUser);
        } else {
            console.error('Transfer button not found');
        }
    })
    .catch(error => {
        console.error("Session validation error:", error);
        alert("Error validating session. Please try again.");
        window.location.href = "../login_page_index.html";
    });
});

function validateForm() {
    let accountHolderId = document.getElementById("account_id").value;
    let transferAmount = document.getElementById("transfer_amount").value;
    let transferButton = document.getElementById("transfer");

    if (accountHolderId.length && transferAmount.length) {
        transferButton.disabled = false;
        transferButton.style.cursor = 'pointer';
    } else {
        transferButton.disabled = true;
        transferButton.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let rawTransferAmount = document.getElementById("transfer_amount").value;
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

    if (!accountHolderId || !transferAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(transferAmount) || transferAmount <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    if (accountHolderId === loggedInUserId) {
        alert("You cannot transfer funds to yourself.");
        return;
    }

    // Check if balance is available
    if (!rawCurrentBalance || isNaN(currentBalance)) {
        console.log('Balance not available, attempting to reload...');
        alert("Unable to verify your balance. Please try again.");
        loadCurrentBalance(); // Try to reload balance
        return;
    }

    if (currentBalance === 0) {
        alert("Transaction not allowed. Your balance is 0.");
        return;
    }

    if (currentBalance < transferAmount) {
        alert("Not enough Balance.");
        return;
    }

    fetch(`https://blindvault.site/php/get_account_info.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            account_holder_id: accountHolderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const params = new URLSearchParams({
                accountHolderId: accountHolderId,
                accountName: data.account_name,
                transferAmount: transferAmount,
                recipientBalance: data.balance
            });
            window.location.href = "confirmation_form.html?" + params.toString();
        } else {
            if (data.error === 'session_expired') {
                alert("Session expired. Please login again.");
                window.location.href = "../login_page_index.html";
            } else {
                alert("Account not found.");
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error validating account');
    });
}

function cancelButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}

function backButton() {
    window.location.href = "../account_holder/account_holder_home_page.html";
}
