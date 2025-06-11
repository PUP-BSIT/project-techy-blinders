document.addEventListener('DOMContentLoaded', function () {
    const accountIdInput = document.getElementById('account_id');
    const reasonInput = document.getElementById('closure_reason');
    const cancelButton = document.getElementById('cancel');
    const submitButton = document.getElementById('submit');

    function validateForm() {
        const accountHolderId = accountIdInput.value.trim();
        const reasonText = reasonInput.value.trim();

        submitButton.disabled = !(accountHolderId && reasonText);
        submitButton.style.cursor = submitButton.disabled ? 'not-allowed' : 'pointer';
    }

    validateForm();
    accountIdInput.addEventListener('input', validateForm);
    reasonInput.addEventListener('input', validateForm);

    cancelButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            accountIdInput.value = '';
            reasonInput.value = '';
            window.location.href = 'accout_management_page.html';
        }
    });

    submitButton.addEventListener('click', function () {
        const accountId = accountIdInput.value.trim();
        const reason = reasonInput.value.trim();

        if (!accountId) {
            alert('Please enter an Account ID');
            accountIdInput.focus();
            return;
        }

        if (!reason) {
            alert('Please provide a reason for account closure');
            reasonInput.focus();
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

        fetch('https://blindvault.site/php/teller_close_account.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text().then(text => {
                    if (!text) throw new Error('Empty response from server');
                    try {
                        return JSON.parse(text);
                    } catch (e) {
                        throw new Error('Invalid JSON response: ' + text);
                    }
                });
            })
            .then(data => {
                if (data.success) {
                    alert(`Account closed successfully!\n\nAccount: ${data.account_name || accountId}\nClosure Date: ${data.close_date}\nTransaction ID: ${data.transaction_id}`);
                    window.location.href = "close_account_form.html?close_success=true&" + accountId;
                    accountIdInput.value = '';
                    reasonInput.value = '';
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Detailed error:', error);
                alert('Error details: ' + error.message);
            });
    });
});
