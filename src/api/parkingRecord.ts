import request from './instance';

export interface ParkingRecordVO {
  id?: number;
  parkingSpotId: number;
  entryTime?: string;
  exitTime?: string;
  parkingTime?: number;
  status?: number; // 0-已完成，1-停车中
  plateNumber?: string;
  vehicleId: number;
}

export interface QueryParams {
  current?: number;
  size?: number;
  status?: number;
  vehicleId?: number;
}

// 添加停车记录
export function addParkingRecord(data: ParkingRecordVO) {
  return request({
    url: '/api/parking-record',
    method: 'post',
    data
  });
}

// 更新停车记录
export function updateParkingRecord(data: ParkingRecordVO) {
  return request({
    url: '/api/parking-record',
    method: 'put',
    data
  });
}

// 获取停车记录列表
export function getParkingRecordList(params: QueryParams) {
  return request({
    url: '/api/parking-record/list',
    method: 'get',
    params
  });
}

// 根据ID获取停车记录
export function getParkingRecordById(id: number) {
  return request({
    url: `/api/parking-record/${id}`,
    method: 'get'
  });
}

// 删除停车记录
export function deleteParkingRecord(id: number) {
  return request({
    url: `/api/parking-record/${id}`,
    method: 'delete'
  });
}

// 车辆出场
export function vehicleExit(id: number) {
  return request({
    url: `/api/parking-record/${id}/exit`,
    method: 'post'
  });
} 