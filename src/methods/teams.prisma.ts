import { prisma } from "../config/prisma";
import {
  Team,
  TeamMember,
  TeamWithDetails,
  CreateTeamData,
  UpdateTeamData,
} from "../types/index";

interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  leaderId?: string;
}

// Helper function to map Prisma team to Team interface
const mapPrismaTeamToTeam = (prismaTeam: any): Team => {
  return {
    id: prismaTeam.id,
    name: prismaTeam.name,
    description: prismaTeam.description,
    leaderId: prismaTeam.leaderId,
    isActive: prismaTeam.isActive,
    createdAt: prismaTeam.createdAt,
    updatedAt: prismaTeam.updatedAt,
  };
};

// Helper function to map Prisma team member to TeamMember interface
const mapPrismaTeamMemberToTeamMember = (prismaTeamMember: any): TeamMember => {
  return {
    id: prismaTeamMember.id,
    teamId: prismaTeamMember.teamId,
    userId: prismaTeamMember.userId,
    role: prismaTeamMember.role,
  };
};

// Get all teams with filters
export const getAllTeams = async (
  filters: TeamFilters = {}
): Promise<{ teams: Team[]; total: number; page: number; limit: number }> => {
  try {
    const { page = 1, limit = 10, search, leaderId } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (leaderId) {
      where.leaderId = leaderId;
    }

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.team.count({ where }),
    ]);

    return {
      teams: teams.map(mapPrismaTeamToTeam),
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error getting teams:", error);
    throw new Error("Failed to get teams");
  }
};

// Create a new team
export const createTeam = async (data: CreateTeamData): Promise<Team> => {
  try {
    const team = await prisma.team.create({
      data: {
        name: data.name,
        description: data.description === undefined ? null : data.description,
        leaderId: data.leaderId,
      },
    });

    // Add the leader as a member with "leader" role
    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: data.leaderId,
        role: "leader",
      },
    });

    return mapPrismaTeamToTeam(team);
  } catch (error) {
    console.error("Error creating team:", error);
    throw new Error("Failed to create team");
  }
};

// Get team by ID
export const getTeamById = async (
  id: string
): Promise<TeamWithDetails | null> => {
  try {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        leader: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    return {
      ...mapPrismaTeamToTeam(team),
      leader: team.leader,
      members: team.members,
    };
  } catch (error) {
    console.error("Error getting team by ID:", error);
    throw new Error("Failed to get team");
  }
};

// Update team
export const updateTeam = async (
  id: string,
  data: UpdateTeamData
): Promise<Team | null> => {
  try {
    const team = await prisma.team.update({
      where: { id },
      data,
    });

    return mapPrismaTeamToTeam(team);
  } catch (error) {
    console.error("Error updating team:", error);
    throw new Error("Failed to update team");
  }
};

// Delete team
export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await prisma.team.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    throw new Error("Failed to delete team");
  }
};

// Get team members
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  try {
    const members = await prisma.teamMember.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return members.map(mapPrismaTeamMemberToTeamMember);
  } catch (error) {
    console.error("Error getting team members:", error);
    throw new Error("Failed to get team members");
  }
};

// Add team member
export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: string = "member"
): Promise<TeamMember> => {
  try {
    // Check if user is already a member
    const existingMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId,
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this team");
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return mapPrismaTeamMemberToTeamMember(member);
  } catch (error) {
    console.error("Error adding team member:", error);
    throw new Error("Failed to add team member");
  }
};

// Remove team member
export const removeTeamMember = async (
  teamId: string,
  userId: string
): Promise<void> => {
  try {
    // Check if user is the team leader
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (team.leaderId === userId) {
      throw new Error("Cannot remove the team leader");
    }

    await prisma.teamMember.deleteMany({
      where: {
        teamId,
        userId,
      },
    });
  } catch (error) {
    console.error("Error removing team member:", error);
    throw new Error("Failed to remove team member");
  }
};

// Check if user is a member of a team
export const isTeamMember = async (
  teamId: string,
  userId: string
): Promise<boolean> => {
  try {
    const count = await prisma.teamMember.count({
      where: {
        teamId,
        userId,
      },
    });

    return count > 0;
  } catch (error) {
    console.error("Error checking team membership:", error);
    throw new Error("Failed to check team membership");
  }
};

// Get teams for a user
export const getUserTeams = async (userId: string): Promise<Team[]> => {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: true,
      },
    });

    return teamMembers.map((member) => mapPrismaTeamToTeam(member.team));
  } catch (error) {
    console.error("Error getting user teams:", error);
    throw new Error("Failed to get user teams");
  }
};
