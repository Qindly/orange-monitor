import type {
  GetErrorDetailResponse,
  GetErrorsResponse,
  StoredError,
} from '../types/monitor';

const BASE_URL = 'http://localhost:3000';

export interface GetErrorsParams {
  projectId?: string;
  type?: string;
  keyword?: string;
}

export async function getErrors(params?: GetErrorsParams): Promise<StoredError[]> {
  const search = new URLSearchParams();

  if (params?.projectId) search.set('projectId', params.projectId);
  if (params?.type) search.set('type', params.type);
  if (params?.keyword) search.set('keyword', params.keyword);

  const response = await fetch(
    `${BASE_URL}/errors${search.toString() ? `?${search.toString()}` : ''}`
  );

  if (!response.ok) {
    throw new Error(`获取错误列表失败: ${response.status}`);
  }

  const data = (await response.json()) as GetErrorsResponse;

  if (!data.success) {
    throw new Error('获取错误列表失败');
  }

  return data.data;
}

export async function getErrorDetail(id: string): Promise<StoredError> {
  const response = await fetch(`${BASE_URL}/errors/${id}`);

  if (!response.ok) {
    throw new Error(`获取错误详情失败: ${response.status}`);
  }

  const data = (await response.json()) as GetErrorDetailResponse;

  if (!data.success) {
    throw new Error('获取错误详情失败');
  }

  return data.data;
}

export async function clearErrors(): Promise<void> {
  const response = await fetch(`${BASE_URL}/errors`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`清空错误失败: ${response.status}`);
  }
}