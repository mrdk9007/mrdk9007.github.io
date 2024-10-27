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



// Assuming you're getting JSON data from a Google Sheets API or a web app
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzX5g6O6JMM0y_pct2IZB-tEf0jb5aOgQSn8r-J_5aAk4Rai3G_VOBFWgCk8zcy9YGgOQ/exec"; // Replace with your actual Sheets API URL

async function fetchCryptoData() {
    try {
        const response = await fetch(SHEET_API_URL);
        const data = await response.json();
        var portfolioData = data.portfolioData;
        var history = data.history


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
            document.getElementById('loading-indicator').classList.remove('active')

            portfolioData.forEach(crypto => {
                totalInvest += crypto.invested
                balance += crypto.balance;
                generateCryptoCard({cardInfo: crypto, history: history[crypto.symbol]})

                const option = document.createElement('option');
                option.classList.add('subtext')
                option.value = crypto.symbol;
                option.innerHTML = `${crypto.name} (${crypto.symbol})`;
                dropdown.appendChild(option);
            })

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
            <img src="${crypto.icon}" alt="${crypto.name}" style="width: 34px; height: 34px; margin-right: 5px;">
        </div>
        <div class="info">
            <div class="info-left main-text">${crypto.name}<br>
                <span class="subtext">${crypto.symbol}: ${crypto.number}</span>
                
            </div>
            <div class="info-right main-text">
                $${crypto.balance} (${crypto.portfolioBalancePersantage}%)<br>
                <span class="subtext">${crypto.price}  
                    <span class="subtext ${crypto.changeMyPrice >= 100 ? 'up' : 'down'}">
                        ${crypto.changeMyPrice >= 100 ? '⬆' : '⬇'}${crypto.changeMyPrice}%
                    </span>
                    
                </span>
            </div>
        </div>
    `;
    /*<p>Current price: 
            My price: $${crypto.myPrice}
        </p>
        <p>
            Invected: $<span id="amount">${crypto.invested}</span> (${crypto.portfolioInvestedPersantage}%)
        </p>
        */
    //card.appendChild(cryptoInfo);
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
                <span class="main-text">$${crypto.balance} (${crypto.portfolioBalancePersantage}%)</span><br>
                <span class="subtext">$${crypto.price}  
                    <span class="subtext ${crypto.changeMyPrice >= 100 ? 'up' : 'down'}">
                        ${crypto.changeMyPrice >= 100 ? '⬆' : '⬇'}${crypto.changeMyPrice}%
                    </span><br>
                    $${crypto.myPrice}<br>
                    $${crypto.invested} (${crypto.portfolioInvestedPersantage}%)<br>
                    $${crypto.balance} (${crypto.portfolioBalancePersantage}%)
                </span>
            </div>
        </div>
  `;
    // Append card to the container
    popupContent.appendChild(popUpCard);

    // Create the card div history
    const popUpOrderHistory = document.createElement('div');
    popUpOrderHistory.classList.add('crypto-card');
    popUpOrderHistory.classList.add('history');
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
        
    }
    popUpOrderHistoryInfo.innerHTML = `
        <div class="info-left">${historyDatesColumns}</div>
        <div class="info-center">${historyTypesColumns}</div>
        <div class="info-right">${historyAmountsColumns}</div>
        <div class="info-right">${historyPriceColumns}</div>
        <div class="info-right">${historyTotalColumns}</div>
    `
    /*popUpOrderHistoryInfo.innerHTML = `
        <div class="info-left">2022-06-22<br>2022-06-22<br>2022-06-22<br>2022-06-22<br>2022-06-22</div>
        <div class="info-center">bought<br>bought<br>bought<br>stacking<br>sold</div>
        <div class="info-right">3 ${crypto.symbol}<br>3 ${crypto.symbol}<br>3 ${crypto.symbol}<br>3 ${crypto.symbol}<br>-3 ${crypto.symbol}</div>
        <div class="info-right">$42.3<br>$42.3<br>$42.3<br><br>-$42.3</div>
        <div class="info-right">$126.9<br>$126.9<br>$126.9<br><br>-$126.9</div>
    `;*/
    // Append card to the container

    popUpOrderHistory.appendChild(popUpOrderHistoryInfo);
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
            <div> invested: ${crypto.portfolioInvestedPersantage}%</div>
            <div class="color-block-balance"></div>
            <div> balance: ${crypto.portfolioBalancePersantage}%</div>
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
        dalay: 500,
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
                borderWidth: 1,
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
                borderWidth: 1,
                data: [crypto.portfolioBalancePersantage, 100 - crypto.portfolioBalancePersantage],
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
