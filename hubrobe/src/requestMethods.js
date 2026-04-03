import axios from "axios";

const BASE_URL = "https://final-project-ang9.onrender.com/api/";

// Pour les requêtes publiques (produits, etc.)
export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Ajouter un intercepteur pour injecter le token dynamiquement
userRequest.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const TOKEN = user?.accessToken;
  if (TOKEN) {
    config.headers.token = `Bearer ${TOKEN}`;
  }
  return config;
});
