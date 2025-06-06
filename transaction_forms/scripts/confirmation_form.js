window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const accountHolderId = urlParams.get('accountHolderId');
    const accountName = urlParams.get('accountName');
    const transferAmount = urlParams.get('transferAmount');
    const currentBalance = parseFloat(localStorage.getItem("currentBalance")).toFixed(2);

    if (accountHolderId && accountName && transferAmount) {
        document.getElementById('display_account_holder_id').textContent = accountHolderId;
        document.getElementById('display_account_name').textContent = accountName;
        document.getElementById('display_deposit_amount').textContent = '$' + parseFloat(transferAmount).toFixed(2);
        
        document.getElementById('account_holder_id').value = accountHolderId;
        document.getElementById('deposit_amount').value = transferAmount;

    } else {
        alert("Missing transfer information. Please go back and fill the form.");
        window.location.href = "transfer_fund_internal.html";
    }
};

document.getElementById('send_otp').addEventListener('click', function() {
    const accountHolderId = document.getElementById('account_holder_id').value;
    const accountName = document.getElementById('display_account_name').textContent;
    const transferAmount = document.getElementById('deposit_amount').value;
    
    const url = `otp_confirmation_page.html?accountHolderId=${encodeURIComponent(accountHolderId)}&accountName=${encodeURIComponent(accountName)}&transferAmount=${encodeURIComponent(transferAmount)}`;
    
    window.location.href = url;
});

document.getElementById('cancel').addEventListener('click', function() {
    if (confirm("Are you sure you want to cancel this transfer?")) {
        window.location.href = "transfer_fund_internal.html";
    }
});

document.getElementById('back_button').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = "transfer_fund_internal.html";
});