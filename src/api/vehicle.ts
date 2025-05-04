import request from './instance';

export interface VehicleVO {
  id?: number;
  userId: number;
  plateNumber: string;
  vehicleType?: string;
  vehicleColor?: string;
}

export interface QueryParams {
  current?: number;
  size?: number;
  plateNumber?: string;
  userId?: number;
}

// 添加车辆
export function addVehicle(data: VehicleVO) {
  return request({
    url: '/api/vehicle',
    method: 'post',
    data
  });
}

// 更新车辆
export function updateVehicle(data: VehicleVO) {
  return request({
    url: '/api/vehicle',
    method: 'put',
    data
  });
}

// 获取车辆列表
export function getVehicleList(params: QueryParams) {
  return request({
    url: '/api/vehicle/list',
    method: 'get',
    params
  });
}

// 根据ID获取车辆
export function getVehicleById(id: number) {
  return request({
    url: `/api/vehicle/${id}`,
    method: 'get'
  });
}

// 删除车辆
export function deleteVehicle(id: number) {
  return request({
    url: `/api/vehicle/${id}`,
    method: 'delete'
  });
} 