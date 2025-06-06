from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sys
import os

# Ajouter le répertoire parent au path pour importer ftq_predictor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from ftq_predictor import FTQPredictor

app = Flask(__name__)
CORS(app)  # Permettre les requêtes cross-origin

# Instance globale du prédicteur
predictor = None

def initialize_predictor():
    """
    Initialiser le prédicteur FTQ au démarrage
    """
    global predictor
    print("🚀 Initialisation du prédicteur FTQ...")
    
    predictor = FTQPredictor()
    
    # Charger et entraîner le modèle
    try:
        # Essayer de charger les vraies données
        df = predictor.load_data('public/backend/data/data.json')
    except:
        # Utiliser des données synthétiques
        print("📊 Utilisation de données synthétiques pour l'entraînement")
        df = predictor.generate_synthetic_data(1000)
    
    # Entraîner le modèle
    training_results = predictor.train_model(df)
    print("✅ Prédicteur FTQ initialisé et entraîné")
    
    return training_results

@app.route('/api/ftq/predict', methods=['POST'])
def predict_ftq():
    """
    Endpoint pour prédire le FTQ
    """
    try:
        # Récupérer les données de défauts actuels
        data = request.get_json()
        current_defects = data.get('defects', [])
        
        if not predictor or not predictor.is_trained:
            return jsonify({
                'error': 'Prédicteur non initialisé',
                'status': 'error'
            }), 500
        
        # Faire la prédiction
        prediction = predictor.predict_ftq(current_defects)
        
        if prediction:
            return jsonify({
                'status': 'success',
                'prediction': prediction,
                'message': 'Prédiction FTQ réussie'
            })
        else:
            return jsonify({
                'error': 'Erreur lors de la prédiction',
                'status': 'error'
            }), 500
            
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/ftq/model-info', methods=['GET'])
def get_model_info():
    """
    Obtenir les informations sur le modèle
    """
    if not predictor or not predictor.is_trained:
        return jsonify({
            'error': 'Prédicteur non initialisé',
            'status': 'error'
        }), 500
    
    return jsonify({
        'status': 'success',
        'model_info': {
            'algorithm': 'Random Forest (scikit-learn)',
            'n_estimators': predictor.model.n_estimators,
            'max_depth': predictor.model.max_depth,
            'min_samples_split': predictor.model.min_samples_split,
            'features_count': len(predictor.feature_columns),
            'is_trained': predictor.is_trained
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Vérification de l'état de l'API
    """
    return jsonify({
        'status': 'healthy',
        'predictor_ready': predictor is not None and predictor.is_trained,
        'message': 'API FTQ opérationnelle'
    })

if __name__ == '__main__':
    # Initialiser le prédicteur au démarrage
    training_results = initialize_predictor()
    
    print("\n🌐 Démarrage de l'API FTQ...")
    print("📡 Endpoints disponibles:")
    print("   - POST /api/ftq/predict - Prédiction FTQ")
    print("   - GET /api/ftq/model-info - Infos modèle")
    print("   - GET /api/health - État de l'API")
    print("\n🚀 API prête sur http://localhost:5000")
    
    # Démarrer le serveur Flask
    app.run(debug=True, host='0.0.0.0', port=5000)
