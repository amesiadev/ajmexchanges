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
  if (currency === "USD") {
    usdValue = amount;
  } else if (currency === "COP") {
    usdValue = amount / usdToCopRate;
  }

  // Calculos
  const baseValue = usdValue * bcvRate;
  const faltaPorDolar = 220 - bcvRate;
  const bono = faltaPorDolar * usdValue;
  const total = baseValue + bono;

  // Mostrar desglose
  document.getElementById("enteredAmount").innerText =
    `Monto ingresado: ${amount.toFixed(2)} ${currency}`;

  if (currency === "COP") {
    document.getElementById("usdEquivalent").innerText =
      `Equivalente: ${usdValue.toFixed(2)} USD`;
  } else {
    document.getElementById("usdEquivalent").innerText = "";
  }

  document.getElementById("baseValue").innerText = `Valor base: ${baseValue.toFixed(2)} Bs`;

  document.getElementById("bonusInfo").innerText = `Bono: ${bono.toFixed(2)} Bs`;

  document.getElementById("finalResult").innerText = total.toFixed(2) + " Bs";
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
    setTimeout(() => loader.style.display = "none", 500); // desaparece suave
  });

document.addEventListener("DOMContentLoaded", getRates);
