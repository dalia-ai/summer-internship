import { useEffect, useMemo, useState } from "react";
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
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    chargerStatistiques();
  }, []);

  const chargerStatistiques = async () => {
    try {
      setLoading(true);
      setError("");

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
      console.error(error);
      setError(
        "Impossible de charger les statistiques."
      );
      setReclamations([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TOTAL
  // ==========================================

  const totalReclamations = reclamations.length;

  // ==========================================
  // CONFIANCE MOYENNE
  // ==========================================

  const confianceMoyenne = useMemo(() => {
    if (reclamations.length === 0) {
      return 0;
    }

    const somme = reclamations.reduce(
      (total, reclamation) => {
        const score = Number(
          reclamation.score_confiance ?? 0
        );

        return total + score;
      },
      0
    );

    return (somme / reclamations.length) * 100;
  }, [reclamations]);

  // ==========================================
  // HAUTE / FAIBLE CONFIANCE
  // ==========================================

  const hauteConfiance = useMemo(() => {
    return reclamations.filter(
      (reclamation) =>
        Number(reclamation.score_confiance ?? 0) >= 0.5
    ).length;
  }, [reclamations]);

  const faibleConfiance = useMemo(() => {
    return reclamations.filter(
      (reclamation) =>
        Number(reclamation.score_confiance ?? 0) < 0.5
    ).length;
  }, [reclamations]);

  // ==========================================
  // NOMBRE PAR CATÉGORIE
  // ==========================================

  const statistiquesCategories = useMemo(() => {
    return categories
      .map((categorie) => {
        const total = reclamations.filter(
          (reclamation) =>
            reclamation.categorie === categorie
        ).length;

        return {
          categorie,
          total,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [reclamations]);

  const maximumCategorie = Math.max(
    ...statistiquesCategories.map(
      (item) => item.total
    ),
    1
  );

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

const evolutionParDate = useMemo(() => {
  const compteur = {};

  reclamations.forEach((reclamation) => {
    if (!reclamation.date) {
      return;
    }

    const date = String(
      reclamation.date
    ).slice(0, 10);

    compteur[date] =
      (compteur[date] || 0) + 1;
  });

  return Object.entries(compteur)
    .map(([date, total]) => ({
      date,
      total,
    }))
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    );
}, [reclamations]);

  // ==========================================
  // CATÉGORIE DOMINANTE
  // ==========================================

  const categorieDominante =
    statistiquesCategories.length > 0 &&
    statistiquesCategories[0].total > 0
      ? statistiquesCategories[0].categorie
      : "-";

  if (loading) {
    return (
      <div className="statistiques-container">
        <p>Chargement des statistiques...</p>
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

  return (
    <div className="statistiques-container">

      {/* HEADER */}
      <div className="statistiques-header">
        <h1>Statistiques des réclamations</h1>

        <p>
          Vue d'ensemble des réclamations analysées
          par le modèle.
        </p>
      </div>

      {/* KPI */}
      <div className="stats-cards">

        <div className="stats-card">
          <span className="stats-card-label">
            Total des réclamations
          </span>

          <strong className="stats-card-value">
            {totalReclamations}
          </strong>
        </div>

        <div className="stats-card">
          <span className="stats-card-label">
            Confiance moyenne
          </span>

          <strong className="stats-card-value">
            {confianceMoyenne.toFixed(1)} %
          </strong>
        </div>

        <div className="stats-card">
          <span className="stats-card-label">
            Confiance ≥ 50 %
          </span>

          <strong className="stats-card-value stats-green">
            {hauteConfiance}
          </strong>
        </div>

        <div className="stats-card">
          <span className="stats-card-label">
            Confiance &lt; 50 %
          </span>

          <strong className="stats-card-value stats-yellow">
            {faibleConfiance}
          </strong>
        </div>

      </div>

      {/* DEUXIÈME LIGNE */}
      <div className="stats-secondary">

        <div className="stats-small-card">
          <span>Catégorie la plus fréquente</span>

          <strong>
            {categorieDominante}
          </strong>
        </div>

      </div>

      {/* CATÉGORIES */}
      <div className="stats-section">

        <div className="stats-section-header">
          <div>
            <h2>Réclamations par catégorie</h2>

            <p>
              Répartition des réclamations parmi les
              10 catégories bancaires.
            </p>
          </div>
        </div>

        <div className="categories-stats">

          {statistiquesCategories.map((item) => {
            const pourcentage =
              maximumCategorie > 0
                ? (item.total /
                    maximumCategorie) *
                  100
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
                      width: `${pourcentage}%`,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>
      </div>

      {/* CONFIANCE */}
      <div className="stats-section">

        <div className="stats-section-header">
          <div>
            <h2>Niveaux de confiance</h2>

            <p>
              Répartition des classifications selon
              leur score de confiance.
            </p>
          </div>
        </div>

        <div className="confidence-summary">

          <div className="confidence-item">
            <div>
              <span className="confidence-dot confidence-good" />

              <span>
                Score supérieur ou égal à 50 %
              </span>
            </div>

            <strong>
              {hauteConfiance}
            </strong>
          </div>

          <div className="confidence-item">
            <div>
              <span className="confidence-dot confidence-low" />

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

  {/* BAR CHART */}
  <div className="chart-card">

    <div className="chart-header">
      <h2>Réclamations par catégorie</h2>

      <p>
        Nombre de réclamations classées dans chaque
        catégorie.
      </p>
    </div>

    <div className="chart-container">
      <ResponsiveContainer
        width="100%"
        height={350}
      >
        <BarChart
          data={statistiquesCategories}
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
            radius={[6, 6, 0, 0]}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>


  {/* DONUT */}
  <div className="chart-card">

    <div className="chart-header">
      <h2>Niveau de confiance</h2>

      <p>
        Répartition des prédictions selon le seuil
        de 50 %.
      </p>
    </div>

    <div className="chart-container">

      <ResponsiveContainer
        width="100%"
        height={350}
      >

        <PieChart>

          <Pie
            data={donneesConfiance}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={110}
            paddingAngle={4}
          >

            <Cell fill="#22c55e" />
            <Cell fill="#eab308" />

          </Pie>

          <Tooltip />

          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>

</div>

<div className="chart-card evolution-chart">

  <div className="chart-header">

    <h2>
      Évolution des réclamations
    </h2>

    <p>
      Nombre de réclamations analysées par date.
    </p>

  </div>

  <div className="chart-container">

    <ResponsiveContainer
      width="100%"
      height={350}
    >

      <LineChart
        data={evolutionParDate}
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

  </div>

</div>
      </div>

    </div>
  );
}