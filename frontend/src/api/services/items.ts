import { Item} from "@/types/item";
import { api } from "../axios";


export const itemsApi = {
    getAllItems: (): Promise<Item[]> => api.get('http://localhost:3000/storage-items')  // url is to need to be change
}

// need update