from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Optional
from app.models import ReclamationRequest, ReclamationResponse, HistoriqueResponse, ReclamationBatchRequest
from app.database import init_db, ajouter_reclamation, obtenir_historique, obtenir_statistiques
from app.ml_service import load_ml_components, predire_reclamation


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestionnaire du cycle de vie FastAPI.
    Exécuté UNE SEULE FOIS au démarrage du serveur :
    - Initialise la base de données SQLite
    - Charge le modèle ML et le vectorizer en mémoire
    """
    print("[FastAPI Lifespan] Démarrage du serveur backend...")
    init_db()
    load_ml_components()
    yield
    print("[FastAPI Lifespan] Arrêt du serveur backend...")


app = FastAPI(
    title="API Classification Réclamations Bancaires",
    description="API REST de classification automatique de réclamations bancaires par Machine Learning (TF-IDF + Scikit-Learn)",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Santé"])
def read_root():
    """
    Endpoint de santé / accueil de l'API.
    """
    return {
        "statut": "OK",
        "message": "Bienvenue sur l'API de classification des réclamations bancaires.",
        "documentation": "/docs"
    }

@app.post(
    "/classer",
    response_model=ReclamationResponse
)
def classer_reclamation(
    payload: ReclamationRequest
):

    try:
        categorie, score_confiance, statut = predire_reclamation(
            payload.texte,
            payload.langue
        )

        resultat = ajouter_reclamation(
            texte=payload.texte,
            langue=payload.langue,
            categorie=categorie,
            score_confiance=score_confiance,
            statut=statut
        )

        return resultat

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        print(
            "[Erreur /classer]",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/classer-batch")
def classer_batch(payload: ReclamationBatchRequest):

    resultats = []

    for texte in payload.textes:

        texte = str(texte).strip()

        if not texte:
            continue

        categorie, score_confiance, statut = predire_reclamation(
            texte,
            payload.langue
        )

        reclamation = ajouter_reclamation(
            texte=texte,
            langue=payload.langue,
            categorie=categorie,
            score_confiance=score_confiance,
            statut=statut
        )

        resultats.append(
            reclamation
        )

    return {
        "total": len(resultats),
        "langue": payload.langue,
        "resultats": resultats
    }

@app.get("/historique")
def historique(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    categorie: Optional[str] = None,
    langue: Optional[str] = None,
    confiance_min: Optional[float] = None,
    date_filtre: Optional[str] = None
):

    if page < 1:
        page = 1

    if page_size < 1:
        page_size = 10

    if page_size > 100:
        page_size = 100

    return obtenir_historique(
        page=page,
        page_size=page_size,
        search=search,
        categorie=categorie,
        langue=langue,
        confiance_min=confiance_min,
        date_filtre=date_filtre
    )


@app.get("/statistiques")
def statistiques():

    return obtenir_statistiques()