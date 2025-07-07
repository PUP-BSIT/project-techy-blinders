const API_URL = `https://blindvault.site/php/edit_account_details.php`;

let currentEditId = null;
let updates = { email: null, phone_number: null };

function showModal(message, type = 'info', title = 'Edit Account') {
    const modal = document.getElementById('custom_modal');
    const modalTitle = document.getElementById('modal_title');
    const modalMessage = document.getElementById('modal_message');
    const modalIcon = document.getElementById('modal_icon');
    
    if (!modal || !modalTitle || !modalMessage || !modalIcon) {
        console.error('Modal elements not found:', {
            modal: !!modal,
            modalTitle: !!modalTitle,
            modalMessage: !!modalMessage,
            modalIcon: !!modalIcon
        });
        alert(message);
        return;
    }
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Clear existing icon class
    modalIcon.className = 'modal-icon';
    
    // Set icon only if a valid type is provided
    if (type) {
        switch(type) {
            case 'success':
                modalIcon.className += ' success fas fa-check-circle';
                modalTitle.textContent = title || 'Success';
                break;
            case 'error':
                modalIcon.className += ' error fas fa-times-circle';
                modalTitle.textContent = title || 'Error';
                break;
            case 'warning':
                modalIcon.className += ' warning fas fa-exclamation-triangle';
                modalTitle.textContent = title || 'Warning';
                break;
            case 'info':
                modalIcon.className += ' info fas fa-info-circle';
                break;
            default:
                modalIcon.className += ' info fas fa-info-circle';
        }
    }
    
    modal.classList.remove('show');
    
    modal.style.display = 'block';
    modal.offsetHeight; 
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    setTimeout(() => {
        const closeButton = modal.querySelector('.modal-button.primary');
        if (closeButton) {
            closeButton.focus();
        }
    }, 100);
}

function closeModal() {
    const modal = document.getElementById('custom_modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function showChoiceModal(id) {
    currentEditId = id;
    updates = { email: null, phone_number: null };
    showEmailModal();
}

function showEmailModal() {
    const modal = document.getElementById('edit_email_modal');
    const form = document.getElementById('editEmailForm');
    if (!modal || !form) return;
    
    form.reset();
    modal.classList.remove('show');
    modal.style.display = 'block';
    modal.offsetHeight;
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    setTimeout(() => {
        document.getElementById('new_email').focus();
    }, 100);
}

function closeEmailModal() {
    const modal = document.getElementById('edit_email_modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function skipEmail() {
    closeEmailModal();
    showPhoneModal();
}

function showPhoneModal() {
    const modal = document.getElementById('edit_phone_modal');
    const form = document.getElementById('editPhoneForm');
    if (!modal || !form) return;
    
    form.reset();
    modal.classList.remove('show');
    modal.style.display = 'block';
    modal.offsetHeight;
    
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    setTimeout(() => {
        document.getElementById('new_phone').focus();
    }, 100);
}

function closePhoneModal() {
    const modal = document.getElementById('edit_phone_modal');
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function skipPhone() {
    closePhoneModal();
    submitChanges();
}

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
                            <button class="edit-button" onclick="showChoiceModal('${info.account_holder_id}')">Edit</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error("Failed to load details:", error);
            showModal("Failed to load account details.", 'error', 'Edit Account');
        });
}

function submitEmail() {
    const newEmail = document.getElementById('new_email').value.trim();
    const errors = [];

    if (newEmail) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(newEmail)) {
            errors.push('Invalid email address: must contain "@" and a valid domain.');
            closeEmailModal();
            showModal(errors.join('\n'), 'warning', 'Edit Account');
            return;
        } else {
            updates.email = newEmail;
        }
    }
    // If newEmail is empty, we just don't update it (skip)

    closeEmailModal();
    showPhoneModal();
}

function submitPhone() {
    const newPhone = document.getElementById('new_phone').value.trim();
    const errors = [];

    if (newPhone) {
        const phoneRegex = /^\d{11}$/;
        if (!phoneRegex.test(newPhone)) {
            errors.push('Invalid phone number: must be exactly 11 digits.');
            closePhoneModal();
            showModal(errors.join('\n'), 'warning', 'Edit Account');
            return;
        } else {
            updates.phone_number = newPhone;
        }
    }
    // If newPhone is empty, we just don't update it (skip)

    closePhoneModal();
    submitChanges();
}

function submitChanges() {
    const editButton = document.querySelector(`button[onclick="showChoiceModal('${currentEditId}')"]`);

    // Check if any updates were made
    const hasEmailUpdate = updates.email !== null && updates.email !== '';
    const hasPhoneUpdate = updates.phone_number !== null && updates.phone_number !== '';

    if (!hasEmailUpdate && !hasPhoneUpdate) {
        showModal('No changes were made.', 'info', 'Edit Account');
        return;
    }

    if (editButton) {
        editButton.disabled = true;
        editButton.innerHTML = '<span class="loading-spinner"></span>Updating...';
    }

    // Build payload with only the fields that have updates
    const payload = { account_holder_id: currentEditId };
    if (hasEmailUpdate) payload.email = updates.email;
    if (hasPhoneUpdate) payload.phone_number = updates.phone_number;

    fetch(API_URL, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            let successMessage = "Account updated successfully!";
            if (hasEmailUpdate && hasPhoneUpdate) {
                successMessage = "Email and phone number updated successfully!";
            } else if (hasEmailUpdate) {
                successMessage = "Email updated successfully!";
            } else if (hasPhoneUpdate) {
                successMessage = "Phone number updated successfully!";
            }
            showModal(successMessage, 'success', 'Edit Account');
            loadDetails();
        } else {
            showModal("Error: " + (data.error || data.message || 'Unknown error'), 'error', 'Edit Account');
        }
    })
    .catch(err => {
        console.error("Update failed", err);
        showModal("An error occurred while updating.", 'error', 'Edit Account');
    })
    .finally(() => {
        if (editButton) {
            editButton.disabled = false;
            editButton.innerHTML = 'Edit';
        }
        // Reset updates object for next edit
        updates = { email: null, phone_number: null };
        currentEditId = null;
    });
}

loadDetails();