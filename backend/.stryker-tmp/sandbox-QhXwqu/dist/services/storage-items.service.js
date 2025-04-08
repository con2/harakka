// @ts-nocheck
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageItemsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("./supabase.service");
let StorageItemsService = class StorageItemsService {
    supabaseService;
    supabase;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = supabaseService.getClient();
    }
    async getAllItems() {
        const { data, error } = await this.supabase.from('storage_items').select('*');
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getItemById(id) {
        const { data, error } = await this.supabase.from('storage_items').select('*').eq('id', id).single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async createItem(item) {
        const { data, error } = await this.supabase.from('storage_items').insert([item]);
        if (error)
            throw new Error(error.message);
        return data;
    }
    async updateItem(id, item) {
        const { data, error } = await this.supabase.from('storage_items').update(item).eq('id', id);
        if (error)
            throw new Error(error.message);
        return data;
    }
    async deleteItem(id) {
        const { data, error } = await this.supabase.from('storage_items').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.StorageItemsService = StorageItemsService;
exports.StorageItemsService = StorageItemsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], StorageItemsService);
//# sourceMappingURL=storage-items.service.js.map