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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../common/entities/task.entity");
const submission_entity_1 = require("../common/entities/submission.entity");
const user_entity_1 = require("../common/entities/user.entity");
let TasksService = class TasksService {
    constructor(tasksRepository, submissionsRepository, usersRepository) {
        this.tasksRepository = tasksRepository;
        this.submissionsRepository = submissionsRepository;
        this.usersRepository = usersRepository;
    }
    async getMyTasks(employeeId) {
        return this.tasksRepository.find({
            where: { assignedTo: { id: employeeId } },
            relations: ['project', 'submissions'],
            order: { dueDate: 'ASC' },
        });
    }
    async getTaskById(taskId, userId) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
            relations: ['assignedTo', 'project', 'submissions'],
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        if (task.assignedTo.id !== userId) {
            throw new common_1.ForbiddenException('You can only view your assigned tasks');
        }
        return task;
    }
    async submitWork(taskId, employeeId, submissionDto) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId, assignedTo: { id: employeeId } },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found or not assigned to you');
        }
        const employee = await this.usersRepository.findOne({
            where: { id: employeeId },
        });
        const submission = this.submissionsRepository.create({
            type: submissionDto.type,
            content: submissionDto.content,
            url: submissionDto.url,
            metadata: submissionDto.metadata,
            task,
            submittedBy: employee,
        });
        return this.submissionsRepository.save(submission);
    }
    async getSubmissions(taskId, userId) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.submissionsRepository.find({
            where: { task: { id: taskId } },
            relations: ['submittedBy', 'task'],
            order: { createdAt: 'DESC' },
        });
    }
    async updateTaskCompletion(taskId, employeeId, completionPercentage) {
        const task = await this.tasksRepository.findOne({
            where: { id: taskId, assignedTo: { id: employeeId } },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        task.completionPercentage = Math.min(100, completionPercentage);
        return this.tasksRepository.save(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(submission_entity_1.Submission)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map