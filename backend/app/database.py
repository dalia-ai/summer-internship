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

def init_db():

    with get_connection() as conn:
        cursor = conn.cursor()

        # Création pour une nouvelle base
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS reclamations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                texte TEXT NOT NULL,
                langue TEXT NOT NULL DEFAULT 'fr',
                categorie TEXT NOT NULL,
                score_confiance REAL NOT NULL,
                statut TEXT NOT NULL DEFAULT 'confiant',
                date TEXT NOT NULL
            )
            """
        )

        # ====================================================
        # MIGRATION DE L'ANCIENNE BASE
        # ====================================================

        cursor.execute(
            "PRAGMA table_info(reclamations)"
        )

        colonnes = {
            row["name"]
            for row in cursor.fetchall()
        }

        # Ajouter langue si l'ancienne base ne l'a pas
        if "langue" not in colonnes:

            cursor.execute(
                """
                ALTER TABLE reclamations
                ADD COLUMN langue TEXT
                NOT NULL DEFAULT 'fr'
                """
            )

            print(
                "[Database] Colonne 'langue' ajoutée"
            )

        # Ajouter statut si l'ancienne base ne l'a pas
        if "statut" not in colonnes:

            cursor.execute(
                """
                ALTER TABLE reclamations
                ADD COLUMN statut TEXT
                NOT NULL DEFAULT 'confiant'
                """
            )

            print(
                "[Database] Colonne 'statut' ajoutée"
            )

        conn.commit()

    print("[Database] Base SQLite initialisée")

def ajouter_reclamation(
    texte: str,
    langue: str,
    categorie: str,
    score_confiance: float,
    statut: str
):
    date_str = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute(
            """
            INSERT INTO reclamations
            (
                texte,
                langue,
                categorie,
                score_confiance,
                statut,
                date
            )
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                texte,
                langue,
                categorie,
                float(score_confiance),
                statut,
                date_str
            )
        )

        conn.commit()

        reclamation_id = cursor.lastrowid

    return {
        "id": reclamation_id,
        "texte": texte,
        "langue": langue,
        "categorie": categorie,
        "score_confiance": round(
            float(score_confiance),
            4
        ),
        "statut": statut,
        "date": date_str
    }

def obtenir_historique(
    limit: int = 20,
    offset: int = 0
):
    with get_connection() as conn:
        cursor = conn.cursor()

        # Nombre total de réclamations
        cursor.execute(
            "SELECT COUNT(*) FROM reclamations"
        )

        total = cursor.fetchone()[0]

        # Récupération des réclamations
        cursor.execute(
            """
            SELECT
                id,
                texte,
                langue,
                categorie,
                score_confiance,
                statut,
                date
            FROM reclamations
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            (
                limit,
                offset
            )
        )

        rows = cursor.fetchall()

        reclamations = []

        for row in rows:
            reclamations.append({
                "id": row["id"],
                "texte": row["texte"],
                "langue": row["langue"],
                "categorie": row["categorie"],
                "score_confiance": float(
                    row["score_confiance"]
                ),
                "statut": row["statut"],
                "date": row["date"]
            })

    return {
        "total": total,
        "reclamations": reclamations
    }
