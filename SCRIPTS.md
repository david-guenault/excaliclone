# 📜 Scripts de gestion Excalibox

Ce document décrit l'utilisation des scripts de gestion pour Excalibox.

## 🚀 Scripts disponibles

### 🟢 Démarrage (`start.sh` / `start.bat`)

Lance l'environnement de développement Excalibox.

**Fonctionnalités:**
- Vérifie et installe les dépendances si nécessaire
- Démarre le serveur de développement Vite
- Ouvre automatiquement l'application dans Firefox (Linux/Mac)
- Affiche l'URL d'accès

**Utilisation:**
```bash
# Linux/Mac
./start.sh
npm run start

# Windows
start.bat
npm run start:win
```

**Ports utilisés:**
- Port par défaut: `5173`
- Ports alternatifs si occupé: `5174`, `5175`, `5176`, `5177`

---

### 🛑 Arrêt (`stop.sh` / `stop.bat`)

Arrête proprement tous les processus liés à Excalibox.

**Fonctionnalités:**
- Recherche et arrête les serveurs Vite actifs
- Ferme les processus Node.js du projet
- Libère les ports utilisés (5173-5177)
- Arrêt forcé si nécessaire

**Utilisation:**
```bash
# Linux/Mac
./stop.sh
npm run stop

# Windows
stop.bat
npm run stop:win
```

**Processus arrêtés:**
- Serveurs de développement Vite
- Processus Node.js liés au projet
- Processus npm run dev
- Processus utilisant les ports Vite

---

### 📊 Status (`status.sh` / `status.bat`)

Affiche l'état complet de l'environnement Excalibox.

**Informations affichées:**

#### 🚀 Serveur de développement
- État des serveurs Vite sur les ports 5173-5177
- Accessibilité de l'application (test HTTP)
- PIDs des processus actifs

#### 📦 Processus
- Processus Node.js liés au projet
- Processus npm actifs
- Détails des processus (PID, temps d'exécution, ligne de commande)

#### 🔧 Dépendances
- Présence de `node_modules`
- Taille du dossier d'installation
- Présence de `package-lock.json`

#### 🏗️ Compilation
- État de la compilation TypeScript
- Erreurs de compilation détectées

#### 🔍 Qualité du code
- Résultats ESLint
- Nombre de problèmes détectés

#### 🧪 Tests
- Présence de tests dans le projet
- Commandes de test disponibles

#### 💻 Ressources système
- Utilisation mémoire
- Espace disque disponible
- Charge système (Linux/Mac)

**Utilisation:**
```bash
# Linux/Mac
./status.sh
npm run status

# Windows
status.bat
npm run status:win
```

---

## 🔧 Configuration

### Variables d'environnement

Les scripts utilisent les variables suivantes:

- `DEV_PID`: PID du serveur de développement (start.sh)
- `PORT`: Port préféré pour le serveur (par défaut: 5173)

### Personnalisation

#### Modifier les ports surveillés
Éditez les scripts et modifiez la liste:
```bash
for PORT in 5173 5174 5175 5176 5177; do
```

#### Changer le navigateur par défaut (Linux/Mac)
Dans `start.sh`, remplacez:
```bash
firefox http://localhost:5173
```
Par votre navigateur préféré.

---

## 🚨 Dépannage

### Problèmes courants

#### Port déjà utilisé
```
Error: Port 5173 is already in use
```
**Solution:** Le script tentera automatiquement les ports suivants (5174, 5175, etc.)

#### Processus bloqué
```
EADDRINUSE: address already in use
```
**Solutions:**
1. Utiliser `./stop.sh` pour arrêter proprement
2. Identifier le processus: `lsof -i :5173`
3. Arrêter manuellement: `kill -9 <PID>`

#### Dépendances manquantes
```
node_modules not found
```
**Solution:** Le script `start.sh` installera automatiquement les dépendances

#### Permission refusée
```
Permission denied: ./start.sh
```
**Solution:** Rendre le script exécutable:
```bash
chmod +x start.sh stop.sh status.sh
```

### Commandes de diagnostic

#### Vérifier les processus Vite
```bash
ps aux | grep vite
```

#### Vérifier les ports utilisés
```bash
netstat -tulpn | grep :5173
# ou
lsof -i :5173
```

#### Forcer l'arrêt de tous les processus Node.js
```bash
pkill -f "node.*vite"
```

---

## 📝 Logs et debugging

### Activer les logs détaillés

Ajouter au début des scripts:
```bash
set -x  # Linux/Mac
```

### Fichiers de log

Les scripts ne génèrent pas de fichiers de log par défaut. Pour capturer les sorties:

```bash
./start.sh 2>&1 | tee excalibox.log
./status.sh > status.log 2>&1
```

---

## 🔄 Intégration CI/CD

### GitHub Actions

Exemple d'utilisation dans `.github/workflows/test.yml`:

```yaml
- name: Start application
  run: npm run start &
  
- name: Wait for startup
  run: sleep 10
  
- name: Check status
  run: npm run status
  
- name: Run tests
  run: npm test
  
- name: Stop application
  run: npm run stop
```

### Scripts de production

Pour la production, adaptez les scripts:
- Remplacez `npm run dev` par `npm run build && npm run preview`
- Utilisez des ports différents (3000, 8080, etc.)
- Ajoutez des healthchecks
- Intégrez avec PM2 ou systemd

---

## 📊 Monitoring

### Métriques surveillées

Les scripts status fournissent:
- **Disponibilité**: Serveur actif/inactif
- **Performance**: Charge système, mémoire
- **Qualité**: Erreurs de compilation, linting
- **Santé**: Processus actifs, ports libres

### Alertes

Vous pouvez intégrer les scripts avec des systèmes d'alerte:

```bash
# Exemple d'alerte si l'application est down
if ! ./status.sh | grep -q "🎉 Excalibox est en cours d'exécution"; then
    echo "ALERT: Excalibox is down!" | mail admin@example.com
fi
```

---

## 🆘 Support

En cas de problème:

1. Vérifiez le status: `npm run status`
2. Consultez les logs de la console
3. Redémarrez: `npm run stop && npm run start`
4. Vérifiez la documentation du projet
5. Ouvrez une issue sur le repository

---

*Documentation des scripts mise à jour: $(date)*