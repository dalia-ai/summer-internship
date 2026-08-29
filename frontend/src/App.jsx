import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import FormulaireReclamation from "./components/FormulaireReclamation";
import ResultatClassification from "./components/ResultatClassification";
import Historique from "./components/Historique";
import Statistiques from "./components/Statistiques";
import ImportBatch from "./components/ImportBatch";

function App() {
  const [dernierResultat, setDernierResultat] = useState(null);

  const [
    refreshHistoriqueCounter,
    setRefreshHistoriqueCounter,
  ] = useState(0);

  const handleClassificationSuccess = (resultat) => {
    setDernierResultat(resultat);

    // Rafraîchir automatiquement l'historique
    setRefreshHistoriqueCounter((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">

        {/* HEADER */}
        <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 flex items-center justify-between">

            {/* LOGO */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
                B
              </div>

              <div>
                <h1 className="font-bold text-base tracking-tight text-white leading-none">
                  Smart Bank
                </h1>

                <p className="text-xs text-slate-400 font-medium mt-1">
                  Classification automatique de réclamations bancaires
                </p>
              </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex items-center gap-2">

              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                Accueil
              </NavLink>

              <NavLink
                to="/statistiques"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                Statistiques
              </NavLink>

              

              <NavLink
  to="/import"
  className={({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`
  }
>
  Import 
</NavLink>

            </nav>

          </div>
        </header>

        {/* CONTENU */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

          <Routes>

            {/* PAGE ACCUEIL */}
            <Route
              path="/"
              element={
                <>
                  {/* FORMULAIRE + RESULTAT */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    <div>
                      <FormulaireReclamation
                        onClassificationSuccess={
                          handleClassificationSuccess
                        }
                      />
                    </div>

                    <div>
                      <ResultatClassification
                        resultat={dernierResultat}
                      />
                    </div>

                  </div>

                  {/* HISTORIQUE SUR LA PAGE ACCUEIL */}
                  <div className="mt-10">
                    <Historique
                      refreshTrigger={
                        refreshHistoriqueCounter
                      }
                    />
                  </div>
                </>
              }
            />

            {/* PAGE STATISTIQUES */}
            <Route
              path="/statistiques"
              element={<Statistiques />}
            />

            {/* PAGE IMPORT */}
            <Route
              path="/import"
              element={<ImportBatch />}
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;