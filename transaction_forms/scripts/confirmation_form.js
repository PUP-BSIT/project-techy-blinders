function maskAccountName(fullName) {
    if (!fullName) return '***';
    
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '***';
    
    const maskedParts = nameParts.map(part => {
        return part.charAt(0).toUpperCase() + '*'.repeat(Math.max(part.length - 1, 3));
    });
    
    return maskedParts.join(' ');
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const transferType = urlParams.get('transferType') || 'internal';
    localStorage.setItem('pendingTransferType', transferType);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const transferAmount = urlParams.get('transferAmount');
    let bankName = urlParams.get('bankName');
    const senderId = urlParams.get('senderId');
    
    // Map bank code to real bank name
    const bankNameMap = {
        'bank1': 'StackOverCash',
        'bank2': 'DragonVault',
        // Add more mappings as needed
    };
    
    if (transferType === 'external' && bankName) {
        bankName = bankNameMap[bankName] || bankName;
    }
    
    if (accountHolderId && accountName && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        
        // Display masked account name
        document.getElementById('display_account_name').textContent = maskAccountName(accountName);
        
        document.getElementById('display_deposit_amount').textContent = '$' + parseFloat(transferAmount).toFixed(2);
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = transferAmount;
        
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
        alert("Missing transfer information. Please go back and fill the form.");
        window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
    }
};

document.getElementById('send_otp').addEventListener('click', function() {
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    const accountHolderId = document.getElementById('account_holder_id').value;
    const accountName = document.getElementById('display_account_name').textContent;
    const transferAmount = document.getElementById('deposit_amount').value;
    const bankName = document.getElementById('display_bank_name') ? document.getElementById('display_bank_name').textContent : undefined;
    const senderId = localStorage.getItem('loggedInId');
    
    if (transferType === 'external') {
        // Generate OTP for external
        fetch('https://blindvault.site/php/external_transfer_otp_generate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sender_id: senderId,
                recipient_id: accountHolderId,
                amount: transferAmount
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem('pendingTransfer', JSON.stringify({
                    senderId: senderId,
                    recipientId: accountHolderId,
                    amount: transferAmount,
                    recipientName: accountName,
                    bankName: bankName
                }));
                window.location.href = "otp_confirmation_page.html";
            } else {
                alert('OTP generation failed: ' + data.message);
            }
        })
        .catch(error => {
            alert('Network error. Please try again.');
        });
    } else {
        localStorage.setItem('pendingTransfer', JSON.stringify({
            senderId: senderId,
            recipientId: accountHolderId,
            amount: transferAmount,
            recipientName: accountName
        }));
        window.location.href = "otp_confirmation_page.html";
    }
});

document.getElementById('cancel').addEventListener('click', function() {
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    if (confirm("Are you sure you want to cancel this transfer?")) {
        window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
    }
});

document.getElementById('back_button').addEventListener('click', function(e) {
    e.preventDefault();
    const transferType = localStorage.getItem('pendingTransferType') || 'internal';
    window.location.href = transferType === 'external' ? "transfer_fund_external.html" : "transfer_fund_internal.html";
});