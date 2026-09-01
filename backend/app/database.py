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
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    categorie: str | None = None,
    langue: str | None = None,
    confiance_min: float | None = None,
    date_filtre: str | None = None
):

    offset = (page - 1) * page_size

    conditions = []
    params = []

    if search:

        conditions.append(
            """
            (
                LOWER(texte) LIKE ?
                OR LOWER(categorie) LIKE ?
            )
            """
        )

        valeur = f"%{search.lower()}%"

        params.extend([
            valeur,
            valeur
        ])


    if categorie:

        conditions.append(
            "categorie = ?"
        )

        params.append(
            categorie
        )


    if langue:

        conditions.append(
            "langue = ?"
        )

        params.append(
            langue
        )


    if confiance_min is not None:

        conditions.append(
            "score_confiance >= ?"
        )

        params.append(
            confiance_min
        )


    if date_filtre:

        conditions.append(
            "DATE(date) = ?"
        )

        params.append(
            date_filtre
        )


    where_sql = ""

    if conditions:

        where_sql = (
            " WHERE "
            + " AND ".join(conditions)
        )


    with get_connection() as conn:

        cursor = conn.cursor()


        # Nombre total après filtrage
        cursor.execute(
            f"""
            SELECT COUNT(*)
            FROM reclamations
            {where_sql}
            """,
            params
        )

        total = cursor.fetchone()[0]


        # Résultats de la page
        cursor.execute(
            f"""
            SELECT
                id,
                texte,
                langue,
                categorie,
                score_confiance,
                statut,
                date
            FROM reclamations
            {where_sql}
            ORDER BY id DESC
            LIMIT ?
            OFFSET ?
            """,
            params + [
                page_size,
                offset
            ]
        )

        rows = cursor.fetchall()


    reclamations = [
        dict(row)
        for row in rows
    ]


    total_pages = (
        (total + page_size - 1)
        // page_size
        if total > 0
        else 0
    )


    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "reclamations": reclamations
    }


def obtenir_statistiques():

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM reclamations
            """
        )

        total = cursor.fetchone()[0]


        cursor.execute(
            """
            SELECT AVG(score_confiance)
            FROM reclamations
            """
        )

        moyenne = cursor.fetchone()[0]

        confiance_moyenne = (
            float(moyenne)
            if moyenne is not None
            else 0.0
        )

        cursor.execute(
            """
            SELECT
                categorie,
                COUNT(*) AS nombre
            FROM reclamations
            GROUP BY categorie
            ORDER BY nombre DESC
            """
        )

        par_categorie = [
            dict(row)
            for row in cursor.fetchall()
        ]


        cursor.execute(
            """
            SELECT
                langue,
                COUNT(*) AS nombre
            FROM reclamations
            GROUP BY langue
            ORDER BY nombre DESC
            """
        )

        par_langue = [
            dict(row)
            for row in cursor.fetchall()
        ]


       

        cursor.execute(
            """
            SELECT
                statut,
                COUNT(*) AS nombre
            FROM reclamations
            GROUP BY statut
            ORDER BY nombre DESC
            """
        )

        par_statut = [
            dict(row)
            for row in cursor.fetchall()
        ]



        cursor.execute(
            """
            SELECT
                DATE(date) AS date,
                COUNT(*) AS nombre
            FROM reclamations
            WHERE date IS NOT NULL
            GROUP BY DATE(date)
            ORDER BY DATE(date) ASC
            """
        )

        par_date = [
            dict(row)
            for row in cursor.fetchall()
        ]


    return {

        "total":
            total,

        "confiance_moyenne":
            confiance_moyenne,

        "par_categorie":
            par_categorie,

        "par_langue":
            par_langue,

        "par_statut":
            par_statut,

        "par_date":
            par_date
    }


 