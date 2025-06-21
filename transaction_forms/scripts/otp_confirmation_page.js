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

function showModal(message, type = 'info', title = 'Transaction External', callback = null) {
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
        if (callback) callback();
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
            modalIcon.className += ' warning fas fa-exclamation-triangle';
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
            // Add callback to close button if provided
            if (callback) {
                closeButton.onclick = function() {
                    closeModal();
                    callback();
                };
            }
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        // Reset close button onclick to default
        const closeButton = modal.querySelector('.modal-button.primary');
        if (closeButton) {
            closeButton.onclick = closeModal;
        }
    }, 300);
}

   // --- REMOVE automatic OTP GENERATION FOR INTERNAL TRANSFER ---
    // if (transferType === 'internal') {
    //     const pendingTransfer = JSON.parse(localStorage.getItem('pendingTransfer'));
    //     if (pendingTransfer) {
    //         fetch(OTP_GENERATE_URL, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 sender_id: pendingTransfer.senderId,
    //                 recipient_id: pendingTransfer.recipientId,
    //                 amount: parseFloat(pendingTransfer.amount),
    //                 recipient_name: pendingTransfer.recipientName
    //             })
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             if (data.success && !otpAlertShown) {
    //                 otpAlertShown = true;
    //                 let message = 'OTP sent successfully!';
    //                 if (data.debug_info) {
    //                     message += `\n\nPhone: ${data.debug_info.phone}\nExpires: ${data.debug_info.expires_at}`;
    //                 }
    //                 alert(message);
    //             } else if (!data.success) {
    //                 alert('Error generating OTP: ' + data.message);
    //                 window.location.href = "transfer_fund_internal.html";
    //             }
    //         })
    //         .catch(error => {
    //             alert('Network error. Please try again.');
    //             window.location.href = "transfer_fund_internal.html";
    //         });
    //     }
    // }
    
document.addEventListener('DOMContentLoaded', function() {
    // Optionally update UI for transfer type
    if (transferType === 'external') {
        const title = document.querySelector('h2');
        if (title) title.textContent = 'Enter OTP for External Transfer';
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
                showModal('No pending transfer data found');
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
                    showModal(message);
                } else {
                    showModal('Error resending OTP: ' + data.message);
                }
            })
            .catch(error => {
                showModal('Network error. Please try again.');
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
        showModal('No pending transfer data found');
        return;
    }
    const otpCode = otpVerification.value.trim();
    if (otpCode.length !== 6) {
        showModal('Please enter a valid 6-digit OTP');
        return;
    }
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verifying...';
    verifyButton.style.cursor = 'not-allowed';

    if (transferType === 'external') {
        // For external, send OTP and transfer details directly to transfer_external.php
        const transferData = {
            transaction_amount: Number(pendingTransfer.amount),
            source_account_no: String(pendingTransfer.senderId),
            source_bank_code: 'Blind Vault',
            recipient_account_no: String(pendingTransfer.recipientId),
            otp_code: String(otpCode),
            external_bank_code: pendingTransfer.bankCode
        };
        // Check for missing required fields
        const requiredFields = ['transaction_amount', 'source_account_no', 'source_bank_code', 'recipient_account_no', 'otp_code'];
        const missingFields = requiredFields.filter(field => {
            return (
                transferData[field] === undefined ||
                transferData[field] === null ||
                transferData[field] === '' ||
                (typeof transferData[field] === 'number' && isNaN(transferData[field]))
            );
        });
        if (missingFields.length > 0) {
            showModal('Cannot proceed. Missing required fields: ' + missingFields.join(', '));
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            verifyButton.style.cursor = 'pointer';
            return;
        }
        fetch(FINAL_TRANSFER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transferData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                showModal('Transfer Successful!');
                localStorage.removeItem('pendingTransfer');
                localStorage.removeItem('pendingTransferType');
                window.location.href = '../account_holder/account_holder_home_page.html';
            } else {
                showModal('Transfer failed: ' + result.message);
                verifyButton.disabled = false;
                verifyButton.textContent = 'Verify';
                verifyButton.style.cursor = 'pointer';
            }
        })
        .catch(error => {
            showModal('Network error during transfer. Please try again.');
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
            // Show success modal with callback to redirect to thank you page
            showModal(
                'Transaction Successful!', 
                'success', 
                'Transaction Internal',
                function() {
                    // This callback will execute when the modal is closed
                    localStorage.removeItem('pendingTransfer');
                    localStorage.removeItem('pendingTransferType');
                    window.location.href = `thank_you_message.html`;
                }
            );
        } else {
            showModal('Verification failed: ' + data.message);
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify';
            verifyButton.style.cursor = 'pointer';
            otpVerification.value = '';
            validateForm();
        }
    })
    .catch(error => {
        showModal('Network error. Please try again.');
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