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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("../common/entities/project.entity");
const task_entity_1 = require("../common/entities/task.entity");
let ProjectsService = class ProjectsService {
    constructor(projectsRepository, tasksRepository) {
        this.projectsRepository = projectsRepository;
        this.tasksRepository = tasksRepository;
    }
    async getMyProjects(employeeId) {
        const tasks = await this.tasksRepository.find({
            where: { assignedTo: { id: employeeId } },
            relations: ['project'],
        });
        const projectIds = [...new Set(tasks.map(t => t.project.id))];
        return this.projectsRepository.findByIds(projectIds);
    }
    async getProjectById(projectId) {
        const project = await this.projectsRepository.findOne({
            where: { id: projectId },
            relations: ['tasks'],
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async getProjectTasks(projectId, employeeId) {
        return this.tasksRepository.find({
            where: { project: { id: projectId }, assignedTo: { id: employeeId } },
            relations: ['project'],
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map