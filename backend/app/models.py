from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from pydantic import BaseModel, Field
from typing import Literal


class ReclamationRequest(BaseModel):
    texte: str = Field(
        ...,
        min_length=1
    )

    langue: Literal["fr", "ar"]


class ReclamationResponse(BaseModel):
    id: int
    texte: str
    langue: str
    categorie: str
    score_confiance: float
    statut: str
    date: str

class HistoriqueResponse(BaseModel):
    """
    Modèle Pydantic pour la liste d'historique (GET /historique)
    """
    total: int = Field(..., description="Nombre total d'éléments renvoyés")
    reclamations: List[ReclamationResponse] = Field(..., description="Liste des réclamations classées")
