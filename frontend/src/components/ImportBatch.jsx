import { useState } from "react";
import * as XLSX from "xlsx";
import "./ImportBatch.css";


export default function ImportBatch() {

  // =========================================================
  // STATES
  // =========================================================

  const [fichier, setFichier] = useState(null);

  const [donnees, setDonnees] = useState([]);

  const [colonnes, setColonnes] = useState([]);

  const [colonneTexte, setColonneTexte] =
    useState("");

  // Langue sélectionnée pour tout le fichier importé
  const [langue, setLangue] = useState("fr");

  const [erreur, setErreur] = useState("");

  const [resultats, setResultats] = useState([]);

  const [
    classificationEnCours,
    setClassificationEnCours,
  ] = useState(false);

  const [progression, setProgression] =
    useState(0);

  const [
    erreurClassification,
    setErreurClassification,
  ] = useState("");


  // =========================================================
  // CHANGEMENT DE LANGUE
  // =========================================================

  const changerLangue = (nouvelleLangue) => {

    setLangue(nouvelleLangue);

    // Supprimer les résultats calculés avec l'ancienne langue
    setResultats([]);

    setProgression(0);

    setErreurClassification("");
  };


  // =========================================================
  // IMPORT DU FICHIER
  // =========================================================

  const handleFileChange = async (event) => {

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }


    // Réinitialisation
    setErreur("");

    setFichier(null);

    setDonnees([]);

    setColonnes([]);

    setColonneTexte("");

    setResultats([]);

    setProgression(0);

    setErreurClassification("");

    setClassificationEnCours(false);


    // Vérifier l'extension
    const extension =
      selectedFile.name
        .split(".")
        .pop()
        ?.toLowerCase();


    if (
      !["csv", "xls", "xlsx"].includes(extension)
    ) {

      setErreur(
        "Format non supporté. Utilisez un fichier CSV, XLS ou XLSX."
      );

      return;
    }


    try {

      // Lecture du fichier
      const buffer =
        await selectedFile.arrayBuffer();


      const workbook =
        XLSX.read(
          buffer,
          {
            type: "array",
          }
        );


      // Première feuille Excel
      const nomPremiereFeuille =
        workbook.SheetNames[0];


      const feuille =
        workbook.Sheets[
          nomPremiereFeuille
        ];


      // Conversion vers JSON
      const lignes =
        XLSX.utils.sheet_to_json(
          feuille,
          {
            defval: "",
          }
        );


      if (lignes.length === 0) {

        setErreur(
          "Le fichier ne contient aucune donnée."
        );

        return;
      }


      // Colonnes disponibles
      const nomsColonnes =
        Object.keys(lignes[0]);


      setFichier(selectedFile);

      setDonnees(lignes);

      setColonnes(nomsColonnes);


      // Détection automatique de la colonne texte
      const colonneDetectee =
        nomsColonnes.find(
          (nom) => {

            const normalise =
              nom
                .trim()
                .toLowerCase();

            return [
              "reclamation",
              "réclamation",
              "texte",
              "text",
              "description",
            ].includes(normalise);
          }
        );


      setColonneTexte(
        colonneDetectee ||
        nomsColonnes[0]
      );

    } catch (error) {

      console.error(
        "Erreur lecture fichier :",
        error
      );

      setErreur(
        "Impossible de lire le fichier sélectionné."
      );
    }
  };


  // =========================================================
  // LIGNES VALIDES
  // =========================================================

  const lignesValides =
    donnees.filter((ligne) => {

      if (!colonneTexte) {
        return false;
      }

      const texte =
        String(
          ligne[colonneTexte] ?? ""
        ).trim();

      return texte !== "";
    });


  // =========================================================
  // CLASSIFICATION EN LOT
  // =========================================================

  const classifierToutesLesReclamations =
    async () => {

      if (
        lignesValides.length === 0
      ) {
        return;
      }


      setClassificationEnCours(true);

      setProgression(0);

      setResultats([]);

      setErreurClassification("");


      const nouveauxResultats = [];


      try {

        for (
          let i = 0;
          i < lignesValides.length;
          i++
        ) {

          const texte =
            String(
              lignesValides[i][
                colonneTexte
              ]
            ).trim();


          // =================================================
          // APPEL FASTAPI
          // =================================================

          const response =
            await fetch(
              "http://127.0.0.1:8000/classer",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  texte,
                  langue,
                }),
              }
            );


          if (!response.ok) {

            const message =
              await response.text();

            throw new Error(
              `Erreur ligne ${
                i + 1
              } : HTTP ${
                response.status
              } ${message}`
            );
          }


          const data =
            await response.json();


          // Catégorie
          const categorie =
            data.categorie ??
            data.prediction ??
            data.category ??
            "-";


          // Score
          const score =
            Number(
              data.score_confiance ??
              data.confiance ??
              data.confidence ??
              data.score ??
              0
            );


          // Statut
          const statut =
            data.statut ??
            "-";


          // Ajouter le résultat
          nouveauxResultats.push({
            texte,
            langue,
            categorie,
            score,
            statut,
          });


          // Mise à jour du tableau
          setResultats([
            ...nouveauxResultats,
          ]);


          // Progression
          const progressionActuelle =
            Math.round(
              ((i + 1) /
                lignesValides.length) *
              100
            );


          setProgression(
            progressionActuelle
          );
        }

    } catch (error) {

        console.error(
          "Erreur classification :",
          error
        );

        setErreurClassification(
          error.message ||
          "Une erreur est survenue pendant la classification."
        );

      } finally {

        setClassificationEnCours(
          false
        );
      }
    };


  // =========================================================
  // LABEL LANGUE
  // =========================================================

  const getLangueLabel = (code) => {

    if (code === "fr") {
      return "Français";
    }

    if (code === "ar") {
      return "العربية";
    }

    if (code === "en") {
      return "English";
    }

    return code;
  };


  // =========================================================
  // AFFICHAGE
  // =========================================================

  return (

    <div className="import-batch-container">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="import-batch-header">

        <h1>
          Classification en lot
        </h1>

        <p>
          Importez un fichier CSV ou Excel
          contenant plusieurs réclamations
          bancaires.
        </p>

      </div>


      {/* =====================================================
          ÉTAPE 1 : IMPORT
      ===================================================== */}

      <div className="import-card">

        <div className="import-card-header">

          <div className="step-number">
            1
          </div>

          <div>

            <h2>
              Importer un fichier
            </h2>

            <p>
              Formats acceptés :
              CSV, XLS et XLSX
            </p>

          </div>

        </div>


        <label className="upload-zone">

          <div className="upload-icon">
            ↑
          </div>

          <strong>
            Sélectionner un fichier
          </strong>

          <span>
            Cliquez ici pour parcourir vos fichiers
          </span>

          <input
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileChange}
            hidden
          />

        </label>


        {/* ERREUR IMPORT */}

        {erreur && (

          <div className="import-error">
            {erreur}
          </div>

        )}


        {/* FICHIER SÉLECTIONNÉ */}

        {fichier && (

          <div className="selected-file">

            <div>

              <strong>
                {fichier.name}
              </strong>

              <span>

                {(
                  fichier.size /
                  1024
                ).toFixed(1)}{" "}
                Ko

              </span>

            </div>


            <div className="file-lines">

              {donnees.length} ligne

              {donnees.length > 1
                ? "s"
                : ""}

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          ÉTAPE 2 : COLONNE
      ===================================================== */}

      {donnees.length > 0 && (

        <div className="import-card">

          <div className="import-card-header">

            <div className="step-number">
              2
            </div>

            <div>

              <h2>
                Sélectionner la colonne
              </h2>

              <p>
                Choisissez la colonne contenant
                le texte des réclamations.
              </p>

            </div>

          </div>


          <div className="column-selector">

            <label>
              Colonne des réclamations
            </label>

            <select
              value={colonneTexte}

              onChange={(event) => {

                setColonneTexte(
                  event.target.value
                );

                setResultats([]);

                setProgression(0);

                setErreurClassification(
                  ""
                );
              }}
            >

              {colonnes.map(
                (colonne) => (

                  <option
                    key={colonne}
                    value={colonne}
                  >
                    {colonne}
                  </option>

                )
              )}

            </select>

          </div>

        </div>

      )}


      {/* =====================================================
          ÉTAPE 3 : LANGUE
      ===================================================== */}

      {donnees.length > 0 && (

        <div className="import-card">

          <div className="import-card-header">

            <div className="step-number">
              3
            </div>

            <div>

              <h2>
                Sélectionner la langue
              </h2>

              <p>
                Choisissez la langue des
                réclamations contenues dans
                le fichier.
              </p>

            </div>

          </div>


          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >

            {/* FR */}

            <button
              type="button"
              onClick={() =>
                changerLangue("fr")
              }
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border:
                  langue === "fr"
                    ? "1px solid #2563eb"
                    : "1px solid #cbd5e1",
                background:
                  langue === "fr"
                    ? "#2563eb"
                    : "#ffffff",
                color:
                  langue === "fr"
                    ? "#ffffff"
                    : "#334155",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Français
            </button>


            {/* AR */}

            <button
              type="button"
              onClick={() =>
                changerLangue("ar")
              }
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border:
                  langue === "ar"
                    ? "1px solid #2563eb"
                    : "1px solid #cbd5e1",
                background:
                  langue === "ar"
                    ? "#2563eb"
                    : "#ffffff",
                color:
                  langue === "ar"
                    ? "#ffffff"
                    : "#334155",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              العربية
            </button>


            {/* EN */}

            <button
              type="button"
              onClick={() =>
                changerLangue("en")
              }
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border:
                  langue === "en"
                    ? "1px solid #2563eb"
                    : "1px solid #cbd5e1",
                background:
                  langue === "en"
                    ? "#2563eb"
                    : "#ffffff",
                color:
                  langue === "en"
                    ? "#ffffff"
                    : "#334155",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              English
            </button>

          </div>


          <div
            style={{
              marginTop: "14px",
              fontSize: "14px",
              color: "#64748b",
            }}
          >

            Langue sélectionnée :{" "}

            <strong>
              {getLangueLabel(langue)}
            </strong>

          </div>

        </div>

      )}


      {/* =====================================================
          ÉTAPE 4 : APERÇU
      ===================================================== */}

      {lignesValides.length > 0 && (

        <div className="import-card">

          <div className="import-card-header">

            <div className="step-number">
              4
            </div>

            <div>

              <h2>
                Aperçu des réclamations
              </h2>

              <p>

                {lignesValides.length}{" "}

                réclamation

                {lignesValides.length > 1
                  ? "s"
                  : ""}{" "}

                détectée

                {lignesValides.length > 1
                  ? "s"
                  : ""}

              </p>

            </div>

          </div>


          <div className="preview-table-wrapper">

            <table className="preview-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Réclamation
                  </th>

                </tr>

              </thead>


              <tbody>

                {lignesValides
                  .slice(
                    0,
                    10
                  )
                  .map(
                    (
                      ligne,
                      index
                    ) => (

                      <tr key={index}>

                        <td>
                          {index + 1}
                        </td>

                        <td
                          dir={
                            langue === "ar"
                              ? "rtl"
                              : "ltr"
                          }
                        >
                          {String(
                            ligne[
                              colonneTexte
                            ]
                          )}
                        </td>

                      </tr>

                    )
                  )}

              </tbody>

            </table>

          </div>


          {lignesValides.length > 10 && (

            <div className="preview-information">

              Aperçu limité aux 10 premières
              réclamations sur{" "}
              {lignesValides.length}.

            </div>

          )}


          {/* ACTION */}

          <div className="batch-actions">

            <span>

              {lignesValides.length}{" "}

              réclamation

              {lignesValides.length > 1
                ? "s"
                : ""}{" "}

              prête

              {lignesValides.length > 1
                ? "s"
                : ""}{" "}

              pour la classification.

            </span>


            <button
              type="button"
              className="batch-classify-button"
              onClick={
                classifierToutesLesReclamations
              }
              disabled={
                classificationEnCours
              }
            >

              {classificationEnCours
                ? `Classification... ${progression} %`
                : `Classifier les ${lignesValides.length} réclamations`
              }

            </button>

          </div>


          {/* PROGRESSION */}

          {classificationEnCours && (

            <div className="batch-progress">

              <div className="batch-progress-info">

                <span>
                  Classification en cours...
                </span>

                <strong>
                  {progression} %
                </strong>

              </div>


              <div className="batch-progress-track">

                <div
                  className="batch-progress-bar"
                  style={{
                    width:
                      `${progression}%`,
                  }}
                />

              </div>

            </div>

          )}


          {/* ERREUR CLASSIFICATION */}

          {erreurClassification && (

            <div className="import-error">

              {erreurClassification}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          ÉTAPE 5 : RÉSULTATS
      ===================================================== */}

      {resultats.length > 0 && (

        <div className="import-card">

          <div className="import-card-header">

            <div className="step-number">
              5
            </div>

            <div>

              <h2>
                Résultats de classification
              </h2>

              <p>

                {resultats.length}{" "}

                réclamation

                {resultats.length > 1
                  ? "s"
                  : ""}{" "}

                classifiée

                {resultats.length > 1
                  ? "s"
                  : ""}

              </p>

            </div>

          </div>


          <div className="preview-table-wrapper">

            <table className="preview-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Réclamation
                  </th>

                  <th>
                    Langue
                  </th>

                  <th>
                    Catégorie
                  </th>

                  <th>
                    Confiance
                  </th>

                  <th>
                    Statut
                  </th>

                </tr>

              </thead>


              <tbody>

                {resultats.map(
                  (
                    resultat,
                    index
                  ) => {

                    const score =
                      resultat.score <= 1
                        ? resultat.score * 100
                        : resultat.score;


                    return (

                      <tr key={index}>

                        <td>
                          {index + 1}
                        </td>


                        <td
                          dir={
                            resultat.langue === "ar"
                              ? "rtl"
                              : "ltr"
                          }
                        >
                          {resultat.texte}
                        </td>


                        <td>
                          {getLangueLabel(
                            resultat.langue
                          )}
                        </td>


                        <td>

                          <span className="category-badge">

                            {
                              resultat.categorie
                            }

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              score >= 50
                                ? "score-badge score-success"
                                : "score-badge score-warning"
                            }
                          >

                            {score.toFixed(1)} %

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              resultat.statut === "confiant"
                                ? "score-badge score-success"
                                : "score-badge score-warning"
                            }
                          >

                            {resultat.statut}

                          </span>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}