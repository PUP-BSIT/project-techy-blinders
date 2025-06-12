document.addEventListener('DOMContentLoaded', function() {
    const loggedInId = sessionStorage.getItem('teller_id');
    
    console.log('Checking session data:', { loggedInId });
    
    if (!loggedInId) {
        alert('Please log in first.');
        window.location.href = './login_page.html';
        return;
    }
    
    fetchTellerData(loggedInId);
    
    console.log('Logged in teller ID:', loggedInId);
});

async function fetchTellerData(tellerId) {
    try {
        const response = await fetch('https://blindvault.site/php/login_page_teller.php', {
            method: 'GET',
            credentials: 'include' 
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                const bankTellerLabel = document.querySelector('.bank-teller-label');
                if (bankTellerLabel) {
                    bankTellerLabel.textContent = `Hello, ${data.teller_name}`;
                }
            } else {
                const bankTellerLabel = document.querySelector('.bank-teller-label');
                if (bankTellerLabel) {
                    bankTellerLabel.textContent = `Hello, Bank Teller (ID: ${tellerId})`;
                }
            }
        }
    } catch (error) {
        console.error('Error fetching teller data:', error);
        const bankTellerLabel = document.querySelector('.bank-teller-label');
        if (bankTellerLabel) {
            bankTellerLabel.textContent = `Hello, Bank Teller (ID: ${tellerId})`;
        }
    }
}

function logout() {
    sessionStorage.removeItem('teller_id');
    
    fetch('https://blindvault.site/php/login_page_teller.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'action=logout'
    }).finally(() => {
        window.location.href = './login_page.html';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout_button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});