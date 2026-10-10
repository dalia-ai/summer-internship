import sys
from pathlib import Path

import numpy as np
import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import app.ml_service as ml_service


class FakeMatrix:
    def __init__(self, nnz=1):
        self.nnz = nnz


class FakeVectorizer:
    def __init__(self, nnz=1):
        self.nnz = nnz

    def transform(self, textes):
        return FakeMatrix(self.nnz)


class FakeModel:
    def __init__(
        self,
        prediction="Carte bancaire",
        probabilites=None
    ):
        self.prediction = prediction

        if probabilites is None:
            probabilites = [0.1, 0.9]

        self.probabilites = probabilites

    def predict(self, X):
        return [self.prediction]

    def predict_proba(self, X):
        return np.array([self.probabilites])


def test_nettoyer_texte_fr():
    resultat = ml_service.nettoyer_texte_fr(
        "  Bonjour!!!   CARTE bancaire  "
    )

    assert resultat == "bonjour carte bancaire"


def test_nettoyer_texte_en():
    resultat = ml_service.nettoyer_texte_en(
        "  My CARD!!! is BLOCKED.  "
    )

    assert resultat == "my card is blocked"


def test_langue_invalide():
    with pytest.raises(ValueError):
        ml_service.predire_reclamation(
            "Problème bancaire",
            "de"
        )


def test_reclamation_vide():
    with pytest.raises(ValueError):
        ml_service.predire_reclamation(
            "   ",
            "fr"
        )


def test_modele_fr_non_charge(monkeypatch):
    monkeypatch.setattr(
        ml_service,
        "_model_fr",
        None
    )

    monkeypatch.setattr(
        ml_service,
        "_vectorizer_fr",
        None
    )

    with pytest.raises(RuntimeError):
        ml_service.predire_reclamation(
            "Carte bloquée",
            "fr"
        )


def test_prediction_fr_confiante(monkeypatch):
    monkeypatch.setattr(
        ml_service,
        "_model_fr",
        FakeModel(
            prediction="Carte bancaire",
            probabilites=[0.05, 0.95]
        )
    )

    monkeypatch.setattr(
        ml_service,
        "_vectorizer_fr",
        FakeVectorizer()
    )

    categorie, confiance, statut = (
        ml_service.predire_reclamation(
            "Ma carte bancaire est bloquée",
            "fr"
        )
    )

    assert categorie == "Carte bancaire"
    assert confiance == pytest.approx(0.95)
    assert statut == "confiant"


def test_prediction_fr_incertaine(monkeypatch):
    monkeypatch.setattr(
        ml_service,
        "_model_fr",
        FakeModel(
            prediction="Virement",
            probabilites=[0.49, 0.51]
        )
    )

    monkeypatch.setattr(
        ml_service,
        "_vectorizer_fr",
        FakeVectorizer()
    )

    monkeypatch.setattr(
        ml_service,
        "SEUIL_CONFIANCE_FR",
        0.70
    )

    categorie, confiance, statut = (
        ml_service.predire_reclamation(
            "Problème de virement",
            "fr"
        )
    )

    assert categorie == "Virement"
    assert confiance == pytest.approx(0.51)
    assert statut == "incertain"


def test_texte_fr_non_reconnu(monkeypatch):
    monkeypatch.setattr(
        ml_service,
        "_model_fr",
        FakeModel()
    )

    monkeypatch.setattr(
        ml_service,
        "_vectorizer_fr",
        FakeVectorizer(nnz=0)
    )

    categorie, confiance, statut = (
        ml_service.predire_reclamation(
            "xyzxyzxyz",
            "fr"
        )
    )

    assert categorie == "Non reconnue"
    assert confiance == 0.0
    assert statut == "invalide"


def test_prediction_en_confiante(monkeypatch):
    monkeypatch.setattr(
        ml_service,
        "_model_en",
        FakeModel(
            prediction="Credit card",
            probabilites=[0.1, 0.9]
        )
    )

    monkeypatch.setattr(
        ml_service,
        "_vectorizer_en",
        FakeVectorizer()
    )

    categorie, confiance, statut = (
        ml_service.predire_reclamation(
            "My card is blocked",
            "en"
        )
    )

    assert categorie == "Credit card"
    assert confiance == pytest.approx(0.9)
    assert statut == "confiant"