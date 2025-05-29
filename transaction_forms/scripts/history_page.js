const API_URL = `https://darkorange-cormorant-406076.hostingersite.com/php/history_page.php`;

function loadTransactions() {
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('user_id') || localStorage.getItem('loggedInId');

    console.log('User ID being used:', userId);

    if (!userId) {
        document.getElementById('transactions-list').innerHTML = `
            <p>Invalid access. Please go back to home page.</p>
            <button onclick="window.location.href='../account_holder/account_holder_home_page.html'">Go Back Home</button>
        `;
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            account_holder_id: userId
        })
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('transactions-list');
        if (data.success) {
            if (data.transactions.length === 0) {
                container.innerHTML = '<p>No transactions found.</p>';
                return;
            }

            container.innerHTML = '';

            data.transactions.forEach(tx => {
                const div = document.createElement('div');
                div.classList.add('transaction-entry');

                const date = new Date(tx.created_at);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const amountDisplay = tx.transaction_type.toLowerCase() === 'Transfer_internal'
                    ? `-₱${parseFloat(tx.amount).toFixed(2)}`
                    : `+₱${parseFloat(tx.amount).toFixed(2)}`;

                div.innerHTML = `
                    <div class="transaction-header">
                        <span class="transaction-type ${tx.transaction_type.toLowerCase()}">${tx.transaction_type}</span>
                        <span class="transaction-date">${formattedDate}</span>
                    </div>
                    <div class="transaction-amount ${tx.transaction_type.toLowerCase()}">
                        ${amountDisplay}
                    </div>
                    <div class="transaction-details">
                        <p><strong>Status:</strong> ${tx.status}</p>
                        ${tx.description ? `<p><strong>Description:</strong> ${tx.description}</p>` : ''}
                    </div>
                    <hr>
                `;
                container.appendChild(div);
            });
        } else {
            container.innerHTML = `<p class="error-message">${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error loading transactions:', error);
        document.getElementById('transactions-list').innerHTML = '<p class="error-message">Failed to load transactions. Please try again.</p>';
    });
}

window.onload = function() {
    loadTransactions();
};

function refreshTransactions() {
    loadTransactions();
}