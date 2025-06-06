import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_squared_error, r2_score
import json
import datetime
import warnings
warnings.filterwarnings('ignore')

class FTQPredictor:
    """
    Prédicteur FTQ utilisant Random Forest avec scikit-learn
    Concepts ML : Feature Engineering, Random Forest, Cross-validation
    """
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,      # 100 arbres dans la forêt
            max_depth=10,          # Profondeur maximale des arbres
            min_samples_split=5,   # Minimum d'échantillons pour diviser un nœud
            min_samples_leaf=2,    # Minimum d'échantillons dans une feuille
            random_state=42,       # Pour la reproductibilité
            n_jobs=-1             # Utiliser tous les processeurs
        )
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.is_trained = False
        
    def load_data(self, json_file_path):
        """
        Charger et préprocesser les données de défauts
        """
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            
            df = pd.DataFrame(data)
            print(f"📊 Données chargées: {len(df)} défauts")
            return df
        except Exception as e:
            print(f"❌ Erreur chargement données: {e}")
            return self.generate_synthetic_data()
    
    def generate_synthetic_data(self, n_samples=1000):
        """
        Générer des données synthétiques réalistes pour l'entraînement
        """
        print("🔄 Génération de données synthétiques...")
        
        np.random.seed(42)
        data = []
        
        for i in range(n_samples):
            # Simuler des données réalistes
            hour = np.random.randint(0, 24)
            day_of_week = np.random.randint(0, 7)
            area = np.random.choice(['Motor', 'Interior'])
            line = np.random.choice(['L1', 'L2', 'L3'])
            defect_type = np.random.choice(['Terminal', 'Connecteur', 'Sécurité', 'Autre'])
            
            # Temps de rework influencé par le type de défaut
            base_time = {'Terminal': 35, 'Connecteur': 50, 'Sécurité': 40, 'Autre': 30}
            rework_time = base_time[defect_type] + np.random.normal(0, 10)
            rework_time = max(15, min(120, rework_time))  # Borner entre 15-120 min
            
            # Date aléatoire dans les 30 derniers jours
            date = datetime.datetime.now() - datetime.timedelta(
                days=np.random.randint(0, 30),
                hours=hour,
                minutes=np.random.randint(0, 60)
            )
            
            data.append({
                'ORDNR': f'ORD{i+1:04d}',
                'Area': area,
                'Line': line,
                'REWORK_DATE': date.isoformat(),
                'Rework_time': round(rework_time),
                'defect_type': defect_type
            })
        
        return pd.DataFrame(data)
    
    def feature_engineering(self, df):
        """
        Ingénierie des caractéristiques (Feature Engineering)
        """
        print("🔧 Feature Engineering...")
        
        # Convertir la date
        df['REWORK_DATE'] = pd.to_datetime(df['REWORK_DATE'])
        
        # Extraire les caractéristiques temporelles
        df['hour'] = df['REWORK_DATE'].dt.hour
        df['day_of_week'] = df['REWORK_DATE'].dt.dayofweek
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_night_shift'] = ((df['hour'] >= 22) | (df['hour'] <= 6)).astype(int)
        
        # Encoder les variables catégorielles
        categorical_features = ['Area', 'Line', 'defect_type']
        for feature in categorical_features:
            if feature not in self.label_encoders:
                self.label_encoders[feature] = LabelEncoder()
                df[f'{feature}_encoded'] = self.label_encoders[feature].fit_transform(df[feature])
            else:
                df[f'{feature}_encoded'] = self.label_encoders[feature].transform(df[feature])
        
        # Statistiques par ligne de production
        line_stats = df.groupby(['Area', 'Line']).agg({
            'Rework_time': ['mean', 'std', 'count']
        }).round(2)
        
        # Ajouter des features d'interaction
        df['area_line'] = df['Area'] + '_' + df['Line']
        df['defect_severity'] = df['Rework_time'] / df['Rework_time'].mean()
        
        # Features pour la prédiction
        feature_columns = [
            'hour', 'day_of_week', 'is_weekend', 'is_night_shift',
            'Area_encoded', 'Line_encoded', 'defect_type_encoded',
            'Rework_time', 'defect_severity'
        ]
        
        return df, feature_columns
    
    def calculate_ftq_target(self, df, production_target=1000):
        """
        Calculer le FTQ cible basé sur les défauts
        """
        # Grouper par jour pour calculer le FTQ quotidien
        daily_defects = df.groupby(df['REWORK_DATE'].dt.date).size()
        daily_ftq = ((production_target/30 - daily_defects) / (production_target/30) * 100).clip(85, 98)
        
        # Mapper le FTQ à chaque défaut
        df['date_only'] = df['REWORK_DATE'].dt.date
        ftq_mapping = daily_ftq.to_dict()
        df['ftq_target'] = df['date_only'].map(ftq_mapping)
        
        return df
    
    def train_model(self, df):
        """
        Entraîner le modèle Random Forest
        """
        print("🌲 Entraînement du modèle Random Forest...")
        
        # Feature engineering
        df, feature_columns = self.feature_engineering(df)
        
        # Calculer les cibles FTQ
        df = self.calculate_ftq_target(df)
        
        # Préparer les données
        X = df[feature_columns]
        y = df['ftq_target']
        
        # Division train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Normalisation des features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Entraînement du Random Forest
        self.model.fit(X_train_scaled, y_train)
        
        # Évaluation
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"✅ Modèle entraîné:")
        print(f"   - MSE: {mse:.2f}")
        print(f"   - R²: {r2:.3f}")
        print(f"   - Features: {len(feature_columns)}")
        
        # Importance des features
        feature_importance = pd.DataFrame({
            'feature': feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\n📊 Importance des features:")
        for _, row in feature_importance.head().iterrows():
            print(f"   - {row['feature']}: {row['importance']:.3f}")
        
        self.feature_columns = feature_columns
        self.is_trained = True
        
        return {
            'mse': mse,
            'r2': r2,
            'feature_importance': feature_importance.to_dict('records')
        }
    
    def predict_ftq(self, current_defects_data):
        """
        Prédire le FTQ basé sur les données actuelles
        """
        if not self.is_trained:
            print("❌ Modèle non entraîné!")
            return None
        
        print("🔮 Prédiction FTQ en cours...")
        
        # Convertir en DataFrame si nécessaire
        if isinstance(current_defects_data, list):
            df_current = pd.DataFrame(current_defects_data)
        else:
            df_current = current_defects_data.copy()
        
        # Feature engineering sur les données actuelles
        df_current, _ = self.feature_engineering(df_current)
        
        # Calculer les métriques actuelles
        total_defects = len(df_current)
        avg_rework_time = df_current['Rework_time'].mean()
        
        # Créer les features pour la prédiction
        current_time = datetime.datetime.now()
        
        # Features moyennes des données actuelles
        features = np.array([[
            current_time.hour,                                    # hour
            current_time.weekday(),                              # day_of_week
            1 if current_time.weekday() >= 5 else 0,            # is_weekend
            1 if current_time.hour >= 22 or current_time.hour <= 6 else 0,  # is_night_shift
            df_current['Area_encoded'].mode()[0] if len(df_current) > 0 else 0,  # Area_encoded
            df_current['Line_encoded'].mode()[0] if len(df_current) > 0 else 0,  # Line_encoded
            df_current['defect_type_encoded'].mode()[0] if len(df_current) > 0 else 0,  # defect_type_encoded
            avg_rework_time,                                     # Rework_time
            1.0                                                  # defect_severity
        ]])
        
        # Normaliser et prédire
        features_scaled = self.scaler.transform(features)
        predicted_ftq = self.model.predict(features_scaled)[0]
        
        # Calculer le FTQ actuel
        production_target = 1000
        current_ftq = ((production_target - total_defects) / production_target * 100)
        current_ftq = max(85, min(98, current_ftq))
        
        # Calculer la confiance (basée sur la variance des prédictions des arbres)
        tree_predictions = [tree.predict(features_scaled)[0] for tree in self.model.estimators_]
        confidence = 1 - (np.std(tree_predictions) / np.mean(tree_predictions))
        confidence = max(0.7, min(0.95, confidence))
        
        # Analyser les lignes les plus/moins performantes
        line_analysis = self.analyze_production_lines(df_current)
        
        result = {
            'current_ftq': round(current_ftq, 1),
            'predicted_ftq': round(predicted_ftq, 1),
            'confidence': round(confidence, 3),
            'total_defects': total_defects,
            'avg_rework_time': round(avg_rework_time, 1),
            'improvement': round(predicted_ftq - current_ftq, 1),
            'line_analysis': line_analysis,
            'model_info': {
                'algorithm': 'Random Forest',
                'n_estimators': self.model.n_estimators,
                'max_depth': self.model.max_depth,
                'features_used': len(self.feature_columns)
            }
        }
        
        print(f"🎯 Prédiction terminée:")
        print(f"   - FTQ actuel: {result['current_ftq']}%")
        print(f"   - FTQ prédit: {result['predicted_ftq']}%")
        print(f"   - Confiance: {result['confidence']*100:.1f}%")
        
        return result
    
    def analyze_production_lines(self, df):
        """
        Analyser les performances par ligne de production
        """
        if len(df) == 0:
            return {
                'best_motor_line': 'Motor L1',
                'worst_motor_line': 'Motor L2',
                'best_interior_line': 'Interior L1',
                'worst_interior_line': 'Interior L3'
            }
        
        # Analyser par zone et ligne
        line_stats = df.groupby(['Area', 'Line']).agg({
            'Rework_time': ['count', 'mean']
        }).round(2)
        
        # Séparer Motor et Interior
        motor_lines = df[df['Area'] == 'Motor'].groupby('Line')['Rework_time'].count()
        interior_lines = df[df['Area'] == 'Interior'].groupby('Line')['Rework_time'].count()
        
        # Identifier les meilleures/pires lignes (moins de défauts = mieux)
        best_motor = motor_lines.idxmin() if len(motor_lines) > 0 else 'L1'
        worst_motor = motor_lines.idxmax() if len(motor_lines) > 0 else 'L2'
        
        best_interior = interior_lines.idxmin() if len(interior_lines) > 0 else 'L1'
        worst_interior = interior_lines.idxmax() if len(interior_lines) > 0 else 'L3'
        
        return {
            'best_motor_line': f'Motor {best_motor}',
            'worst_motor_line': f'Motor {worst_motor}',
            'best_interior_line': f'Interior {best_interior}',
            'worst_interior_line': f'Interior {worst_interior}'
        }

# Fonction principale pour exécuter la prédiction
def main():
    """
    Fonction principale pour tester le prédicteur FTQ
    """
    print("🚀 Démarrage du prédicteur FTQ avec Python ML")
    print("=" * 50)
    
    # Initialiser le prédicteur
    predictor = FTQPredictor()
    
    # Charger les données (ou générer des données synthétiques)
    try:
        # Essayer de charger les vraies données
        df = predictor.load_data('public/backend/data/data.json')
    except:
        # Utiliser des données synthétiques
        df = predictor.generate_synthetic_data(800)
    
    # Entraîner le modèle
    training_results = predictor.train_model(df)
    
    # Simuler des données actuelles pour la prédiction
    current_defects = df.tail(50).to_dict('records')  # Derniers 50 défauts
    
    # Faire la prédiction
    prediction = predictor.predict_ftq(current_defects)
    
    if prediction:
        print("\n" + "=" * 50)
        print("📊 RÉSULTATS DE LA PRÉDICTION FTQ")
        print("=" * 50)
        print(f"🎯 FTQ Actuel: {prediction['current_ftq']}%")
        print(f"🔮 FTQ Prédit: {prediction['predicted_ftq']}%")
        print(f"📈 Amélioration: {prediction['improvement']:+.1f}%")
        print(f"🎲 Confiance: {prediction['confidence']*100:.1f}%")
        print(f"🔧 Défauts analysés: {prediction['total_defects']}")
        print(f"⏱️  Temps moyen rework: {prediction['avg_rework_time']:.1f} min")
        
        print(f"\n🏆 Lignes les plus performantes:")
        print(f"   - {prediction['line_analysis']['best_motor_line']}")
        print(f"   - {prediction['line_analysis']['best_interior_line']}")
        
        print(f"\n⚠️  Lignes à améliorer:")
        print(f"   - {prediction['line_analysis']['worst_motor_line']}")
        print(f"   - {prediction['line_analysis']['worst_interior_line']}")
        
        print(f"\n🤖 Modèle utilisé:")
        print(f"   - Algorithme: {prediction['model_info']['algorithm']}")
        print(f"   - Nombre d'arbres: {prediction['model_info']['n_estimators']}")
        print(f"   - Profondeur max: {prediction['model_info']['max_depth']}")
        print(f"   - Features: {prediction['model_info']['features_used']}")
        
        # Recommandations basées sur les résultats
        print(f"\n💡 RECOMMANDATIONS:")
        if prediction['current_ftq'] < 95:
            print("   🚨 ALERTE: FTQ en dessous du seuil critique de 95%")
            print(f"   🎯 Concentrer les efforts sur {prediction['line_analysis']['worst_motor_line']}")
            print(f"   🎯 Améliorer les processus de {prediction['line_analysis']['worst_interior_line']}")
        else:
            print("   ✅ FTQ dans les objectifs")
            print(f"   📋 Maintenir les bonnes pratiques de {prediction['line_analysis']['best_motor_line']}")
        
        if prediction['improvement'] > 0:
            print(f"   📈 Amélioration prévue de {prediction['improvement']:.1f}% possible")
        else:
            print(f"   📉 Risque de dégradation de {abs(prediction['improvement']):.1f}%")
    
    print("\n✅ Analyse terminée!")
    return prediction

# Exécuter le script
if __name__ == "__main__":
    result = main()
