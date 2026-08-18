import os
import joblib
import numpy as np
from typing import Tuple, Optional

# Chemins vers les artefacts ML
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELE_PATH = os.path.join(DATA_DIR, "modele.pkl")
VECTORIZER_PATH = os.path.join(DATA_DIR, "vectorizer.pkl")

# Variables globales chargées UNE SEULE FOIS en mémoire au démarrage de l'API
_model: Optional[object] = None
_vectorizer: Optional[object] = None

def load_ml_components() -> None:
    """
    Charge le modèle et le vectorizer depuis le disque une seule fois.
    Si les fichiers sont absents, déclenche la génération d'un modèle d'exemple.
    """
    global _model, _vectorizer

    if not os.path.exists(MODELE_PATH) or not os.path.exists(VECTORIZER_PATH):
        print("[ML Service] Fichiers modele.pkl ou vectorizer.pkl introuvables.")
        print("[ML Service] Génération automatique d'un modèle factice de démonstration...")
        import sys
        root_dir = os.path.dirname(BASE_DIR)
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
        from create_dummy_model import generate_dummy_artifacts
        generate_dummy_artifacts()

    print(f"[ML Service] Chargement de {MODELE_PATH} et {VECTORIZER_PATH}...")
    _model = joblib.load(MODELE_PATH)
    _vectorizer = joblib.load(VECTORIZER_PATH)
    print("[ML Service] Modèle et Vectorizer chargés avec succès en mémoire.")

def predire_reclamation(texte: str) -> Tuple[str, float]:
    """
    Transforme le texte de la réclamation avec le vectorizer,
    effectue la prédiction avec le modèle et extrait le score de confiance.

    Returns:
        tuple (catégorie: str, score_confiance: float entre 0.0 et 1.0)
    """
    global _model, _vectorizer

    if _model is None or _vectorizer is None:
        raise RuntimeError("Le modèle ML n'a pas été initialisé au démarrage de l'application.")

    # 1. Prétraitement / Transformation TF-IDF
    texte_vectorise = _vectorizer.transform([texte])

    # 2. Prédiction de la catégorie
    prediction = _model.predict(texte_vectorise)[0]

    # 3. Calcul du score de confiance
    score_confiance = 1.0
    if hasattr(_model, "predict_proba"):
        probas = _model.predict_proba(texte_vectorise)[0]
        score_confiance = float(np.max(probas))
    elif hasattr(_model, "decision_function"):
        decision = _model.decision_function(texte_vectorise)
        # Normalisation MinMax/Softmax approximative pour SVM sans probabilité
        exp_d = np.exp(decision - np.max(decision))
        softmax_probs = exp_d / np.sum(exp_d)
        score_confiance = float(np.max(softmax_probs))

    # S'assurer que la catégorie renvoyée est une chaîne simple
    categorie_str = str(prediction)

    return categorie_str, score_confiance
