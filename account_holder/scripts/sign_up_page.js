let API_URL = "https://darkorange-cormorant-406076.hostingersite.com/php/process_registration.php";

document.addEventListener('DOMContentLoaded', function() {
    const firstName = document.getElementById("first_name");
    const lastName = document.getElementById("last_name");
    const middleName = document.getElementById("middle_name");
    const phoneNumber = document.getElementById("phone_number");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm_password");

    firstName.addEventListener('input', validateForm);
    lastName.addEventListener('input', validateForm);
    middleName.addEventListener('input', validateForm);
    phoneNumber.addEventListener('input', validateForm);
    email.addEventListener('input', validateForm);
    password.addEventListener('input', validateForm);
    confirmPassword.addEventListener('input', validateForm);

    validateForm();
});

function validateForm() {
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const middleName = document.getElementById("middle_name").value;
    const phoneNumber = document.getElementById("phone_number").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    let createAccount = document.querySelector('.create');
    
    if(firstName.length && lastName.length && middleName.length &&
        phoneNumber.length && email.length && password.length
        && confirmPassword.length ){
        createAccount.disabled = false;
        createAccount.style.cursor = 'pointer';
    } else {
        createAccount.disabled = true;
        createAccount.style.cursor = "not-allowed";
    }
}

function submitUser() {
    let firstName = document.getElementById("first_name").value;
    let lastName = document.getElementById("last_name").value;
    let middleInitial = document.getElementById("middle_name").value;
    let phoneNumber = document.getElementById("phone_number").value;
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    let confirmationPassword = document.getElementById("confirm_password").value;
    
    const phonePattern = /^[0-9]{10,15}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validateForm();
    if (!firstName || !lastName || !middleInitial) {
        alert("Please complete the form.");
        return;
    }

    if (!phonePattern.test(phoneNumber)) {
        alert("Phone number must be 10–15 digits.");
        return;
    }

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmationPassword) {
        alert("Passwords do not match.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "first_name=" + encodeURIComponent(firstName) + "&" +
              "last_name=" + encodeURIComponent(lastName) + "&" +
              "middle_name=" + encodeURIComponent(middleInitial) + "&" +
              "phone_number=" + encodeURIComponent(phoneNumber) + "&" +
              "email=" + encodeURIComponent(email) + "&" +
              "password=" + encodeURIComponent(password)
    })
    .then((response) => response.text())
    .then((responseText) => {
        console.log("Server response:", responseText);
        
        if (responseText.toLowerCase().includes("success") || 
            responseText.toLowerCase().includes("created") ||
            responseText.toLowerCase().includes("registered")) {
            
            let accountId = extractAccountId(responseText);
            
            responseText.toLocaleLowerCase().includes()
            if (accountId) {
                alert(`Account successfully created! Your Account ID is: ${accountId}\n\nPlease save this ID as you will need it to log in.`);
            } else {
                alert("Account successfully created! Please check the server response for your Account ID.");
            }
            
            clearForm();
            
            setTimeout(() => {
                window.location.href = "login_page_index.html?account_successfully_created=true&account_id=" + accountId;
            }, 3000);
            
        } else {
            alert(responseText);
        }
    })
    .catch((error) => {
        console.error("Error submitting user:", error);
        alert("An error occurred. Please try again.");
    });
}

function extractAccountId(responseText) {
    try {
        const jsonData = JSON.parse(responseText);
        if (jsonData.account_id || jsonData.accountId || jsonData.id) {
            return jsonData.account_id || jsonData.accountId || jsonData.id;
        }
    } catch (e) {
    }
    
    
    const numberMatches = responseText.match(/\b\d{6,}\b/g);
    if (numberMatches && numberMatches.length > 0) {
        return numberMatches[0]; 
    }
    
    const patterns = [
        /account\s*id[:\s]*(\d+)/i,
        /id[:\s]*(\d+)/i,
        /account[:\s]*(\d+)/i
    ];
    
    for (let pattern of patterns) {
        const match = responseText.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null; 
}

function clearForm() {
    document.getElementById("signup_form").reset();
}