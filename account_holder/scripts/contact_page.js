function validateContactForm() {
    const name = document.getElementById("name_input").value.trim();
    const email = document.getElementById("email_input").value.trim();
    const number = document.getElementById("number_input").value.trim();
    const comment = document.getElementById("comment_input").value.trim();

    if (name === "" || email === "" || number === "") {
        alert("You must fill in your name, email, and phone number before commenting.");
        return;
    }

    if (comment === "") {
        alert("Please enter your message before submitting.");
        return;
    }

    alert("Thank you for your comment!");
    document.querySelector("form").reset();
}