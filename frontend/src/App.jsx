import React, { useState } from 'react';
import FormulaireReclamation from './components/FormulaireReclamation';
import ResultatClassification from './components/ResultatClassification';
import Historique from './components/Historique';

function App() {
  const [dernierResultat, setDernierResultat] = useState(null);
  const [refreshHistoriqueCounter, setRefreshHistoriqueCounter] = useState(0);

  const handleClassificationSuccess = (resultat) => {
    setDernierResultat(resultat);
    // Incrémente le compteur pour forcer le rafraîchissement automatique de l'historique
    setRefreshHistoriqueCounter((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Header bancaire */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
              B
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">
                Smart Bank 
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Classification automatique de réclamations bancaires
              </p>
            </div>
          </div>

         
        </div>
      </header>

      {/* Zone de contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Formulaire de saisie */}
          <div>
            <FormulaireReclamation onClassificationSuccess={handleClassificationSuccess} />
          </div>

          {/* Résultat de prédiction */}
          <div>
            <ResultatClassification resultat={dernierResultat} />
          </div>
        </div>

        {/* Tableau d'historique */}
        <Historique refreshTrigger={refreshHistoriqueCounter} />
      </main>
    </div>
  );
}

export default App;
