import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'; // Ensure this import is correct
const supabaseUrl = 'https://yfawoztamzvkjknfixci.supabase.co'; // Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmYXdvenRhbXp2a2prbmZpeGNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5Mjk4NTYsImV4cCI6MjA2NjUwNTg1Nn0.h5-TUPamo9GtOkCamDTPy0gYsfR5qSTQ0ygQVlnosYU'; // Replace with your Supabase public API key
const supabase = createClient(supabaseUrl, supabaseAnonKey); 

async function getUserDataFromSupabase(telegram_id, initData) {
  /*const { data, error } = await supabase.functions.invoke('get-user-data', {
    body: { telegram_id },
  });*/
  console.log("getUserDataFromSupabase", telegram_id, initData)
  const { data, error } = await supabase.functions.invoke('get-user-data', {
    body: { initData }
  });
  if (error) {
    console.error("Ошибка Supabase:", error);
    return null;
  }

  return data;
}

async function addDataToSupabase(data) {
    const { data: answer, error } = await supabase.functions.invoke('add-data', {
    body: { data },
  });

  if (error) {
    console.error("Ошибка Supabase:", error);
    return { status: "error", message: error.message || "Unknown error" };
  }
  console.log("Supabase answer:", answer);
  return answer;
}
// JavaScript to toggle between tabs
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', async function () {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        this.classList.add('active');
        console.log("Tab clicked:", this.dataset.tab);
        const tabContent = document.getElementById(this.dataset.tab);
        tabContent.classList.add('active');

        // Show the loading indicator
        const loadingIndicator = tabContent.querySelector('.loading');
        if (loadingIndicator !== null) {
            loadingIndicator.classList.add('active')
        }

        // Check if crypto cards are generated before hiding the loading indicator
        const cryptoCards = tabContent.querySelector('.crypto-cards');

        if (cryptoCards !== null) {
            if (cryptoCards.children.length > 0) {
                loadingIndicator.classList.remove('active');
            } else {
                console.error('Error: Crypto cards not generated');
            }
        }
    });
});

document.addEventListener('click', function (event) {
    // Открытие попапа при клике на .history-line
    const historyLine = event.target.closest('.history-line');
    if (historyLine) {
        const popupContainer = historyLine.nextElementSibling;
        if (!popupContainer) return;

        popupContainer.classList.add('open');
        popupContainer.querySelector('.popup-content-order').classList.add('open');
    }

    // Закрытие попапа при клике на .popup-close-order
    const closeButton = event.target.closest('.popup-close-order');
    if (closeButton) {
        closePopUpOrder(closeButton)
    }
})

function closePopUpOrder(closeButton) {
    const popupContainer = closeButton.closest('.popup-container-order');
    if (!popupContainer) return;

    let popupContent = popupContainer.querySelector('.popup-content-order')
    popupContent.classList.add('close')

    setTimeout(() => {
        popupContent.classList.remove('open', 'close');
        popupContainer.classList.remove('open');
    }, 300)
}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-order")) {
        const orderId = event.target.getAttribute("data-id");
        const closeButton = event.target.closest('.delete-order')

        console.log("delete order: %s", orderId)

        fetch("http://127.0.0.1:5005/delete_order",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "id": orderId })
            }
        )
            .then(response => response.json().then(data => ({ status: response.status, body: data })))
            .then(({ status, body }) => {
                if (status === 200 && body.success) {
                    message = "Order deleted successfully!"
                } else {
                    message = `Error: ${body.error}`
                }
                return message
            })
            .catch(error => {
                message = `Error: ${error}`
            })
            .finally(() => {
                const popupContainer = closeButton.closest('.popup-container-order');
                let mainNotification = popupContainer.querySelector('.popup-actions-notification')
                const notification = document.createElement('div')
                //notification.classList.add('notification', 'error')
                notification.innerHTML = message
                mainNotification.appendChild(notification);

                // Auto-remove the notification after 3 seconds
                setTimeout(() => {
                    mainNotification.removeChild(notification);
                    closePopUpOrder(closeButton)
                }, 3000);
                console.log(message)
            })

    }
})

const walletCards = document.querySelectorAll('.crypto-card-wallet');

walletCards.forEach(card => {
    var header = card.querySelector('.header');
    header.addEventListener('click', () => {
        //card.classList.add('expanded')
        var networks = card.querySelector(".networks")
        var network = networks.querySelectorAll(".network")

        if (networks.style.display === 'none' || networks.style.display === '') {
            networks.style.display = 'block'; // Show content
            networks.style.maxHeight = networks.scrollHeight + 'px'; // Expand to fit content
            networks.style.padding = '5px 0px 0px 0px'

            console.log(network.length)
            addNetworkListeners(networks)
        } else {
            console.log("closed")
            removeNetworkListeners(networks)

            networks.style.padding = '0px 0px 4px 0px'
            networks.style.maxHeight = null; // Collapse the content

            setTimeout(function () {
                networks.style.display = 'none' // Delay padding reset for smoother animation
                card.classList.remove('expanded')
            }, 400)
        }
    });
});

function addNetworkListeners(networks) {
    const network = networks.querySelectorAll(".network");
    network.forEach(chain => {
        const networkHeader = chain.querySelector('.network-header');

        // Check if the listener is already added
        if (!networkHeader.callback) {
            const callback = () => toggleNetworkHeader(networkHeader, chain, networks);
            networkHeader.addEventListener('click', callback);
            networkHeader.callback = callback; // Save the callback reference
        }
    });
}

function removeNetworkListeners(networks) {
    const network = networks.querySelectorAll(".network");
    network.forEach(chain => {
        const networkHeader = chain.querySelector('.network-header');
        if (networkHeader.callback) {
            networkHeader.removeEventListener('click', networkHeader.callback);
            delete networkHeader.callback; // Clean up the reference
        }
    });
}

function toggleNetworkHeader(networkHeader, chain, networks) {
    var networkWallet = chain.querySelector(".network .wallet");
    var networkProtocol = chain.querySelector(".network .protocol");

    if (networkWallet.style.display === 'none' || networkWallet.style.display === '') {
        networkWallet.style.display = 'block';
        networkWallet.style.maxHeight = networkWallet.scrollHeight + 'px';
        networks.style.maxHeight = (networkWallet.scrollHeight + networks.scrollHeight) + 'px';

        if (networkProtocol !== null) {
            networkProtocol.style.display = 'block';
            networkProtocol.style.maxHeight = networkProtocol.scrollHeight + 'px';
        }
        networks.style.maxHeight = (networkWallet.scrollHeight + networks.scrollHeight + networkProtocol.scrollHeight) + 'px';
    } else {
        if (networkProtocol !== null) {
            networkProtocol.style.maxHeight = null;
            networkProtocol.style.display = 'none';
        }
        networkWallet.style.maxHeight = null;

        setTimeout(() => {
            networkWallet.style.display = 'none';
            networks.style.maxHeight = (networks.scrollHeight - 0) + 'px';
        }, 300);
    }
}

// Assuming you're getting JSON data from a Google Sheets API or a web app
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzDUAluskxKpPgRg5-0O4GJOFIH9DyYpkzCBCy-1UFe5MNYj5F0lB6tsaDTjuF64eBe/exec"; // Replace with your actual Sheets API URL

let dropdownOptions = ""

function getTelegramUserId() {
    //let telegram_id = 682611621
    try {
        let tg = window.Telegram.WebApp

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            let user = tg.initDataUnsafe.user
            telegram_id = user.id
            console.log("User ID: %s\nfirst_name: %s\nlast_name: %s", telegram_id, user.first_name, user.last_name);

        } else {
            console.log("User data not available. Make sure you opened the app via Telegram.");
        }
    } catch (error) {
        console.log("Error accessing Telegram WebApp:", error);
    }

    return {telegram_id: telegram_id, initData: tg.initData}
}
window.fetchCryptoData = fetchCryptoData
async function fetchCryptoData() {
    /*console.log("testLocalServer")
    const response = await fetch("http://127.0.0.1:5000/add_data"); // Замени на свой API URL
    const cards = await response.json();
    console.log(cards)*/
    //let telegram_id = getTelegramUserId()
    let telegramData  = getTelegramUserId()
    let telegram_id  = telegramData['telegram_id']
    let initData  = telegramData['initData']//{telegram_id: telegram_id, initData: tg.initData}
    console.log("telData", telegram_id, initData)
    try {
        /**********************get data from spreadsheet******************************/
        /*const response = await fetch(SHEET_API_URL);
        const data = await response.json();*/

        /**********************get data using python server******************************/
        /*const server = await fetch("http://127.0.0.1:5005/add_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"data": dataServer})
          })
        const server = await fetch("http://127.0.0.1:5005/get_user_data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"telegram_id": userId})
        })

        const data = await server.json();*/

        /**********************get data from supabase******************************/
        let data = await getUserDataFromSupabase(telegram_id, initData)
        var portfolioData = data.portfolioData;
        var history = data.history
        var walletData = data.walletData
        addForm()

        // Iterate over the data (assuming it's an array of crypto assets)
        if (portfolioData.length > 0) {
            const dropdown = document.getElementById('cryptoDropdown');

            const option = document.createElement('option');
            option.classList.add('subtext')
            option.value = "";
            option.selected = true
            option.disabled = true
            option.text = `Select a token`;
            dropdown.appendChild(option);

            let totalInvest = 0
            let balance = 0
            await new Promise(resolve => setTimeout(resolve, 5500))
            let loadings = document.querySelectorAll('.loading');
            loadings.forEach(loading => {
                loading.classList.remove('active')
            })
            //document.getElementById('loading-indicator').classList.remove('active')
            portfolioData.forEach(crypto => {
                totalInvest += crypto.invested
                balance += crypto.balance;
                generateCryptoCard({ cardInfo: crypto, history: history[crypto.symbol] })

                const option = document.createElement('option');
                option.classList.add('subtext')
                option.value = crypto.symbol;
                option.innerHTML = `${crypto.name} (${crypto.symbol})`;
                dropdown.appendChild(option);
            })
            dropdownOptions = portfolioData.map(crypto =>
                `<option class="subtext" value="${crypto.symbol}">${crypto.name} (${crypto.symbol})</option>`
            ).join("")
            dropdownOptions = `<option class="subtext" selected=true disabled=true value="">Select a token</option>${dropdownOptions}`
            var ratio = 100 * balance / totalInvest

            var score = balance / totalInvest
            var maxScore = 10

            if (score > 10) {
                var maxScore = score + 2
            }
            animateMarkToScore(score, maxScore)

            document.getElementById('scoreValue').innerText = `${score.toFixed(2)}x`; // Update score display
            document.getElementById('invested').innerText = `$${totalInvest.toLocaleString()}`;
            document.getElementById('balance').innerText = `$${balance.toLocaleString()}`;
            document.getElementById('total-ratio').innerHTML = `<span class="price ${ratio >= 100 ? 'up' : 'down'}">
                ${ratio >= 100 ? '⬆' : '⬇'}(${ratio.toLocaleString()}%)
            </span>`
        }
        if (walletData.length > 0) {
            walletData.forEach(data => {
                createWalletCard(data)
            })
        }

    } catch (error) {
        console.error('Error fetching data:', error);

        // Add UI notification for the user
        sendNotification(error.message, 'error');
    }
}

function sendNotification(message, type) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    
    let startMessage
    if (type === 'error') {
        notification.classList.add('notification', 'error');
        startMessage = `Error fetching data:`
    } else {
        notification.classList.add('notification', 'success');
        startMessage = `Success:`
    }

    notification.innerHTML = `${startMessage} ${message}`;
    notificationContainer.appendChild(notification);

    // Auto-remove the notification after 5 seconds
    setTimeout(() => {
        notificationContainer.removeChild(notification);
    }, 5000);
}
// Generate the crypto card elements dynamically
function generateCryptoCard(data) {
    //{cardInfo: crypto, history: history[crypto.symbol]}
    var crypto = data.cardInfo
    var history = data.history
    const container = document.getElementById('crypto-cards');

    // Create the card div
    const card = document.createElement('div');
    card.classList.add('crypto-card');

    /*const cryptoInfo = document.createElement('div');
    cryptoInfo.classList.add('crypto-info');*/

    card.innerHTML = `
        <div class="icon">
            <img src="${crypto.icon}" alt="${crypto.name}" >
        </div>
        <div class="info">
            <div class="info-left main-text">${crypto.name}<br>
                <span class="subtext">${crypto.symbol}: ${crypto.number}</span>                
            </div>
            <div class="info-right main-text">
                $${crypto.balance} (${crypto.portfolioBalancePercentage}%)<br>
                <span class="subtext">${crypto.price}  
                    <span class="subtext ${crypto.changeMyPrice >= 100 ? 'up' : 'down'}">
                        ${crypto.changeMyPrice >= 100 ? '⬆' : '⬇'}${crypto.changeMyPrice}%
                    </span>                    
                </span>
            </div>
        </div>
    `;

    container.appendChild(card);


    // Add the popup container and content
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');

    const popUpCardHeader = document.createElement('div');
    popUpCardHeader.classList.add('popup-card-header');

    const popUpHeader = document.createElement('div');
    popUpHeader.classList.add('main-text');
    popUpHeader.textContent = 'Details';

    popUpCardHeader.appendChild(popUpHeader)

    const popUpCardButton = document.createElement('div');
    popUpCardButton.classList.add('popup-content-button');
    const closeButton = document.createElement('button');
    closeButton.classList.add('popup-close');
    closeButton.innerHTML = '<ion-icon name="add-outline"></ion-icon>';

    // Add event listener to close the popup when clicking the close button
    closeButton.addEventListener('click', (event) => {
        popupContent.classList.add('close');
        setTimeout(() => {
            popupContent.classList.remove('open', 'close');
            popupContainer.classList.remove('open');
        }, 300);
    });
    popUpCardButton.appendChild(closeButton)

    popUpCardHeader.appendChild(popUpCardButton)
    popupContent.appendChild(popUpCardHeader);

    // Create the card div
    const popUpCard = document.createElement('div');
    popUpCard.classList.add('crypto-card');

    popUpCard.innerHTML = `
        <div class="icon">
            <img src="${crypto.icon}" alt="${crypto.name}" style="width: 34px; height: 34px; margin-right: 5px;">
        </div>
        <div class="info">
            <div class="info-left"><span class="main-text">${crypto.name}</span><br>
                <span class="subtext">
                    ${crypto.symbol}: ${crypto.number}<br>
                    Average price<br>
                    Invested<br>
                    Balance
                </span>
            </div>
            <div class="info-right">
                <span class="main-text">$${crypto.balance} (${crypto.portfolioBalancePercentage}%)</span><br>
                <span class="subtext">$${crypto.price}  
                    <span class="subtext ${crypto.changeMyPrice >= 100 ? 'up' : 'down'}">
                        ${crypto.changeMyPrice >= 100 ? '⬆' : '⬇'}${crypto.changeMyPrice}%
                    </span><br>
                    $${crypto.myPrice}<br>
                    ${crypto.invested >= 0 ? '$' + crypto.invested : '-$' + (crypto.invested * (-1))} (${crypto.portfolioInvestedPercentage}%)<br>
                    $${crypto.balance} (${crypto.portfolioBalancePercentage}%)
                </span>
            </div>
        </div>
    `;


    // Append card to the container
    popupContent.appendChild(popUpCard);

    // Create the card div history
    const popUpOrderHistory = document.createElement('div');
    popUpOrderHistory.classList.add('crypto-card');
    /*popUpOrderHistory.classList.add('history');
    popUpOrderHistory.innerHTML = `
        <div class="info-left main-text">Order history
        </div>
    `
 
    const popUpOrderHistoryInfo = document.createElement('div');
    popUpOrderHistoryInfo.classList.add('card-history-info');
    popUpOrderHistoryInfo.classList.add('subtext');
 
    var historyDatesColumns = ""
    var historyTypesColumns = ""
    var historyAmountsColumns = ""
    var historyPriceColumns = ""
    var historyTotalColumns = ""
 
    for (line in history) {
        var historyDatesColumns = `${historyDatesColumns}${history[line].date}<br>`
        var historyTypesColumns = `${historyTypesColumns}${history[line].type}<br>`
        var historyAmountsColumns = `${historyAmountsColumns}${history[line].amount} ${crypto.symbol}<br>`
        var historyPriceColumns = `${historyPriceColumns}$${history[line].price}<br>`
        var historyTotalColumns = `${historyTotalColumns}$${history[line].total}<br>`
 
    }*/
    popUpOrderHistory.innerHTML = `
            <div class="history">
                <div class="info-left main-text">Order history
                </div>
                <div class="card-history-info subtext">
                    ${history.map(data => `
                        <div class="history-line">
                            <div class="info-left">${data.date}</div>
                            <div class="info-center">${data.type}</div>
                            <div class="info-right">${data.amount} ${crypto.symbol}</div>
                            <div class="info-right">$${data.price}</div>
                            <div class="info-right">${data.total >= 0 ? '$' + data.total : '-$' + (data.total * (-1))}</div>
                        </div>
                        <div class='popup-container-order'>
                            <div class='popup-content-order'>
                                <div class='popup-card-header'>
                                    <div class='main-text'>Delete order?
                                    </div>
                                    <div class="popup-content-button">
                                        <button class="popup-close-order">
                                            <ion-icon name="add-outline"></ion-icon>
                                        </button>
                                    </div>
                                </div>
                                <div class="crypto-card">
                                    <div class="history-line">
                                        <div class="info-left">${data.date}</div>
                                        <div class="info-center">${data.type}</div>
                                        <div class="info-right">${data.amount} ${crypto.symbol}</div>
                                        <div class="info-right">$${data.price}</div>
                                        <div class="info-right">${data.total >= 0 ? '$' + data.total : '-$' + (data.total * (-1))}</div>
                                    </div>
                                </div>
                                <div class="popup-actions">
                                    <button class="delete-order" data-id="${data.id}">Delete</button>
                                </div>
                                <div class="popup-actions-notification">
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        
        `
    // Append card to the container

    //popUpOrderHistory.appendChild(popUpOrderHistoryInfo);
    popupContent.appendChild(popUpOrderHistory);

    // Create the card div diagram
    const popUpDiagramContainer = document.createElement('div');
    popUpDiagramContainer.classList.add('crypto-card');

    const popUpDiagramLegend = document.createElement('div');
    popUpDiagramLegend.classList.add('legend');

    popUpDiagramLegend.innerHTML = `
        <span class="main-text">Legend</span>
    `;

    const popUpDiagramLegendInfo = document.createElement('div');

    popUpDiagramLegendInfo.innerHTML = `
        <div class="legend-info subtext">
            <div class="color-block-invested"></div>
            <div> invested: ${crypto.portfolioInvestedPercentage}%</div>
            <div class="color-block-balance"></div>
            <div> balance: ${crypto.portfolioBalancePercentage}%</div>
            <div class="color-block-other"></div>
            <div> other</div>
        </div>
    `;

    popUpDiagramLegend.appendChild(popUpDiagramLegendInfo)

    popUpDiagramContainer.appendChild(popUpDiagramLegend);

    const diagramContainer = document.createElement('div');
    diagramContainer.classList.add('crypto-diagrams');

    popUpDiagramContainer.appendChild(diagramContainer);

    // Right Column - First Crypto Diagram
    const diagramContainer1 = document.createElement('div');
    diagramContainer1.classList.add('crypto-diagram');
    const canvas1 = document.createElement('canvas');
    diagramContainer1.appendChild(canvas1);
    //popupContent.appendChild(diagramContainer1);

    diagramContainer.appendChild(diagramContainer1);

    // Right Column - Second Crypto Diagram
    const diagramContainer2 = document.createElement('div');
    diagramContainer2.classList.add('crypto-diagram');
    const canvas2 = document.createElement('canvas');
    diagramContainer2.appendChild(canvas2);
    diagramContainer.appendChild(diagramContainer2);


    popupContent.appendChild(popUpDiagramContainer);


    popupContainer.appendChild(popupContent);
    card.appendChild(popupContainer);

    // Add event listener to the card
    card.addEventListener('click', () => {
        popupContainer.classList.add('open');
        popupContent.classList.add('open');
    });

    // Add event listener to close the popup when clicking outside
    document.addEventListener('click', (event) => {
        if (!card.contains(event.target)) {
            popupContainer.classList.remove('open');
            popupContent.classList.remove('open');
        }
    });

    const animationOptions = {
        duration: 3000, // Animation duration in milliseconds
        easing: 'easeInOutQuart', // Animation easing style easeInOutBack
        delay: 500,
    }

    // Generate first chart using Chart.js
    new Chart(canvas1, {
        type: 'doughnut',
        data: {
            labels: ['Portfolio Share', 'Remaining'],
            datasets: [{
                borderWidth: 1,
                data: [crypto.portfolioInvestedPercentage, 100 - crypto.portfolioInvestedPercentage],
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
                borderWidth: 1,
                data: [crypto.portfolioBalancePercentage, 100 - crypto.portfolioBalancePercentage],
                backgroundColor: ['#6e7eb3', '#ffcd56'] // Different colors for distinction
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
setTimeout(() => {
            loadTradingViewCharts ()
        }, 1200);


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


// Helper function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to move the mark based on the score
/*function moveMark(score, maxScore) {
    const mark = document.getElementById('mark');
    const semicircle = document.getElementById('semicircle');
    let markHeight = mark.offsetHeight
    let markWidth = mark.offsetWidth

    console.log(mark.offsetHeight, mark.offsetWidth)
    const radius = semicircle.offsetWidth / 2; // Get radius of the semicircle
    const centerX = radius; // Center X is the middle of the semicircle
    const centerY = radius; // Center Y is half the semicircle height

    // Map the score from 0 to 10 to an angle from 0 degrees (right) to 180 degrees (left)
    const angle = (1 - (score / maxScore)) * Math.PI; // Converts score to radians; inverts the score

    // Calculate the position of the mark
    const x = centerX + radius * Math.cos(angle) - (markWidth / 2); // Adjust for width
    const y = centerY - radius * Math.sin(angle) - (markHeight / 2); // Adjust for height

    // Set the position of the mark
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;

    // Calculate rotation angle for the mark (in degrees)
    const rotationAngle = (angle * -180 / Math.PI) + 90; // No need to adjust
    mark.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation

}*/

// Function to animate mark movement from score 0 to the target score
/*function animateMarkMovement(targetScore) {
    let currentScore = 0; // Start at score 0
    const step = 0.1;     // Step size for each increment
    const duration = 1000; // Duration of the entire animation in milliseconds
    const steps = (targetScore / step); // Total steps needed to reach the target score
    const intervalTime = duration / steps; // Interval time between each step
    
    // Use setInterval to increment the score and move the mark gradually
    const intervalId = setInterval(() => {
        if (currentScore >= targetScore) {
            clearInterval(intervalId); // Stop the animation when the target score is reached
            return;
        }

        currentScore = Math.min(currentScore + step, targetScore); // Increment the score and ensure it doesn't exceed target
        document.getElementById('scoreValue').innerText = `${currentScore.toFixed(2)}x`; // Update the score display

        moveMark(currentScore); // Move the mark to the current score
    }, intervalTime);
}

// Function to move the mark based on the score
function moveMark(score) {
    const mark = document.getElementById('mark');
    const semicircle = document.getElementById('semicircle');
    let markHeight = mark.offsetHeight
    let markWidth = mark.offsetWidth

    const radius = semicircle.offsetWidth / 2; // Get radius of the semicircle
    const centerX = radius; // Center X is the middle of the semicircle
    const centerY = radius; // Center Y is half the semicircle height

    // Convert the score to an angle from 0 (rightmost) to 180 degrees (leftmost)
    const angle = (1 - (score / 10)) * Math.PI; // Converts score to radians; inverts the score

    // Calculate the position of the mark
    const x = centerX + radius * Math.cos(angle) - (markWidth / 2); // Adjust for width of mark
    const y = centerY - radius * Math.sin(angle) - (markHeight / 2); // Adjust for height of mark

    // Set the new position of the mark
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;

    // Calculate the rotation angle for the mark
    const rotationAngle = (angle * -180 / Math.PI) + 90; // No need to adjust
    mark.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation
    console.log(score, x, y, rotationAngle)
}

// Function to receive new score data and trigger the animation
function updateScore(newScore) {
    document.getElementById('scoreValue').innerText = '0.0'; // Reset score display
    moveMark(0); // Reset mark position
    
    animateMarkMovement(newScore); // Start animation based on new score
}*/

const mark = document.getElementById('mark');
const scoreValue = document.getElementById('scoreValue');
let currentScore = 0; // Start from score 0

function moveMark(score, maxScore) {
    const mark = document.getElementById('mark');
    const semicircle = document.getElementById('semicircle');
    let markHeight = mark.offsetHeight
    let markWidth = mark.offsetWidth

    const radius = semicircle.offsetWidth / 2; // Get radius of the semicircle
    const centerX = radius; // Center X is the middle of the semicircle
    const centerY = radius; // Center Y is half the semicircle height

    // Convert the score to an angle from 0 (rightmost) to 180 degrees (leftmost)
    const angle = (1 - (score / maxScore)) * Math.PI; // Converts score to radians; inverts the score

    // Calculate the position of the mark
    const x = centerX + radius * Math.cos(angle) - (markWidth / 2); // Adjust for width of mark
    const y = centerY - radius * Math.sin(angle) - (markHeight / 2); // Adjust for height of mark

    // Set the new position of the mark
    mark.style.left = `${x}px`;
    mark.style.top = `${y}px`;

    // Calculate the rotation angle for the mark
    const rotationAngle = (angle * -180 / Math.PI) + 90; // No need to adjust
    mark.style.transform = `rotate(${rotationAngle}deg)`; // Apply rotation
    //console.log(score, x, y, rotationAngle)
}
animateMarkToScore(0, 10)
// Simulate incoming data for score and animate
function animateMarkToScore(newScore, maxScore) {
    const step = 0.1; // Increment for score change
    const intervalTime = 35; // Time between steps (ms)

    const interval = setInterval(() => {
        if (currentScore < newScore) {
            currentScore += step;
        } else {
            currentScore = newScore;
            clearInterval(interval);
        }
        scoreValue.textContent = `${currentScore.toFixed(2)}x`;
        moveMark(currentScore, maxScore);
    }, intervalTime);
}

function createWalletCard(walletData) {
    const container = document.getElementById('crypto-wallets');

    const card = document.createElement("div");
    card.classList.add("crypto-card-wallet");
    let walletAddress = walletData.address.slice(0, 6) + "..." + walletData.address.slice(-4)

    card.innerHTML = `
        <div class="header main-text">
            <div class="info-left">
                <h4>${walletData.name}</h4>
                <span class="subtext">${walletAddress}</span>
            </div>
            <div class="info-right">
                <br>$${(walletData.balance).toFixed(2)}
            </div>
        </div>
        <div class="networks">
            ${walletData.chains.map(chain => `
                <div class="network">
                    <div class="network-header chain main-text">
                        <div class="icon">
                            <img src="${chain.icon}" alt="${chain.name}">
                        </div>
                        <div class="network-header info">
                            <div class="info-left">${chain.name}</div>
                            <div class="info-right">$${(chain.balance).toFixed(2)} (${(100 * chain.balance / walletData.balance).toFixed(2)}%)</div>
                        </div>
                    </div>
                    <div class="network wallet">
                        <div class="network-header info main-text">
                            <div class="info-left">Wallet</div>
                            <div class="info-right">$${(chain.walletBalance).toFixed(2)} (${(100 * chain.walletBalance / chain.balance).toFixed(2)}%)</div>
                        </div>
                        <div class="network-details subtext">
                            ${chain.wallet.map(detail => `
                                    <div class="network-detail">
                                        <div class="info-left">${detail.name}: ${detail.amount}</div>
                                        <div class="info-right">$${(detail.balance).toFixed(2)} (${(100 * detail.balance / chain.walletBalance).toFixed(2)}%)</div>
                                    </div>
                            `).join('')}
                        </div>
                    </div>
                    ${chain.protocols.length > 0 ? `
                    <div class="network protocol">
                        <div class="network-header info main-text">
                            <div class="info-left">Protocols</div>
                            <div class="info-right">$${Math.round(chain.protocolBalance * 1000) / 1000} (${(100 * chain.protocolBalance / chain.balance).toFixed(2)}%)</div>
                        </div>
                        <div class="network-details subtext">
                            ${chain.protocols.map(protocol => `
                                <div class="network-header">
                                    <div class="icon">
                                        <img src="${protocol.icon}" alt="${protocol.name}">
                                    </div>
                                    <div class="network-header info main-text">
                                        <div class="info-left">
                                            <a href="${protocol.link}" target="_blank">${protocol.name}</a>
                                        </div>
                                        <div class="info-right">$${(protocol.platformBalance).toFixed(2)} (${(100 * protocol.platformBalance / chain.balance).toFixed(2)}%)</div>
                                    </div>
                                </div>
                                ${protocol.token.map(detail => `
                                    <div class="network-detail">
                                        <div class="info-left">${detail.name}: ${detail.amount} (${detail.positionType})</div>
                                        <div class="info-right">$${(detail.balance).toFixed(2)} (${(protocol.platformBalance > 0 ? 100 * detail.balance / protocol.platformBalance : 0).toFixed(2)}%)</div>
                                    </div>
                                `).join('')}
                            `).join('')}
                        </div>
                    </div>
                    `: ''}
                </div>
            `).join('')}
        </div>
    `
    container.appendChild(card);

    // Add event listener to toggle networks
    const header = card.querySelector(".header");
    const networks = card.querySelector(".networks");

    header.addEventListener("click", () => {
        if (networks.style.display === "none" || networks.style.display === "") {
            networks.style.display = "block";
            networks.style.maxHeight = networks.scrollHeight + "px";
            networks.style.padding = "5px 0px 0px 0px";

            addNetworkListeners(networks);
        } else {
            removeNetworkListeners(networks);
            networks.style.padding = "0px 0px 4px 0px";
            networks.style.maxHeight = null;

            setTimeout(() => {
                networks.style.display = "none";
                card.classList.remove("expanded");
            }, 400);
        }
    });
}

/* add, delete form */
async function addForm() {
    const formsWrapper = document.getElementById("forms-wrapper")
    const formCount = formsWrapper.children.length
    console.log(dropdownOptions)

    const formContainer = document.createElement("div");
    formContainer.className = "form-container";
    formContainer.setAttribute("data-id", formCount);
    
    let formType = ["bought", "sold", "airdrop", "reward", "staking", "farming", "other"]
    let formTypeOptions = formType.map(type =>
                `<option class="subtext" value="${type}">${type}</option>`
            ).join("")

    console.log(dropdownOptions)
    formContainer.innerHTML = `<div class="form-group">
                    <label for="cryptoDropdown" class="main-text">Select token</label>
                    <div class="dropdown">
                        <select id="cryptoDropdown" onchange="updatePreview(this)">
                            ${dropdownOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="type" class="main-text">Type</label>
                    <div class="dropdown">
                        <select id="type" name='type' class="dropdown" onchange="updatePreview(this)">
                                ${formTypeOptions}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="crypto-amount" class="main-text">Amount</label>
                    <input type="number" name='amount' min="0" placeholder="e.g., 1200" onchange="validateDecimal(this) updatePreview(this)" required >
                </div>
                <div class="form-group">
                    <label for="crypto-price" class="main-text">Price $</label>
                    <input type="text" name='price' pattern="^\\d+(\\.\\d{1,2})?$" placeholder="0.00" onchange="validateDecimal(this) updatePreview(this)" required>
                </div>
                <div class="form-group">
                    <label for="date" class="main-text">Date</label>
                    <input type="date" name='date' onchange="updatePreview(this)">
                </div>
                <button class="remove-btn" onclick="removeForm(${formCount})"><ion-icon name="add-outline"></ion-icon></button>`
    //formContainer.insertBefore(tokenSelect, formContainer.firstChild);
    document.getElementById("forms-wrapper").appendChild(formContainer);
    updatePreview();
}
window.addForm = addForm

function removeForm(id) {
    const form = document.querySelector(`[data-id='${id}']`);
    if (form) form.remove();
    updatePreview();
}
window.removeForm = removeForm
function clearFormData() {
    const forms = document.querySelectorAll(".form-container");

    forms.forEach(form => {
        // Сбрасываем значения всех полей в форме
        form.querySelectorAll("input, select").forEach(field => {
            if (field.tagName === "SELECT") {
                field.selectedIndex = 0; // Сбрасываем выбор в выпадающем списке
            } else {
                field.value = ""; // Очищаем текстовые поля, числа и даты
            }
        });
    });

    // Обновляем превью после очистки
    updatePreview();

    console.log("Данные всех форм очищены.");
}
window.clearFormData = clearFormData
async function saveData() {
    let telegramData  = getTelegramUserId()
    let telegram_id  = telegramData['telegram_id']
    const forms = document.querySelectorAll(".form-container");
    let data = [];

    forms.forEach(form => {
        const tokenName = form.querySelector("#cryptoDropdown").value;
        let amount = form.querySelector("[name='amount']").value;
        const price = form.querySelector("[name='price']").value;
        const date = form.querySelector("[name='date']").value;
        const type = form.querySelector("#type").value;

        if (tokenName && amount && price && date && type) {
            if (type === "sold") {
                amount = Number(amount) * (-1)
            }
            data.push({ token_name: tokenName, amount: amount, price: Number(price), date: date, type: type, total: Number((amount * Number(price)).toFixed(2)) });
        }
    });

    console.log("Отправляем в базу:", JSON.stringify({data: data, telegram_id: telegram_id}));
    // Здесь можно сделать fetch() для отправки данных на сервер
    let answer = await addDataToSupabase({data: data, telegram_id: telegram_id})
    sendNotification(answer.message, answer.status);
    clearFormData()
    fetchCryptoData()
}
window.saveData = saveData
function updatePreview() {
    const forms = document.querySelectorAll(".form-container");
    const previewList = document.getElementById("preview-list");
    previewList.innerHTML = "";

    forms.forEach((formContainer) => {

        const tokenName = formContainer.querySelector('#cryptoDropdown')?.value || '';
        const type = formContainer.querySelector('#type')?.value || '';
        const price = formContainer.querySelector('input[name="price"]')?.value || '';
        let amount = formContainer.querySelector('input[name="amount"]')?.value || '';
        const date = formContainer.querySelector('input[name="date"]')?.value || '';
        
        if (type === "sold") {
            amount = Number(amount) * (-1);
        }
        console.log("tokenName: %s\namount: %s\nprice: %s\ndate: %s", tokenName, amount, price, date);
        if (tokenName && amount && price && type && date) {
            const listItem = document.createElement("div")
            listItem.classList.add("history-line");
            //listItem.textContent = `${date} - ${type} - ${amount} ${tokenName} - $${price}`;
            listItem.innerHTML = `<div class="info-left">${date}</div>
                                    <div class="info-center">${type}</div>
                                    <div class="info-center">${amount} ${tokenName}</div>
                                    <div class="info-center">$${price}</div>
                                    <div class="info-center">$${price * amount}</div>`
            previewList.appendChild(listItem);
        }
    });

    let preview = document.getElementById("preview-container")
    let saveBtn = document.getElementById("save-btn")

    if (previewList.children.length === 0) {
        preview.classList.remove("form-group")
        preview.classList.remove("crypto-card")
        saveBtn.classList.remove("save-btn")
        preview.classList.add("hidden");
        saveBtn.classList.add("hidden")
    } else {
        preview.classList.remove("hidden");
        saveBtn.classList.remove("hidden")
        preview.classList.add("form-group")
        preview.classList.add("crypto-card")
        saveBtn.classList.add("save-btn")
    }

}
window.updatePreview = updatePreview
function validateDecimal(input) {
    let value = input.value
    if (!/^[0-9]*\.?[0-9]*$/.test(value)) {
        input.value = value.slice(0, -1)
    }
    updatePreview()
}
window.validateDecimal = validateDecimal

function loadChart(symbol, containerId ) {
    new TradingView.widget({
        container_id: containerId,
        width: "100%",
        height: "325px",
        symbol,
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: false,
    });

}

function loadTradingViewCharts () {
    const chartsWrapper = document.getElementById("tradingview_charts")
            
    const symbols = ["CRYPTOCAP:TOTAL", "CRYPTOCAP:TOTAL2", "CRYPTOCAP:TOTAL3", "CRYPTOCAP:BTC.D", "CRYPTOCAP:ETH.D", "(CRYPTOCAP:TOTAL3-CRYPTOCAP:USDT)/CRYPTOCAP:BTC", "(CRYPTOCAP:TOTAL3-CRYPTOCAP:USDT)/CRYPTOCAP:ETH", "CRYPTOCAP:OTHERS", "CRYPTOCAP:ETH.D/CRYPTOCAP:OTHERS.D"];
            
    symbols.forEach(symbol => {
        const chartCount = chartsWrapper.children.length + 1
        const chartContainer = document.createElement("div");
        chartContainer.className = "chart";
        let idName = "tradingview_chart_" + chartCount;
        chartContainer.id = idName
        chartContainer.setAttribute("data-id", chartCount);
        chartsWrapper.appendChild(chartContainer);

        loadChart(symbol, idName )
    });
    
}







