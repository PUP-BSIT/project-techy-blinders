function maskAccountId(accountId) {
    const idStr = accountId.toString();
    if (idStr.length <= 5) {
        return '*'.repeat(idStr.length);
    }
    return idStr.slice(0, -5) + '*****';
}

// Get account_holder_id from sessionStorage
const accountHolderId = sessionStorage.getItem('account_holder_id');
if (!accountHolderId) {
    alert("Not logged in. Redirecting to login.");
    window.location.href = "login_page.html";
}

const API_URL = `https://blindvault.site/php/account_holder_home_page.php?id=${accountHolderId}`;

fetch(API_URL, {
    method: 'GET',
    credentials: 'include'
})
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.account-details h4:nth-of-type(1)').textContent = `Name: ${data.name}`;
            document.querySelector('.account-details h4:nth-of-type(2)').textContent = `Account Holder ID: ${maskAccountId(data.account_holder_id)}`;

            const balance = parseFloat(data.account_balance.replace(/,/g, ''));
            document.querySelector('.balance-details h3').textContent = `$${balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        } else {
            alert("Account not found or session invalid. Redirecting to login.");
            window.location.href = "login_page.html";
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert("Error loading account details. Please try again.");
    });

function logout() {
    fetch("https://blindvault.site/php/logout.php", {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => {
        sessionStorage.removeItem('account_holder_id');
        window.location.href = "login_page.html";
    })
    .catch(error => {
        console.error("Logout error:", error);
        window.location.href = "login_page.html";
    });
}

function goToHistoryPage() {
    window.location.href = `../history_page.html`;
}
