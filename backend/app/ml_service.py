import os
import re
import joblib
import numpy as np
from typing import Tuple, Optional


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_DIR = os.path.join(BASE_DIR, "data")

MODELE_PATH = os.path.join(
    DATA_DIR,
    "modele_svm_fr.pkl"
)

VECTORIZER_PATH = os.path.join(
    DATA_DIR,
    "vectorizer_fr.pkl"
)



_model: Optional[object] = None
_vectorizer: Optional[object] = None


# Seuil choisi pendant nos tests
SEUIL_CONFIANCE = 0.50



def nettoyer_texte(texte: str) -> str:
    """
    Applique exactement le même nettoyage
    que pendant l'entraînement du modèle.
    """

    texte = str(texte)

    # Minuscules
    texte = texte.lower()

    # Normalisation des apostrophes
    texte = texte.replace("’", "'")

    # Garder lettres françaises, chiffres,
    # apostrophes, espaces et tirets
    texte = re.sub(
        r"[^a-zàâäéèêëîïôöùûüÿçœæ0-9'\s-]",
        " ",
        texte
    )

    # Supprimer les espaces multiples
    texte = re.sub(
        r"\s+",
        " ",
        texte
    )

    return texte.strip()



def load_ml_components() -> None:
    """
    Charge le SVM calibré et le vectorizer
    une seule fois au démarrage de FastAPI.
    """

    global _model, _vectorizer

    if not os.path.exists(MODELE_PATH):
        raise FileNotFoundError(
            f"Modèle introuvable : {MODELE_PATH}"
        )

    if not os.path.exists(VECTORIZER_PATH):
        raise FileNotFoundError(
            f"Vectorizer introuvable : {VECTORIZER_PATH}"
        )

    print("[ML Service] Chargement du modèle SVM français...")

    _model = joblib.load(MODELE_PATH)
    _vectorizer = joblib.load(VECTORIZER_PATH)

    print("[ML Service] Modèle chargé avec succès.")
    print(
        "[ML Service] Nombre de catégories :",
        len(_model.classes_)
    )




def predire_reclamation(
    texte: str
) -> Tuple[str, float]:

    global _model, _vectorizer

    if _model is None or _vectorizer is None:
        raise RuntimeError(
            "Le modèle ML n'est pas chargé."
        )

    if not texte or not texte.strip():
        raise ValueError(
            "Le texte de la réclamation est vide."
        )

    # 1. Nettoyage
    texte_clean = nettoyer_texte(texte)

    # 2. TF-IDF
    texte_vectorise = _vectorizer.transform(
        [texte_clean]
    )

    # 3. Catégorie
    prediction = _model.predict(
        texte_vectorise
    )[0]

    # 4. Probabilités du SVM calibré
    probabilites = _model.predict_proba(
        texte_vectorise
    )[0]

    # 5. Meilleure probabilité
    score_confiance = float(
        np.max(probabilites)
    )

    return str(prediction), score_confiance