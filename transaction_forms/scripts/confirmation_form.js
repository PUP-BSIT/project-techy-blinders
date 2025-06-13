function maskAccountName(fullName) {
    if (!fullName) return '***';
    
    const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '***';
    
    const maskedParts = nameParts.map(part => {
        return part.charAt(0).toUpperCase() + '*'.repeat(Math.max(part.length - 1, 3));
    });
    
    return maskedParts.join(' ');
}

window.onload = async function() {
    const urlParams = new URLSearchParams(window.location.search);
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
    
    if (transferType === 'external' && bankName) {
        bankName = bankNameMap[bankName] || bankName;
    }
    
    if (accountHolderId && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = transferAmount;
        document.getElementById('display_deposit_amount').textContent = '$' + parseFloat(transferAmount).toFixed(2);
        
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
        // Store both code and display name
        localStorage.setItem('pendingTransfer', JSON.stringify({
            senderId: senderId,
            recipientId: accountHolderId,
            amount: transferAmount,
            recipientName: accountName,
            bankCode: urlParams.get('bankName'), // This is the code: 'bank1' or 'bank2'
            bankDisplayName: bankName // For display only
        }));
        window.location.href = "otp_confirmation_page.html";
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