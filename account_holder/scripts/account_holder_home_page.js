const loggedInId = localStorage.getItem("loggedInId");

function maskAccountId(accountId) {
    const idStr = accountId.toString();
    if (idStr.length <= 5) {
        return '*'.repeat(idStr.length);
    }
    return idStr.slice(0, -5) + '*****';
}

if (!loggedInId) {
    alert("Please log in first.");
    window.location.href = "login_page.html"; 
} else {
    const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/account_holder_home_page.php?id=${loggedInId}`;
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector('.account-details h4:nth-of-type(1)').textContent = `Name: ${data.name}`;
                document.querySelector('.account-details h4:nth-of-type(2)').textContent = `Account Holder ID: ${maskAccountId(data.account_holder_id)}`;
                const balance = parseFloat(data.account_balance.replace(/,/g, ''));
                localStorage.setItem("currentBalance", balance.toString());
                document.querySelector('.balance-details h3').textContent = `$${balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            } else {
                alert("Failed to load account details.");
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            alert("Error loading account details. Please try again.");
        });
}

function logout() {
    localStorage.removeItem("loggedInId");
    window.location.href = "login_page.html";
}

function goToHistoryPage() {
    const userId = getCurrentUserId();
    
    if (userId) {
        window.location.href = `..//history_page.html?user_id=${userId}`;
    } else {
        alert('Please log in to view transaction history.');
    }
}

function getCurrentUserId() {
    return localStorage.getItem("loggedInId");
}