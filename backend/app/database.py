import sqlite3
import os
from datetime import datetime
from typing import List, Dict, Any, Tuple

# Chemin absolu vers la base SQLite dans le dossier data
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "historique.db")

def get_connection() -> sqlite3.Connection:
    """
    Crée et retourne une connexion SQLite.
    Garantit que le dossier data/ existe.
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par leur nom
    return conn

def init_db() -> None:
    """
    Initialise la table 'reclamations' dans la base SQLite si elle n'existe pas.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reclamations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                texte TEXT NOT NULL,
                categorie TEXT NOT NULL,
                score_confiance REAL NOT NULL,
                date TEXT NOT NULL
            )
        """)
        conn.commit()
    print(f"[Database] Base de données SQLite initialisée sur {DB_PATH}")

def ajouter_reclamation(texte: str, categorie: str, score_confiance: float) -> Dict[str, Any]:
    """
    Insère une réclamation classée dans l'historique et retourne l'enregistrement complet.
    """
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO reclamations (texte, categorie, score_confiance, date)
            VALUES (?, ?, ?, ?)
            """,
            (texte, categorie, float(score_confiance), date_str)
        )
        conn.commit()
        inserted_id = cursor.lastrowid

    return {
        "id": inserted_id,
        "texte": texte,
        "categorie": categorie,
        "score_confiance": round(score_confiance, 4),
        "date": date_str
    }

def obtenir_historique(limit: int = 20, offset: int = 0) -> Tuple[List[Dict[str, Any]], int]:
    """
    Récupère la liste des réclamations classées, triées par date décroissante,
    ainsi que le nombre total d'enregistrements.
    """
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Compter le total
        cursor.execute("SELECT COUNT(*) FROM reclamations")
        total = cursor.fetchone()[0]

        # Sélectionner les réclamations paginées
        cursor.execute(
            """
            SELECT id, texte, categorie, score_confiance, date
            FROM reclamations
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset)
        )
        rows = cursor.fetchall()
        
        items = [
            {
                "id": row["id"],
                "texte": row["texte"],
                "categorie": row["categorie"],
                "score_confiance": row["score_confiance"],
                "date": row["date"]
            }
            for row in rows
        ]

    return items, total
