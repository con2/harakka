import { Injectable } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
// this is used by the controller

@Injectable()
export class StorageItemsService{ // handles Database querys
    private supabase;

    constructor (private supabaseService: SupabaseService){
        this.supabase = supabaseService.getClient(); // takes the key (SupabaseService) to establish connection to the database for handling CRUD
    }

    async getAllItems(){
        const {data, error} = await this.supabase.from('storage_items').select('*');
        if (error) throw new Error (error.message);
        return data;
    }

    async getItemById(id: number){
        const {data, error}= await this.supabase.from('storage_items').select('*').eq('id', id).single();
        if (error) throw new Error (error.message);
        return data;
    }

    async createItem(item: any){
        const {data, error} = await this.supabase.from('storage_items').insert([item]);
        if (error) throw new Error (error.message);
        return data;
    }

    async updateItem(id: number, item : any){
        const {data, error} = await this.supabase.from('storage_items').update(item).eq('id', id);
        if (error) throw new Error (error.message);
        return data;
    }

    async deleteItem(id:number){
        const {data, error}= await this.supabase.from('storage_items').delete().eq('id', id);
        if (error) throw new Error (error.message);
        return data;
    }
}