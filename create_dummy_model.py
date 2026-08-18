"""
Script utilitaire pour entraîner et générer un modèle factice (dummy) 
et un vectorizer TF-IDF pour les réclamations bancaires.

Permet de tester l'API et le Frontend immédiatement avant d'avoir 
les vrais fichiers pkl entraînés.
"""
import os
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Données d'entraînement factices représentatives du domaine bancaire
DATASET = [
    # Carte Bancaire
    ("Ma carte bancaire a été avalée par le distributeur automatique ce matin.", "Carte Bancaire"),
    ("Paiement refusé par carte bleue alors que mon solde est créditeur.", "Carte Bancaire"),
    ("Je souhaite faire opposition sur ma carte bancaire suite à une perte.", "Carte Bancaire"),
    ("Mon code secret de carte bancaire ne fonctionne plus sur les TPE.", "Carte Bancaire"),
    ("Demande de renouvellement de ma carte Visa Premier.", "Carte Bancaire"),
    ("Un débit frauduleux par carte apparaît sur mon relevé de compte.", "Carte Bancaire"),

    # Frais & Cotisations
    ("Des agios et frais d'incidents non justifiés ont été prélevés sur mon compte.", "Frais & Cotisations"),
    ("Contestation de la commission d'intervention de 80 euros prélevée ce mois.", "Frais & Cotisations"),
    ("Augmentation abusive des frais de tenue de compte sans préavis.", "Frais & Cotisations"),
    ("Je demande le remboursement des frais de rejet de chèque.", "Frais & Cotisations"),
    ("La cotisation annuelle de ma carte a doublé sans explication.", "Frais & Cotisations"),

    # Prélèvements & Virements
    ("Un prélèvement SEPA inconnu a été effectué par une société inconnue.", "Prélèvements & Virements"),
    ("Mon virement sortant vers le compte d'un fournisseur n'est toujours pas arrivé.", "Prélèvements & Virements"),
    ("Erreur de virement bancaire : l'argent a été débité deux fois.", "Prélèvements & Virements"),
    ("Je souhaite faire révocation d'un prélèvement automatique mensuel.", "Prélèvements & Virements"),
    ("Problème d'exécution d'un virement international instantané.", "Prélèvements & Virements"),

    # Crédit & Prêt
    ("Demande de renégociation du taux d'intérêt de mon prêt immobilier.", "Crédit & Prêt"),
    ("Je demande un report d'échéance pour mon crédit consommation.", "Crédit & Prêt"),
    ("Calcul erroné des pénalités de remboursement anticipé du prêt.", "Crédit & Prêt"),
    ("Absence de réponse suite à ma demande de prêt auto en agence.", "Crédit & Prêt"),
    ("Attestation d'assurance emprunteur pour mon crédit non envoyée.", "Crédit & Prêt"),

    # Compte & Accès
    ("Impossible de me connecter à mon espace client en ligne sur l'application mobile.", "Compte & Accès"),
    ("Mon accès bancaire est bloqué suite à 3 erreurs de mot de passe.", "Compte & Accès"),
    ("Je souhaite clôturer mon compte courant et transférer mon solde.", "Compte & Accès"),
    ("Changement d'adresse postale et numéro de téléphone non pris en compte.", "Compte & Accès"),
    ("Problème de réception du code SMS d'authentification forte 2FA.", "Compte & Accès")
]

def generate_dummy_artifacts():
    print("[ML Setup] Entraînement d'un modèle d'exemple sur le dataset bancaire...")
    
    textes = [doc[0] for doc in DATASET]
    categories = [doc[1] for doc in DATASET]

    # Vectorizer TF-IDF
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    X = vectorizer.fit_transform(textes)

    # Modèle Régression Logistique
    model = LogisticRegression(C=1.0)
    model.fit(X, categories)

    # Dossier de destination
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "backend", "data")
    os.makedirs(data_dir, exist_ok=True)

    modele_path = os.path.join(data_dir, "modele.pkl")
    vectorizer_path = os.path.join(data_dir, "vectorizer.pkl")

    joblib.dump(model, modele_path)
    joblib.dump(vectorizer, vectorizer_path)

    print(f"[ML Setup] Fichiers sauvegardés avec succès :")
    print(f"  -> {modele_path}")
    print(f"  -> {vectorizer_path}")

if __name__ == "__main__":
    generate_dummy_artifacts()
