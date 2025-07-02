import { CreateTeamData, UpdateTeamData } from "../types/index";
declare class TeamService {
    getAllTeams(query?: any): Promise<{
        success: boolean;
        message: string;
        data: {
            teams: import("../types/index").Team[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    createTeam(data: CreateTeamData): Promise<{
        success: boolean;
        message: string;
        data: import("../types/index").Team;
    }>;
    getTeamById(id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types/index").TeamWithDetails;
    }>;
    updateTeam(id: string, data: UpdateTeamData): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types/index").Team;
    }>;
    deleteTeam(id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getTeamMembers(teamId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types/index").TeamMember[];
    }>;
    addTeamMember(teamId: string, userId: string, role?: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types/index").TeamMember;
    }>;
    removeTeamMember(teamId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getUserTeams(userId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../types/index").Team[];
    }>;
}
declare const _default: TeamService;
export default _default;
