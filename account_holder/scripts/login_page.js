const API_URL = "https://blindvault.site/php/login_page.php";

function loginUser() {
    console.log("loginUser triggered");

    let accountId = document.getElementById('account_id').value;
    let password = document.getElementById('password').value;

    console.log("Account ID:", accountId, "Password length:", password.length);

    if (!accountId || !password) {
        alert('Please enter both account ID and password.');
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        credentials: 'include',
        body: `account_holder_id=${encodeURIComponent(accountId)}&password=${encodeURIComponent(password)}`
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
                // ✅ Store in sessionStorage (not localStorage)
                sessionStorage.setItem("account_holder_id", data.account_holder_id);

                console.log("Session storage set:", sessionStorage.getItem("account_holder_id"));
                alert('Login successful!');
                window.location.href = "account_holder_home_page.html?login_success=true";
            } else {
                alert('Login failed: ' + (data.error || data.message || 'Unknown error'));
                window.location.href = "login_page_index.html?login_success=false";
            }

        } catch (e) {
            console.error('JSON parse error:', e);
            alert('Server error: Invalid response format');
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Network error: ' + error.message);
    });
}
