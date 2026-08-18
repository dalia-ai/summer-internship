from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class ReclamationRequest(BaseModel):
    """
    Modèle Pydantic pour la requête POST /classer
    """
    texte: str = Field(..., description="Le texte de la réclamation bancaire à classifier")

    @field_validator('texte')
    def texte_non_vide(cls, v: str) -> str:
        v_stripped = v.strip()
        if not v_stripped:
            raise ValueError("Le texte de la réclamation ne peut pas être vide ou composé uniquement d'espaces.")
        return v_stripped

class ReclamationResponse(BaseModel):
    """
    Modèle Pydantic pour le résultat de classification
    """
    id: Optional[int] = Field(None, description="Identifiant unique en base de données")
    texte: str = Field(..., description="Texte original de la réclamation")
    categorie: str = Field(..., description="Catégorie prédite par le modèle ML")
    score_confiance: float = Field(..., description="Score de confiance du modèle entre 0.0 et 1.0 (ou en %)")
    date: Optional[str] = Field(None, description="Horodatage de la demande")

class HistoriqueResponse(BaseModel):
    """
    Modèle Pydantic pour la liste d'historique (GET /historique)
    """
    total: int = Field(..., description="Nombre total d'éléments renvoyés")
    reclamations: List[ReclamationResponse] = Field(..., description="Liste des réclamations classées")
