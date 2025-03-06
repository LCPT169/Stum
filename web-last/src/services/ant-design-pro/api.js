// @ts-ignore

/* eslint-disable */
import {request} from 'umi';
import * as CC from '@/constants/constant';

function getCookie(name) {
  let cookies = document.cookie;
  // 解析出名/值对列表
  let list = cookies.split('; ');

  for (let i = 0; i < list.length; i++) {
    // 解析出名和值
    let arr = list[i].split('=');
    if (arr[0] === name) {
      return arr[1];
    }
  }
  return '';
}

const csrftoken = getCookie('csrftoken')

/**Cesium:检测树木：获取树木检测信息(tree_coordinate.json)*/
// export async function getTreeDataApi(url,options) {
//   return request(url, {
//     method: 'GET',
//     ...(options || {}),
//   });
// }
export async function getTreeDataApi(url,body,options) {
  return request(url, {
    method: 'GET',
    data: body,
    ...(options || {}),
  });
}
/**获取仪表盘信息*/
export async function getDashboard(options) {
  return request('/api/system/info', {
    method: 'GET',
    ...(options || {}),
  });
}


/** 获取当前的用户 GET */
// 这个web-odm接口是获取用户列表
export async function currentUser(options) {
  return request('/api/admin/users/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
//未使用
export async function outLogin(options) {
  return request('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */

export async function login(body, options) {
  return request('/api/token-auth/', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 创建用户 */
// /api/admin/users/
export async function createUser(body, options) {
  return request('/api/user/create/', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新用户信息 */

export async function updateUser(body, options) {
  return request(`/api/user/update/pwd/`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 注销用户 */

export async function deleteUser(id, body, options) {
  return request(`/api/admin/users/${id}/`, {
    method: 'DELETE',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取项目列表 */
export async function getProjects(body, options) {
  return request('/api/project/getall', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 新建项目 */
export async function addProject(body, options) {
  return request('/api/project/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新项目 /api/projects/7/edit/ */

export async function updateProject(body, options) {
  return request(`/api/project/edit/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除项目 */

export async function removeProject(body,options) {
  return request(`/api/project/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/** 获取任务列表 */
export async function getTasks(body,options) {
  return request(`/api/task/getall`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/** 新建任务 */
//获取rid
export async function postId(body,options) {
  return request(`/api/upload/init`, {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}
//上传图片
export async function uploadImages(body, options) {
  return request(`/api/upload/upload`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}
//请求路径
export async function runTaskPath( options) {
  return request(`/api/get/runtaskpath`, {
    method: 'POST',
    ...(options || {}),
  });
}
//添加odm参数
// export async function startTask(body,options) {
//   return request('/apipy/runtask', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRFToken': csrftoken,
//     },
//     data: body,
//     ...(options || {}),
//   });
// }
export async function startTask(body,options) {
  return request('/api/task/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

//WebODM
// export async function addTask(projectId, body, options) {
//   return request(`/api/projects/${projectId}/tasks/`, {
//     method: 'POST',
//     headers: {
//       'X-CSRFToken': csrftoken,
//     },
//     data: body,
//     ...(options || {}),
//   });
// }

/** 更新任务 */
//未使用
export async function updateTask(projectId, taskId, body, options) {
  return request(`/api/projects/${projectId}/tasks/${taskId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}

/** 取消任务 */

export async function cancelTask( data, options) {
  return request(`/apipy/task/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: data,
    ...(options || {}),
  });
}

/** 删除任务 */

export async function removeTask(data, options) {
  return request(`/api/task/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: data,
    ...(options || {}),
  });
}



/** 重启任务 */
export async function getRid(body, options) {
  return request(`/api/task/getrid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: body,
    ...(options || {}),
  });
}
export async function resatrtTask(data, options) {
  return request(`/apipy/task/rerun`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data: data,
    ...(options || {}),
  });
}



/** Orthphoto TMS layer */

export async function downloadOrthophoto(body,options) {
  return request(`/api/assert/ortho`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/** Surface Model TSM layer */

export async function downloadDSM(body,options) {
  return request(`/api/assert/dem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/** Terrain Model TMS layer */

export async function downloadPC(body,options) {
  return request(`/api/assert/pc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/**检测树木*/
export async function detectTreeJava(body, options) {
  return request(`/api/get/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}
export async function scanTreePython(body,options) {
  return request(`/apiyolo/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}

/**下载检测图*/
export async function downloadDetected(body,options) {
  return request(`/api/assert/detect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    data:body,
    ...(options || {}),
  });
}
