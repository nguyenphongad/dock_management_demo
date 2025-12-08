import axios from "axios";
import { API_CONFIG } from "./index";

const apiServiceInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    headers: API_CONFIG.DEFAULT_HEADERS
});

apiServiceInstance.interceptors.request.use(
    config => {
        // Merge headers - ưu tiên headers từ request
        config.headers = {
            ...API_CONFIG.DEFAULT_HEADERS,
            ...config.headers
        };
        
        console.log('Request URL:', config.baseURL + config.url);
        console.log('Request Headers:', {
            ...config.headers,
            Authorization: config.headers.Authorization ? 
                `Bearer ${config.headers.Authorization.substring(7, 57)}...` : 'None'
        });
        
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

apiServiceInstance.interceptors.response.use(
    response => {
        console.log('Response Status:', response.status);
        return response;
    },
    error => {
        if (error.response) {
            console.error('Lỗi Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                message: error.message,
            });
        } else if (error.request) {
            console.error('Lỗi Request (không nhận được response):', error.request);
        } else {
            console.error('Lỗi:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiServiceInstance;
