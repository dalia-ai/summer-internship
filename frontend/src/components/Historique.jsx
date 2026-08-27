import { useEffect, useMemo, useState } from "react";
import "./Historique.css";

export default function Historique() {
  const [reclamations, setReclamations] = useState([]);

  // Filtres
  const [search, setSearch] = useState("");
  const [categorie, setCategorie] = useState("");
  const [confianceMin, setConfianceMin] = useState("");
  const [dateFiltre, setDateFiltre] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    chargerHistorique();
  }, []);

const chargerHistorique = async () => {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/historique"
    );

    if (!response.ok) {
      throw new Error(
        `Erreur HTTP ${response.status}`
      );
    }

    const data = await response.json();

    setReclamations(
      Array.isArray(data.reclamations)
        ? data.reclamations
        : []
    );
  } catch (error) {
    console.error(
      "Erreur chargement historique :",
      error
    );

    setReclamations([]);
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "-";
  }

  // Backend : "2026-08-27 11:09:23"
  // Conversion vers un format ISO compris par JavaScript
  const date = new Date(
    String(dateValue).replace(" ", "T")
  );

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  // Liste des catégories disponibles
const categories = [
  "Carte bancaire",
  "Paiements par carte",
  "Virements",
  "Prélèvements",
  "Retraits d'espèces",
  "Recharges",
  "Compte bancaire",
  "Change et devises",
  "Identité et sécurité",
  "Services bancaires",
];

  // Filtrage
  const reclamationsFiltrees = useMemo(() => {
  if (!Array.isArray(reclamations)) {
    return [];
  }

  return reclamations.filter((reclamation) => {
    const texte =
      String(reclamation.texte ?? "").toLowerCase();

    const categorieReclamation =
      String(reclamation.categorie ?? "").toLowerCase();

    const rechercheValide =
      search.trim() === "" ||
      texte.includes(search.toLowerCase()) ||
      categorieReclamation.includes(search.toLowerCase());

    const categorieValide =
      categorie === "" ||
      reclamation.categorie === categorie;

    const confiance = Number(
      reclamation.confiance ??
      reclamation.score_confiance ??
      reclamation.confidence ??
      0
    );

    const confianceValide =
      confianceMin === "" ||
      confiance >= Number(confianceMin);

      let dateValide = true;

if (dateFiltre) {
  if (!reclamation.date) {
    dateValide = false;
  } else {
    const dateReclamation = String(reclamation.date).slice(0, 10);

    dateValide = dateReclamation === dateFiltre;
  }
}


    return (
      rechercheValide &&
      categorieValide &&
      confianceValide &&
      dateValide
    );
  });
}, [
  reclamations,
  search,
  categorie,
  confianceMin,
  dateFiltre
]);

  // Nombre total de pages
  const totalPages = Math.max(
    1,
    Math.ceil(reclamationsFiltrees.length / itemsPerPage)
  );

  // Données de la page actuelle
  const reclamationsPage = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return reclamationsFiltrees.slice(startIndex, endIndex);
  }, [reclamationsFiltrees, currentPage, itemsPerPage]);

  // Lorsqu'un filtre change, revenir page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categorie, confianceMin, itemsPerPage, dateFiltre]);

  // Sécurité si le nombre de pages diminue
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetFiltres = () => {
    setSearch("");
    setCategorie("");
    setConfianceMin("");
    setCurrentPage(1);
  };

  const getPages = () => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        pages.push(i);
      }
    }

    return pages;
  };

  const debut =
    reclamationsFiltrees.length === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const fin = Math.min(
    currentPage * itemsPerPage,
    reclamationsFiltrees.length
  );

  return (
    <div className="historique-container">

      <div className="historique-header">
        <div>
          <h1>Historique des réclamations</h1>
          <p>
            Consultez et filtrez les réclamations analysées.
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div className="historique-filters">

        <div className="filter-group">
          <label>Recherche</label>

          <input
            type="text"
            placeholder="Rechercher une réclamation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Catégorie</label>

          <select
            value={categorie}
            onChange={(e) => setCategorie(e.target.value)}
          >
            <option value="">Toutes les catégories</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Confiance minimale</label>

          <select
            value={confianceMin}
            onChange={(e) => setConfianceMin(e.target.value)}
          >
            <option value="">Tous les scores</option>
            <option value="0.5">≥ 50 %</option>
            <option value="0.7">≥ 70 %</option>
            <option value="0.8">≥ 80 %</option>
            <option value="0.9">≥ 90 %</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date</label>

          <input
            type="date"
            value={dateFiltre}
            onChange={(e) => setDateFiltre(e.target.value)}
          />
        </div>
      </div>

      {/* INFORMATIONS */}
      <div className="history-info">
        <span>
          {reclamationsFiltrees.length} réclamation
          {reclamationsFiltrees.length > 1 ? "s" : ""}
        </span>

        <div className="items-per-page">
          <label>Afficher</label>

          <select
            value={itemsPerPage}
            onChange={(e) =>
              setItemsPerPage(Number(e.target.value))
            }
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <span>par page</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="historique-table">
          <thead>
            <tr>
              
              <th>Réclamation</th>
              <th>Catégorie</th>
              <th>Confiance</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {reclamationsPage.length > 0 ? (
              reclamationsPage.map((reclamation) => {
                const confiance =
                  reclamation.confiance ??
                  reclamation.score_confiance ??
                  reclamation.confidence ??
                  0;

                return (
                  <tr key={reclamation.id}>
                    

                    <td className="reclamation-text">
                      {reclamation.texte}
                    </td>

                    <td>
                      <span className="category-badge">
                        {reclamation.categorie}
                      </span>
                    </td>

                    <td>
                      <strong>
                        {(Number(confiance) * 100).toFixed(1)} %
                      </strong>
                    </td>

                    <td className="date-cell">
  {formatDate(reclamation.date)}
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="empty-history">
                  Aucune réclamation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {reclamationsFiltrees.length > 0 && (
        <div className="pagination-container">

          <div className="pagination-info">
            Affichage de {debut} à {fin} sur{" "}
            {reclamationsFiltrees.length} résultats
          </div>

          <div className="pagination">

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              disabled={currentPage === 1}
            >
              ← Précédent
            </button>

            {getPages().map((page, index, pages) => {
              const previousPage = pages[index - 1];

              return (
                <span key={page}>
                  {previousPage &&
                    page - previousPage > 1 && (
                      <span className="pagination-dots">
                        ...
                      </span>
                    )}

                  <button
                    className={
                      currentPage === page
                        ? "page-button active"
                        : "page-button"
                    }
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </span>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(page + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              Suivant →
            </button>

          </div>
        </div>
      )}
    </div>
  );
}