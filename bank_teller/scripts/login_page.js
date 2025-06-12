const API_URL = "https://blindvault.site/php/login_page_teller.php";

function tellerUser() {
    console.log("tellerUser triggered");
    
    let tellerId = document.getElementById('teller_id').value;
    let password = document.getElementById('password').value;
    
    console.log("Teller ID:", tellerId, "Password length:", password.length);
    
    if (!tellerId || !password) {
        alert('Please enter both teller ID and password.');
        return;
    }
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include', 
        body: `teller_id=${encodeURIComponent(tellerId)}&password=${encodeURIComponent(password)}`
    })
    .then(response => {
        console.log("Response status:", response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    })
    .then(text => {
        console.log("Raw response:", text);
        try {
            const data = JSON.parse(text);
            console.log("Parsed JSON:", data);
            
            if (data.success) {
                sessionStorage.setItem("teller_id", data.teller_id);
                console.log("Session storage set:", sessionStorage.getItem("teller_id"));
                
                alert('Login successful!');
                window.location.href = './bank_teller_homepage.html?login_success=true';
            } else {
                alert('Login failed: ' + (data.error || data.message || 'Unknown error'));
                window.location.href = "login_page.html?login_success=false";
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Response was:', text);
            alert('Server error: Invalid response format');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Network error: ' + error.message);
    });
}