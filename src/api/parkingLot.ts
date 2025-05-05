import request from './instance';

export interface ParkingLotVO {
  id?: number;
  lotName: string;
  address: string;
  readonly totalSpot?: number;
  readonly usedSpot?: number;
}

export interface QueryParams {
  current?: number;
  size?: number;
  name?: string;
}

// 添加停车场
export function addParkingLot(data: ParkingLotVO) {
  return request({
    url: '/api/parking-lot',
    method: 'post',
    data
  });
}

// 更新停车场
export function updateParkingLot(data: ParkingLotVO) {
  return request({
    url: '/api/parking-lot',
    method: 'put',
    data
  });
}

// 获取停车场列表
export function getParkingLotList(params: QueryParams) {
  return request({
    url: '/api/parking-lot/list',
    method: 'get',
    params
  });
}

// 根据ID获取停车场
export function getParkingLotById(id: number) {
  return request({
    url: `/api/parking-lot/${id}`,
    method: 'get'
  });
}

// 删除停车场
export function deleteParkingLot(id: number) {
  return request({
    url: `/api/parking-lot/${id}`,
    method: 'delete'
  });
} 