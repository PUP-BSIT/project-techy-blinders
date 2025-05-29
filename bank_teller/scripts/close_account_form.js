document.addEventListener('DOMContentLoaded', function() {
    const accountIdHolderId = document.getElementById("account_id");
    const reasonInput = document.getElementById("reason");
    
    accountIdHolderId.addEventListener('input', validateForm);
    reasonInput.addEventListener('input', validateForm);
    
    validateForm();
});

function validateForm() {
    let accountHolderId = document.getElementById("account_id").value;
    let reasonInput = document.getElementById("reason").value;
    let submitButton = document.getElementById("submit");

    if(accountHolderId.length && reasonInput.length){
        submitButton.disabled = false;
        submitButton.style.cursor = 'pointer';
    } else {
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const accountIdInput = document.getElementById('account_id');
    const reasonTextarea = document.getElementById('reason');
    const cancelButton = document.getElementById('cancel');
    const submitButton = document.getElementById('submit');
    validateForm();
    
    cancelButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            accountIdInput.value = '';
            reasonTextarea.value = '';
            window.location.href = 'accout_management_page.html';
        }
    });

    submitButton.addEventListener('click', function() {
        const accountId = accountIdInput.value.trim();
        const reason = reasonTextarea.value.trim();

        if (!accountId) {
            alert('Please enter an Account ID');
            accountIdInput.focus();
            return;
        }

        if (!reason) {
            alert('Please provide a reason for account closure');
            reasonTextarea.focus();
            return;
        }

        if (!confirm(`Are you sure you want to close account ${accountId}? This action cannot be undone.`)) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Processing...';

        const requestData = {
            account_id: accountId,
            reason: reason
        };

        console.log('Sending data:', requestData);
        
        const apiUrl = 'https://darkorange-cormorant-406076.hostingersite.com/php/teller_close_account.php';
        console.log('Fetch URL:', apiUrl);

        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.text().then(text => {
                console.log('Raw response:', text);
                if (!text) {
                    throw new Error('Empty response from server');
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('JSON parse error:', e);
                    console.error('Response text:', text);
                    throw new Error('Invalid JSON response: ' + text);
                }
            });
        })
        .then(data => {
            console.log('Parsed data:', data);
            if (data.success) {
                alert(`Account closed successfully!\n\nAccount: ${data.account_name || accountId}\nClosure Date: ${data.close_date}\nTransaction ID: ${data.transaction_id}`);
                
                accountIdInput.value = '';
                reasonTextarea.value = '';
                
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Detailed error:', error);
            alert('Error details: ' + error.message + '\n\nCheck browser console for more information.');
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
    });

    accountIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            reasonTextarea.focus();
        }
    });

    accountIdInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^a-zA-Z0-9]/g, '');
    });
});