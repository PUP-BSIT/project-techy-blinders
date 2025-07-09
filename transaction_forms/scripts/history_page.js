const historyDebugger = {
    enabled: true,
    logError: function(location, error, additionalInfo = null) {
        if (this.enabled) {
            console.error(`[HISTORY PAGE ERROR - ${location}]:`, error);
            if (additionalInfo) {
                console.error('Additional Info:', additionalInfo);
            }
        }
    },
    logWarning: function(location, message, data = null) {
        if (this.enabled) {
            console.warn(`[HISTORY PAGE WARNING - ${location}]:`, message);
            if (data) {
                console.warn('Data:', data);
            }
        }
    }
};

const API_URL = "https://blindvault.site/php/history_page.php";

function formatTransactionType(type) {
    try {
        switch (type.toLowerCase()) {
            case 'transfer_internal':
                return 'Transfer Out';
            case 'transfer_in':
                return 'Transfer In';
            case 'deposit':
                return 'Deposit';
            case 'withdraw':
                return 'Withdraw';
            case 'transfer_external':
                return 'Transfer External';
            default:
                return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    } catch (error) {
        historyDebugger.logError('formatTransactionType', error, { type });
        return 'Unknown Transaction';
    }
}

function getAmountWithSign(transactionType, amount, isReceiver = false) {
    try {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            historyDebugger.logError('getAmountWithSign', 'Invalid amount provided', { transactionType, amount });
            return '\u20B10.00';
        }

        switch (transactionType.toLowerCase()) {
            case 'transfer_internal':
                return (isReceiver ? '+' : '-') + numAmount.toFixed(2);
            case 'transfer_in':
            case 'deposit':
                return '+' + numAmount.toFixed(2);
            case 'withdraw':
            case 'transfer_external':
                return '-' + numAmount.toFixed(2);
            default:
                return numAmount.toFixed(2);
        }
    } catch (error) {
        historyDebugger.logError('getAmountWithSign', error, { transactionType, amount, isReceiver });
        return '\u20B10.00';
    }
}

function getTransactionClass(transactionType, isReceiver = false) {
    switch (transactionType.toLowerCase()) {
        case 'transfer_internal':
            return isReceiver ? 'positive' : 'negative';
        case 'transfer_in':
        case 'deposit':
            return 'positive';
        case 'withdraw':
        case 'transfer_external':
            return 'negative';
        default:
            return 'neutral';
    }
}

function loadTransactions() {
    const transactionsList = document.getElementById('transactions-list');
    if (!transactionsList) {
        historyDebugger.logError('loadTransactions', 'transactions-list element not found in DOM');
        return;
    }

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (!data) {
            historyDebugger.logError('loadTransactions', 'No data received from API');
            transactionsList.innerHTML = '<p class="error-message">No data received. Please try again.</p>';
            return;
        }

        if (data.success) {
            if (!data.transactions || data.transactions.length === 0) {
                transactionsList.innerHTML = '<p>No transactions found.</p>';
                return;
            }

            transactionsList.innerHTML = '';

            data.transactions.forEach((tx, index) => {
                try {
                    if (!tx.transaction_type || !tx.amount || !tx.created_at) {
                        historyDebugger.logWarning('loadTransactions', `Transaction ${index + 1} missing required fields`, tx);
                        return;
                    }

                    const div = document.createElement('div');
                    div.classList.add('transaction-entry');

                    const date = new Date(tx.created_at);
                    if (isNaN(date.getTime())) {
                        historyDebugger.logError('loadTransactions', `Invalid date format for transaction ${index + 1}`, tx.created_at);
                        return;
                    }

                    const formattedDate = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    const formattedType = formatTransactionType(tx.transaction_type);
                    const amountDisplay = getAmountWithSign(tx.transaction_type, tx.amount, tx.account_holder_id === tx.recipient_id);
                    const amountClass = getTransactionClass(tx.transaction_type, tx.account_holder_id === tx.recipient_id);

                    div.innerHTML = `
                        <div class="transaction-header">
                            <span class="transaction-type ${tx.transaction_type.toLowerCase()}">${formattedType}</span>
                            <span class="transaction-date">${formattedDate}</span>
                        </div>
                        <div class="transaction-amount ${amountClass}">
                            ${amountDisplay}
                        </div>
                        <div class="transaction-details">
                            <p><strong>Status:</strong> ${tx.status || 'Unknown'}</p>
                            ${tx.description ? `<p><strong>Description:</strong> ${tx.description}</p>` : ''}
                            ${tx.reference_number ? `<p><strong>Reference:</strong> ${tx.reference_number}</p>` : ''}
                        </div>
                        <hr>
                    `;
                    transactionsList.appendChild(div);
                } catch (error) {
                    historyDebugger.logError('loadTransactions', `Error processing transaction ${index + 1}`, error);
                }
            });
        } else {
            historyDebugger.logError('loadTransactions', 'API returned unsuccessful response', data.message);
            transactionsList.innerHTML = `<p class="error-message">${data.message || 'Unknown error occurred'}</p>`;
        }
    })
    .catch(error => {
        historyDebugger.logError('loadTransactions', 'Fetch request failed', error);
        transactionsList.innerHTML = '<p class="error-message">Failed to load transactions. Please try again.</p>';
    });
}

window.onload = function () {
    try {
        loadTransactions();
    } catch (error) {
        historyDebugger.logError('window.onload', 'Failed to initialize page', error);
    }
};

function refreshTransactions() {
    try {
        loadTransactions();
    } catch (error) {
        historyDebugger.logError('refreshTransactions', 'Failed to refresh transactions', error);
    }
}