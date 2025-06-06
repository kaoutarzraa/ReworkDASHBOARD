# Dashboard en temps réel

Ce dashboard a été modifié pour s'actualiser en temps réel lorsque les données du fichier `data.json` changent.

## Structure du projet

- **backend/** : Serveur FastAPI avec WebSocket pour la diffusion en temps réel
  - **data/data.json** : Fichier de données qui est surveillé pour les changements
  - **main.py** : Point d'entrée du backend avec API REST et WebSocket

- **frontend/** : Application React avec actualisation en temps réel
  - **dashboard.tsx** : Composant principal du dashboard
  - **lib/websocket-service.ts** : Service de gestion de la connexion WebSocket
  - **lib/api.ts** : Service pour les appels API REST
  - **public/data.json** : Copie locale des données pour le mode fallback

## Fonctionnalités

- Surveillance en temps réel du fichier data.json
- Diffusion des changements via WebSocket
- Actualisation automatique des graphiques et statistiques
- Reconnexion automatique en cas de perte de connexion
- Indicateurs visuels de l'état de la connexion
- **Nouveau** : Mode fallback local si le backend n'est pas accessible

## Démarrage

### Option 1 : Avec backend (pour les mises à jour en temps réel)

1. Lancer le backend :
```bash
cd backend
python main.py
```

2. Lancer le frontend :
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

3. Accéder au dashboard à l'adresse : http://localhost:3000

### Option 2 : Sans backend (mode fallback local)

1. Lancer uniquement le frontend :
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

2. Accéder au dashboard à l'adresse : http://localhost:3000
   Le dashboard chargera automatiquement les données depuis le fichier local public/data.json

## Résolution des problèmes

- Si vous rencontrez des erreurs de dépendances, utilisez l'option `--legacy-peer-deps` :
  ```bash
  npm install --legacy-peer-deps
  ```

- Si le port 3000 est déjà utilisé, spécifiez un autre port :
  ```bash
  npm run dev -- --port 3001
  ```

## Modification des données

Pour tester l'actualisation en temps réel, modifiez le fichier `backend/data/data.json`. Le dashboard se mettra à jour automatiquement.
