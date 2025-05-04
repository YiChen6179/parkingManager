// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  IS_LOGGED_IN: 'isLoggedIn'
};

// API 相关配置
export const API_CONFIG = {
  BASE_URL: '', // 相对路径，便于代理
  TIMEOUT: 10000, // 10秒
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// 响应码
export const RESPONSE_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// 路由名称
export const ROUTE_NAMES = {
  AUTH: 'auth',
  DASHBOARD: 'dashboard',
  PARKING_LOTS: 'parking-lots',
  PARKING_ZONES: 'parking-zones',
  PARKING_SPOTS: 'parking-spots',
  PARKING_RECORDS: 'parking-records',
  USERS: 'users',
  VEHICLES: 'vehicles',
  NOT_FOUND: 'not-found'
};

// 路由路径
export const ROUTE_PATHS = {
  ROOT: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PARKING_LOTS: '/parking-lots',
  PARKING_ZONES: '/parking-zones',
  PARKING_SPOTS: '/parking-spots',
  PARKING_RECORDS: '/parking-records',
  USERS: '/users',
  VEHICLES: '/vehicles'
};

// 停车场状态
export const PARKING_LOT_STATUS = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed'
};

// 停车位状态
export const PARKING_SPOT_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance'
};

// 停车位类型
export const PARKING_SPOT_TYPE = {
  STANDARD: 'standard',
  HANDICAPPED: 'handicapped',
  ELECTRIC: 'electric',
  COMPACT: 'compact'
};

// 停车记录状态
export const PARKING_RECORD_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// 支付状态
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

// 车辆类型
export const VEHICLE_TYPE = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  TRUCK: 'truck',
  OTHER: 'other'
};

// 车辆状态
export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
}; 