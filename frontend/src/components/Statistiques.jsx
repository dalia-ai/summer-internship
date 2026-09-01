import { useEffect, useState } from "react";
import "./Statistiques.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";


export default function Statistiques() {

  const [statistiques, setStatistiques] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    chargerStatistiques();

  }, []);


  const chargerStatistiques = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/statistiques"
      );


      if (!response.ok) {

        throw new Error(
          `HTTP ${response.status}`
        );
      }


      const data =
        await response.json();


      console.log(
        "Statistiques reçues du backend :",
        data
      );


      setStatistiques(data);

    } catch (error) {

      console.error(
        "Erreur statistiques :",
        error
      );


      setError(
        "Impossible de charger les statistiques."
      );

    } finally {

      setLoading(false);
    }
  };


  if (loading) {

    return (

      <div className="statistiques-container">

        <p>
          Chargement des statistiques...
        </p>

      </div>
    );
  }


  if (error) {

    return (

      <div className="statistiques-container">

        <p className="stats-error">
          {error}
        </p>

      </div>
    );
  }


  if (!statistiques) {

    return (

      <div className="statistiques-container">

        <p>
          Aucune statistique disponible.
        </p>

      </div>
    );
  }


  const totalReclamations =
    Number(
      statistiques.total ?? 0
    );


  const confianceBackend =
    Number(
      statistiques.confiance_moyenne ?? 0
    );

  const confianceMoyenne =
    confianceBackend <= 1
      ? confianceBackend * 100
      : confianceBackend;




  const statistiquesStatut =
    Array.isArray(
      statistiques.par_statut
    )
      ? statistiques.par_statut
      : [];




  const hauteConfianceObjet =
    statistiquesStatut.find(
      (item) =>
        item.statut === "confiant"
    );


  const hauteConfiance =
    Number(
      hauteConfianceObjet?.nombre ??
      hauteConfianceObjet?.total ??
      0
    );


  const faibleConfiance =
    statistiquesStatut
      .filter(
        (item) =>
          item.statut !== "confiant"
      )
      .reduce(
        (somme, item) => {

          return (
            somme +
            Number(
              item.nombre ??
              item.total ??
              0
            )
          );
        },
        0
      );




  const statistiquesCategories =
    (
      Array.isArray(
        statistiques.par_categorie
      )
        ? statistiques.par_categorie
        : []
    )
      .map(
        (item) => ({

          categorie:
            item.categorie ?? "-",

          total:
            Number(
              item.nombre ??
              item.total ??
              0
            ),

        })
      )
      .sort(
        (a, b) =>
          b.total - a.total
      );


  const maximumCategorie =
    Math.max(
      ...statistiquesCategories.map(
        (item) =>
          item.total
      ),
      1
    );



  const categorieDominante =
    statistiquesCategories.length > 0 &&
    statistiquesCategories[0].total > 0
      ? statistiquesCategories[0].categorie
      : "-";


  const donneesConfiance = [

    {
      name: "≥ 50 %",
      value: hauteConfiance,
    },

    {
      name: "< 50 %",
      value: faibleConfiance,
    },

  ];



  const evolutionParDate =
    (
      Array.isArray(
        statistiques.par_date
      )
        ? statistiques.par_date
        : []
    )
      .map(
        (item) => ({

          date:
            item.date,

          total:
            Number(
              item.nombre ??
              item.total ??
              0
            ),

        })
      )
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );


  return (

    <div className="statistiques-container">


      <div className="statistiques-header">

        <h1>
          Statistiques des réclamations
        </h1>

        <p>
          Vue d'ensemble des réclamations analysées
          par le modèle.
        </p>

      </div>


     

      <div className="stats-cards">


     
        <div className="stats-card">

          <span className="stats-card-label">

            Total des réclamations

          </span>

          <strong className="stats-card-value">

            {totalReclamations}

          </strong>

        </div>


        {/* CONFIANCE MOYENNE */}

        <div className="stats-card">

          <span className="stats-card-label">

            Confiance moyenne

          </span>

          <strong className="stats-card-value">

            {confianceMoyenne.toFixed(1)} %

          </strong>

        </div>


        {/* HAUTE CONFIANCE */}

        <div className="stats-card">

          <span className="stats-card-label">

            Confiance ≥ 50 %

          </span>

          <strong
            className="
              stats-card-value
              stats-green
            "
          >

            {hauteConfiance}

          </strong>

        </div>


        {/* FAIBLE CONFIANCE */}

        <div className="stats-card">

          <span className="stats-card-label">

            Confiance &lt; 50 %

          </span>

          <strong
            className="
              stats-card-value
              stats-yellow
            "
          >

            {faibleConfiance}

          </strong>

        </div>

      </div>


     

      <div className="stats-secondary">

        <div className="stats-small-card">

          <span>
            Catégorie la plus fréquente
          </span>

          <strong>
            {categorieDominante}
          </strong>

        </div>

      </div>


   


      <div className="stats-section">


        <div className="stats-section-header">

          <div>

            <h2>
              Réclamations par catégorie
            </h2>

            <p>
              Répartition des réclamations
              parmi les catégories bancaires.
            </p>

          </div>

        </div>


        <div className="categories-stats">


          {statistiquesCategories.length === 0 ? (

            <p>
              Aucune donnée disponible.
            </p>

          ) : (

            statistiquesCategories.map(
              (item) => {


                const pourcentage =
                  maximumCategorie > 0
                    ? (
                        item.total /
                        maximumCategorie
                      ) * 100
                    : 0;


                return (

                  <div
                    className="category-stat-row"
                    key={item.categorie}
                  >


                    <div className="category-stat-header">

                      <span className="category-stat-name">

                        {item.categorie}

                      </span>

                      <strong>

                        {item.total}

                      </strong>

                    </div>


                    <div className="category-stat-track">

                      <div
                        className="category-stat-bar"

                        style={{
                          width:
                            `${pourcentage}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

      </div>




      <div className="stats-section">


        <div className="stats-section-header">

          <div>

            <h2>
              Niveaux de confiance
            </h2>

            <p>
              Répartition des classifications
              selon leur score de confiance.
            </p>

          </div>

        </div>


        <div className="confidence-summary">


          {/* >= 50 */}

          <div className="confidence-item">

            <div>

              <span
                className="
                  confidence-dot
                  confidence-good
                "
              />

              <span>
                Score supérieur ou égal
                à 50 %
              </span>

            </div>

            <strong>
              {hauteConfiance}
            </strong>

          </div>


          {/* < 50 */}

          <div className="confidence-item">

            <div>

              <span
                className="
                  confidence-dot
                  confidence-low
                "
              />

              <span>
                Score inférieur à 50 %
              </span>

            </div>

            <strong>
              {faibleConfiance}
            </strong>

          </div>

        </div>




        <div className="stats-charts-grid">



          <div className="chart-card">


            <div className="chart-header">

              <h2>
                Réclamations par catégorie
              </h2>

              <p>
                Nombre de réclamations
                classées dans chaque catégorie.
              </p>

            </div>


            <div className="chart-container">


              {statistiquesCategories.length === 0 ? (

                <p>
                  Aucune donnée disponible.
                </p>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <BarChart
                    data={
                      statistiquesCategories
                    }

                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 70,
                    }}
                  >


                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />


                    <XAxis
                      dataKey="categorie"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      height={100}

                      tick={{
                        fontSize: 11,
                      }}
                    />


                    <YAxis
                      allowDecimals={false}
                    />


                    <Tooltip />


                    <Bar
                      dataKey="total"
                      fill="#2563eb"

                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />


                  </BarChart>

                </ResponsiveContainer>

              )}

            </div>

          </div>


         
    

          <div className="chart-card">


            <div className="chart-header">

              <h2>
                Niveau de confiance
              </h2>

              <p>
                Répartition des prédictions
                selon le seuil de 50 %.
              </p>

            </div>


            <div className="chart-container">


              {totalReclamations === 0 ? (

                <p>
                  Aucune donnée disponible.
                </p>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height={350}
                >

                  <PieChart>


                    <Pie
                      data={
                        donneesConfiance
                      }

                      dataKey="value"
                      nameKey="name"

                      cx="50%"
                      cy="50%"

                      innerRadius={75}
                      outerRadius={110}

                      paddingAngle={4}
                    >


                      <Cell
                        fill="#22c55e"
                      />

                      <Cell
                        fill="#eab308"
                      />


                    </Pie>


                    <Tooltip />

                    <Legend />


                  </PieChart>

                </ResponsiveContainer>

              )}

            </div>

          </div>

        </div>




        <div className="chart-card evolution-chart">


          <div className="chart-header">

            <h2>
              Évolution des réclamations
            </h2>

            <p>
              Nombre de réclamations
              analysées par date.
            </p>

          </div>


          <div className="chart-container">


            {evolutionParDate.length === 0 ? (

              <p>
                Aucune donnée d'évolution
                disponible.
              </p>

            ) : (

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <LineChart
                  data={
                    evolutionParDate
                  }

                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 20,
                  }}
                >


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="date"

                    tick={{
                      fontSize: 12,
                    }}
                  />


                  <YAxis
                    allowDecimals={false}
                  />


                  <Tooltip />


                  <Line
                    type="monotone"

                    dataKey="total"

                    stroke="#2563eb"

                    strokeWidth={3}

                    dot={{
                      r: 4,
                    }}

                    activeDot={{
                      r: 6,
                    }}
                  />


                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}