import { Tag } from '@/types/tag';
import { api } from '../axios';

export const tagsApi = {
  getAllTags: (): Promise<Tag[]> => api.get('/tags'),
  getTagById: (id: string): Promise<Tag> => api.get(`/tags/${id}`),
  getItemsByTag: (itemId: string): Promise<Tag[]> => api.get(`/tags/${itemId}`),  // Adjusted endpoint for fetching tags for item
  createTag: (tag: Partial<Tag>): Promise<Tag> => api.post('/tags', tag),
  updateTag: (id: string, tagData: Partial<Tag>): Promise<Tag> => api.put(`/tags/${id}`, tagData),
  deleteTag: (id: string): Promise<void> => api.delete(`/tags/${id}`),
  assignTagToItem: (itemId: string, tagIds: string[]): Promise<void> => 
    api.post(`/tags/${itemId}/assign`, { tagIds }),  
  removeTagFromItem: (itemId: string, tagId: string): Promise<void> => 
    api.post('/tags/remove', { itemId, tagId }),
};