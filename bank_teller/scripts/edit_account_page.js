const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/edit_account_details.php`;

function loadDetails() {
    fetch(API_URL)
        .then(response => response.json())
        .then(informations => {
            let tableBody = document.querySelector(".information-table-body");
            tableBody.innerHTML = "";

            informations.forEach(info => {
                let row = `
                    <tr>
                        <td>${info.account_holder_id}</td>
                        <td>${info.first_name}</td>
                        <td>${info.last_name}</td>
                        <td>${info.middle_name}</td>
                        <td>${info.phone_number}</td>
                        <td>${info.email}</td>
                        <td>
                            <button class="edit-button" onclick="editInfo('${info.account_holder_id}')">Edit</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error("Failed to load details:", error));
}

function editInfo(id) {
    const newEmail = prompt("Enter new email:");
    const newPhone = prompt("Enter new phone number:");

    if (newEmail && newPhone) {
        fetch(API_URL, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_holder_id: id,
                email: newEmail,
                phone_number: newPhone
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Account updated successfully!");
                loadDetails();
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(err => {
            console.error("Update failed", err);
            alert("An error occurred while updating.");
        });
    }
}

loadDetails();