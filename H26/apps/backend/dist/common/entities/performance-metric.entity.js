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
exports.PerformanceMetric = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let PerformanceMetric = class PerformanceMetric {
};
exports.PerformanceMetric = PerformanceMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PerformanceMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], PerformanceMetric.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], PerformanceMetric.prototype, "readinessScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float' }),
    __metadata("design:type", Number)
], PerformanceMetric.prototype, "performanceScore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        default: () => "('{}')",
    }),
    __metadata("design:type", Object)
], PerformanceMetric.prototype, "detailedScores", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], PerformanceMetric.prototype, "trends", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PerformanceMetric.prototype, "recordedAt", void 0);
exports.PerformanceMetric = PerformanceMetric = __decorate([
    (0, typeorm_1.Entity)('performance_metrics')
], PerformanceMetric);
//# sourceMappingURL=performance-metric.entity.js.map