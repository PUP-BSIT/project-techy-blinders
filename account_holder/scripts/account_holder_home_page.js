function maskAccountId(accountId) {
    const idStr = accountId.toString();
    return idStr.length <= 5 ? '*'.repeat(idStr.length) : idStr.slice(0, -5) + '*****';
}

const API_URL = "https://blindvault.site/php/account_holder_home_page.php";

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
            alert("Not logged in. Redirecting...");
            window.location.href = "login_page_index.html";
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert("Could not load data.");
    });

function logoutSession() {
    // Disable the logout button to prevent double-clicks
    const logoutBtn = document.getElementById('logout_button');
    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>Logging out...';
    }

    fetch("https://blindvault.site/php/logout_session.php", {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout response:", data);
        
        // Clear any client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Use replace instead of href to prevent back button issues
        window.location.replace("../index.html");
    })
    .catch(error => {
        console.error("Logout error:", error);
        
        // Clear storage even if logout request failed
        localStorage.clear();
        sessionStorage.clear();
        
        // Still redirect to login page
        window.location.replace("../index.html");
    });
}

function goToHistoryPage() {
    window.location.href = `../history_page.html`;
}