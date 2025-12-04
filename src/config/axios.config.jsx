import axios from "axios";
import { API_CONFIG } from "./index";

const apiServiceInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.DEFAULT_HEADERS
});

apiServiceInstance.interceptors.request.use(
    config => {
        // Thêm headers mặc định vào mọi request
        config.headers = {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...config.headers
        };
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiServiceInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('Lỗi Response:', {
                status: error.response.status,
                data: error.response.data,
                message: error.message,
            });
        } else if (error.request) {
            console.error('Lỗi Request:', error.request);
        } else {
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiServiceInstance;
