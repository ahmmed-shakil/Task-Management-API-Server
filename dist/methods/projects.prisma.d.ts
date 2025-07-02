import { Project, CreateProjectData, ProjectStatus, ProjectPriority, ProjectWithDetails, PaginatedProjects } from "../types/index";
interface ProjectFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus | ProjectStatus[];
    priority?: ProjectPriority | ProjectPriority[];
    ownerId?: string;
    teamId?: string;
    isActive?: boolean;
}
export declare const getProjectById: (id: string) => Promise<Project | null>;
export declare const getProjectWithDetails: (id: string) => Promise<ProjectWithDetails | null>;
export declare const createProject: (projectData: CreateProjectData) => Promise<Project>;
export declare const updateProject: (id: string, updateData: Partial<CreateProjectData>) => Promise<Project | null>;
export declare const deleteProject: (id: string) => Promise<boolean>;
export declare const getProjects: (filters: ProjectFilters) => Promise<PaginatedProjects>;
export declare const getProjectsByOwner: (ownerId: string, filters?: Omit<ProjectFilters, "ownerId">) => Promise<PaginatedProjects>;
export declare const getProjectsByTeam: (teamId: string, filters?: Omit<ProjectFilters, "teamId">) => Promise<PaginatedProjects>;
export declare const updateProjectProgress: (id: string, progress: number) => Promise<Project | null>;
export declare const updateProjectStatus: (id: string, status: ProjectStatus) => Promise<Project | null>;
export declare const archiveProject: (id: string) => Promise<boolean>;
export declare const restoreProject: (id: string) => Promise<boolean>;
export declare const calculateProjectProgress: (id: string) => Promise<number>;
export declare const isProjectMember: (projectId: string, userId: string) => Promise<string | null>;
export declare const getProjectMembers: (projectId: string) => Promise<{
    role: string;
    email: string;
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}[]>;
export declare const addProjectMember: (projectId: string, userId: string, role?: string) => Promise<{
    role: string;
    email: string;
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}>;
export declare const removeProjectMember: (projectId: string, userId: string) => Promise<boolean>;
export declare const getUserProjects: (userId: string, filters?: Omit<ProjectFilters, "ownerId">) => Promise<{
    projects: {
        owner: {
            email: string;
            id: string;
            firstName: string;
            lastName: string;
            avatar: string | null;
        };
        team: {
            id: string;
            name: string;
            memberCount: number;
        } | undefined;
        taskStats: {
            total: number;
            completed: number;
            inProgress: number;
            todo: number;
        };
        id: string;
        name: string;
        description: string | null;
        status: ProjectStatus;
        priority: ProjectPriority;
        start_date: Date | null;
        end_date: Date | null;
        owner_id: string;
        team_id: string | null;
        budget: number | null;
        progress: number;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
    }[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}>;
export declare const getAllProjects: (filters: ProjectFilters) => Promise<PaginatedProjects>;
export {};
