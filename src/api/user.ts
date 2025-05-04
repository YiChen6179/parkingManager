import request from './instance';

export interface UserVO {
  id?: number;
  username: string;
  email?: string;
  tel?: string;
}

export interface QueryParams {
  current?: number;
  size?: number;
  username?: string;
}

// 添加用户
export function addUser(data: UserVO) {
  return request({
    url: '/api/user',
    method: 'post',
    data
  });
}

// 更新用户
export function updateUser(data: UserVO) {
  return request({
    url: '/api/user',
    method: 'put',
    data
  });
}

// 获取用户列表
export function getUserList(params: QueryParams) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params
  });
}

// 根据ID获取用户
export function getUserById(id: number) {
  return request({
    url: `/api/user/${id}`,
    method: 'get'
  });
}

// 删除用户
export function deleteUser(id: number) {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  });
} 