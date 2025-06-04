const VERIFY_OTP_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/verify_transfer_otp.php`;

let otpVerification = document.getElementById("otp_verification");
let verifyButton = document.getElementById("verify");
let cancelButton = document.getElementById("cancel");

// Get pending transfer details from localStorage
let pendingTransferData = null;

document.addEventListener('DOMContentLoaded', function() {
    // Get transfer details from localStorage
    const transferData = localStorage.getItem('pendingTransfer');
    if (transferData) {
        pendingTransferData = JSON.parse(transferData);
        console.log('Pending transfer data:', pendingTransferData);
    } else {
        alert('No pending transfer found. Redirecting back...');
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
    if (!pendingTransferData) {
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
            sender_id: pendingTransferData.senderId,
            otp_code: otpCode
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('OTP Verification result:', data);
        
        if (data.success) {
            // Update localStorage with new balance
            localStorage.setItem("currentBalance", data.sender_new_balance.replace(/,/g, ''));
            
            // Clear pending transfer data
            localStorage.removeItem('pendingTransfer');
            
            // Show success message
            alert(`Transfer Successful!\n\nAmount: ₱${pendingTransferData.amount}\nTo: ${pendingTransferData.recipientName}\nYour new balance: ₱${data.sender_new_balance}\n\nTransaction ID: ${data.transaction_id}`);
            
            // Redirect to account home page
            window.location.href = "../account_holder/account_holder_home_page.html";
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