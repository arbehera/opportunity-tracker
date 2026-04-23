import client from './client';

export const getNotifications = () => client.get('/notifications');
export const markNotificationRead = (id: string) => client.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.patch('/notifications/read-all');
