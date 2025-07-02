import * as teamMethods from "../methods/teams.prisma";
import { CreateTeamData, UpdateTeamData } from "../types/index";

class TeamService {
  async getAllTeams(query: any = {}) {
    try {
      const { page = 1, limit = 10, search, leaderId } = query;

      const result = await teamMethods.getAllTeams({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        leaderId,
      });

      return {
        success: true,
        message: "Teams retrieved successfully",
        data: {
          teams: result.teams,
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to get teams: ${error.message}`);
    }
  }

  async createTeam(data: CreateTeamData) {
    try {
      const team = await teamMethods.createTeam({
        name: data.name,
        description: data.description,
        leaderId: data.leaderId,
      });

      return {
        success: true,
        message: "Team created successfully",
        data: team,
      };
    } catch (error: any) {
      throw new Error(`Failed to create team: ${error.message}`);
    }
  }

  async getTeamById(id: string) {
    try {
      const team = await teamMethods.getTeamById(id);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "Team retrieved successfully",
        data: team,
      };
    } catch (error: any) {
      throw new Error(`Failed to get team: ${error.message}`);
    }
  }

  async updateTeam(id: string, data: UpdateTeamData) {
    try {
      const team = await teamMethods.updateTeam(id, data);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "Team updated successfully",
        data: team,
      };
    } catch (error: any) {
      throw new Error(`Failed to update team: ${error.message}`);
    }
  }

  async deleteTeam(id: string) {
    try {
      const team = await teamMethods.getTeamById(id);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      await teamMethods.deleteTeam(id);

      return {
        success: true,
        message: "Team deleted successfully",
        data: null,
      };
    } catch (error: any) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  }

  async getTeamMembers(teamId: string) {
    try {
      const team = await teamMethods.getTeamById(teamId);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      const members = await teamMethods.getTeamMembers(teamId);

      return {
        success: true,
        message: "Team members retrieved successfully",
        data: members,
      };
    } catch (error: any) {
      throw new Error(`Failed to get team members: ${error.message}`);
    }
  }

  async addTeamMember(teamId: string, userId: string, role: string = "member") {
    try {
      const team = await teamMethods.getTeamById(teamId);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      const member = await teamMethods.addTeamMember(teamId, userId, role);

      return {
        success: true,
        message: "Team member added successfully",
        data: member,
      };
    } catch (error: any) {
      throw new Error(`Failed to add team member: ${error.message}`);
    }
  }

  async removeTeamMember(teamId: string, userId: string) {
    try {
      const team = await teamMethods.getTeamById(teamId);

      if (!team) {
        return {
          success: false,
          message: "Team not found",
          data: null,
        };
      }

      await teamMethods.removeTeamMember(teamId, userId);

      return {
        success: true,
        message: "Team member removed successfully",
        data: null,
      };
    } catch (error: any) {
      throw new Error(`Failed to remove team member: ${error.message}`);
    }
  }

  async getUserTeams(userId: string) {
    try {
      const teams = await teamMethods.getUserTeams(userId);

      return {
        success: true,
        message: "User teams retrieved successfully",
        data: teams,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user teams: ${error.message}`);
    }
  }
}

export default new TeamService();
