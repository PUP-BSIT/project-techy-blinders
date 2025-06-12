const API_URL = "https://blindvault.site/php/process_contact.php";

document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById("name_input");
    const emailInput = document.getElementById("email_input");
    const numberInput = document.getElementById("number_input");
    const submitButton = document.getElementById("submit_button");
    const textInput = document.getElementById("comment_input");

    nameInput.addEventListener('input', validateForm);
    emailInput.addEventListener('input', validateForm);
    numberInput.addEventListener('input', validateForm);
    textInput.addEventListener('input', validateForm);
    submitButton.addEventListener('click', submitContactForm);

    validateForm();
});

function validateForm() {
    const nameInput = document.getElementById("name_input").value;
    const emailInput = document.getElementById("email_input").value;
    const numberInput = document.getElementById("number_input").value;
    const textInput = document.getElementById("comment_input").value;
    const submitButton = document.getElementById("submit_button");

    if (nameInput.length && emailInput.length && numberInput.length 
        && textInput.length) {
        submitButton.disabled = false;
        submitButton.style.cursor = "pointer";
    } else {
        submitButton.disabled = true;
        submitButton.style.cursor = "not-allowed";
    }
}

function submitContactForm() {
    const nameInput = document.getElementById("name_input").value;
    const emailInput = document.getElementById("email_input").value;
    const numberInput = document.getElementById("number_input").value;
    const textInput = document.getElementById("comment_input").value;
    const submitButton = document.getElementById("submit_button");

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            full_name: nameInput,
            email: emailInput,
            phone_number: numberInput,
            message: textInput
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for your message. We will get back to you soon!');
            clearForm();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while sending your message.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
        validateForm();
    });
}

function clearForm() {
    document.getElementById("name_input").value = "";
    document.getElementById("email_input").value = "";
    document.getElementById("number_input").value = "";
    document.getElementById("comment_input").value = "";
    validateForm();
}