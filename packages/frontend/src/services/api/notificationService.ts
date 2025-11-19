// src/services/api/notificationService.ts
import client from './client';
import type { Notification } from '../../types';

const base = '/thongbao'; // hoặc '/notifications' tùy API backend

const getNotifications = async (): Promise<Notification[]> => {
  const res = await client.get(base);
  const payload = res.data as any;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

const getNotificationsByDriver = async (ma_tai_xe: number): Promise<Notification[]> => {
  const res = await client.get(`${base}?ma_tai_xe=${ma_tai_xe}`);
  const payload = res.data as any;
  return Array.isArray(payload) ? payload : payload?.data ?? [];
};

const createNotification = async (payload: Partial<Notification>) => {
  const res = await client.post(base, payload);
  const body = res.data as any;
  return body?.data ?? body;
};

export default {
  getNotifications,
  getNotificationsByDriver,
  createNotification
};
