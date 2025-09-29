# INWI SOC Analytics - Sample Data

Ce dossier contient des fichiers CSV d'exemple pour tester le module d'analyse SOC INWI.

## Fichiers disponibles

### 1. sample_alerts.csv
**Type de rapport :** Alert Report  
**Description :** Données d'alertes de sécurité avec informations sur la sévérité, types d'événements et actions prises.

**Colonnes :**
- Timestamp : Date et heure de l'alerte
- Severity : Niveau de sévérité (High, Medium, Low)
- Event_Type : Type d'événement de sécurité
- Action_Taken : Action prise (Quarantined, Blocked, Monitored, etc.)
- Source_IP : Adresse IP source
- Destination_IP : Adresse IP destination
- Description : Description de l'alerte

### 2. sample_incidents.csv
**Type de rapport :** Incident Report  
**Description :** Données d'incidents de sécurité avec métriques de réponse et SLA.

**Colonnes :**
- Incident_ID : Identifiant unique de l'incident
- Opened_At : Date d'ouverture
- State : État (Open, Closed)
- Category : Catégorie d'incident
- Priority : Priorité (Critical, High, Medium, Low)
- Resolution_Time_h : Temps de résolution en heures
- SLA_Target : Objectif SLA
- Assigned_To : Personne assignée
- Description : Description de l'incident

### 3. sample_availability.csv
**Type de rapport :** System Availability Report  
**Description :** Données de disponibilité des systèmes de sécurité.

**Colonnes :**
- Date : Date de mesure
- Tool_Name : Nom de l'outil
- Uptime_pct : Pourcentage de disponibilité
- Downtime_min : Temps d'arrêt en minutes
- Cause : Cause de l'indisponibilité
- Impact : Impact (High, Medium, Low, None)

### 4. sample_rules.csv
**Type de rapport :** Rules/Policies Report  
**Description :** Données des règles et politiques de sécurité.

**Colonnes :**
- Rule_ID : Identifiant de la règle
- Name : Nom de la règle
- Type : Type de règle (Signature, Behavioral, Anomaly, etc.)
- Status : État (Enabled, Disabled)
- Tool : Outil associé
- MITRE_Technique : Technique MITRE ATT&CK
- Severity : Sévérité
- Last_Updated : Dernière mise à jour
- Created_By : Créateur

### 5. sample_ioc.csv
**Type de rapport :** IOC Report  
**Description :** Indicateurs de compromission (IOC) avec format spécial délimité par point-virgule.

**Format :** IOC_Type;IOC_Value;First_Seen;Last_Seen;Source;Campaign_Name;Detected_By

**Types d'IOC :**
- IP : Adresses IP malveillantes
- Domain : Domaines suspects
- Hash : Hachages de fichiers malveillants
- URL : URLs malveillantes
- Email : Adresses email suspectes

## Utilisation

1. Connectez-vous au dashboard
2. Accédez au module INWI SOC Analytics
3. Sélectionnez le type de rapport correspondant au fichier CSV
4. Téléchargez le fichier CSV d'exemple
5. Analysez les résultats générés

## Métriques générées

### Alert Report
- Nombre total d'alertes
- Distribution par sévérité
- Taux de faux positifs
- Top 5 des types d'événements

### Incident Report
- Nombre total d'incidents
- Incidents ouverts/fermés
- MTTR (Mean Time To Resolution)
- Conformité SLA
- Distribution par catégorie

### System Availability Report
- Disponibilité moyenne
- Temps d'arrêt total
- Nombre d'outils surveillés
- Score de disponibilité
- Causes d'indisponibilité

### Rules/Policies Report
- Nombre total de règles
- Règles actives/désactivées
- Couverture MITRE ATT&CK
- Efficacité des règles
- Distribution par outil

### IOC Report
- Nombre total d'IOCs
- Campagnes uniques
- Distribution par type d'IOC
- Sources de détection
- Niveau de menace

## Notes techniques

- Taille maximale des fichiers : 10MB
- Format supporté : CSV uniquement
- Encodage : UTF-8 ou Latin-1
- Authentification requise
- Les données sont analysées en temps réel sans stockage permanent