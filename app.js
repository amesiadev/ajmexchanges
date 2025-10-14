let bcvRate = null;
let usdToCopRate = null;

// Obtener tasas
async function getRates() {
  try {
    const res = await fetch("https://openexchangerates.org/api/latest.json?app_id=8a2620eb6e304a559a3656342ae3b77b&base=USD&symbols=COP,VES");
    const data = await res.json();
    bcvRate = data.rates.VES;
    usdRate = data.rates.USD;
    usdToCopRate = data.rates.COP;

    document.getElementById("bcvRate").innerText =
      `BCV: ${bcvRate.toFixed(2)} Bs | 1 USD = ${usdToCopRate.toFixed(2)} COP`;
  } catch (e) {
    console.error("Error obteniendo tasas:", e);
    document.getElementById("bcvRate").innerText = "No se pudo cargar tasas";
  }
}

function calculate() {
  const amount = parseFloat(document.getElementById("monto").value);
  const currency = document.getElementById("moneda").value;
  if (isNaN(amount) || !bcvRate) return;

  let usdValue;
  let copValue;
  if (currency === "USD") {
    usdValue = amount;
    copValue = amount * usdToCopRate;
  } else if (currency === "COP") {
    usdValue = amount / usdToCopRate;
  }

  // Calculos
  const baseValue = usdValue * bcvRate;
  const faltaPorDolar = 260 - bcvRate;
  const bono = faltaPorDolar * usdValue;
  const total = baseValue + bono;

  // Mostrar desglose
  document.getElementById("enteredAmount").innerText =
    `Monto ingresado: ${amount.toFixed(2)} ${currency}`;

  if (currency === "COP") {
    document.getElementById("usdEquivalent").innerText =
      `Equivalente: ${usdValue.toFixed(2)} USD`;
  } else {
    document.getElementById("usdEquivalent").innerText = 
      `Equivalente: ${copValue.toFixed(2)} COP`;
  }

  document.getElementById("baseValue").innerText = `Valor base: ${baseValue.toFixed(2)} Bs`;

  document.getElementById("bonusInfo").innerText = `Bono: ${bono.toFixed(2)} Bs`;

  document.getElementById("finalResult").innerText =`Recibes: ${total.toFixed(2)} Bs`;
}

// Asegúrate que exista el contenedor de resultados en tu HTML
const resultsContainer = document.getElementById("resultCard");

// ✅ Verifica que html2canvas esté cargado
async function ensureHtml2Canvas() {
  if (typeof html2canvas === "undefined") {
    throw new Error("html2canvas no está cargado. Asegúrate de incluirlo en tu index.html");
  }
}

// ✅ Genera imagen PNG del contenedor de resultados
async function generarImagenBlob() {
  if (!resultsContainer) throw new Error("Contenedor de resultados no encontrado.");
  await ensureHtml2Canvas();
  const canvas = await html2canvas(resultsContainer, { backgroundColor: "#ffffff", scale: 2 });
  return await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
}

// 📘 Compartir en Facebook
async function compartirFacebook() {
  try {
    const blob = await generarImagenBlob();
    const file = new File([blob], "resultado.png", { type: "image/png" });

    // ✅ Compatibilidad con Web Share API
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "AJM Exchanges",
        text: "Mira mi cálculo en AJM Exchanges"
      });
      return;
    }

    // ❌ Fallback: descarga y abre diálogo FB
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "resultado.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(urlObj), 5000);

    const shareUrl = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent("Mira mi cálculo en AJM Exchanges");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${quote}`, "_blank");
  } catch (err) {
    console.error("Error compartiendo en Facebook:", err);
    alert("No se pudo compartir en Facebook. Descarga la imagen manualmente.");
  }
}

// 💬 Compartir en WhatsApp
async function compartirWhatsApp() {
  try {
    const blob = await generarImagenBlob();
    const file = new File([blob], "resultado.png", { type: "image/png" });

    // ✅ Web Share API
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Resultado AJM Exchanges",
        text: "Te comparto mi cálculo de AJM Exchanges"
      });
      return;
    }

    // ❌ Fallback: descarga + abre wa.me
    const urlObj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = urlObj;
    a.download = "resultado.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(urlObj), 5000);

    const mensaje = encodeURIComponent("Te comparto mi cálculo desde AJM Exchanges. Descarga la imagen y compártela aquí:");
    window.open(`https://wa.me/?text=${mensaje}%20${encodeURIComponent(window.location.href)}`, "_blank");
  } catch (err) {
    console.error("Error compartiendo por WhatsApp:", err);
    alert("No se pudo compartir en WhatsApp. Descarga la imagen manualmente.");
  }
}
  window.addEventListener("load", function() {
    const loader = document.getElementById("loader");
    loader.style.opacity = "0";
    setTimeout(() => loader.style.display = "none", 1500); // desaparece suave
  });

// Duplicar contenido automáticamente si quieres un bucle infinito perfecto
const track = document.querySelector('.carousel-track');
const clone = track.innerHTML;
track.innerHTML += clone;
// === Simulador de transacciones AJM Exchanges ===

const names = [
  "Carlos M.", "Ana P.", "Luis G.", "María J.", "Pedro R.", "Daniela T.",
  "Andrés L.", "Rosa C.", "Miguel A.", "Laura S."
];

const operations = [
  { tipo: "USD → Bs", icon: "🇺🇸 → 🇻🇪" },
  { tipo: "COP → Bs", icon: "🇨🇴 → 🇻🇪" },
  { tipo: "Bs → USD", icon: "🇻🇪 → 🇺🇸" }
];

const list = document.getElementById("transactions-list");
const tasa = 260; // Tasa actual Bs/USD
const tasaCOP = tasa / 110; // Aproximado: 1 USD = 1100 COP

function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomTime() {
  const mins = Math.floor(Math.random() * 10) + 1;
  return `hace ${mins} min`;
}

function generateTransaction() {
  const name = names[Math.floor(Math.random() * names.length)];
  const { tipo, icon } = operations[Math.floor(Math.random() * operations.length)];
  let amount = randomAmount(50, 5000);
  let result;

  if (tipo === "USD → Bs") {
    result = (amount * tasa).toLocaleString("es-VE") + " Bs";
  } else if (tipo === "COP → Bs") {
    result = (amount * tasaCOP).toLocaleString("es-VE") + " Bs";
  } else {
    result = "$" + (amount / tasa).toFixed(2);
  }

  return `
    <li>
      💱 <strong>${name}</strong> ${icon}<br>
      Cambió <strong>${amount.toLocaleString()} ${tipo.split(" ")[0]}</strong> → 
      <strong>${result}</strong><br>
      <small>🕒 ${randomTime()}</small>
    </li>`;
}

function updateTransactions() {
  const transactions = [];
  for (let i = 0; i < 6; i++) {
    transactions.push(generateTransaction());
  }
  list.innerHTML = transactions.join("");
}

updateTransactions();
setInterval(updateTransactions, 10000);

document.addEventListener("DOMContentLoaded", getRates);
