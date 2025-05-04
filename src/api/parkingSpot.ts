import request from './instance';

export interface ParkingSpotVO {
  id?: number;
  parkingZoneId: number;
  status?: number; // 0-空闲，1-占用
  spotNumber: string;
  length?: number;
  width?: number;
}

export interface QueryParams {
  current?: number;
  size?: number;
  spotNumber?: string;
  status?: number;
  zoneId?: number;
}

// 添加停车位
export function addParkingSpot(data: ParkingSpotVO) {
  return request({
    url: '/api/parking-spot',
    method: 'post',
    data
  });
}

// 更新停车位
export function updateParkingSpot(data: ParkingSpotVO) {
  return request({
    url: '/api/parking-spot',
    method: 'put',
    data
  });
}

// 获取停车位列表
export function getParkingSpotList(params: QueryParams) {
  return request({
    url: '/api/parking-spot/list',
    method: 'get',
    params
  });
}

// 根据ID获取停车位
export function getParkingSpotById(id: number) {
  return request({
    url: `/api/parking-spot/${id}`,
    method: 'get'
  });
}

// 删除停车位
export function deleteParkingSpot(id: number) {
  return request({
    url: `/api/parking-spot/${id}`,
    method: 'delete'
  });
} 