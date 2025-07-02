import { Project, CreateProjectData, ProjectStatus, ProjectPriority, ApiResponse } from "../types/index";
interface ProjectFilters {
    page?: string | number;
    limit?: string | number;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    search?: string;
}
interface AddMemberData {
    userId: string;
    role?: string;
}
declare class ProjectService {
    getAllProjects(userId: string, filters?: ProjectFilters): Promise<ApiResponse<any>>;
    createProject(userId: string, projectData: CreateProjectData): Promise<ApiResponse<Project>>;
    getProjectById(projectId: string, userId: string): Promise<ApiResponse<any>>;
    updateProject(projectId: string, userId: string, updateData: Partial<CreateProjectData>): Promise<ApiResponse<Project>>;
    deleteProject(projectId: string, userId: string): Promise<ApiResponse<null>>;
    getProjectMembers(projectId: string, userId: string): Promise<ApiResponse<any[]>>;
    addProjectMember(projectId: string, userId: string, memberData: AddMemberData): Promise<ApiResponse<any>>;
    removeProjectMember(projectId: string, memberId: string, userId: string): Promise<ApiResponse<null>>;
    getUserProjects(userId: string, page?: number, limit?: number): Promise<ApiResponse<any[]>>;
}
declare const _default: ProjectService;
export default _default;
