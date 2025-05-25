const API_URL = "https://darkorange-cormorant-406076.hostingersite.com/php/login_page_teller.php";

function tellerUser() {
    console.log("tellerUser triggered");
    
    let tellerId = document.getElementById('teller_id').value;
    let password = document.getElementById('password').value;
    
    console.log("Teller ID:", tellerId, "Password length:", password.length);
    
    // Fixed variable name typo
    if (!tellerId || !password) {
        alert('Please enter both account ID and password.');
        return;
    }
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        // Fixed parameter names to match PHP expectations
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
                localStorage.setItem("loggedInId", tellerId);
                alert('Login successful!');
                // You might want to redirect here
                // window.location.href = 'dashboard.html';
            } else {
                alert('Login failed: ' + (data.error || data.message || 'Unknown error'));
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