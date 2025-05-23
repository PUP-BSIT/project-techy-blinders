function validateLogin() {
    const accountId = document.getElementById("accountId").value.trim();
    const password = document.getElementById("password").value.trim();

    if (accountId === "" || password === "") {
        alert("Both Account ID and Password are required.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    alert("Login successful!");
}