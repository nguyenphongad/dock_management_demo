// Cấu hình mới sử dụng API Gateway
export const GATEWAY_PORT = 5000;
export const GATEWAY_URL = `http://localhost:${GATEWAY_PORT}`;

// Đường dẫn cho các service qua gateway
export const SERVICE_PATHS = {
    AUTH_SERVICE: 'api/',
};

// API Configuration cho Dock Management - Sử dụng biến môi trường
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api-stm-prod.smartlogvn.com',
    ENDPOINTS: {
        DOCK_REGISTER_LIST: import.meta.env.VITE_API_ENDPOINT || '/api/MON/MONOPS_DockRegister_List'
    },
    DEFAULT_HEADERS: {
        'accept': import.meta.env.VITE_HEADER_ACCEPT || 'application/json, text/plain, */*',
        'accept-language': import.meta.env.VITE_HEADER_ACCEPT_LANGUAGE || 'vi-VN',
        'content-type': import.meta.env.VITE_HEADER_CONTENT_TYPE || 'application/json; charset=UTF-8',
        'd': import.meta.env.VITE_HEADER_DOMAIN || 'mondelez.smartlogvn.com',
        'functionid': import.meta.env.VITE_HEADER_FUNCTION_ID || '313',
        'listactioncode': import.meta.env.VITE_HEADER_LIST_ACTION_CODE || 'ActEdit,ActDel,ViewAdmin,ActAdd,ActOPS,ActExcel',
        'methodid': import.meta.env.VITE_HEADER_METHOD_ID || '',
        'origin': import.meta.env.VITE_HEADER_ORIGIN || 'https://mondelez.smartlogvn.com',
        'referer': import.meta.env.VITE_HEADER_REFERER || 'https://mondelez.smartlogvn.com/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site'
    }
};

// Warehouse IDs từ biến môi trường
export const WAREHOUSE_IDS = {
    BKD: parseInt(import.meta.env.VITE_WAREHOUSE_BKD_ID) || 775,
    NKD: parseInt(import.meta.env.VITE_WAREHOUSE_NKD_ID) || 776
};

// Warehouse Names từ biến môi trường
export const WAREHOUSE_NAMES = {
    BKD: import.meta.env.VITE_WAREHOUSE_BKD_NAME || 'BKD - Kho trong - BKD',
    NKD: import.meta.env.VITE_WAREHOUSE_NKD_NAME || 'NKD - Kho trong - NKD'
};

// Status IDs từ biến môi trường
const statusIdsString = import.meta.env.VITE_STATUS_IDS || '1024,1025,1026,1027,1028,1029,1030,1017,1023,1022';
export const STATUS_IDS = {
    ALL: statusIdsString.split(',').map(id => parseInt(id.trim()))
};

// Default Token từ biến môi trường
export const DEFAULT_TOKEN = import.meta.env.VITE_API_TOKEN || '';
