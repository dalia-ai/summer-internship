import sys
from pathlib import Path

from fastapi.testclient import TestClient


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import app.main as main_module


client = TestClient(main_module.app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["statut"] == "OK"
    assert "message" in data
    assert data["documentation"] == "/docs"


def test_classer_reclamation(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "predire_reclamation",
        lambda texte, langue: (
            "Carte bancaire",
            0.95,
            "confiant"
        )
    )

    monkeypatch.setattr(
        main_module,
        "ajouter_reclamation",
        lambda **kwargs: {
            "id": 1,
            "texte": kwargs["texte"],
            "langue": kwargs["langue"],
            "categorie": kwargs["categorie"],
            "score_confiance": kwargs["score_confiance"],
            "statut": kwargs["statut"],
            "date": "2026-10-10 10:00:00"
        }
    )

    response = client.post(
        "/classer",
        json={
            "texte": "Ma carte bancaire est bloquée",
            "langue": "fr"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["categorie"] == "Carte bancaire"
    assert data["score_confiance"] == 0.95
    assert data["statut"] == "confiant"


def test_classer_langue_invalide():
    response = client.post(
        "/classer",
        json={
            "texte": "Test",
            "langue": "de"
        }
    )

    assert response.status_code == 422


def test_classer_value_error(monkeypatch):
    def fake_prediction(texte, langue):
        raise ValueError("Réclamation invalide")

    monkeypatch.setattr(
        main_module,
        "predire_reclamation",
        fake_prediction
    )

    response = client.post(
        "/classer",
        json={
            "texte": "Test",
            "langue": "fr"
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Réclamation invalide"


def test_classer_erreur_interne(monkeypatch):
    def fake_prediction(texte, langue):
        raise RuntimeError("Erreur ML")

    monkeypatch.setattr(
        main_module,
        "predire_reclamation",
        fake_prediction
    )

    response = client.post(
        "/classer",
        json={
            "texte": "Test",
            "langue": "fr"
        }
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Erreur ML"


def test_classer_batch(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "predire_reclamation",
        lambda texte, langue: (
            "Virement",
            0.90,
            "confiant"
        )
    )

    compteur = {"id": 0}

    def fake_ajouter(**kwargs):
        compteur["id"] += 1

        return {
            "id": compteur["id"],
            "texte": kwargs["texte"],
            "langue": kwargs["langue"],
            "categorie": kwargs["categorie"],
            "score_confiance": kwargs["score_confiance"],
            "statut": kwargs["statut"],
            "date": "2026-10-10 10:00:00"
        }

    monkeypatch.setattr(
        main_module,
        "ajouter_reclamation",
        fake_ajouter
    )

    response = client.post(
        "/classer-batch",
        json={
            "langue": "fr",
            "textes": [
                "Premier problème",
                "",
                "Deuxième problème"
            ]
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["langue"] == "fr"
    assert len(data["resultats"]) == 2


def test_historique(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "obtenir_historique",
        lambda **kwargs: {
            "page": kwargs["page"],
            "page_size": kwargs["page_size"],
            "total": 0,
            "total_pages": 0,
            "reclamations": []
        }
    )

    response = client.get(
        "/historique?page=1&page_size=10"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total"] == 0


def test_historique_corrige_pagination(monkeypatch):
    valeurs = {}

    def fake_historique(**kwargs):
        valeurs.update(kwargs)

        return {
            "page": kwargs["page"],
            "page_size": kwargs["page_size"],
            "total": 0,
            "total_pages": 0,
            "reclamations": []
        }

    monkeypatch.setattr(
        main_module,
        "obtenir_historique",
        fake_historique
    )

    response = client.get(
        "/historique?page=0&page_size=500"
    )

    assert response.status_code == 200
    assert valeurs["page"] == 1
    assert valeurs["page_size"] == 100


def test_statistiques(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "obtenir_statistiques",
        lambda: {
            "total": 2,
            "confiance_moyenne": 0.90,
            "par_categorie": [],
            "par_langue": [],
            "par_statut": [],
            "par_date": []
        }
    )

    response = client.get("/statistiques")

    assert response.status_code == 200

    data = response.json()

    assert data["total"] == 2
    assert data["confiance_moyenne"] == 0.90