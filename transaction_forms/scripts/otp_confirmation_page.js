const VERIFY_OTP_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/verify_transfer_otp.php`;
const OTP_GENERATE_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/transfer_otp_generate.php`;

let otpVerification = document.getElementById("otp_verification");
let verifyButton = document.getElementById("verify");
let cancelButton = document.getElementById("cancel");
let otpAlertShown = false;

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const transferAmount = urlParams.get('transferAmount');
    const loggedInId = localStorage.getItem("loggedInId");

    if (!loggedInId) {
        alert('Error: Sender ID not found. Please try again.');
        window.location.href = "transfer_fund_internal.html";
        return;
    }

    if (accountHolderId && accountName && transferAmount) {
        // Store transfer details for verification
        localStorage.setItem('pendingTransfer', JSON.stringify({
            recipientId: accountHolderId,
            recipientName: accountName,
            amount: transferAmount,
            senderId: loggedInId
        }));

        // Generate OTP for the transfer
        generateOTPForTransfer(accountHolderId, transferAmount, accountName);
    } else {
        alert('Missing transfer information. Redirecting back...');
        window.location.href = "transfer_fund_internal.html";
        return;
    }

    // Add event listeners
    otpVerification.addEventListener("input", validateForm);
    verifyButton.addEventListener("click", verifyOTP);
    cancelButton.addEventListener("click", cancelTransfer);

    // Auto-format OTP input (only digits, max 6)
    otpVerification.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
        validateForm();
    });

    // Enable enter key for OTP input
    otpVerification.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !verifyButton.disabled) {
            verifyOTP();
        }
    });

    validateForm();
});

function generateOTPForTransfer(recipientId, amount, recipientName) {
    otpAlertShown = false;
    
    const transferButton = document.getElementById("verify");
    transferButton.disabled = true;
    transferButton.textContent = 'Generating OTP...';

    // Get logged in user ID for sender
    const loggedInId = localStorage.getItem("loggedInId");

    if (!loggedInId) {
        alert('Error: Sender ID not found. Please try again.');
        window.location.href = "transfer_fund_internal.html";
        return;
    }

    fetch(OTP_GENERATE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender_id: loggedInId,
            recipient_id: recipientId,
            amount: parseFloat(amount),
            recipient_name: recipientName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('OTP Generation result:', data);
        
        if (data.success) {
            // Store complete transfer details
            localStorage.setItem('pendingTransfer', JSON.stringify({
                senderId: loggedInId,
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
        } else {
            alert('Error generating OTP: ' + data.message);
            window.location.href = "transfer_fund_internal.html";
        }
    })
    .catch(error => {
        console.error('Error generating OTP:', error);
        alert('Network error. Please try again.');
        window.location.href = "transfer_fund_internal.html";
    })
    .finally(() => {
        transferButton.disabled = false;
        transferButton.textContent = 'Verify';
        validateForm();
    });
}

function validateForm() {
    if (otpVerification.value.length === 6) {
        verifyButton.disabled = false;
        verifyButton.style.cursor = "pointer";
        verifyButton.style.backgroundColor = "#01C38E";
    } else {
        verifyButton.disabled = true;
        verifyButton.style.cursor = "not-allowed";
        verifyButton.style.backgroundColor = "#666";
    }
}

function verifyOTP() {
    const pendingTransfer = JSON.parse(localStorage.getItem('pendingTransfer'));
    if (!pendingTransfer) {
        alert('No pending transfer data found');
        return;
    }

    const otpCode = otpVerification.value.trim();
    
    if (otpCode.length !== 6) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }

    // Disable verify button during processing
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    verifyButton.style.cursor = 'not-allowed';

    fetch(VERIFY_OTP_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sender_id: pendingTransfer.senderId,
            recipient_id: pendingTransfer.recipientId,
            amount: parseFloat(pendingTransfer.amount),
            otp_code: otpCode,
            recipient_name: pendingTransfer.recipientName
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('OTP Verification result:', data);
        
        if (data.success) {
            // Update localStorage with new balance if provided
            if (data.sender_new_balance) {
                localStorage.setItem("currentBalance", data.sender_new_balance.replace(/,/g, ''));
            }
            
            // Show success message
            alert(`Transfer Successful!\n\nAmount: $${pendingTransfer.amount}\nTo: ${pendingTransfer.recipientName}\nYour new balance: $${data.sender_new_balance}\n\nTransaction ID: ${data.transaction_id}`);
            
            // Construct URL with all necessary parameters
            const params = new URLSearchParams({
                accountHolderId: pendingTransfer.recipientId,
                accountName: pendingTransfer.recipientName,
                transferAmount: pendingTransfer.amount
            });
            
            // Clear pending transfer data before redirect
            localStorage.removeItem('pendingTransfer');
            
            // Redirect to thank you page with parameters
            window.location.href = `thank_you_message.html?${params.toString()}`;
        } else {
            alert('Verification failed: ' + data.message);
            
            // Re-enable verify button
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            verifyButton.style.cursor = 'pointer';
            
            // Clear the OTP input for retry
            otpVerification.value = '';
            validateForm();
        }
    })
    .catch(error => {
        console.error('Error verifying OTP:', error);
        alert('Network error. Please try again.');
        
        // Re-enable verify button
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify';
        verifyButton.style.cursor = 'pointer';
    });
}

function cancelTransfer() {
    if (confirm('Are you sure you want to cancel this transfer?')) {
        // Clear pending transfer data
        localStorage.removeItem('pendingTransfer');
        
        // Redirect back to transfer page
        window.location.href = "transfer_fund_internal.html";
    }
}

// Initialize form validation on page load
validateForm();