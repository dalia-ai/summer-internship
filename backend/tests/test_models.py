import sys
from pathlib import Path

import pytest
from pydantic import ValidationError


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.models import (
    ReclamationRequest,
    ReclamationBatchRequest
)


def test_reclamation_request_valide():
    reclamation = ReclamationRequest(
        texte="Ma carte est bloquée",
        langue="fr"
    )

    assert reclamation.texte == "Ma carte est bloquée"
    assert reclamation.langue == "fr"


def test_reclamation_request_langue_invalide():
    with pytest.raises(ValidationError):
        ReclamationRequest(
            texte="Test",
            langue="de"
        )


def test_reclamation_request_texte_vide():
    with pytest.raises(ValidationError):
        ReclamationRequest(
            texte="",
            langue="fr"
        )


def test_batch_valide():
    batch = ReclamationBatchRequest(
        langue="en",
        textes=[
            "Card blocked",
            "Transfer problem"
        ]
    )

    assert batch.langue == "en"
    assert len(batch.textes) == 2


def test_batch_langue_invalide():
    with pytest.raises(ValidationError):
        ReclamationBatchRequest(
            langue="it",
            textes=["Test"]
        )