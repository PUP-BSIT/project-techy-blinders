const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/search_account.php`;

document.addEventListener('DOMContentLoaded', function() {
    const searchTypeSelect = document.getElementById('search_type');
    const searchInput = document.getElementById('search_input');
    
    searchTypeSelect.addEventListener('change', function() {
        if (this.value === 'account') {
            searchInput.placeholder = 'Search by Account ID...';
        } else if (this.value === 'teller') {
            searchInput.placeholder = 'Search by Teller ID...';
        }
    });
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchType = document.getElementById('search_type').value;
    const searchValue = searchInput.value.trim();
    
    if (!searchValue) {
        const searchTypeText = searchType === 'account' ? 'Account Holder ID' : 
            'Teller ID';
        alert(`Please enter a ${searchTypeText}`);
        return;
    }
    
    showLoading();
    
    const requestData = {};
    if (searchType === 'account') {
        requestData.account_holder_id = searchValue;
    } else if (searchType === 'teller') {
        requestData.teller_id = searchValue;
    }
    
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.success) {
            displayResults(data.data, searchType);
        } else {
            showError(data.error || 'No results found');
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Search failed:', error);
        showError('An error occurred while searching. Please try again.');
    });
}

function displayResults(data, searchType) {
    removeExistingResults();
    
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';
    
    let resultsHTML = '<h2 class="results-title">Search Results</h2>';
    
    if (data.bank_teller) {
        resultsHTML += `
            <div class="result-section">
                <h3 class="section-title">Bank Teller Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Teller ID:</span>
                        <span class="info-value">${data.bank_teller.teller_id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">First Name:</span>
                        <span class="info-value">${data.bank_teller.first_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Last Name:</span>
                        <span class="info-value">${data.bank_teller.last_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Middle Name:</span>
                        <span class="info-value">${data.bank_teller.middle_name || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${data.bank_teller.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created At:</span>
                        <span class="info-value">${formatDate(data.bank_teller.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Updated At:</span>
                        <span class="info-value">${formatDate(data.bank_teller.updated_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (data.bank_account) {
        resultsHTML += `
            <div class="result-section">
                <h3 class="section-title">Bank Account Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Account Holder ID:</span>
                        <span class="info-value">${data.bank_account.account_holder_id}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${data.bank_account.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Account Number:</span>
                        <span class="info-value">${data.bank_account.account_number}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Account Balance:</span>
                        <span class="info-value balance">$${parseFloat(data.bank_account.account_balance).toFixed(2)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status:</span>
                        <span class="info-value status ${data.bank_account.is_active == 1 ? 'active' : 'inactive'}">
                            ${data.bank_account.is_active == 1 ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created At:</span>
                        <span class="info-value">${formatDate(data.bank_account.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Updated At:</span>
                        <span class="info-value">${formatDate(data.bank_account.updated_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (data.account_holder) {
        resultsHTML += `
            <div class="result-section">
                <h3 class="section-title">Account Holder Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">First Name:</span>
                        <span class="info-value">${data.account_holder.first_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Last Name:</span>
                        <span class="info-value">${data.account_holder.last_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Middle Name:</span>
                        <span class="info-value">${data.account_holder.middle_name || 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Phone Number:</span>
                        <span class="info-value">${data.account_holder.phone_number}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${data.account_holder.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Created At:</span>
                        <span class="info-value">${formatDate(data.account_holder.created_at)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Updated At:</span>
                        <span class="info-value">${formatDate(data.account_holder.updated_at)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = resultsHTML;
    document.body.appendChild(resultsContainer);
    
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

function showLoading() {
    const searchButton = document.querySelector('.search-button');
    searchButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    searchButton.disabled = true;
}

function hideLoading() {
    const searchButton = document.querySelector('.search-button');
    searchButton.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    searchButton.disabled = false;
}

function showError(message) {
    removeExistingResults();
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
        <div class="error-message">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(errorContainer);
    errorContainer.scrollIntoView({ behavior: 'smooth' });
}

function removeExistingResults() {
    const existingResults = document.querySelector('.results-container');
    const existingError = document.querySelector('.error-container');
    
    if (existingResults) {
        existingResults.remove();
    }
    if (existingError) {
        existingError.remove();
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}