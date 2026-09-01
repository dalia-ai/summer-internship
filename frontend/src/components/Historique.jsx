import { useEffect, useState } from "react";
import "./Historique.css";


export default function Historique() {



  const [reclamations, setReclamations] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [search, setSearch] =
    useState("");

  const [categorie, setCategorie] =
    useState("");

  const [confianceMin, setConfianceMin] =
    useState("");

  const [dateFiltre, setDateFiltre] =
    useState("");




  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

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


  

  const chargerHistorique = async () => {

    setLoading(true);
    setError("");

    try {


      const params =
        new URLSearchParams();


      params.set(
        "page",
        String(currentPage)
      );


      params.set(
        "page_size",
        String(itemsPerPage)
      );


      // Recherche texte
      if (search.trim()) {

        params.set(
          "search",
          search.trim()
        );
      }


      // Catégorie
      if (categorie) {

        params.set(
          "categorie",
          categorie
        );
      }


      // Confiance minimale
      if (confianceMin) {

        params.set(
          "confiance_min",
          confianceMin
        );
      }


      // Date
      if (dateFiltre) {

        params.set(
          "date_filtre",
          dateFiltre
        );
      }


      const response =
        await fetch(
          `http://127.0.0.1:8000/historique?${params.toString()}`
        );


      if (!response.ok) {

        throw new Error(
          `Erreur HTTP ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        "Historique reçu du backend :",
        data
      );



      setReclamations(
        Array.isArray(data.reclamations)
          ? data.reclamations
          : []
      );


   

      setTotal(
        Number(
          data.total ?? 0
        )
      );



      setTotalPages(
        Number(
          data.total_pages ?? 0
        )
      );


    } catch (error) {

      console.error(
        "Erreur chargement historique :",
        error
      );


      setError(
        "Impossible de charger l'historique."
      );


      setReclamations([]);

      setTotal(0);

      setTotalPages(0);

    } finally {

      setLoading(false);
    }
  };



  useEffect(() => {

    chargerHistorique();

  }, [
    currentPage,
    itemsPerPage,
    search,
    categorie,
    confianceMin,
    dateFiltre,
  ]);


 

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "-";
    }


    const date =
      new Date(
        String(
          dateValue
        ).replace(
          " ",
          "T"
        )
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "-";
    }


    return date.toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };




  const resetFiltres = () => {

    setSearch("");

    setCategorie("");

    setConfianceMin("");

    setDateFiltre("");

    setCurrentPage(1);
  };




  const getPages = () => {

    const pages = [];


    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {

      if (
        i === 1 ||
        i === totalPages ||
        (
          i >= currentPage - 2 &&
          i <= currentPage + 2
        )
      ) {

        pages.push(i);
      }
    }


    return pages;
  };




  const debut =
    total === 0
      ? 0
      : (
          currentPage - 1
        ) *
          itemsPerPage +
        1;


  const fin =
    Math.min(
      currentPage *
        itemsPerPage,
      total
    );




  return (

    <div className="historique-container">



      <div className="historique-header">

        <div>

          <h1>
            Historique des réclamations
          </h1>

          <p>
            Consultez et filtrez les
            réclamations analysées.
          </p>

        </div>

      </div>



      <div className="historique-filters">


        {/* RECHERCHE */}

        <div className="filter-group">

          <label>
            Recherche
          </label>

          <input
            type="text"

            placeholder="
              Rechercher une réclamation...
            "

            value={search}

            onChange={(e) => {

              setSearch(
                e.target.value
              );

              setCurrentPage(1);
            }}
          />

        </div>


        {/* CATÉGORIE */}

        <div className="filter-group">

          <label>
            Catégorie
          </label>

          <select
            value={categorie}

            onChange={(e) => {

              setCategorie(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >

            <option value="">
              Toutes les catégories
            </option>


            {categories.map(
              (cat) => (

                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>

              )
            )}

          </select>

        </div>


        {/* CONFIANCE */}

        <div className="filter-group">

          <label>
            Confiance minimale
          </label>

          <select
            value={confianceMin}

            onChange={(e) => {

              setConfianceMin(
                e.target.value
              );

              setCurrentPage(1);
            }}
          >

            <option value="">
              Tous les scores
            </option>

            <option value="0.5">
              ≥ 50 %
            </option>

            <option value="0.7">
              ≥ 70 %
            </option>

            <option value="0.8">
              ≥ 80 %
            </option>

            <option value="0.9">
              ≥ 90 %
            </option>

          </select>

        </div>


        {/* DATE */}

        <div className="filter-group">

          <label>
            Date
          </label>

          <input
            type="date"

            value={dateFiltre}

            onChange={(e) => {

              setDateFiltre(
                e.target.value
              );

              setCurrentPage(1);
            }}
          />

        </div>

      </div>


      {(search ||
        categorie ||
        confianceMin ||
        dateFiltre) && (

        <div
          style={{
            marginBottom:
              "16px",
          }}
        >

          <button
            type="button"
            onClick={resetFiltres}
          >
            Réinitialiser les filtres
          </button>

        </div>

      )}




      <div className="history-info">

        <span>

          {total} réclamation

          {total > 1
            ? "s"
            : ""}

        </span>


        <div className="items-per-page">

          <label>
            Afficher
          </label>

          <select
            value={
              itemsPerPage
            }

            onChange={(e) => {

              setItemsPerPage(
                Number(
                  e.target.value
                )
              );

              setCurrentPage(1);
            }}
          >

            <option value={5}>
              5
            </option>

            <option value={10}>
              10
            </option>

            <option value={20}>
              20
            </option>

            <option value={50}>
              50
            </option>

          </select>

          <span>
            par page
          </span>

        </div>

      </div>



      {error && (

        <div className="stats-error">

          {error}

        </div>

      )}



      <div className="table-container">

        <table className="historique-table">


          <thead>

            <tr>

              <th>
                Réclamation
              </th>

              <th>
                Catégorie
              </th>

              <th>
                Confiance
              </th>

              <th>
                Date
              </th>

            </tr>

          </thead>


          <tbody>


            {/* CHARGEMENT */}

            {loading ? (

              <tr>

                <td
                  colSpan="4"
                  className="empty-history"
                >

                  Chargement...

                </td>

              </tr>

            ) : reclamations.length > 0 ? (


              reclamations.map(
                (reclamation) => {


                  const confiance =
                    Number(
                      reclamation
                        .score_confiance ??
                      reclamation
                        .confiance ??
                      reclamation
                        .confidence ??
                      0
                    );


                  const confiancePourcentage =
                    confiance <= 1
                      ? confiance * 100
                      : confiance;


                  return (

                    <tr
                      key={
                        reclamation.id
                      }
                    >


                      {/* TEXTE */}

                      <td className="reclamation-text">

                        {reclamation.texte}

                      </td>


                      {/* CATÉGORIE */}

                      <td>

                        <span className="category-badge">

                          {
                            reclamation.categorie
                          }

                        </span>

                      </td>


                      {/* CONFIANCE */}

                      <td>

                        <strong>

                          {
                            confiancePourcentage
                              .toFixed(1)
                          }{" "}
                          %

                        </strong>

                      </td>


                      {/* DATE */}

                      <td className="date-cell">

                        {
                          formatDate(
                            reclamation.date
                          )
                        }

                      </td>


                    </tr>

                  );
                }
              )

            ) : (

              <tr>

                <td
                  colSpan="4"
                  className="empty-history"
                >

                  Aucune réclamation trouvée.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>



      {total > 0 &&
        totalPages > 0 && (

        <div className="pagination-container">


          {/* INFORMATIONS */}

          <div className="pagination-info">

            Affichage de{" "}
            {debut} à {fin}
            {" "}sur{" "}
            {total} résultats

          </div>


          {/* BOUTONS */}

          <div className="pagination">


            {/* PRÉCÉDENT */}

            <button
              type="button"

              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      page - 1,
                      1
                    )
                )
              }

              disabled={
                currentPage <= 1
              }
            >

              ← Précédent

            </button>


            {/* NUMÉROS DE PAGES */}

            {getPages().map(
              (
                page,
                index,
                pages
              ) => {


                const previousPage =
                  pages[index - 1];


                return (

                  <span key={page}>


                    {/* ... */}

                    {previousPage &&
                      page -
                        previousPage >
                        1 && (

                      <span className="pagination-dots">

                        ...

                      </span>

                    )}


                    {/* NUMÉRO */}

                    <button
                      type="button"

                      className={
                        currentPage ===
                        page

                          ? "page-button active"

                          : "page-button"
                      }

                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                    >

                      {page}

                    </button>


                  </span>

                );
              }
            )}


            {/* SUIVANT */}

            <button
              type="button"

              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      page + 1,
                      totalPages
                    )
                )
              }

              disabled={
                currentPage >=
                totalPages
              }
            >

              Suivant →

            </button>

          </div>

        </div>

      )}

    </div>
  );
}