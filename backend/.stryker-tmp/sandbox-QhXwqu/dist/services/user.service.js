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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("./supabase.service");
let UserService = class UserService {
    supabaseService;
    supabase;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
        this.supabase = supabaseService.getClient();
    }
    async getAllUsers() {
        const { data, error } = await this.supabase.from('user_profiles').select('*');
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getUserById(id) {
        const { data, error } = await this.supabase.from('user_profiles').select('*').eq('id', id).single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async createUser(user) {
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });
        if (authError) {
            console.error("Supabase Auth Error:", authError);
            throw new Error(authError.message);
        }
        const { data: profileData, error: profileError } = await this.supabase
            .from('user_profiles')
            .insert([{
                id: authData.user.id,
                role: user.role || 'user',
                full_name: user.full_name,
                visible_name: user.visible_name,
                phone: user.phone,
                preferences: user.preferences || {}
            }]);
        if (profileError) {
            console.error("Supabase Profile Insert Error:", profileError);
            throw new Error(profileError.message);
        }
        return profileData;
    }
    async updateUser(id, user) {
        const { data, error } = await this.supabase.from('user_profiles').update(user).eq('id', id).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async deleteUser(id) {
        const { error } = await this.supabase.from('user_profiles').delete().eq('id', id);
        if (error)
            throw new Error(error.message);
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UserService);
//# sourceMappingURL=user.service.js.map