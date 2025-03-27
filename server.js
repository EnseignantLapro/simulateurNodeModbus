const net = require('net');
const modbus = require('jsmodbus');
const fs = require('fs');
const { logMessage } = require('./logger'); // ou './logger' selon ta structure
const { isPromise } = require('util/types');
const PORT = 502;  // port non privilégié

// État interne des capteurs simulés
const sensorState = {};
// Chargement configuration
const sensors = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Init des capteurs simulés avec valeur et tendance
sensors.forEach(sensor => {
    sensorState[sensor.name] = {
        value: randomValue(sensor.min, sensor.max),
        trend: Math.random() < 0.5 ? 'up' : 'down'
    };
});

const maxAddress = Math.max(...sensors.map(sensor => sensor.address));
const holdingRegisters = Buffer.alloc((maxAddress + 1) * 2);

// Création serveur MODBUS TCP
const serverTCP = net.createServer();
const server = new modbus.server.TCP(serverTCP, {
    holding: holdingRegisters
});

const clientIPs = new Map(); // socket => ip
var ip ="";
// Lorsqu’un client TCP se connecte on stock son ip
server.on('connection', (clientSocket) => {
   ip = clientSocket.socket.remoteAddress?.replace(/^::ffff:/, '') || 'inconnu';;
    clientIPs.set(clientSocket, ip);
});

server.on('close', (clientSocket) => {
    clientIPs.delete(clientSocket);
});

server.on('preReadHoldingRegisters', (req, res, send) => {
   // logMessage(`vous avez tenté une lecture à l'adresse 🔹 ${req._body._start } `);
});
  
  server.on('postReadHoldingRegisters', (req, cb) => {
    const address = req._body._start || 0;
    const quantity = req._body._count || 1;

    let Message = `📗 ${ip} 📥 Lecture a l'adresse ${address} de ${quantity} octet(s)`;

    for (let i = 0; i < quantity; i++) {
        const offset = (address + i) * 2;

        if (offset + 2 <= holdingRegisters.length) {
            const val = holdingRegisters.readUInt16BE(offset);
            Message += ( `✅  valeur = ${val}`);
        } else {
            Message += (`⚠️ Lecture hors limites pour l'adresse ${address + i}`);
        }
    }

    logMessage(Message);
});



// Générateur aléatoire
function randomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Générateur de variation progressive
function nextSensorValue(sensor, state) {
    const step = Math.floor(Math.random() * 5) + 1; // variation de 1 à 5

    // Changer de tendance avec une faible probabilité (10 %)
    if (Math.random() < 0.03) {
        state.trend = state.trend === 'up' ? 'down' : 'up';
    }

    // Appliquer la tendance
    if (state.trend === 'up') {
        state.value = Math.min(state.value + step, sensor.max);
    } else {
        state.value = Math.max(state.value - step, sensor.min);
    }

    return state.value;
}


// Actualiser les données des capteurs
function updateSensorData() {
    var message = "";
    sensors.forEach(sensor => {
        const state = sensorState[sensor.name];
        const value = nextSensorValue(sensor, state);

         // ✅ On sécurise la valeur avant l’écriture
        const safeValue = Math.max(0, Math.min(65535, value));
        holdingRegisters.writeUInt16BE(safeValue, sensor.address * 2);
        message+=(`🔹 set capteur ${sensor.name} [Address ${sensor.address}] valeur ${value} ${sensor.unit}`);
    });
    logMessage(message);
}

// Actualiser toutes les secondes
setInterval(updateSensorData, 5000);

// Démarrer serveur MODBUS TCP

serverTCP.listen(PORT, () => {

    logMessage(`🚀 Serveur MODBUS TCP lancé sur port ${PORT}`);
    updateSensorData();  // première mise à jour immédiate
});

