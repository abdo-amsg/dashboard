#!/usr/bin/env python3
"""
Script pour corriger les dates dans les datasets CISO
Convertit toutes les dates de 2024 vers 2025
"""

import pandas as pd
import os
from datetime import datetime, timedelta

# Répertoire des données
data_dir = r"c:\Users\KAWTAR-PC\Documents\dashboard\data"

# Fichiers CISO à corriger
ciso_files = [
    "ciso_incident_report.csv",
    "ciso_vulnerability_report.csv", 
    "ciso_system_availability.csv",
    "ciso_detection_rules.csv",
    "ciso_threat_intelligence.csv",
    "ciso_awareness_training.csv",
    "ciso_attack_surface.csv",
    "ciso_security_projects.csv"
]

def fix_dates_in_file(filepath):
    """Corrige les dates dans un fichier CSV"""
    try:
        print(f"Traitement de {os.path.basename(filepath)}...")
        
        # Lire le fichier
        df = pd.read_csv(filepath)
        
        # Vérifier si la colonne 'date' existe
        if 'date' not in df.columns:
            print(f"  ⚠️  Pas de colonne 'date' dans {os.path.basename(filepath)}")
            return
        
        # Convertir les dates
        df['date'] = pd.to_datetime(df['date'])
        
        # Remplacer 2024 par 2025
        df['date'] = df['date'].apply(lambda x: x.replace(year=2025) if x.year == 2024 else x)
        
        # Sauvegarder
        df.to_csv(filepath, index=False)
        print(f"  ✅ {os.path.basename(filepath)} corrigé")
        
    except Exception as e:
        print(f"  ❌ Erreur avec {os.path.basename(filepath)}: {e}")

def main():
    print("🔧 Correction des dates dans les datasets CISO...")
    print("=" * 50)
    
    for filename in ciso_files:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            fix_dates_in_file(filepath)
        else:
            print(f"  ⚠️  Fichier non trouvé: {filename}")
    
    print("=" * 50)
    print("✅ Correction terminée!")

if __name__ == "__main__":
    main()