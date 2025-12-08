import { WAREHOUSE_IDS, WAREHOUSE_NAMES, STATUS_IDS } from '../config/index';

/**
 * Tạo request body cho API Dock Register List
 * @param {string} warehouse - Mã kho (BKD hoặc NKD)
 * @param {Date} dateFrom - Ngày bắt đầu
 * @param {Date} dateTo - Ngày kết thúc
 * @returns {Object} Request body
 */
export const buildDockRequestBody = (warehouse, dateFrom = null, dateTo = null) => {
    const stockID = WAREHOUSE_IDS[warehouse] || WAREHOUSE_IDS.BKD;
    const warehouseName = WAREHOUSE_NAMES[warehouse] || WAREHOUSE_NAMES.BKD;
    
    // Nếu không truyền date thì lấy ngày hiện tại
    const today = new Date();
    const startOfDay = dateFrom || new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = dateTo || new Date(today.setHours(23, 59, 59, 999));
    
    return {
        filter: {
            ListStatusID: STATUS_IDS.ALL,
            TypeOfDate: 1,
            StockID: stockID,
            ListStockID: [stockID],
            DateFrom: startOfDay.toISOString(),
            DateTo: endOfDay.toISOString(),
            IsAutoRefresh: false,
            RefreshInterval: 30,
            IsAutoNextPage: false,
            DisplayTimePerPageInterval: 30,
            StockName: warehouseName,
            ListTypeOfTripDockID: [],
            ListTypeOfDockID: [],
            ListTypeOfBusinessID: []
        },
        request: {
            sort: "",
            page: 1,
            pageSize: 100, // Tăng lên để lấy nhiều dữ liệu hơn
            group: "",
            filter: "DockRegisterStatusID~eq~1026",
            filter: ""
        }
    };
};

/**
 * Tạo headers cho request API
 * @param {string} token - Bearer token
 * @returns {Object} Headers object
 */
export const buildRequestHeaders = (token) => {
    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'vi-VN',
        'content-type': 'application/json; charset=UTF-8',
        'd': 'mondelez.smartlogvn.com',
        'functionid': '313',
        'listactioncode': 'ActEdit,ActDel,ViewAdmin,ActAdd,ActOPS,ActExcel',
        'methodid': ''
    };
    
    if (token) {
        headers['authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

/**
 * Parse dữ liệu từ API response thành format của app
 * @param {Object} apiResponse - Response từ API
 * @returns {Object} Parsed data
 */
export const parseDockApiResponse = (apiResponse) => {
    const records = apiResponse?.data || [];
    
    console.log('Parsing API response, total records:', records.length);
    
    // Phân loại vehicles theo trạng thái
    const vehicles = records.map(record => ({
        id: record.ID,
        plateNumber: record.RegNo || record.VehicleNumber,
        dockNumber: extractDockNumber(record.DockName),
        dockName: record.DockName,
        driverName: record.DriverName || record.Driver || null,
        status: mapStatusFromAPI(record.DockRegisterStatusID),
        registerDate: record.RegisterDate,
        gateInTime: record.GateIn,
        loadingStartTime: record.LoadingStart,
        loadingEndTime: record.LoadingEnd,
        gateOutTime: record.GateOut,
        waitTime: calculateWaitTime(record),
        loadingTime: calculateLoadingTime(record),
        turnaroundTime: calculateTurnaroundTime(record),
        utilizationStatus: mapUtilizationStatus(record.StatusQuota),
        statusQuota: record.StatusQuota
    }));
    
    console.log('Parsed vehicles:', vehicles.length);
    
    // Tạo dữ liệu docks từ vehicles
    const docks = generateDocksData(vehicles, records);
    
    // Tính toán KPIs
    const kpis = calculateKPIs(vehicles);
    
    console.log('Generated KPIs:', kpis);
    
    return {
        vehicles,
        docks,
        kpis
    };
};

/**
 * Trích xuất số dock từ tên dock (VD: "BKD1-DockB01" -> 1)
 * Sử dụng extractDockCode từ vehicleStorageManager để có kết quả nhất quán
 */
const extractDockNumber = (dockName) => {
    if (!dockName) return null;
    
    // Import function từ vehicleStorageManager để đảm bảo consistency
    // Hoặc duplicate logic ở đây
    
    // Pattern: BKD#-Dock[A-D]## hoặc [A-D]##
    const match1 = dockName.match(/Dock([A-D])(\d{1,2})/i);
    if (match1) {
        return parseInt(match1[2], 10);
    }
    
    const match2 = dockName.match(/^([A-D])(\d{1,2})$/i);
    if (match2) {
        return parseInt(match2[2], 10);
    }
    
    return null;
};

/**
 * Map StatusQuota từ API sang trạng thái utilization
 */
const mapUtilizationStatus = (statusQuota) => {
    if (!statusQuota) return 'normal';
    
    const statusMap = {
        'Trong định mức': 'normal',
        'Gần hết định mức': 'nearly_full',
        'Vượt định mức': 'exceeded'
    };
    
    return statusMap[statusQuota] || 'normal';
};

/**
 * Map StatusID từ API sang trạng thái của app
 */
const mapStatusFromAPI = (statusID) => {
    const statusMap = {
        1024: 'waiting',      // Đăng ký
        1025: 'gated_in',     // Đã vào cổng
        1026: 'loading',      // Đang làm hàng
        1027: 'completed',    // Hoàn thành
        1028: 'completed',    // Đã ra cổng
        1029: 'completed',    // Đã rời kho (completed)
        1030: 'pending'       // Chờ xử lý
    };
    
    return statusMap[statusID] || 'unknown';
};

/**
 * Tính thời gian chờ (phút)
 */
const calculateWaitTime = (record) => {
    if (!record.GateIn || !record.LoadingStart) return 0;
    const diff = new Date(record.LoadingStart) - new Date(record.GateIn);
    return Math.round(diff / 60000);
};

/**
 * Tính thời gian làm hàng (phút)
 */
const calculateLoadingTime = (record) => {
    if (!record.LoadingStart || !record.LoadingEnd) return 0;
    const diff = new Date(record.LoadingEnd) - new Date(record.LoadingStart);
    return Math.round(diff / 60000);
};

/**
 * Tính thời gian quay vòng (phút)
 */
const calculateTurnaroundTime = (record) => {
    if (!record.GateIn || !record.GateOut) return 0;
    const diff = new Date(record.GateOut) - new Date(record.GateIn);
    return Math.round(diff / 60000);
};

/**
 * Generate dữ liệu docks từ danh sách vehicles và records
 */
const generateDocksData = (vehicles, records) => {
    // Lấy danh sách dock numbers từ data thực tế
    const dockNumbers = [...new Set(records.map(r => extractDockNumber(r.DockName)).filter(n => n !== null))];
    
    // Nếu không có dock nào, dùng mặc định 1-6
    const finalDockNumbers = dockNumbers.length > 0 ? dockNumbers.sort((a, b) => a - b) : [1, 2, 3, 4, 5, 6];
    
    return finalDockNumbers.map(dockNum => {
        // Tìm xe đang loading tại dock này
        const vehicleAtDock = vehicles.find(
            v => v.dockNumber === dockNum && v.status === 'loading'
        );
        
        // Đếm số xe đã hoàn thành trong ngày tại dock này
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completedToday = vehicles.filter(v => {
            if (v.dockNumber !== dockNum) return false;
            if (v.status !== 'completed') return false;
            if (!v.gateOutTime) return false;
            
            const gateOutDate = new Date(v.gateOutTime);
            return gateOutDate >= today;
        }).length;
        
        return {
            name: `C${dockNum}`,
            number: dockNum,
            status: vehicleAtDock ? 'loading' : 'empty',
            currentVehicle: vehicleAtDock?.plateNumber || null,
            utilization: vehicleAtDock?.utilizationStatus || 'normal',
            utilizationText: getUtilizationText(vehicleAtDock?.utilizationStatus),
            dailyPerformance: completedToday
        };
    });
};

/**
 * Get text hiển thị cho utilization status
 */
const getUtilizationText = (status) => {
    const statusMap = {
        'normal': 'Trong định mức',
        'nearly_full': 'Gần hết định mức',
        'exceeded': 'Vượt định mức'
    };
    return statusMap[status] || '-';
};

/**
 * Tính toán các KPIs
 */
const calculateKPIs = (vehicles) => {
    const loading = vehicles.filter(v => v.status === 'loading').length;
    const waiting = vehicles.filter(v => v.status === 'waiting' || v.status === 'gated_in').length;
    
    // Đếm completed trong ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const completed = vehicles.filter(v => {
        if (v.status !== 'completed') return false;
        if (!v.gateOutTime) return false;
        
        const gateOutDate = new Date(v.gateOutTime);
        return gateOutDate >= today;
    }).length;
    
    // Tính trung bình các thời gian cho xe đã hoàn thành trong ngày
    const completedVehicles = vehicles.filter(v => {
        if (v.status !== 'completed') return false;
        if (!v.gateOutTime) return false;
        
        const gateOutDate = new Date(v.gateOutTime);
        return gateOutDate >= today;
    });
    
    const avgTurnaround = completedVehicles.length > 0
        ? Math.round(
            completedVehicles.reduce((sum, v) => sum + (v.turnaroundTime || 0), 0) / completedVehicles.length
          )
        : 0;
    
    const avgLoading = completedVehicles.length > 0
        ? Math.round(
            completedVehicles.reduce((sum, v) => sum + (v.loadingTime || 0), 0) / completedVehicles.length
          )
        : 0;
    
    const avgWait = completedVehicles.length > 0
        ? Math.round(
            completedVehicles.reduce((sum, v) => sum + (v.waitTime || 0), 0) / completedVehicles.length
          )
        : 0;
    
    return {
        currentlyLoading: loading,
        waiting: waiting,
        completedToday: completed,
        avgTurnaroundTime: avgTurnaround,
        avgLoadingTime: avgLoading,
        avgWaitTime: avgWait
    };
};
