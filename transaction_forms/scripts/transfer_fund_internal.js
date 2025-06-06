const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_internal.php`;
const OTP_GENERATE_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_otp_generate.php`;

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById("account_id");
    const transferAmountInput = document.getElementById("transfer_amount");
    
    accountIdInput.addEventListener('input', validateForm);
    transferAmountInput.addEventListener('input', validateForm);
    
    validateForm();

    document.getElementById("transfer").addEventListener('click', submitUser);
});

function validateForm() {
    let accountHolderId = document.getElementById("account_id").value;
    let transferAmount = document.getElementById("transfer_amount").value;
    let transferButton = document.getElementById("transfer");
    
    if(accountHolderId.length && transferAmount.length){
        transferButton.disabled = false;
        transferButton.style.cursor = 'pointer';
    } else {
        transferButton.disabled = true;
        transferButton.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let transferAmount = document.getElementById("transfer_amount").value;
    let loggedInUserId = localStorage.getItem("loggedInId");
    let currentBalance = parseFloat(localStorage.getItem("currentBalance"));
    
    if (!accountHolderId || !transferAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(transferAmount) || parseFloat(transferAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    if (accountHolderId === loggedInUserId) {
        alert("You cannot transfer funds to yourself.");
        return;
    }

    if (currentBalance === 0) {
        alert("Transaction not allowed. Your balance is 0.");
        return;
    }

    if (parseFloat(transferAmount) > currentBalance) {
        alert("Transfer amount exceeds current balance.");
        return;
    }

    fetch(`https://darkorange-cormorant-406076.hostingersite.com/php/get_account_info.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: accountHolderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            generateOTPForTransfer(loggedInUserId, accountHolderId, transferAmount, data.account_name);
        } else {
            alert('Account not found: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error validating account');
    });
}

let otpAlertShown = false;

function generateOTPForTransfer(senderId, recipientId, amount, recipientName) {
    otpAlertShown = false;
    
    const transferButton = document.getElementById("transfer");
    transferButton.disabled = true;
    transferButton.textContent = 'Generating OTP...';

    fetch(OTP_GENERATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender_id: senderId,
            recipient_id: recipientId,
            amount: parseFloat(amount)
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('OTP Generation result:', data);
        
        if (data.success) {
            localStorage.setItem('pendingTransfer', JSON.stringify({
                senderId: senderId,
                recipientId: recipientId,
                amount: amount,
                recipientName: recipientName
            }));

            if (!otpAlertShown) {
                otpAlertShown = true;
                
                let message = 'OTP sent successfully!';
                if (data.debug_info) {
                    message += `\n\nPhone: ${data.debug_info.phone}\nExpires: ${data.debug_info.expires_at}`;
                }
                
                alert(message);
            }

            window.location.href = "otp_confirmation_page.html";
        } else {
            alert('Error generating OTP: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error generating OTP:', error);
        alert('Network error. Please try again.');
    })
    .finally(() => {
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