/* ===== SEGURIDAD ===== */
let PIN = localStorage.getItem("pin") || "1234";

function validarPIN(){
  if(document.getElementById("pinInput").value === PIN){
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
  } else {
    alert("PIN incorrecto");
  }
}

/* ===== DATOS ===== */
let semana = JSON.parse(localStorage.getItem("semana")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];

function guardar(){
  localStorage.setItem("semana", JSON.stringify(semana));
  localStorage.setItem("historico", JSON.stringify(historico));
}

/* ===== REGISTRO DIARIO ===== */
function agregarDia(){
  const fecha = fechaInput();
  const ventas = Number(document.getElementById("ventasDia").value);
  semana.push({fecha, ventas});
  guardar();
}

function fechaInput(){
  return document.getElementById("fecha").value;
}

/* ===== ANALISIS ===== */
function analizar(){
  const totalVentas = semana.reduce((a,b)=>a+b.ventas,0);
  const gastos = Number(gastosFijos.value) + Number(gastosVariables.value);
  const ganancia = totalVentas - gastos;

  const ahorro = ganancia * (pAhorro.value/100);
  const reinversion = ganancia * (pReinversion.value/100);
  const libre = ganancia - ahorro - reinversion;

  resumen.innerHTML = `
  Ventas: $${totalVentas}<br>
  Gastos: $${gastos}<br>
  Ganancia: $${ganancia}<br>
  Ahorro: $${ahorro}<br>
  Reinversión: $${reinversion}<br>
  Disponible: $${libre}
  `;

  graficaResultados(ahorro, reinversion, libre);
  backupAutomatico();
}

/* ===== CIERRE SEMANA ===== */
function cerrarSemana(){
  historico.push({fecha:new Date(), semana});
  semana = [];
  guardar();
  alert("Semana cerrada");
}

/* ===== GRAFICA ===== */
function graficaResultados(a,r,l){
  new Chart(document.getElementById("grafica"),{
    type:'pie',
    data:{
      labels:['Ahorro','Reinversión','Disponible'],
      datasets:[{data:[a,r,l]}]
    }
  });
}

/* ===== EXPORTAR ===== */
function exportarExcel(){
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(historico);
  XLSX.utils.book_append_sheet(wb, ws, "Datos");
  XLSX.writeFile(wb, "finanzas.xlsx");
}

function exportarPDF(){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.text(resumen.innerText,10,10);
  pdf.save("finanzas.pdf");
}

/* ===== BORRAR ===== */
function borrarDatos(){
  if(confirm("¿Borrar todo?")){
    localStorage.clear();
    location.reload();
  }
}

/* ===== BACKUP LOCAL ===== */
function backupAutomatico(){
  localStorage.setItem("backup", JSON.stringify({semana,historico}));
}

/* ===== GOOGLE DRIVE BACKUP ===== */
const CLIENT_ID="TU_CLIENT_ID";
const API_KEY="TU_API_KEY";
const SCOPES="https://www.googleapis.com/auth/drive.file";
let tokenClient;

function iniciarSesionDrive(){
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: subirBackupDrive
  });
  tokenClient.requestAccessToken();
}

async function subirBackupDrive(){
  const file = new Blob([JSON.stringify({semana,historico})],{type:"application/json"});
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify({name:"backup_finanzas.json"})],{type:"application/json"}));
  form.append("file", file);

  await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",{
    method:"POST",
    headers:{Authorization:`Bearer ${gapi.client.getToken().access_token}`},
    body:form
  });

  alert("Backup en Google Drive listo");
}
