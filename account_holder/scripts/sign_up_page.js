let API_URL = "https://darkorange-cormorant-406076.hostingersite.com/php/process_registration.php";

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
        alert(responseText);
        clearForm();
    })
    .catch((error) => {
        console.error("Error submitting user:", error);
        alert("An error occurred. Please try again.");
    });
}

function clearForm() {
    document.getElementById("signup_form").reset();
}