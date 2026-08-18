import axios from 'axios';

// URL de base de l'API FastAPI (développement local)
const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 secondes
});

/**
 * Envoie un texte de réclamation à classer au backend FastAPI.
 * @param {string} texte - Le texte saisi par l'utilisateur
 * @returns {Promise<{id: number, texte: string, categorie: string, score_confiance: number, date: string}>}
 */
export const classerReclamation = async (texte) => {
  try {
    const response = await api.post('/classer', { texte });
    return response.data;
  } catch (error) {
    if (error.response) {
      // L'API a répondu avec un code d'erreur (4xx, 5xx)
      throw new Error(error.response.data.detail || 'Erreur lors de la classification de la réclamation.');
    } else if (error.request) {
      // La requête a été émise mais pas de réponse (ex. API éteinte)
      throw new Error("Impossible de contacter le serveur backend API (FastAPI). Vérifiez qu'il est bien démarré sur http://127.0.0.1:8000.");
    } else {
      throw new Error(error.message || 'Une erreur inattendue est survenue.');
    }
  }
};

/**
 * Récupère l'historique des dernières réclamations classées.
 * @param {number} limit - Nombre d'éléments (default: 20)
 * @param {number} offset - Décalage (default: 0)
 * @returns {Promise<{total: number, reclamations: Array}>}
 */
export const fetchHistorique = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/historique', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Erreur lors de la récupération de l'historique.");
    } else if (error.request) {
      throw new Error("Impossible de contacter le serveur backend API (FastAPI).");
    } else {
      throw new Error(error.message || "Erreur lors du chargement de l'historique.");
    }
  }
};

export default api;
