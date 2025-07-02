import { Team, TeamMember, TeamWithDetails, CreateTeamData, UpdateTeamData } from "../types/index";
interface TeamFilters {
    page?: number;
    limit?: number;
    search?: string;
    leaderId?: string;
}
export declare const getAllTeams: (filters?: TeamFilters) => Promise<{
    teams: Team[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const createTeam: (data: CreateTeamData) => Promise<Team>;
export declare const getTeamById: (id: string) => Promise<TeamWithDetails | null>;
export declare const updateTeam: (id: string, data: UpdateTeamData) => Promise<Team | null>;
export declare const deleteTeam: (id: string) => Promise<void>;
export declare const getTeamMembers: (teamId: string) => Promise<TeamMember[]>;
export declare const addTeamMember: (teamId: string, userId: string, role?: string) => Promise<TeamMember>;
export declare const removeTeamMember: (teamId: string, userId: string) => Promise<void>;
export declare const isTeamMember: (teamId: string, userId: string) => Promise<boolean>;
export declare const getUserTeams: (userId: string) => Promise<Team[]>;
export {};
