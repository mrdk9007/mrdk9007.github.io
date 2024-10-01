// JavaScript to toggle between tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async function () {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        const tabContent = document.getElementById(this.dataset.tab);
        tabContent.classList.add('active');

        // Show the loading indicator
        const loadingIndicator = tabContent.querySelector('.loading');
        loadingIndicator.classList.add('active');

        // Check if crypto cards are generated before hiding the loading indicator
        const cryptoCards = tabContent.querySelector('.crypto-cards');
        if (cryptoCards.children.length > 0) {
            loadingIndicator.classList.remove('active');
        } else {
            console.error('Error: Crypto cards not generated');
        }

    });
});

let tg = window.Telegram.WebApp
tg.expand()

// Assuming you're getting JSON data from a Google Sheets API or a web app
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxFUbOJrKl-t3MHN9aIfoIuL4pqpPsxtH3TXDBV6aHswelzpKyNYyiPn2xQzp4ryikJsg/exec"; // Replace with your actual Sheets API URL

async function fetchCryptoData() {
    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();

        // Iterate over the data (assuming it's an array of crypto assets)
        if (data.length > 0) {
            let totalInvest = 0
            let balance = 0
            await new Promise(resolve => setTimeout(resolve, 5500))
            document.getElementById('loading-indicator').classList.remove('active')

            data.forEach(crypto => {
                totalInvest += crypto.invested
                balance += crypto.balance;
                generateCryptoCard(crypto)
            })
            var ratio = 100 * balance / totalInvest
            document.getElementById('total-invest').innerText = `$${totalInvest.toLocaleString()}`;
            document.getElementById('balance').innerText = `$${balance.toLocaleString()}`;
            document.getElementById('total-ratio').innerHTML = `<span class="price ${ratio >= 100 ? 'up' : 'down'}">
                ${ratio >= 100 ? '⬆' : '⬇'} (${ratio.toLocaleString()}%)
            </span>`
        }

    } catch (error) {
        console.error('Error fetching data:', error);

        // Add UI notification for the user
        const notificationContainer = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.classList.add('notification', 'error');
        notification.innerHTML = `Error fetching data: ${error.message}`;
        notificationContainer.appendChild(notification);

        // Auto-remove the notification after 5 seconds
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 5000);
    }
}

// Generate the crypto card elements dynamically
function generateCryptoCard(crypto) {
    const container = document.getElementById('crypto-cards');

    // Create the card div
    const card = document.createElement('div');
    card.classList.add('crypto-card');

    // Left Column - Crypto Info
    const cryptoInfo = document.createElement('div');
    cryptoInfo.classList.add('crypto-info');

    cryptoInfo.innerHTML = `
        <h2><img src="${crypto.icon}" alt="${crypto.name}" style="width: 20px; height: 20px; margin-right: 5px;">
        ${crypto.name}</h2>
        <p>
            ${crypto.symbol}: <span id="amount">${crypto.number}</span>
        </p>
        <p>Current price: $${crypto.price}
            <span class="price ${crypto.changeMyPrice >= 100 ? 'up' : 'down'}">
                ${crypto.changeMyPrice >= 100 ? '⬆' : '⬇'}${crypto.changeMyPrice}%
            </span><br>
            My price: $${crypto.myPrice}
        </p>
        <p>
            Invected: $<span id="amount">${crypto.invested}</span> (${crypto.portfolioInvestedPersantage}%)<br>
            Balance: $<span id="amount">${crypto.balance}</span> (${crypto.portfolioBalancePersantage}%)
        </p>
        
    `;
    card.appendChild(cryptoInfo);

    // Right Column - First Crypto Diagram
    const diagramContainer1 = document.createElement('div');
    diagramContainer1.classList.add('crypto-diagram');
    const canvas1 = document.createElement('canvas');
    diagramContainer1.appendChild(canvas1);
    card.appendChild(diagramContainer1);

    // Right Column - Second Crypto Diagram
    const diagramContainer2 = document.createElement('div');
    diagramContainer2.classList.add('crypto-diagram');
    const canvas2 = document.createElement('canvas');
    diagramContainer2.appendChild(canvas2);
    card.appendChild(diagramContainer2);

    // Append card to the container
    container.appendChild(card);

    const animationOptions = {
        duration: 3000, // Animation duration in milliseconds
        easing: 'easeInOutBack', // Animation easing style
    }

    // Generate first chart using Chart.js
    /*new Chart(canvas1, {
        type: 'bar',
        data: {
            
            labels: [""],
            datasets: [
                {
                    label: ['Invested'],
                    data: [crypto.portfolioInvestedPersantage,],
                    borderColor: '#ff6384',
                    backgroundColor: '#ff6384',
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                },
                {
                    label: ['Balance'],
                    data: [crypto.portfolioBalancePersantage,],
                    borderColor: '#ffcd56',
                    backgroundColor: '#ffcd56',
                    borderWidth: 1,
                    borderRadius: 3,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            //animation: animationOptions, // Apply animation to second chart
            responsive: true,
            plugins: {
                legend: false,
            }
        }
    });*/
    // Generate second chart using Chart.js
    new Chart(canvas1, {
        type: 'doughnut',
        data: {
            labels: ['Portfolio Share', 'Remaining'],
            datasets: [{
                data: [crypto.portfolioInvestedPersantage, 100 - crypto.portfolioInvestedPersantage],
                backgroundColor: ['#ff6384', '#ffcd56'] // Different colors for distinction
            }]
        },
        options: {
            animation: animationOptions, // Apply animation to second chart
            plugins: {
                legend: false
            }
        }
    })
    // Generate second chart using Chart.js
    new Chart(canvas2, {
        type: 'doughnut',
        data: {
            labels: ['Portfolio Share', 'Remaining'],
            datasets: [{
                data: [crypto.portfolioBalancePersantage, 100 - crypto.portfolioBalancePersantage],
                backgroundColor: ['#ff6384', '#ffcd56'] // Different colors for distinction
            }]
        },
        options: {
            animation: animationOptions, // Apply animation to second chart
            plugins: {
                legend: false
            }
        }
    })

}

// Initialize and fetch the data
fetchCryptoData()


// Refresh button to manually fetch new data
document.getElementById('refresh').addEventListener('click', fetchCryptoData);


// Add Crypto Function
function addCrypto() {
    const crypto = {
        name: document.getElementById('crypto-name').value,
        symbol: document.getElementById('crypto-symbol').value,
        price: document.getElementById('crypto-price').value,
        myPrice: document.getElementById('crypto-myPrice').value,
        amount: document.getElementById('crypto-amount').value,
        portfolioShare: document.getElementById('crypto-portfolio-share').value,
        change: Math.random() * 200 - 100 // Simulate price change %
    };

    generateCryptoCard(crypto);
    alert(`${crypto.name} added to your portfolio!`);
}
