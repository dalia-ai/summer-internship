from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models import ReclamationRequest, ReclamationResponse, HistoriqueResponse
from app.database import init_db, ajouter_reclamation, obtenir_historique
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

# Instanciation de FastAPI avec documentation Swagger automatique
app = FastAPI(
    title="API Classification Réclamations Bancaires",
    description="API REST de classification automatique de réclamations bancaires par Machine Learning (TF-IDF + Scikit-Learn)",
    version="1.0.0",
    lifespan=lifespan
)

# Activation des CORS pour permettre au Frontend React (Vite) de consommer l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En développement local
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
    response_model=ReclamationResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Classification"],
    summary="Classer une réclamation bancaire"
)
def classer_reclamation(payload: ReclamationRequest):
    """
    Classer le texte d'une réclamation bancaire :
    - Prédit la catégorie et le score de confiance via le modèle ML préchargé
    - Enregistre la réclamation et le résultat dans la base SQLite
    - Renvoie la catégorie et le score
    """
    try:
        # 1. Prédiction ML
        categorie, score_confiance = predire_reclamation(payload.texte)

        # 2. Sauvegarde dans la base de données
        resultat_db = ajouter_reclamation(
            texte=payload.texte,
            categorie=categorie,
            score_confiance=score_confiance
        )

        return resultat_db

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        print(f"[Erreur /classer] {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors de la classification de la réclamation: {str(e)}"
        )

@app.get(
    "/historique",
    response_model=HistoriqueResponse,
    tags=["Historique"],
    summary="Consulter l'historique des réclamations"
)
def lire_historique(
    limit: int = Query(20, ge=1, le=100, description="Nombre d'éléments à retourner"),
    offset: int = Query(0, ge=0, description="Décalage pour la pagination")
):
    """
    Récupère la liste des réclamations classées, triées par date décroissante.
    """
    try:
        items, total = obtenir_historique(limit=limit, offset=offset)
        return {
            "total": total,
            "reclamations": items
        }
    except Exception as e:
        print(f"[Erreur /historique] {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération de l'historique: {str(e)}"
        )
