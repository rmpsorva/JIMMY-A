import { Connection, PublicKey, Transaction, clusterApiUrl } from "https://cdn.jsdelivr.net/npm/@solana/web3.js@1.73.0/+esm";
import { getAssociatedTokenAddress, createTransferInstruction, getAccount } from "https://cdn.jsdelivr.net/npm/@solana/spl-token@0.3.9/+esm";

// =======================================================
// CONSTANTES GLOBALES Y SELECTORES
// =======================================================
const connectBtn = document.getElementById("connect-wallet-btn");
const walletAddressEl = document.getElementById("wallet-address");
const jimmyBalanceEl = document.getElementById("jimmy-balance");
const loadingIndicator = document.getElementById("loading");
const spinBtn = document.getElementById("spin-btn");
const slotReels = document.querySelectorAll(".slot-reel");
const resultMessageEl = document.getElementById("result-message");
const walletSection = document.getElementById("wallet-section");
const connectedWalletDisplay = document.getElementById("connected-wallet-display");

let walletConnection = null;
const JIMMYA_MINT = new PublicKey("54ocizWBC3CsD5L2Zr1kvVkLx5dFPUFzTJzv2J4zuray"); 
const CASINO_PROGRAM_ID = new PublicKey("H44gL2B9...PROGRAM_ID"); // ¡REEMPLAZA CON EL ID REAL DE TU PROGRAMA!
const DECIMALS = 9;
const BET_AMOUNT = 50;

// Símbolos mejorados
const SYMBOLS = [
  '🍕', 
  '🍗', 
  '🥩', 
  '😎', 
  '👑', 
];

// Sistema de premios con multiplicadores
const PAYOUTS = {
  '👑👑👑': { multiplier: 10, message: "¡JACKPOT DE EMPANADA! 🏆 Ganas 500 JIMMYA!" }, 
  '😎😎😎': { multiplier: 3, message: "¡TRIPLE JIMMY! 🥳 Ganas 150 JIMMYA!" },
  '🍕🍕🍕': { multiplier: 2, message: "¡TRIPLE EMPANADA! 🎉 Ganas 100 JIMMYA!" },
  '🍗🍗🍗': { multiplier: 2, message: "¡TRIPLE POLLO! 🎉 Ganas 100 JIMMYA!" },
  '🥩🥩🥩': { multiplier: 2, message: "¡TRIPLE CARNE! 🎉 Ganas 100 JIMMYA!" }
};

// =======================================================
// FUNCIONES DE UTILIDAD Y UX
// =======================================================
function setLoading(loading) {
  loadingIndicator.style.display = loading ? 'block' : 'none';
  [connectBtn, spinBtn].forEach(btn => {
    btn.disabled = loading;
  });
  spinBtn.classList.toggle('spinning', loading);
}

function showNotification(message, type = "info") {
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 500);
  }, 5000);
}

// =======================================================
// FUNCIONES DE WALLET
// =======================================================
function disconnectWallet() {
  if (window.solana && window.solana.disconnect) {
      window.solana.disconnect();
  }
  walletConnection = null;
  walletSection.classList.remove('hidden');
  connectedWalletDisplay.classList.add('hidden');
  spinBtn.disabled = true;
  jimmyBalanceEl.textContent = "0.00";
  showNotification("👋 Wallet desconectada", "info");
}

async function connectWallet() {
  if (!window.solana || !window.solana.isPhantom) {
    showNotification("¡Oh no! Instala Phantom Wallet para empezar la diversión.", "error");
    setTimeout(() => {
      if (confirm("¿Quieres instalar Phantom Wallet?")) {
        window.open("https://phantom.app/", "_blank");
      }
    }, 2000);
    return;
  }

  setLoading(true);

  try {
    const resp = await window.solana.connect();
    walletConnection = window.solana;
    
    const pubKeyStr = resp.publicKey.toString();
    walletAddressEl.textContent = `${pubKeyStr.substring(0, 6)}...${pubKeyStr.substring(pubKeyStr.length - 6)}`;
    
    walletSection.classList.add('hidden');
    connectedWalletDisplay.classList.remove('hidden');
    
    window.solana.on('accountChanged', async (publicKey) => {
      if (publicKey) {
        await getTokenBalance();
        showNotification("🔁 Wallet actualizada!", "info");
      } else {
        disconnectWallet();
      }
    });

    window.solana.on('disconnect', disconnectWallet);

    await getTokenBalance();
    showNotification("✅ ¡Wallet conectada! ¡La fortuna de la empanada te llama!", "success");

  } catch (err) {
    console.error("Error al conectar la wallet:", err);
    showNotification("❌ Fallo al conectar. Asegúrate de aprobar la conexión.", "error");
  } finally {
    setLoading(false);
  }
}

async function getTokenBalance() {
  if (!walletConnection || !walletConnection.publicKey) return;
  
  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const senderTokenAddr = await getAssociatedTokenAddress(JIMMYA_MINT, walletConnection.publicKey);
    
    try {
      const tokenAccount = await getAccount(connection, senderTokenAddr);
      const balance = Number(tokenAccount.amount) / 10 ** DECIMALS;
      jimmyBalanceEl.textContent = balance.toFixed(2);
      
      spinBtn.disabled = balance < BET_AMOUNT;
      
    } catch (error) {
      jimmyBalanceEl.textContent = "0.00";
      spinBtn.disabled = true;
    }
  } catch (err) {
    console.error("Error obteniendo balance:", err);
    jimmyBalanceEl.textContent = "Error";
  }
}

// =======================================================
// LÓGICA DE SLOT MACHINE Y APUESTA
// =======================================================

function animateReels(finalSymbols, duration = 2) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    slotReels.forEach((reel, index) => {
      let spins = 0;
      const maxSpins = 10 + (index * 3); 
      
      const interval = setInterval(() => {
        const randomSymbolIndex = Math.floor(Math.random() * SYMBOLS.length);
        reel.textContent = SYMBOLS[randomSymbolIndex];
        spins++;
        
        if (Date.now() - startTime > (duration * 1000 * (index + 1)) / 3 || spins > maxSpins) {
          clearInterval(interval);
          reel.textContent = finalSymbols[index];
          
          if (index === slotReels.length - 1) {
            setTimeout(resolve, 500); 
          }
        }
      }, 80 + (index * 20)); 
    });
  });
}

function calculatePayout(symbols) {
  const symbolString = symbols.join('');
  return PAYOUTS[symbolString] || { multiplier: 0, message: "¡Mala suerte! Inténtalo de nuevo 🎰" };
}

async function sendTokensToUser(amount) {
  if (!walletConnection) return false;
  
  const currentBalance = parseFloat(jimmyBalanceEl.textContent);
  jimmyBalanceEl.textContent = (currentBalance + amount).toFixed(2);
  
  showNotification(`🎉 ¡Premio enviado! +${amount} JIMMYA (Actualiza en un momento)`, "success");
  
  return true;
}


async function spinSlot() {
  if (!walletConnection) {
    showNotification("¡Conecta tu wallet, campeón!", "warning");
    return;
  }

  const currentBalance = parseFloat(jimmyBalanceEl.textContent);
  if (currentBalance < BET_AMOUNT) {
    showNotification(`¡Necesitas ${BET_AMOUNT} JIMMYA para girar!`, "error");
    return;
  }

  setLoading(true);
  resultMessageEl.textContent = "¡Girando la fortuna de la empanada!";

  try {
    const connection = new Connection(clusterApiUrl("devnet"));
    const senderPubKey = walletConnection.publicKey;
    
    const senderTokenAddr = await getAssociatedTokenAddress(JIMMYA_MINT, senderPubKey);
    
    // VERIFICACIÓN DE BALANCE EN BLOCKCHAIN
    try {
      const tokenAccount = await getAccount(connection, senderTokenAddr);
      const realBalance = Number(tokenAccount.amount) / 10 ** DECIMALS;
      
      if (realBalance < BET_AMOUNT) {
        showNotification("❌ Balance insuficiente en la blockchain. Sincronizando...", "error");
        await getTokenBalance(); 
        return;
      }
    } catch (error) {
      showNotification("❌ No tienes la cuenta de token JIMMYA. ¡Necesitas tener algo para jugar!", "error");
      return;
    }


    // 1. CREAR TRANSACCIÓN DE APUESTA
    const tx = new Transaction().add(
      createTransferInstruction(
        senderTokenAddr,
        await getAssociatedTokenAddress(JIMMYA_MINT, CASINO_PROGRAM_ID), 
        senderPubKey,
        BigInt(Math.floor(BET_AMOUNT * 10 ** DECIMALS))
      )
    );
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = senderPubKey;

    // 2. FIRMAR Y ENVIAR TRANSACCIÓN
    showNotification("💰 ¡Apuesta enviada! Cruzando los dedos...", "info");
    const { signature } = await walletConnection.signAndSendTransaction(tx);
    await connection.confirmTransaction({ signature, ...await connection.getLatestBlockhash() }, "processed");
    
    // 3. LÓGICA DE RESULTADO (Simulación de RNG. Reemplazar con llamada al CI)
    const finalSymbols = [
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)], 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    ];

    if (Math.random() < 0.3) { 
      const payoutKeys = Object.keys(PAYOUTS);
      const winningCombo = payoutKeys[Math.floor(Math.random() * payoutKeys.length)];
      finalSymbols[0] = winningCombo[0];
      finalSymbols[1] = winningCombo[1];
      finalSymbols[2] = winningCombo[2];
    }
    
    await animateReels(finalSymbols, 2);

    // 4. CALCULAR Y MOSTRAR RESULTADO
    const payout = calculatePayout(finalSymbols);
    const winAmount = BET_AMOUNT * payout.multiplier;
    
    resultMessageEl.textContent = payout.message;

    if (payout.multiplier > 0) {
      resultMessageEl.classList.add('jackpot-win');
      
      const winEffect = document.createElement('div');
      winEffect.className = 'win-effect';
      document.body.appendChild(winEffect);
      setTimeout(() => winEffect.remove(), 2000); 
      
      if (winAmount > 0) {
        await sendTokensToUser(winAmount); 
      }
    } else {
      await getTokenBalance(); 
      showNotification(`💸 Apuesta de ${BET_AMOUNT} JIMMYA realizada`, "info");
    }

  } catch (err) {
    console.error("Error en el giro:", err);
    showNotification("❌ Transacción fallida/cancelada: " + (err.message || "Intenta nuevamente"), "error");
  } finally {
    setLoading(false);
    resultMessageEl.classList.remove('jackpot-win');
  }
}

// =======================================================
// EVENTOS Y CONEXIÓN INICIAL
// =======================================================
connectBtn.addEventListener("click", connectWallet);
spinBtn.addEventListener("click", spinSlot);

window.addEventListener('load', async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect({ onlyIfTrusted: true });
      if (resp) {
        await connectWallet(); 
      }
    } catch (error) {
    }
  }
});
