const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = '/var/www/html/serveur.log';

/**
 * Loggue un message en haut du fichier,
 * et si +100 lignes, supprime les plus anciennes (en bas).
 */
function logMessage(msg) {
  console.log(msg);
  const dateStr = new Date().toISOString();
  const newLine = `[${dateStr}] ${msg}`; // ex : [2025-03-20T18:00:00.000Z] Mon message

  let lines = [];

  // Lire le fichier existant
  if (fs.existsSync(LOG_FILE_PATH)) {
    const content = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    // Séparer en lignes, en évitant les lignes vides
    lines = content.split('\n').filter(Boolean);
  }

  // Ajouter la nouvelle ligne en HAUT
  lines.unshift(newLine);

  // Garder uniquement les 100 premières (càd 100 plus récentes)
  if (lines.length > 100) {
    lines = lines.slice(0, 100);
  }

  // Réécrire le fichier en entier
  fs.writeFileSync(LOG_FILE_PATH, lines.join('\n') + '\n');
}

module.exports = { logMessage };