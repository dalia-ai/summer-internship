import sys
from pathlib import Path
import pytest

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import app.database as database


def test_database_initialization(tmp_path, monkeypatch):
    test_db = tmp_path / "test_historique.db"

    monkeypatch.setattr(database, "DB_PATH", str(test_db))

    database.init_db()

    assert test_db.exists()


def test_ajouter_reclamation(tmp_path, monkeypatch):
    test_db = tmp_path / "test_historique.db"

    monkeypatch.setattr(database, "DB_PATH", str(test_db))

    database.init_db()

    resultat = database.ajouter_reclamation(
        texte="Ma carte bancaire est bloquée",
        langue="fr",
        categorie="Carte bancaire",
        score_confiance=0.95,
        statut="confiant",
    )

    assert resultat["id"] > 0
    assert resultat["texte"] == "Ma carte bancaire est bloquée"
    assert resultat["langue"] == "fr"
    assert resultat["categorie"] == "Carte bancaire"
    assert resultat["score_confiance"] == 0.95
    assert resultat["statut"] == "confiant"


def test_obtenir_historique(tmp_path, monkeypatch):
    test_db = tmp_path / "test_historique.db"

    monkeypatch.setattr(database, "DB_PATH", str(test_db))

    database.init_db()

    database.ajouter_reclamation(
        texte="Problème de virement",
        langue="fr",
        categorie="Virement",
        score_confiance=0.90,
        statut="confiant",
    )

    historique = database.obtenir_historique()

    assert historique["total"] == 1
    assert len(historique["reclamations"]) == 1
    assert historique["reclamations"][0]["categorie"] == "Virement"
    assert historique["reclamations"][0]["langue"] == "fr"


def test_obtenir_statistiques(tmp_path, monkeypatch):
    test_db = tmp_path / "test_historique.db"

    monkeypatch.setattr(database, "DB_PATH", str(test_db))

    database.init_db()

    database.ajouter_reclamation(
        texte="Carte bloquée",
        langue="fr",
        categorie="Carte",
        score_confiance=0.80,
        statut="confiant",
    )

    database.ajouter_reclamation(
        texte="Retrait impossible",
        langue="fr",
        categorie="Retrait",
        score_confiance=0.90,
        statut="confiant",
    )

    stats = database.obtenir_statistiques()

    assert stats["total"] == 2
    assert stats["confiance_moyenne"] == pytest.approx(0.85)
    assert len(stats["par_categorie"]) == 2