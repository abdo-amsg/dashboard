#!/usr/bin/env python3
"""
Script pour corriger les dates 2024 vers 2025 dans les fichiers COMEX
"""

import os
import pandas as pd
from datetime import datetime
import re

def fix_dates_in_file(file_path):
    """Corrige les dates 2024 vers 2025 dans un fichier CSV"""
    print(f"\n🔍 Traitement de {os.path.basename(file_path)}...")
    
    try:
        # Lire le fichier
        df = pd.read_csv(file_path)
        print(f"   📊 {len(df)} lignes trouvées")
        
        # Identifier les colonnes contenant des dates
        date_columns = []
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['date', 'time', 'month', 'day']):
                date_columns.append(col)
        
        if not date_columns:
            # Chercher des patterns de dates dans toutes les colonnes
            for col in df.columns:
                sample_values = df[col].dropna().astype(str).head(5)
                for val in sample_values:
                    if re.search(r'2024', str(val)):
                        date_columns.append(col)
                        break
        
        print(f"   📅 Colonnes avec dates détectées: {date_columns}")
        
        changes_made = False
        
        # Corriger les dates dans chaque colonne
        for col in date_columns:
            if col in df.columns:
                original_values = df[col].copy()
                
                # Remplacer 2024 par 2025 dans les valeurs string
                df[col] = df[col].astype(str).str.replace('2024', '2025', regex=False)
                
                # Vérifier si des changements ont été faits
                if not df[col].equals(original_values.astype(str)):
                    changes_made = True
                    print(f"   ✅ Dates corrigées dans la colonne '{col}'")
        
        if changes_made:
            # Sauvegarder le fichier modifié
            df.to_csv(file_path, index=False)
            print(f"   💾 Fichier sauvegardé avec les nouvelles dates")
            return True
        else:
            print(f"   ℹ️  Aucune date 2024 trouvée à corriger")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur lors du traitement: {e}")
        return False

def main():
    """Fonction principale"""
    data_dir = r"c:\Users\KAWTAR-PC\Documents\dashboard\data"
    
    print("🚀 Correction des dates 2024 → 2025 dans les fichiers COMEX")
    print("=" * 60)
    
    # Trouver tous les fichiers COMEX
    comex_files = []
    for file in os.listdir(data_dir):
        if file.startswith('comex_') and file.endswith('.csv'):
            comex_files.append(os.path.join(data_dir, file))
    
    print(f"📁 {len(comex_files)} fichiers COMEX trouvés")
    
    total_fixed = 0
    
    # Traiter chaque fichier
    for file_path in sorted(comex_files):
        if fix_dates_in_file(file_path):
            total_fixed += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Correction terminée: {total_fixed}/{len(comex_files)} fichiers modifiés")

if __name__ == "__main__":
    main()