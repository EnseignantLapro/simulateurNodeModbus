

<img src="https://yt3.googleusercontent.com/mmZDfacNeEWGrNtzFKLqwzbBDPRIVykeljyd93S1Ku39y-lcHBnxkLBNA0P648DlkTC50isg=w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj" width="100%">
# 🔹 Lire les valeurs d'un capteur via Modbus TCP (Node.js)

## 📜 Logs du Serveur Modbus (Node.js)

⚠️ Si les logs du serveur ne s’actualisent pas toutes les 5 secondes, le serveur Modbus simulé n’est probablement pas démarré.  
Demander à l’administrateur ou au professeur d’exécuter la commande suivante :

```bash
root@vm:~# mpm2 restart server.js
```

à exécuter dans le dossier `/opt/simulateurNodeModbus` de la VM.

Attention le server log dans /var/www/html il faut donc les droits sur ce dossier

---

## ✅ Prérequis

- Disposer de Node.js installé sur votre environnement de développement.
- Installer la bibliothèque `jsmodbus` via npm :

```bash
npm install jsmodbus
```

- Visionner la vidéo suivante afin de comprendre la structure des trames Modbus TCP (positions et valeurs des octets) :  
📺 [Le Protocole Modbus TCP - Comprendre ses trames (YouTube)](https://www.youtube.com/embed/uMKwotzBzz8)

---

## 🔎 Test rapide de votre server avec un client Hercules.exe

[Hercules Setup Utility](https://www.hw-group.com/software/hercules-setup-utility) est un utilitaire Windows gratuit permettant de tester des communications TCP, UDP et série.

### Étapes de test :

1. Télécharger et exécuter hercules.exe sur un poste Windows connecté au même réseau que la VM simulant le serveur Modbus.
2. Onglet TCP Client :
   - Adresse IP : celle de la VM.
   - Port : 502 (ou celui défini dans le simulateur).
   - Cliquer sur Connect.
3. Une fois la connexion établie, il est possible d’envoyer des trames Modbus manuellement.

Il faut activé les caractères Hexa pour les voirs et coché HEX pour les envoyer.

---

## 🔎 Test rapide avec de votre server avec modpoll

[modpoll](https://www.modbusdriver.com/modpoll.html) est un outil en ligne de commande pour systèmes Linux permettant de réaliser des requêtes Modbus TCP.

### Installation et utilisation :

```bash
cd modpoll/
cp x86_64-linux-gnu/modpoll /usr/local/bin/
chmod +x /usr/local/bin/modpoll
```

### Commande de test :

```bash
modpoll -m tcp -a 1 -r 1 -c 1 -p 502 IP_DU_SERVEUR
```

- `-m tcp` : mode TCP  
- `-a 1` : adresse esclave  
- `-r 1` : registre de départ  
- `-c 1` : nombre de registres  
- `-p 502` : port Modbus TCP  

---

## 🔎 Test rapide avec Node.js

Le client Node.js doit être exécuté directement sur la VM locale.

---

## 💻 Exemple de code client Node.js (lecture de registre Modbus TCP)

```javascript
const Modbus = require('jsmodbus');
const net = require('net');

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket);

socket.connect({ host: 'IP_DU_SERVEUR', port: 502 });

socket.on('connect', () => {
    console.log('✅ Connecté au serveur MODBUS TCP');

    client.readHoldingRegisters(0, 1)
        .then((resp) => {
            const valeurCapteur = resp.response._body.valuesAsArray[0];
            console.log('🚀 Valeur lue :', valeurCapteur);
        })
        .catch((err) => {
            console.error('Erreur de lecture Modbus :', err);
        })
        .finally(() => {
            socket.end();
        });
});

socket.on('error', (err) => {
    console.error('Erreur socket :', err);
});
```

---

## ⚙️ Explications du code

- `readHoldingRegisters(adresse, longueur)` :
  - `adresse` : adresse du registre à interroger (ex. 0 pour le premier registre).
  - `longueur` : nombre de registres à lire (souvent 1 par capteur).



---

## 📌 À retenir

- Vérifiez que le serveur Modbus est démarré.
- Le port utilisé doit correspondre à celui défini dans la configuration du serveur Node.js (souvent 502 ou 5020).
- Bien comprendre le format des trames Modbus (12 octets en envoi, 11 en retour).
- Utiliser différents outils de test permet de vérifier la robustesse de la communication (Node.js, modpoll, Hercules).

---
