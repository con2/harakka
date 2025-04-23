import { Item } from '@/types/item';
import { api } from '../axios';

export const itemsApi = {
  getAllItems: (): Promise<Item[]> => api.get('/storage-items'),
  getItemById: (id: string): Promise<Item> => api.get(`/storage-items/${id}`),
  createItem: (item: Item): Promise<Item> => api.post('/storage-items', item),
  updateItem: (id: string, item: Partial<Item>): Promise<Item> =>
    api.put(`/storage-items/${id}`, item),
  deleteItem: (id: string): Promise<void> => api.delete(`/storage-items/${id}`),
  getItemsByTag: (tagId: string): Promise<Item[]> =>
    api.get(`/storage-items/by-tag/${tagId}`),

  // gets available items based on start and end date TODO: adjust when back is ready
  getAvailableItems: (
    startDate?: Date | null,
    endDate?: Date | null,
  ): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    return api.get(`/storage-items/available?${params.toString()}`);
  },
};
