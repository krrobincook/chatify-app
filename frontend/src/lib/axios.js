import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3001/api" : "https://chatify-app-cs49.onrender.com/api",
    withCredentials: true,
});