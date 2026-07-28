import axios, { AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { localStorage } from '@/utils/storage';
import { useUserStore } from '@/store';
import { storeToRefs } from 'pinia';

// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 500000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' },
});

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    if (!config.headers) {
      throw new Error(
        `Expected 'config' and 'config.headers' not to be undefined`
      );
    }
    const { loginStatus } = storeToRefs(useUserStore())
    if (loginStatus && localStorage.get('access_token')) {
      config.headers.Authorization = `Bearer ${localStorage.get('access_token')}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // Binary / non-JSON payloads (export, file download)
    if (response.data instanceof ArrayBuffer || response.data instanceof Blob) {
      return response;
    }
    if (Array.isArray(response.data)) {
      return response;
    }
    // No backend / non-object body — pass through without toast spam
    if (!response.data || typeof response.data !== 'object') {
      return response;
    }

    const { code, msg } = response.data;
    if (code === 200 || code === undefined) {
      return response;
    }
    if (code === 401) {
      localStorage.remove('access_token');
      return response;
    }

    ElMessage({
      message: msg || '系统出错',
      type: 'error',
    });
    return Promise.reject(new Error(msg || 'Error'));
  },
  (error: any) => {
    // Network / proxy down (no backend on free static mode)
    if (!error?.response) {
      console.warn('[api] request failed (backend offline or network error):', error?.message || error);
      return Promise.reject(error);
    }

    const data = error.response.data;
    if (data && typeof data === 'object') {
      const { detail } = data;
      console.log('code:', data);
      if (detail === 'Signature has expired.') {
        ElMessageBox.confirm('当前页面已失效，请重新登录', 'Warning', {
          confirmButtonText: 'OK',
          type: 'warning',
        }).then(() => {
          localStorage.clear();
          window.location.href = '/';
        });
      } else if (detail) {
        ElMessage({
          message: detail,
          type: 'error',
        });
      }
    }
    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default service;
