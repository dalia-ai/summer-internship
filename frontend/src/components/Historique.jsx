import React, { useEffect, useState } from 'react';
import { fetchHistorique } from '../services/api';

const Historique = ({ refreshTrigger }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistorique(20, 0);
      setItems(data.reclamations || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const getScoreBadge = (score) => {
    const percent = Math.round(score * 100);
    if (percent >= 80) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 font-mono">{percent}%</span>;
    } else if (percent >= 50) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-mono">{percent}%</span>;
    } else {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 font-mono">{percent}%</span>;
    }
  };

  const getCategoryTag = (cat) => {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {cat}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historique des Réclamations 
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            le nombre total : <span className="font-semibold text-slate-700">{total}</span> réclamations
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          Chargement de l'historique...
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Aucune réclamation dans l'historique
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Réclamation</th>
                <th className="py-3 px-4">Catégorie Prédite</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                  
                  <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 max-w-md truncate font-medium" title={item.texte}>
                    {item.texte}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getCategoryTag(item.categorie)}
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    {getScoreBadge(item.score_confiance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Historique;
