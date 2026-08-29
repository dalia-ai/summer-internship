import os
import re
import joblib
import numpy as np
from typing import Optional, Tuple


# ============================================================
# CHEMINS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

DATA_DIR = os.path.join(BASE_DIR, "data")


# Français
MODEL_FR_PATH = os.path.join(
    DATA_DIR,
    "modele_svm_fr.pkl"
)

VECTORIZER_FR_PATH = os.path.join(
    DATA_DIR,
    "vectorizer_fr.pkl"
)


# Arabe
MODEL_AR_PATH = os.path.join(
    DATA_DIR,
    "modele_svm_ar.pkl"
)

VECTORIZER_AR_PATH = os.path.join(
    DATA_DIR,
    "vectorizer_ar.pkl"
)


# ============================================================
# OBJETS ML
# ============================================================

_model_fr: Optional[object] = None
_vectorizer_fr: Optional[object] = None

_model_ar: Optional[object] = None
_vectorizer_ar: Optional[object] = None


SEUIL_CONFIANCE_FR = 0.50
SEUIL_CONFIANCE_AR = 0.50


# ============================================================
# NETTOYAGE FRANÇAIS
# ============================================================

def nettoyer_texte_fr(texte: str) -> str:

    texte = str(texte)

    texte = texte.lower()

    texte = texte.replace("’", "'")

    texte = re.sub(
        r"[^a-zàâäéèêëîïôöùûüÿçœæ0-9'\s-]",
        " ",
        texte
    )

    texte = re.sub(
        r"\s+",
        " ",
        texte
    )

    return texte.strip()


# ============================================================
# NETTOYAGE ARABE
# ============================================================

def nettoyer_texte_ar(texte: str) -> str:

    texte = str(texte)

    # Caractères invisibles / directionnels
    texte = re.sub(
        r"[\u200b-\u200f\u202a-\u202e\u2066-\u2069]",
        " ",
        texte
    )

    # Tatweel
    texte = texte.replace("ـ", "")

    # Diacritiques
    texte = re.sub(
        r"[\u0617-\u061A\u064B-\u0652\u0670\u06D6-\u06ED]",
        "",
        texte
    )

    # Normalisation Alef
    texte = re.sub(
        r"[إأآٱ]",
        "ا",
        texte
    )

    # Alif maqsura
    texte = texte.replace("ى", "ي")

    # Caractères persans éventuels
    texte = texte.replace("ی", "ي")
    texte = texte.replace("ک", "ك")

    # Garder arabe + latin + chiffres
    texte = re.sub(
        r"[^ء-يA-Za-z0-9٠-٩\s]",
        " ",
        texte
    )

    texte = re.sub(
        r"\s+",
        " ",
        texte
    )

    return texte.strip()


# ============================================================
# CHARGEMENT
# ============================================================

def load_ml_components() -> None:

    global _model_fr
    global _vectorizer_fr
    global _model_ar
    global _vectorizer_ar

    fichiers = [
        MODEL_FR_PATH,
        VECTORIZER_FR_PATH,
        MODEL_AR_PATH,
        VECTORIZER_AR_PATH
    ]

    for fichier in fichiers:

        if not os.path.exists(fichier):

            raise FileNotFoundError(
                f"Fichier ML introuvable : {fichier}"
            )

    # Français
    print("[ML] Chargement modèle français...")

    _model_fr = joblib.load(
        MODEL_FR_PATH
    )

    _vectorizer_fr = joblib.load(
        VECTORIZER_FR_PATH
    )

    print(
        "[ML] Français :",
        len(_model_fr.classes_),
        "catégories"
    )


    # Arabe
    print("[ML] Chargement modèle arabe...")

    _model_ar = joblib.load(
        MODEL_AR_PATH
    )

    _vectorizer_ar = joblib.load(
        VECTORIZER_AR_PATH
    )

    print(
        "[ML] Arabe :",
        len(_model_ar.classes_),
        "catégories"
    )

    print("[ML] Modèles FR + AR chargés")


# ============================================================
# PRÉDICTION
# ============================================================

def predire_reclamation(
    texte: str,
    langue: str
) -> Tuple[str, float, str]:

    langue = langue.lower().strip()

    if langue not in ["fr", "ar"]:

        raise ValueError(
            "La langue doit être 'fr' ou 'ar'."
        )

    if not texte or not texte.strip():

        raise ValueError(
            "La réclamation ne peut pas être vide."
        )


    # ========================================================
    # FRANÇAIS
    # ========================================================

    if langue == "fr":

        if _model_fr is None or _vectorizer_fr is None:

            raise RuntimeError(
                "Le modèle français n'est pas chargé."
            )

        texte_clean = nettoyer_texte_fr(
            texte
        )

        X = _vectorizer_fr.transform(
            [texte_clean]
        )

        prediction = _model_fr.predict(X)[0]

        probabilites = _model_fr.predict_proba(X)[0]

        confiance = float(
            np.max(probabilites)
        )

        seuil = SEUIL_CONFIANCE_FR


    # ========================================================
    # ARABE
    # ========================================================

    else:

        if _model_ar is None or _vectorizer_ar is None:

            raise RuntimeError(
                "Le modèle arabe n'est pas chargé."
            )

        texte_clean = nettoyer_texte_ar(
            texte
        )

        X = _vectorizer_ar.transform(
            [texte_clean]
        )

        prediction = _model_ar.predict(X)[0]

        probabilites = _model_ar.predict_proba(X)[0]

        confiance = float(
            np.max(probabilites)
        )

        seuil = SEUIL_CONFIANCE_AR


    # ========================================================
    # STATUT
    # ========================================================

    statut = (
        "confiant"
        if confiance >= seuil
        else "incertain"
    )

    return (
        str(prediction),
        confiance,
        statut
    )