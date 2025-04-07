import { Item} from "@/types/item";
import { api } from "../axios";


export const itemsApi = {
    getAllItems: (): Promise<Item[]> => api.get('http://localhost:3000/storage-items'),
    getItemById: (id: string): Promise<Item[]> => api.get(`http://localhost:3000/storage-items/${id}`),
    createItem: (item: Item): Promise<Item> => api.post("http://localhost:3000/storage-items", item),
    updateItem: (id: string, item: Partial<Item>): Promise<Item> => api.put(`http://localhost:3000/storage-items/${id}`, item),
    deleteItem: (id: string): Promise<void> => api.delete(`http://localhost:3000/storage-items/${id}`)

}

// need update