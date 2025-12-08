import apiServiceInstance from "../config/axios.config";

export const get = async (uri, token, params) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        console.log('GET Request Headers:', headers);

        const res = await apiServiceInstance.get(uri, { headers, params });
        return res;
    } catch (error) {
        throw error;
    }
};

export const post = async (uri, data, token, isFormData = false) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
            console.log('POST Token used:', token.substring(0, 50) + '...');
        }
        
        // Thêm Content-Type nếu không phải FormData
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }
        
        console.log('POST Request to:', uri);
        console.log('POST Request Headers:', {
            ...headers,
            Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 57)}...` : 'None'
        });
        console.log('POST Request Body:', JSON.stringify(data, null, 2));
        
        const res = await apiServiceInstance.post(uri, data, { headers });
        console.log('POST Response:', res.data);
        return res.data; // Đảm bảo trả về res.data
    } catch (error) {
        console.error('POST Error:', error.response?.data || error.message);
        throw error;
    }
};

export const put = async (uri, data, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await apiServiceInstance.put(uri, data, { headers });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const del = async (uri, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await apiServiceInstance.delete(uri, { headers });
        return res.data;
    } catch (error) {
        throw error;
    }
};

export const patch = async (uri, data, token) => {
    try {
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const res = await apiServiceInstance.patch(uri, data, { headers });
        return res.data;
    } catch (error) {
        throw error;
    }
};

