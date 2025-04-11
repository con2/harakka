// @ts-nocheck
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./controllers/app.controller");
const app_service_1 = require("./services/app.service");
const supabase_service_1 = require("./services/supabase.service");
const storage_items_service_1 = require("./services/storage-items.service");
const storage_items_controller_1 = require("./controllers/storage-items.controller");
const user_controller_1 = require("./controllers/user.controller");
const user_service_1 = require("./services/user.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule.forRoot()],
        controllers: [app_controller_1.AppController, storage_items_controller_1.StorageItemsController, user_controller_1.UserController],
        providers: [app_service_1.AppService, supabase_service_1.SupabaseService, storage_items_service_1.StorageItemsService, user_service_1.UserService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map