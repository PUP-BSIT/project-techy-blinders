// Shared OTP Confirmation Page for Internal and External Transfers
const transferType = localStorage.getItem('pendingTransferType') || 'internal';

const OTP_GENERATE_URL = transferType === 'external'
  ? 'https://blindvault.site/php/external_transfer_otp_generate.php'
  : 'https://blindvault.site/php/transfer_otp_generate.php';

const OTP_VERIFY_URL = transferType === 'external'
  ? 'https://blindvault.site/php/verify_external_transfer_otp.php'
  : 'https://blindvault.site/php/verify_transfer_otp.php';

const FINAL_TRANSFER_URL = transferType === 'external'
  ? 'https://blindvault.site/php/transfer_external.php'
  : null; // For internal, transfer is done in the verify endpoint

let otpVerification = document.getElementById("otp_verification");
let verifyButton = document.getElementById("verify");
let cancelButton = document.getElementById("cancel");
let otpAlertShown = false;
let resendButton = document.getElementById("resend_otp");

document.addEventListener('DOMContentLoaded', function() {
    // Optionally update UI for transfer type
    if (transferType === 'external') {
        const title = document.querySelector('h2');
        if (title) title.textContent = 'Enter OTP for External Transfer';
    }

    // --- OTP GENERATION FOR INTERNAL TRANSFER ---
    if (transferType === 'internal') {
        const pendingTransfer = JSON.parse(localStorage.getItem('pendingTransfer'));
        if (pendingTransfer) {
            fetch(OTP_GENERATE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender_id: pendingTransfer.senderId,
                    recipient_id: pendingTransfer.recipientId,
                    amount: parseFloat(pendingTransfer.amount),
                    recipient_name: pendingTransfer.recipientName
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && !otpAlertShown) {
                    otpAlertShown = true;
                    let message = 'OTP sent successfully!';
                    if (data.debug_info) {
                        message += `\n\nPhone: ${data.debug_info.phone}\nExpires: ${data.debug_info.expires_at}`;
                    }
                    alert(message);
                } else if (!data.success) {
                    alert('Error generating OTP: ' + data.message);
                    window.location.href = "transfer_fund_internal.html";
                }
            })
            .catch(error => {
                alert('Network error. Please try again.');
                window.location.href = "transfer_fund_internal.html";
            });
        }
    }

    // Add event listeners
    otpVerification.addEventListener("input", validateForm);
    verifyButton.addEventListener("click", verifyOTP);
    cancelButton.addEventListener("click", cancelTransfer);
    otpVerification.addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 6);
        validateForm();
    });
    otpVerification.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !verifyButton.disabled) {
            verifyOTP();
        }
    });
    validateForm();

    if (resendButton) {
        resendButton.addEventListener("click", function() {
            const pendingTransfer = JSON.parse(localStorage.getItem('pendingTransfer'));
            if (!pendingTransfer) {
                alert('No pending transfer data found');
                return;
            }
            resendButton.disabled = true;
            resendButton.textContent = 'Resending...';

            let url, payload;
            if (transferType === 'external') {
                url = 'https://blindvault.site/php/external_transfer_otp_generate.php';
                payload = {
                    sender_id: pendingTransfer.senderId,
                    recipient_id: pendingTransfer.recipientId,
                    amount: parseFloat(pendingTransfer.amount)
                };
            } else {
                url = 'https://blindvault.site/php/transfer_otp_generate.php';
                payload = {
                    sender_id: pendingTransfer.senderId,
                    recipient_id: pendingTransfer.recipientId,
                    amount: parseFloat(pendingTransfer.amount),
                    recipient_name: pendingTransfer.recipientName
                };
            }

            fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    let message = 'OTP resent successfully!';
                    if (data.debug_info) {
                        message += `\n\nPhone: ${data.debug_info.phone}\nExpires: ${data.debug_info.expires_at}`;
                    }
                    alert(message);
                } else {
                    alert('Error resending OTP: ' + data.message);
                }
            })
            .catch(error => {
                alert('Network error. Please try again.');
            })
            .finally(() => {
                resendButton.disabled = false;
                resendButton.textContent = 'Resend OTP';
            });
        });
    }
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
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    verifyButton.style.cursor = 'not-allowed';

    if (transferType === 'external') {
        // For external, send OTP and transfer details directly to transfer_external.php
        const transferData = {
            transaction_amount: parseFloat(pendingTransfer.amount),
            sender_id: pendingTransfer.senderId,
            recipient_account_no: parseInt(pendingTransfer.recipientId),
            source_bank_code: 'Blind Vault',
            external_bank_code: pendingTransfer.bankName,
            otp_code: otpCode
        };
        fetch(FINAL_TRANSFER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('Transfer completed successfully!');
                localStorage.removeItem('pendingTransfer');
                localStorage.removeItem('pendingTransferType');
                window.location.href = '../account_holder/account_holder_home_page.html';
            } else {
                alert('Transfer failed: ' + result.message);
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verify';
                verifyButton.style.cursor = 'pointer';
            }
        })
        .catch(error => {
            alert('Network error during transfer. Please try again.');
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            verifyButton.style.cursor = 'pointer';
        });
        return;
    }

    // Internal transfer: verify OTP first, then transfer is done in backend
    let verifyPayload = {
        sender_id: pendingTransfer.senderId,
        otp_code: otpCode
    };
    verifyPayload.recipient_id = pendingTransfer.recipientId;
    verifyPayload.amount = parseFloat(pendingTransfer.amount);
    verifyPayload.recipient_name = pendingTransfer.recipientName;

    fetch(OTP_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyPayload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`Transfer Successful!`);
            localStorage.removeItem('pendingTransfer');
            localStorage.removeItem('pendingTransferType');
            window.location.href = `thank_you_message.html`;
        } else {
            alert('Verification failed: ' + data.message);
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            verifyButton.style.cursor = 'pointer';
            otpVerification.value = '';
            validateForm();
        }
    })
    .catch(error => {
        alert('Network error. Please try again.');
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verify';
        verifyButton.style.cursor = 'pointer';
    });
}

function cancelTransfer() {
    if (confirm('Are you sure you want to cancel this transfer?')) {
        localStorage.removeItem('pendingTransfer');
        localStorage.removeItem('pendingTransferType');
        if (transferType === 'external') {
            window.location.href = 'transfer_fund_external.html';
        } else {
            window.location.href = 'transfer_fund_internal.html';
        }
    }
}
// Initialize form validation on page load
validateForm(); 