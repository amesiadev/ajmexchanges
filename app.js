let bcvRate = null;
let usdToCopRate = null;
let tasa = 270;
let tasaVenta = 300;

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
  document.getElementById("tasa-actual").innerText=`${tasa.toFixed(2)} Bs`;
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
  const faltaPorDolar = tasa - bcvRate;
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

/* ============================
  AJM Exchanges — Simulador profesional (tabla)
  - Sincroniza con #tasa-valor si existe
  - Guarda contador diario en localStorage
  - Reinicia a medianoche automáticamente (por fecha guardada)
  - Actualiza cada 10s, entre 2-5 nuevas operaciones
  ============================ */

(() => {
  // DOM refs
  const btnWidget = document.getElementById("toggle-widget");
  const panel = document.getElementById("panel-transacciones");
  const list = document.getElementById("transactions-list");
  const contador = document.getElementById("contador-transacciones");
  const barra = document.getElementById("progreso");
  const notificacion = document.getElementById("notificacion-nuevas");
  const tasaDisplay = document.getElementById("tasa-actual");

  // Base data
  const nombres = ["Carlos M.","Ana P.","Luis G.","María J.","Pedro R.","Daniela H.","Andrés L.","Rosa C.","Miguel A.","Laura S.","Pedro P.","Andrea S.","Mariana P.","Bruno C."];
  const operaciones = [
    { tipo: "USD → Bs", icon: "🇺🇸 → 🇻🇪" },
    { tipo: "COP → Bs", icon: "🇨🇴 → 🇻🇪" },
    { tipo: "Bs → USD", icon: "🇻🇪 → 🇺🇸" }
  ];

  // Config
  let tasaCOP = tasa / 110;
  const metaDiaria = 250;
  let totalOperaciones = 0;
  let porcentajePrevio = 0;

  // Helpers
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const nowKey = () => new Date().toISOString().slice(0,10);

  // LocalStorage: cargar/guardar contador por fecha
  function cargarContador() {
    const data = JSON.parse(localStorage.getItem("contadorAJM")) || {};
    if (data.fecha === nowKey()) totalOperaciones = data.total || 0;
    else { totalOperaciones = 0; localStorage.setItem("contadorAJM", JSON.stringify({ fecha: nowKey(), total: 0 })); }
  }
  function guardarContador() { localStorage.setItem("contadorAJM", JSON.stringify({ fecha: nowKey(), total: totalOperaciones })); }

  // Sincronizar tasa desde tu página (elemento #tasa-valor)
  function sincronizarTasa() {
    const elementoTasa = document.getElementById("tasa-valor");
    if (elementoTasa) {
      const valor = parseFloat(elementoTasa.textContent.replace(/[^0-9.]/g,""));
      if (!isNaN(valor) && valor > 0) {
        tasa = valor;
        tasaCOP = tasa / 110;
        tasaDisplay.textContent = `Tasa actual: ${tasa} Bs/USD`;
      }
    } else {
      // mantiene la tasa por defecto y muestra
      tasaDisplay.textContent = `Tasa actual: ${tasa} Bs/USD`;
    }
  }

  // Generar una fila (objeto) y render como HTML fila (.fila)
  function generarOperacion() {
    const nombre = nombres[rand(0,nombres.length-1)];
    const op = operaciones[rand(0,operaciones.length-1)];
    const monto = rand(50,5000);
    let resultado = "";
    if (op.tipo === "USD → Bs") resultado = (monto * tasa).toFixed(2) + " Bs";
    else if (op.tipo === "COP → Bs") resultado = ((monto/usdToCopRate) * tasa).toFixed(2) + " Bs";
    else resultado = "$" + (monto / tasaVenta).toFixed(2);

    totalOperaciones++;
    guardarContador();

    return {
      cliente: nombre,
      operacion: `${monto.toLocaleString()} ${op.tipo.split(" ")[0]} ${op.icon}`,
      resultado,
      tiempo: `hace ${rand(1,10)} min`
    };
  }

  // Mostrar notificación +N
  function mostrarNotificacion(n) {
    notificacion.textContent = `+${n} nuevas operaciones`;
    notificacion.classList.add("visible");
    setTimeout(()=> notificacion.classList.remove("visible"), 2500);
  }

  // Render tabla: recibe array de objetos (las más recientes)
  function renderTabla(items) {
    // build HTML filas
    const html = items.map(it => {
      return `<div class="fila" role="listitem">
        <div><strong>${it.cliente}</strong></div>
        <div>${it.operacion}</div>
        <div>${it.resultado}</div>
        <div><small>${it.tiempo}</small></div>
      </div>`;
    }).join("");
    list.innerHTML = html;
  }

  // Actualización completa (loader)
  function actualizar() {
    sincronizarTasa();

    const nuevas = rand(2,5);
    const items = [];
    for (let i=0;i<nuevas;i++) items.push(generarOperacion());

    // Render (mostramos las N más recientes generadas)
    renderTabla(items);

    // Contador y progreso
    const porcentaje = Math.min((totalOperaciones / metaDiaria) * 100, 100);
    contador.textContent = `🔸 ${totalOperaciones.toLocaleString()} operaciones completadas hoy (${porcentaje.toFixed(0)}% de la meta)`;

    // Pulso sólo si aumentó visualmente
    if (porcentaje > porcentajePrevio) {
      barra.classList.add("pulso");
      setTimeout(()=> barra.classList.remove("pulso"), 1000);
    }
    barra.style.width = porcentaje + "%";
    barra.setAttribute("aria-valuenow", Math.round(porcentaje));
    porcentajePrevio = porcentaje;

    mostrarNotificacion(nuevas);
  }

  // Mostrar/ocultar panel
  btnWidget.addEventListener("click", () => {
    const expanded = btnWidget.getAttribute("aria-expanded") === "true";
    btnWidget.setAttribute("aria-expanded", String(!expanded));
    panel.classList.toggle("oculto");
    // Si abrimos, hacemos una actualización inmediata
    if (!panel.classList.contains("oculto")) actualizar();
  });

  // Inicialización
  cargarContador();
  sincronizarTasa();
  actualizar();
  // Actualiza cada 10s
  setInterval(actualizar, 20000);

  // Reinicio diario: por si la página queda abierta pasada la medianoche,
  // comprobamos cada 60s si la fecha cambió y reiniciamos contador si es necesario.
  let fechaGuardada = nowKey();
  setInterval(() => {
    const hoy = nowKey();
    if (hoy !== fechaGuardada) {
      fechaGuardada = hoy;
      totalOperaciones = 0;
      guardarContador();
      // refrescar visual
      sincronizarTasa();
      actualizar();
    }
  }, 90000);

})();

document.addEventListener("DOMContentLoaded", getRates);
