import axios from "axios";

export const axiosinstance = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:3001/api" : "/api",
    withCredentials: true,
});