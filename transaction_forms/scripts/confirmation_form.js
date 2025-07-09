const urlParams = new URLSearchParams(window.location.search);

function maskAccountName(fullName) {
    if (!fullName) return '***';
    
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '***';
    
    const maskedParts = nameParts.map(part => {
        return part.charAt(0).toUpperCase() + '*'.repeat(Math.max(part.length - 1, 3));
    });
    
    return maskedParts.join(' ');
}

let modalCallback = null;

function showModal(message, type = 'info', title = 'Confirmation Receipt', callback = null) {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    const modalCancel = document.getElementById('modal_cancel');
    const modalOk = document.getElementById('modal_ok');

    if (!modal || !modalTitle || !modalMessage || !modalIcon || !modalCancel || !modalOk) {
        console.error('Modal elements not found');
        alert(message);
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalCallback = callback;

    modalIcon.className = 'modal-icon';
    modalCancel.style.display = 'none';

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
        case 'confirm':
            modalIcon.className += ' info fas fa-question-circle';
            modalTitle.textContent = title || 'Confirm';
            modalCancel.style.display = 'inline-block';
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
        modalOk.focus();
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    const modalCancel = document.getElementById('modal_cancel');
    if (!modal || !modalCancel) return;
    modal.classList.remove('show');
    modalCancel.style.display = 'none';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function handleModalOk() {
    if (modalCallback) {
        modalCallback(true);
        modalCallback = null;
    } else {
        closeModal();
    }
}

window.onload = async function() {
    const transferType = urlParams.get('transferType') || 'internal';
    localStorage.setItem('pendingTransferType', transferType);
    const accountHolderId = urlParams.get('accountHolderId');
    const transferAmount = urlParams.get('transferAmount');
    let bankName = urlParams.get('bankName');
    const senderId = urlParams.get('senderId');
    
    // Map bank code to real bank name
    const bankNameMap = {
        'bank1': 'StackOverCash',
        'bank2': 'DragonVault',
        // Add more mappings as needed
    };
    
    // Hide or show Recipient Name row based on transfer type
    const recipientRow = document.querySelector('#display_account_name')?.closest('.detail-row');
    if (transferType === 'external' && recipientRow) {
        recipientRow.style.display = 'none';
    } else if (recipientRow) {
        recipientRow.style.display = '';
    }
    
    if (transferType === 'external' && bankName) {
        bankName = bankNameMap[bankName] || bankName;
    }
    
    if (accountHolderId && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = transferAmount;
        document.getElementById('display_deposit_amount').textContent = '₱' + parseFloat(transferAmount).toFixed(2);
        
        // Fetch recipient name from backend
        try {
            const response = await fetch('https://blindvault.site/php/get_account_info.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ account_holder_id: accountHolderId })
            });
            const data = await response.json();
            if (data.success && data.account_name) {
                document.getElementById('display_account_name').textContent = maskAccountName(data.account_name);
            } else {
                document.getElementById('display_account_name').textContent = 'Recipient not found';
            }
        } catch (error) {
            document.getElementById('display_account_name').textContent = 'Error fetching recipient';
        }
        
        if (transferType === 'external' && bankName) {
            let bankRow = document.getElementById('bank_row');
            if (!bankRow) {
                const receiptLabels = document.querySelector('.receipt-labels');
                bankRow = document.createElement('div');
                bankRow.className = 'detail-row';
                bankRow.id = 'bank_row';
                bankRow.innerHTML = `<div class="detail-label">Bank Name:</div><div class="detail-value" id="display_bank_name"></div>`;
                receiptLabels.appendChild(bankRow);
            }
            document.getElementById('display_bank_name').textContent = bankName;
        }
    } else {
        showModal("Missing transfer information. Please go back and fill the form.");
        window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
    }
};

document.getElementById('send_otp').addEventListener('click', async function() {
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    const accountHolderId = document.getElementById('account_holder_id').value;
    const accountName = document.getElementById('display_account_name').textContent;
    const transferAmount = document.getElementById('deposit_amount').value;
    const bankName = document.getElementById('display_bank_name') ? document.getElementById('display_bank_name').textContent : undefined;
    const senderId = localStorage.getItem('loggedInId');

    // Prepare transfer data for localStorage
    let pendingTransfer;
    if (transferType === 'external') {
        pendingTransfer = {
            senderId: senderId,
            recipientId: accountHolderId,
            amount: transferAmount,
            recipientName: accountName,
            bankCode: urlParams.get('bankName'), // This is the code: 'bank1' or 'bank2'
            bankDisplayName: bankName // For display only
        };
    } else {
        pendingTransfer = {
            senderId: senderId,
            recipientId: accountHolderId,
            amount: transferAmount,
            recipientName: accountName
        };
    }

    // Send OTP API request
    let otpUrl, otpPayload;
    if (transferType === 'external') {
        otpUrl = 'https://blindvault.site/php/external_transfer_otp_generate.php';
        otpPayload = {
            sender_id: senderId,
            recipient_id: accountHolderId,
            amount: parseFloat(transferAmount)
        };
    } else {
        otpUrl = 'https://blindvault.site/php/transfer_otp_generate.php';
        otpPayload = {
            sender_id: senderId,
            recipient_id: accountHolderId,
            amount: parseFloat(transferAmount),
            recipient_name: accountName
        };
    }

    try {
        const response = await fetch(otpUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(otpPayload)
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('pendingTransfer', JSON.stringify(pendingTransfer));
            showModal('OTP has been sent!', 'success', 'Success');
            setTimeout(() => {
                window.location.href = "otp_confirmation_page.html";
            }, 2000); // Delay redirect to allow user to see the modal
        } else {
            showModal('Error sending OTP: ' + data.message);
        }
    } catch (error) {
        showModal('Network error. Please try again.');
    }
});

document.getElementById('cancel').addEventListener('click', function() {
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    showModal('Are you sure you want to cancel this transfer?', 'confirm', 'Cancel Transfer', (confirmed) => {
        if (confirmed) {
            window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
        }
    });
});

document.getElementById('back_button').addEventListener('click', function(e) {
    e.preventDefault();
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
});