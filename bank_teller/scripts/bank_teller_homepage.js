document.addEventListener('DOMContentLoaded', function() {
    const loggedInId = localStorage.getItem('loggedInId');
    const tellerName = localStorage.getItem('tellerName');
    
    if (!loggedInId) {
        alert('Please log in first.');
        window.location.href = './login_page.html';
        return;
    }
    
    const bankTellerLabel = document.querySelector('.bank-teller-label');
    if (bankTellerLabel && tellerName) {
        bankTellerLabel.textContent = `Hello, ${tellerName}`;
    } else if (bankTellerLabel) {
        bankTellerLabel.textContent = `Hello, Bank Teller (ID: ${loggedInId})`;
    }
    
    console.log('Logged in teller:', tellerName, 'ID:', loggedInId);
});

function logout() {
    localStorage.removeItem('loggedInId');
    localStorage.removeItem('tellerName');
    
    window.location.href = './login_page.html';
}

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logout_button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});