// 定义标准响应格式
export interface ApiResponse<T = any> {
  code: number;   // 200表示成功
  message: string;
  data: T;
}

// 定义用户信息
export interface UserInfo {
  id: number;
  username: string;
  email?: string;
  tel?: string;
}

// 登录请求参数
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponseData {
  token: string;
  user: UserInfo;
}

// 停车场
export interface ParkingLot {
  id: number;
  name: string;
  address: string;
  capacity: number;
  currentOccupancy: number;
  status: 'active' | 'maintenance' | 'closed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 停车区
export interface ParkingZone {
  id: number;
  name: string;
  parkingLotId: number;
  parkingLotName?: string;
  capacity: number;
  currentOccupancy: number;
  status: 'active' | 'maintenance' | 'closed';
  floorLevel?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// 停车位
export interface ParkingSpot {
  id: number;
  spotNumber: string;
  parkingZoneId: number;
  parkingZoneName?: string;
  parkingLotId: number;
  parkingLotName?: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'standard' | 'handicapped' | 'electric' | 'compact';
  createdAt: string;
  updatedAt: string;
}

// 停车记录
export interface ParkingRecord {
  id: number;
  vehicleId: number;
  vehiclePlate?: string;
  parkingSpotId: number;
  spotNumber?: string;
  parkingZoneId: number;
  parkingZoneName?: string;
  parkingLotId: number;
  parkingLotName?: string;
  entryTime: string;
  exitTime?: string;
  duration?: number;
  fee?: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
  userId: number;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

// 车辆信息
export interface Vehicle {
  id: number;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  userId: number;
  username?: string;
  type: 'car' | 'motorcycle' | 'truck' | 'other';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 通用查询参数
export interface QueryParams extends Partial<PaginationParams> {
  [key: string]: any;
} 