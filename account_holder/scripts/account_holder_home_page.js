document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobile-nav');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });
    
    document.addEventListener('click', function(event) {
        const isClickInsideNav = mobileNav.contains(event.target);
        const isClickOnHamburger = hamburger.contains(event.target);
        
        if (!isClickInsideNav && !isClickOnHamburger && mobileNav.classList.contains('active')) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
    
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            mobileNav.classList.remove('active');
        }
    });
});

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
            // Store user ID in localStorage
            localStorage.setItem("loggedInId", data.account_holder_id);
            console.log("Stored user ID:", data.account_holder_id);

            document.querySelector('.account-details h4:nth-of-type(1)').textContent = `Name: ${data.name}`;
            document.querySelector('.account-details h4:nth-of-type(2)').textContent = `Account Holder ID: ${maskAccountId(data.account_holder_id)}`;

            const balance = parseFloat(data.account_balance.replace(/,/g, ''));
            document.querySelector('.balance-details h3').textContent = `₱${balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

            // Store initial balance
            localStorage.setItem("currentBalance", balance.toString());
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
    const logoutBtn = document.getElementById('logout_button');
    if (logoutBtn) {
        logoutBtn.disabled = true;
        logoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging out...';
    }

    fetch("https://blindvault.site/php/logout_session.php", {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log("Logout response:", data);

        // Extra: Force clear session cookie in browser (just in case)
        document.cookie.split(";").forEach((c) => {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=blindvault.site;Secure;SameSite=None");
        });

        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("../index.html");
    })
    .catch(error => {
        console.error("Logout error:", error);

        localStorage.clear();
        sessionStorage.clear();

        window.location.replace("../index.html");
    });
}

function goToHistoryPage() {
    window.location.href = `../history_page.html`;
}