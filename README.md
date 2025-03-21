<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide Simulateur Modbus TCP</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 4px; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 5px; }
        h2 { color: #2c3e50; }
        .info-ip {
            margin: 1em 0;
            padding: 0.8em;
            background: #e9f6ff;
            border-left: 4px solid #3498db;
        }
        .hercules {
            background: #fffaf0;
            border-left: 4px solid #f39c12;
            padding: 1em;
            margin-top: 1em;
        }
        .hercules h3 {
            margin-top: 0;
        }
    </style>
</head>
<body>
    <img src="https://yt3.googleusercontent.com/mmZDfacNeEWGrNtzFKLqwzbBDPRIVykeljyd93S1Ku39y-lcHBnxkLBNA0P648DlkTC50isg=w2276-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj" width="100%">
    <h1>🔹 Lire les valeurs d'un capteur via Modbus TCP (Node.js)</h1>

    <h2>Logs du Serveur Modbus (nodejs) de simulation de carte E/S TCP Modbus </h2>

    <div class="info-ip">
        <strong>Si les logs si dessous ne s'actualise pas toutes les 5s alors le server modbus de la carte E/S simulé n'est pas démarré <br> demander au prof un  root@vm:~# mpm2 restart server.js<br> dans le dossier /opt/simulateurNodeModbus de la vm <span class="server-ip" style="font-weight:bold; color:#2c3e50;"></span> </strong>
        
    
  <iframe id="iframeLog" src="serveur.log" style="width: 100%; height: 200px;"></iframe>
</div>
  <script>
    // Rechargement automatique toutes les 2 secondes
    setInterval(() => {
      document.getElementById('iframeLog').contentWindow.location.reload();
    }, 2000);
  </script>

    <p>Ce guide explique comment effectuer une requête pour lire un capteur simulé via Modbus TCP en utilisant <strong>Node.js</strong> et la librairie <strong>jsmodbus</strong>.</p>


    <h3>✅ Prérequis :</h3>
    <ul>
        <li>Avoir Node.js installé.</li>
        <li>Installer la librairie <code>jsmodbus</code> avec la commande :
            <pre>npm install jsmodbus</pre>
        </li>
        <li>Comprendre la vidéo suivante pour savoir exactement les positions et valeurs des octets de la trame modbus:</li>
        <br><iframe width="916" height="515" src="https://www.youtube.com/embed/uMKwotzBzz8" title="[R10] Le Protocole Modbus TCP : Comprendre ses trames" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </ul>

    <div class="hercules">
        <h3>🔎 Test rapide avec Hercules.exe</h3>
        <p><a href="https://www.hw-group.com/software/hercules-setup-utility" target="_blank">Hercules Setup Utility</a> (hercules.exe) est un outil Windows gratuit permettant de tester des communications TCP/UDP, RS232, etc.</p>
        <p>Pour tester ton serveur Modbus avec Hercules :</p>
        <ol>
            <li>Télécharge et lance <strong>hercules.exe</strong> sur un poste Windows connecté au même réseau.</li>
            <li>Dans l'onglet <strong>TCP Client</strong> :<br>
                <ul>
                    <li>Renseigne l'adresse IP de ton serveur  <span class="server-ip" style="font-weight:bold; color:#2c3e50;"></span>.</li>
                    <li>Renseigne le <strong>port 5020</strong> (ou celui que tu as configuré sur ton simulateur Node.js).</li>
                    <li>Clique sur <strong>Connect</strong> pour établir la connexion.</li>
                </ul>
            </li>
            <li>Si la connexion est établie, tu peux envoyer des commandes Modbus ou te servir d'autres outils pour observer les échanges.</li>
        </ol>
        <p><em>Note :</em> Hercules ne prend pas en charge nativement le protocole Modbus. Il t'affiche juste les paquets bruts. Tu peux néanmoins voir les octets envoyé et reçu en respectant cette config </p>
        <img src="configHercule.png" width="800px">
        <em><br>Ici on peut voir le le Send envoyé et le résultat dans le Received data :</em> /!\ on voit les 2 trames l'appel et la réponse
        <br>🚨 il faut comprendre chacun des 12 octets envoyés ansi que des 11 octets de réponses.
    </div>
  
    <div class="hercules">
      <h3>🔎 Test rapide avec modpoll</h3>
      <p><a href="https://www.modbusdriver.com/modpoll.html" target="_blank">modpoll</a> est un outil linux gratuit permettant de tester des communications modbus TCP.</p>
      <p>Pour tester ton serveur Modbus sous linux</p>
      <ol>
          <li>Télécharge et lance <strong>modpoll</strong> sur un poste VM linux connecté au même réseau.</li>
          <li>cd modpoll/</li>
          <li>cp x86_64-linux-gnu/modpoll /usr/local/bin/</li>
          <li>chmod +x /usr/local/bin/modpoll</li>
          <li>Dans le terminal de ta VM lance  <strong>la commande</strong> :<br>
              <ul>
                  <li> modpoll -m tcp -a 1 -r 1 -c 1 -p 502 <span class="server-ip" style="font-weight:bold; color:#2c3e50;"></span></li>
              </ul>
          </li>
          <li>Si la connexion est établie, tu peux voir tes commandes Modbus dans les logs ci-dessus</li>
      </ol>
      
  </div>

  <div class="hercules">
    <h3>🔎 Test rapide avec nodejs</h3>
    <div class="info-ip">
        <strong>le client node.js doit être fait sur votre VM</strong>
        
    </div>
  </div>

    

    <h3>💻 Exemple de code (client Modbus nodejs) :</h3>

    <pre><code>// Chargement des librairies (Node.js)
const Modbus = require('jsmodbus');
const net = require('net');

// Récupération automatique de l'IP du serveur web actuel
// (Uniquement valable côté navigateur, ne fonctionne pas directement en Node.js)
const serverIP = window.location.hostname;

// Connexion au serveur Modbus
const socket = new net.Socket();
const client = new Modbus.client.TCP(socket);

// Paramètres de connexion : IP du serveur + port
socket.connect({ host: <span class="server-ip" style="font-weight:bold; color:#2c3e50;"></span>, port: 502 });

socket.on('connect', () => {
    console.log('✅ Connecté au serveur MODBUS TCP sur', <span class="server-ip" style="font-weight:bold; color:#2c3e50;"></span>);

    // Lecture d'un registre (ex : adresse 0, longueur = 1)
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
});</code></pre>

    <h3>⚙️ Explications du code :</h3>
    <ul>
        
        <li><code>readHoldingRegisters(adresse, longueur)</code> : lit les valeurs depuis une adresse précise.
            <ul>
                <li><strong>adresse :</strong> position mémoire (registre) du capteur.</li>
                <li><strong>longueur :</strong> nombre de registres à lire (souvent 1 par capteur).</li>
            </ul>
        </li>
    </ul>

    
    
    <script>
      // Script pour afficher l'IP du serveur web dans la page
      const serverIpSpans = document.querySelectorAll('.server-ip');
      serverIpSpans.forEach(span => {
          span.textContent = window.location.hostname;
      });
  </script>

</body>
</html>
