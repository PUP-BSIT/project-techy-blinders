const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/get_account_info.php`;

function submitUser() {
    let accountHolderId = document.getElementById("account_id").value;
    let depositAmount = document.getElementById("deposit_amount").value;

    if (!accountHolderId || !depositAmount) {
        alert("Please complete the form");
        return;
    }

    if (isNaN(depositAmount) || parseFloat(depositAmount) <= 0) {
        alert("Please enter a valid positive amount");
        return;
    }

    // First, fetch the account name from the database
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: accountHolderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store data in URL parameters to pass to confirmation page
            const params = new URLSearchParams({
                accountHolderId: accountHolderId,
                accountName: data.account_name,
                depositAmount: depositAmount
            });

            window.location.href = "confirmation_form.html?" + params.toString();
        } else {
            alert('Account not found: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error fetching account information');
    });
}