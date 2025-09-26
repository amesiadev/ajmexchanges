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
      `BCV: ${bcvRate} Bs | 1 USD = ${usdToCopRate} COP`;
  } catch (e) {
    console.error("Error obteniendo tasas:", e);
    document.getElementById("bcvRate").innerText = "No se pudo cargar tasas";
  }
}

function calculate() {
  const amount = parseFloat(document.getElementById("amountInput").value);
  const currency = document.getElementById("currencySelect").value;
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

  document.getElementById("baseValue").innerText =
    `Valor base: ${baseValue.toFixed(2)} Bs`;

  document.getElementById("bonusInfo").innerText =
    `Bono: ${bono.toFixed(2)} Bs`;

  document.getElementById("finalResult").innerText =
    total.toFixed(2) + " Bs";
}

document.addEventListener("DOMContentLoaded", getRates);
