const accountHolderId = 2075637800; // temp lng to 
const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/account_holder_home_page.php?id=${accountHolderId}`;

fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.account-details h4:nth-of-type(1)').textContent = `Name: ${data.name}`;
            document.querySelector('.account-details h4:nth-of-type(2)').textContent = `Account Holder ID: ${data.account_holder_id}`;
            document.querySelector('.balance-details h3').textContent = `₱${parseFloat(data.account_balance.replace(/,/g, '')).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } else {
            alert("Failed to load account details.");
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    });