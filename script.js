// --- Parallax Effect ---
document.addEventListener('mousemove', (e) => {
    const parallaxElements = document.querySelectorAll('.parallax-bg, .parallax-element');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    parallaxElements.forEach(el => {
        const depth = parseFloat(el.dataset.depth) || 0;
        const moveX = -(mouseX * depth);
        const moveY = -(mouseY * depth);

        if (el.classList.contains('parallax-bg')) {
            el.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
        } else {
             el.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
});


// --- Copy to Clipboard ---
document.body.addEventListener('click', function(event) {
    if (event.target.closest('#copy-button')) {
        const copyButton = event.target.closest('#copy-button');
        const tokenAddress = document.getElementById('token-address').innerText;
        
        navigator.clipboard.writeText(tokenAddress).then(() => {
            const originalText = copyButton.title;
            copyButton.title = 'Copied!';
            setTimeout(() => {
                copyButton.title = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }
});

// --- Presale Logic ---
const presaleConfig = {
    // NOTE: Month is 0-indexed (8 = September)
    // Beijing time is UTC+8. We use UTC internally. 
    // 2025-09-10 00:00:00 GMT+0800 is 2025-09-09 16:00:00 UTC
    startDate: new Date(Date.UTC(2025, 8, 9, 16, 0, 0)),
    roundDurationDays: 3,
    startRound: 12,
    startProgress: 89.01,
    endProgress: 100,
    totalUsd: 25475000,
    totalTokens: 15750000000
};

const roundNumberEl = document.getElementById('round-number');
const progressBarEl = document.getElementById('progress-bar');
const progressPercentEl = document.getElementById('progress-percent');
const usdRaisedEl = document.getElementById('usd-raised');
const tokensSoldEl = document.getElementById('tokens-sold');

function updatePresale() {
    const now = new Date();
    const timeDiffMs = now.getTime() - presaleConfig.startDate.getTime();

    if (timeDiffMs < 0) {
        // Presale hasn't started
        return;
    }
    
    const roundDurationMs = presaleConfig.roundDurationDays * 24 * 60 * 60 * 1000;
    
    const currentRoundOffset = Math.floor(timeDiffMs / roundDurationMs);
    const currentRound = presaleConfig.startRound + currentRoundOffset;
    
    const timeIntoRoundMs = timeDiffMs % roundDurationMs;
    const roundProgressRatio = timeIntoRoundMs / roundDurationMs;

    const progressRange = presaleConfig.endProgress - presaleConfig.startProgress;
    const currentProgress = presaleConfig.startProgress + (progressRange * roundProgressRatio);
    const displayProgress = Math.min(currentProgress, 100);

    const usdRaised = presaleConfig.totalUsd * (displayProgress / 100);
    const tokensSold = presaleConfig.totalTokens * (displayProgress / 100);

    roundNumberEl.textContent = currentRound;
    progressBarEl.style.width = `${displayProgress}%`;
    progressPercentEl.textContent = `${displayProgress.toFixed(2)}%`;
    usdRaisedEl.textContent = `$${Math.round(usdRaised).toLocaleString('en-US')}`;
    tokensSoldEl.textContent = Math.round(tokensSold).toLocaleString('en-US');
}

if (roundNumberEl) {
    updatePresale();
    setInterval(updatePresale, 10000);
}

// --- Buy Interface Logic ---
const buyInterface = document.querySelector('.buy-interface');

if (buyInterface) {
    const payInput = document.getElementById('pay-input');
    const lilpepeOutput = document.getElementById('lilpepe-output');
    const payCurrencyLabel = document.getElementById('pay-currency-label');
    const payCurrencySymbol = document.getElementById('pay-currency-symbol');
    const currencyTabs = document.querySelectorAll('.tab-button');
    
    // let activeCurrency = 'SOL'; // Moved to global scope

    const rates = {
        LILPEPE_PRICE_USD: 0.0015,
        SOL_TO_USD: 200,
        USDT_TO_USD: 1,
        USDC_TO_USD: 1,
    };

    const conversionFactors = {
        SOL: rates.SOL_TO_USD / rates.LILPEPE_PRICE_USD,
        USDT: rates.USDT_TO_USD / rates.LILPEPE_PRICE_USD,
        USDC: rates.USDC_TO_USD / rates.LILPEPE_PRICE_USD,
    };

    function calculateLilpepe() {
        const amount = parseFloat(payInput.value);
        if (!isNaN(amount) && amount >= 0) {
            const lilpepeAmount = amount * conversionFactors[activeCurrency];
            lilpepeOutput.value = lilpepeAmount.toFixed(2);
        } else {
            lilpepeOutput.value = '0';
        }
    }
    
    payInput.addEventListener('input', calculateLilpepe);

    currencyTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            currencyTabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update active currency (now global)
            activeCurrency = tab.dataset.currency;
            
            // Update UI elements
            payCurrencyLabel.textContent = activeCurrency;
            payCurrencySymbol.textContent = activeCurrency;
            
            // Recalculate with the new currency
            calculateLilpepe();
        });
    });
}


// --- Canvas Star Trail ---
const canvas = document.getElementById('star-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
let mouse = { x: null, y: null };
// Keep track of the active currency from the buy interface globally for wallet use
let activeCurrency = 'SOL';

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    // Add a burst of stars on move
    for (let i = 0; i < 2; i++) {
        stars.push(new Star(mouse.x, mouse.y));
    }
});

class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.color = `rgba(0, 255, 255, ${Math.random()})`;
        this.life = 1; // 1 = 100%
        this.decay = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.size > 0.1) this.size -= 0.02;
    }

    draw() {
        ctx.fillStyle = this.color.replace(/[^,]+(?=\))/, this.life); // update alpha
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'cyan';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleStars() {
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();

        if (stars[i].life <= 0 || stars[i].size <= 0.1) {
            stars.splice(i, 1);
            i--;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleStars();
    requestAnimationFrame(animate);
}

// --- Wallet Connection ---
document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.querySelector('.connect-wallet-button');
    const directTransferButton = document.querySelector('.direct-transfer-button');
    const buyOnRaydiumButton = document.getElementById('buy-on-raydium-button');
    let walletAddress = null;
    let provider = null;

    const SOLANA_NETWORK = 'mainnet-beta';
    const DESTINATION_WALLET = 'MUfLyNnMvpfTk9VoGFtYwwpM4uovFVAApjph17Lsshj';
    
    // Modal elements
    const buyModal = document.getElementById('buy-modal');
    const closeModalButton = document.querySelector('.modal-close-button');
    const modalCopyButton = document.getElementById('modal-copy-button');
    const modalTokenAddressEl = document.getElementById('modal-token-address');

    const TOKEN_MINTS = {
        USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Tether USD (Solana)
        USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USD Coin (Solana)
    };


    const getProvider = () => {
        if ('phantom' in window) {
            const provider = window.phantom?.solana;
            if (provider?.isPhantom) {
                return provider;
            }
        }
        if ('solana' in window && window.solana.isReady) {
            return window.solana;
        }
        return null;
    };

    const updateUIOnConnect = (publicKey) => {
        walletAddress = publicKey.toString();
        connectButton.textContent = 'BUY LILPEPE';
        connectButton.removeEventListener('click', connectWalletHandler);
        connectButton.addEventListener('click', buyLilpepeHandler);
    };

    const updateUIOnDisconnect = () => {
        connectButton.textContent = 'Connect Wallet';
        connectButton.removeEventListener('click', buyLilpepeHandler);
        connectButton.addEventListener('click', connectWalletHandler);
        walletAddress = null;
    };

    const connectWalletHandler = async () => {
        // As per new request, this button now also opens the modal.
        buyModal.style.display = 'flex';
        
        // We can still attempt to connect the wallet in the background
        if (!provider) {
            console.log("Solana wallet not found. Please install Phantom wallet.");
            // We don't alert here to not interrupt the modal flow.
            return;
        }
        try {
            // onlyIfTrusted will prevent a popup if not already connected
            // if already connected, the 'connect' event will fire and update the button
             await provider.connect({ onlyIfTrusted: true }); 
        } catch (err) {
            console.log("Auto-connect failed or wallet not trusted. User needs to connect manually if they want to.");
        }
    };

    const buyLilpepeHandler = async () => {
        if (!provider || !walletAddress) {
            alert('Please connect your wallet first.');
            return;
        }

        const payInput = document.getElementById('pay-input');
        const amount = parseFloat(payInput.value);

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount to purchase.');
            return;
        }

        // Instead of sending a transaction, open the modal
        buyModal.style.display = 'flex';
    };
    
    // --- Modal Logic ---
    const showModal = () => {
        buyModal.style.display = 'flex';
    };

    const closeModalHandler = () => {
        buyModal.style.display = 'none';
    };

    const copyModalAddressHandler = () => {
        const address = modalTokenAddressEl.innerText;
        navigator.clipboard.writeText(address).then(() => {
            const originalTitle = modalCopyButton.title;
            const originalText = modalCopyButton.innerHTML;
            modalCopyButton.innerHTML = 'Copied!';
            modalCopyButton.title = 'Copied!';
            setTimeout(() => {
                modalCopyButton.innerHTML = originalText;
                modalCopyButton.title = originalTitle;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy address from modal: ', err);
        });
    };

    if (buyModal) {
        closeModalButton.addEventListener('click', closeModalHandler);
        modalCopyButton.addEventListener('click', copyModalAddressHandler);
        // Close modal if user clicks outside of the content
        buyModal.addEventListener('click', (event) => {
            if (event.target === buyModal) {
                closeModalHandler();
            }
        });
    }

    if(directTransferButton) {
        directTransferButton.addEventListener('click', showModal);
    }
    
    if (buyOnRaydiumButton) {
        buyOnRaydiumButton.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });
    }

    // --- Initial Setup ---
    provider = getProvider();
    if (provider) {
        // Listen for wallet state changes
        provider.on('connect', updateUIOnConnect);
        provider.on('disconnect', updateUIOnDisconnect);

        // Try to auto-connect on page load
        provider.connect({ onlyIfTrusted: true })
            .catch(err => {
                console.log("Auto-connect failed. User needs to connect manually.");
            });
        
        connectButton.addEventListener('click', connectWalletHandler);

    } else {
        // No wallet provider found
        connectButton.textContent = 'Install Phantom';
        connectButton.addEventListener('click', () => {
             window.open('https://phantom.app/', '_blank');
        });
    }
});

// --- FAQ Accordion ---
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Optional: close all other items
            // faqItems.forEach(otherItem => {
            //     otherItem.classList.remove('active');
            // });

            if (!isActive) {
                item.classList.add('active');
            } else {
                 item.classList.remove('active');
            }
        });
    });
});

// --- Complaint Modal ---
document.addEventListener('DOMContentLoaded', () => {
    const reportButton = document.getElementById('report-tokens-button');
    const complaintModal = document.getElementById('complaint-modal');
    const confirmationModal = document.getElementById('confirmation-modal');
    const complaintForm = document.getElementById('complaint-form');

    if (!reportButton || !complaintModal || !confirmationModal || !complaintForm) {
        return;
    }

    const allModals = document.querySelectorAll('.modal-overlay');

    const openModal = (modal) => {
        if (modal) modal.style.display = 'flex';
    };

    const closeModal = (modal) => {
        if (modal) modal.style.display = 'none';
    };

    reportButton.addEventListener('click', () => {
        openModal(complaintModal);
    });
    
    complaintForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const txHashInput = document.getElementById('tx-hash-input');
        if (txHashInput.value.trim() === '') {
            alert('Please enter a transaction hash.');
            return;
        }
        // In a real application, you would send the txHash to a server here.
        console.log('Submitted Tx Hash:', txHashInput.value);
        txHashInput.value = ''; // Clear input
        closeModal(complaintModal);
        openModal(confirmationModal);
    });

    allModals.forEach(modal => {
        const closeButton = modal.querySelector('.modal-close-button');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => closeModal(modal));
        }

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });
});

animate();