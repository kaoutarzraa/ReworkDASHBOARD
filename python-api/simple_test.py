"""
Test simple pour vérifier que l'API fonctionne
"""

import requests
import json
import time

def test_simple():
    """Test simple de l'API"""
    base_url = "http://localhost:5000"
    
    print("🧪 Test simple de l'API")
    print("=" * 30)
    
    # Attendre que l'API démarre
    print("⏳ Attente du démarrage de l'API...")
    time.sleep(2)
    
    # Test health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ API accessible")
        else:
            print(f"❌ API non accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Impossible de contacter l'API: {e}")
        return False
    
    # Test prédiction simple
    try:
        test_data = {
            "defects": [
                {
                    "REWORK_DATE": "2025-01-15 10:30:00",
                    "ORDNR": "2409300996",
                    "Line": "Line 1",
                    "Area": "Motor",
                    "Rework_time": 35,
                    "Success": 1,
                    "Defect_type": "Terminal"
                }
            ]
        }
        
        response = requests.post(
            f"{base_url}/api/ftq/predict",
            headers={"Content-Type": "application/json"},
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success":
                prediction = result["prediction"]
                print(f"✅ Prédiction réussie: {prediction['current_ftq']}% → {prediction['predicted_ftq']}%")
                return True
            else:
                print(f"❌ Erreur dans la prédiction: {result.get('error')}")
                return False
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test de prédiction: {e}")
        return False

if __name__ == "__main__":
    success = test_simple()
    if success:
        print("\n🎉 API fonctionne correctement!")
    else:
        print("\n❌ Problème avec l'API")
