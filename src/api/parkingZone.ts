import request from './instance';

export interface ParkingZoneVO {
  id?: number;
  parkingLotId: number;
  zoneName: string;
  floor?: string;
}

export interface QueryParams {
  current?: number;
  size?: number;
  zoneName?: string;
  parkingLotId?: number;
}

// 添加停车区
export function addParkingZone(data: ParkingZoneVO) {
  return request({
    url: '/api/parking-zone',
    method: 'post',
    data
  });
}

// 更新停车区
export function updateParkingZone(data: ParkingZoneVO) {
  return request({
    url: '/api/parking-zone',
    method: 'put',
    data
  });
}

// 获取停车区列表
export function getParkingZoneList(params: QueryParams) {
  return request({
    url: '/api/parking-zone/list',
    method: 'get',
    params
  });
}

// 根据ID获取停车区
export function getParkingZoneById(id: number) {
  return request({
    url: `/api/parking-zone/${id}`,
    method: 'get'
  });
}

// 删除停车区
export function deleteParkingZone(id: number) {
  return request({
    url: `/api/parking-zone/${id}`,
    method: 'delete'
  });
} 