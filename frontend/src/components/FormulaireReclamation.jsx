import React, { useState } from 'react';
import { classerReclamation } from '../services/api';


const FormulaireReclamation = ({ onClassificationSuccess }) => {
  const [texte, setTexte] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [langue, setLangue] = useState("fr");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!texte.trim()) {
      setError('Veuillez saisir le texte de la réclamation avant de valider.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultat = await classerReclamation(
  texte,
  langue
);
      onClassificationSuccess(resultat);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setTexte('');
    setError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Saisir une Réclamation
        </h2>
        
      </div>


      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-4">
  <button
    type="button"
    onClick={() => setLangue("fr")}
    className={`px-4 py-2 rounded-lg font-medium border ${
      langue === "fr"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-slate-700 border-slate-300"
    }`}
  >
    Français
  </button>

  <button
    type="button"
    onClick={() => setLangue("ar")}
    className={`px-4 py-2 rounded-lg font-medium border ${
      langue === "ar"
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-slate-700 border-slate-300"
    }`}
  >
    العربية
  </button>
</div>
          <textarea
  rows="5"
  value={texte}
  dir={langue === "ar" ? "rtl" : "ltr"}
  lang={langue}
  onChange={(e) => {
    setTexte(e.target.value);
    if (error) {
      setError(null);
    }
  }}
  placeholder={
    langue === "ar"
      ? "اكتب شكواك المصرفية هنا..."
      : "Saisissez votre réclamation..."
  }
  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 text-sm placeholder-slate-400 outline-none transition-all resize-none shadow-inner bg-slate-50/50"
  disabled={loading}
/>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || !texte}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Effacer
          </button>

          <button
            type="submit"
            disabled={loading || !texte.trim()}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyse en cours..
              </>
            ) : (
              <>
                Classer la réclamation
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormulaireReclamation;
