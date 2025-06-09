#!/usr/bin/env python3
"""
Script pour démarrer l'API FTQ Analytics avec gestion d'erreurs
"""

import subprocess
import sys
import os
import time

def install_dependencies():
    """Installer les dépendances nécessaires"""
    dependencies = [
        "flask",
        "flask-cors", 
        "pandas",
        "numpy"
    ]
    
    # Essayer d'installer scikit-learn
    optional_deps = ["scikit-learn"]
    
    print("📦 Installation des dépendances...")
    
    for dep in dependencies:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✅ {dep} installé")
        except subprocess.CalledProcessError:
            print(f"❌ Erreur lors de l'installation de {dep}")
            return False
    
    for dep in optional_deps:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            print(f"✅ {dep} installé")
        except subprocess.CalledProcessError:
            print(f"⚠️ {dep} non installé (optionnel)")
    
    return True

def check_port_available(port=5000):
    """Vérifier si le port est disponible"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def start_api():
    """Démarrer l'API"""
    print("🚀 Démarrage de l'API FTQ Analytics...")
    
    if not check_port_available(5000):
        print("⚠️ Le port 5000 est déjà utilisé")
        return False
    
    try:
        # Démarrer l'API
        subprocess.run([sys.executable, "app.py"], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du démarrage de l'API: {e}")
        return False
    except KeyboardInterrupt:
        print("\n🛑 Arrêt de l'API")
        return True

if __name__ == "__main__":
    print("🐍 DÉMARRAGE API FTQ ANALYTICS")
    print("=" * 40)
    
    # Installer les dépendances
    if not install_dependencies():
        print("❌ Échec de l'installation des dépendances")
        sys.exit(1)
    
    # Démarrer l'API
    start_api()
