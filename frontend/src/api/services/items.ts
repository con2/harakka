import { Item} from "@/types/item";
import { api } from "../axios";

export const itemsApi = {
    getAllItems: (): Promise<Item[]> => api.get("/storage-items"),
    getItemById: (id: string): Promise<Item> => api.get(`/storage-items/${id}`),
    createItem: (item: Item): Promise<Item> => api.post("/storage-items", item),
    updateItem: (id: string, item: Partial<Item>): Promise<Item> => api.put(`/storage-items/${id}`, item),
    deleteItem: (id: string): Promise<void> => api.delete(`/storage-items/${id}`)
 };
 