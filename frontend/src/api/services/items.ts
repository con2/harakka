import { Item} from "@/types/item";
import { api } from "../axios";


export const itemsApi = {
    getAllItems: async (): Promise<Item[]> => {
        const res = await api.get('http://localhost:3000/storage-items');
       // console.log("API response for all items:", res);
        return res.data;
      },
          getItemById: (id: string): Promise<Item> => api.get(`http://localhost:3000/storage-items/${id}`),
    createItem: (item: Item): Promise<Item> => api.post("http://localhost:3000/storage-items", item),
    updateItem: (id: string, item: Partial<Item>): Promise<Item> => api.put(`http://localhost:3000/storage-items/${id}`, item),
    deleteItem: (id: string): Promise<void> => api.delete(`http://localhost:3000/storage-items/${id}`)

}