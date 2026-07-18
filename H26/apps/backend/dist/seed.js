"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const user_entity_1 = require("./common/entities/user.entity");
const user_role_enum_1 = require("./common/enums/user-role.enum");
const AppDataSource = new typeorm_1.DataSource({
    type: 'sqlite',
    database: './skillproof_ai.db',
    entities: [user_entity_1.User],
    synchronize: true,
});
async function seedDatabase() {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(user_entity_1.User);
    // Clear existing users
    await userRepo.clear();
    // Create employee user
    const hashedPassword = await bcrypt.hash('password', 10);
    const employee = userRepo.create({
        email: 'employee@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: hashedPassword,
        role: user_role_enum_1.UserRole.EMPLOYEE,
        department: 'Engineering',
        position: 'Senior Developer',
        isActive: true,
    });
    const supervisor = userRepo.create({
        email: 'supervisor@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: hashedPassword,
        role: user_role_enum_1.UserRole.SUPERVISOR,
        department: 'Engineering',
        position: 'Engineering Manager',
        isActive: true,
    });
    await userRepo.save([employee, supervisor]);
    console.log('✅ Database seeded with demo users!');
    console.log('Employee: employee@example.com / password');
    console.log('Supervisor: supervisor@example.com / password');
    await AppDataSource.destroy();
}
seedDatabase().catch(console.error);
//# sourceMappingURL=seed.js.map