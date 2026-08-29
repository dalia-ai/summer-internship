import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});


export const classerReclamation = async (texte, langue) => {
  try {

    console.log("Texte envoyé :", texte);
    console.log("Langue envoyée :", langue);

    const response = await api.post(
      '/classer',
      {
        texte: texte,
        langue: langue
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "Réponse FastAPI :",
      error.response?.data
    );

    if (error.response) {

      const detail = error.response.data?.detail;

      if (typeof detail === 'string') {
        throw new Error(detail);
      }

      if (Array.isArray(detail)) {
        throw new Error(
          detail
            .map((item) => item.msg)
            .join(' | ')
        );
      }

      throw new Error(
        'Erreur lors de la classification.'
      );
    }

    if (error.request) {
      throw new Error(
        'Impossible de contacter FastAPI.'
      );
    }

    throw new Error(
      error.message ||
      'Erreur inattendue.'
    );
  }
};


export const fetchHistorique = async (
  limit = 20,
  offset = 0
) => {

  try {

    const response = await api.get(
      '/historique',
      {
        params: {
          limit,
          offset
        }
      }
    );

    return response.data;

  } catch (error) {

    if (error.response) {
      throw new Error(
        error.response.data.detail ||
        "Erreur lors de la récupération de l'historique."
      );
    }

    if (error.request) {
      throw new Error(
        'Impossible de contacter le backend.'
      );
    }

    throw new Error(
      error.message ||
      "Erreur lors du chargement de l'historique."
    );
  }
};


export default api;