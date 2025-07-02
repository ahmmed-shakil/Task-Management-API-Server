import { prisma } from "../config/prisma";
import {
  Project,
  CreateProjectData,
  ProjectStatus,
  ProjectPriority,
  ProjectWithDetails,
  PaginatedProjects,
} from "../types/index";

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

// Helper function to map Prisma project to Project interface
const mapPrismaProjectToProject = (prismaProject: any): Project => {
  return {
    id: prismaProject.id,
    name: prismaProject.name,
    description: prismaProject.description,
    status: prismaProject.status as ProjectStatus,
    priority: prismaProject.priority as ProjectPriority,
    start_date: prismaProject.startDate,
    end_date: prismaProject.endDate,
    owner_id: prismaProject.ownerId,
    team_id: prismaProject.teamId,
    budget: prismaProject.budget
      ? parseFloat(prismaProject.budget.toString())
      : null,
    progress: prismaProject.progress,
    is_active: prismaProject.isActive,
    created_at: prismaProject.createdAt,
    updated_at: prismaProject.updatedAt,
  };
};

// Get project by ID
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return null;
    }

    return mapPrismaProjectToProject(project);
  } catch (error) {
    console.error("Error getting project by ID:", error);
    throw new Error("Failed to get project");
  }
};

// Get project with details
export const getProjectWithDetails = async (
  id: string
): Promise<ProjectWithDetails | null> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
        tasks: {
          select: {
            status: true,
          },
          where: {
            isArchived: false,
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    const baseProject = mapPrismaProjectToProject(project);

    // Calculate task statistics
    const taskStats = {
      total: project.tasks.length,
      completed: project.tasks.filter(
        (task: { status: string }) => task.status === "completed"
      ).length,
      inProgress: project.tasks.filter(
        (task: { status: string }) => task.status === "in_progress"
      ).length,
      todo: project.tasks.filter(
        (task: { status: string }) => task.status === "todo"
      ).length,
    };

    return {
      ...baseProject,
      owner: {
        id: project.owner.id,
        email: project.owner.email,
        firstName: project.owner.firstName,
        lastName: project.owner.lastName,
        avatar: project.owner.avatar,
      },
      team: project.team
        ? {
            id: project.team.id,
            name: project.team.name,
            memberCount: project.team._count.members,
          }
        : null,
      taskStats,
    };
  } catch (error) {
    console.error("Error getting project with details:", error);
    throw new Error("Failed to get project details");
  }
};

// Create new project
export const createProject = async (
  projectData: CreateProjectData
): Promise<Project> => {
  const {
    name,
    description,
    status = "planning",
    priority = "medium",
    startDate,
    endDate,
    ownerId,
    teamId,
    budget,
  } = projectData;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? null,
        status: status as ProjectStatus,
        priority: priority as ProjectPriority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        ownerId,
        teamId: teamId ?? null,
        budget: budget ? Number(budget) : null,
      },
    });

    return mapPrismaProjectToProject(project);
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }
};

// Update project
export const updateProject = async (
  id: string,
  updateData: Partial<CreateProjectData>
): Promise<Project | null> => {
  try {
    const updateFields: any = {};
    if (updateData.name !== undefined) updateFields.name = updateData.name;
    if (updateData.description !== undefined)
      updateFields.description = updateData.description ?? null;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status as ProjectStatus;
    if (updateData.priority !== undefined)
      updateFields.priority = updateData.priority as ProjectPriority;
    if (updateData.startDate !== undefined)
      updateFields.startDate = updateData.startDate
        ? new Date(updateData.startDate)
        : null;
    if (updateData.endDate !== undefined)
      updateFields.endDate = updateData.endDate
        ? new Date(updateData.endDate)
        : null;
    if (updateData.teamId !== undefined)
      updateFields.teamId = updateData.teamId ?? null;
    if (updateData.budget !== undefined)
      updateFields.budget = updateData.budget
        ? Number(updateData.budget)
        : null;

    const project = await prisma.project.update({
      where: { id },
      data: updateFields,
    });

    return mapPrismaProjectToProject(project);
  } catch (error: any) {
    if (error.code === "P2025") {
      return null; // Project not found
    }
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }
};

// Delete project
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      return false; // Project not found
    }
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
};

// Get all projects with pagination and filters
export const getProjects = async (
  filters: ProjectFilters
): Promise<PaginatedProjects> => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    priority,
    ownerId,
    teamId,
    isActive,
  } = filters;

  try {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (priority) {
      if (Array.isArray(priority)) {
        where.priority = { in: priority };
      } else {
        where.priority = priority;
      }
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
          tasks: {
            select: {
              status: true,
            },
            where: {
              isArchived: false,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    const projectsWithDetails: ProjectWithDetails[] = projects.map(
      (project: any) => {
        const baseProject = mapPrismaProjectToProject(project);

        // Calculate task statistics
        const taskStats = {
          total: project.tasks.length,
          completed: project.tasks.filter(
            (task: { status: string }) => task.status === "completed"
          ).length,
          inProgress: project.tasks.filter(
            (task: { status: string }) => task.status === "in_progress"
          ).length,
          todo: project.tasks.filter(
            (task: { status: string }) => task.status === "todo"
          ).length,
        };

        return {
          ...baseProject,
          owner: project.owner,
          team: project.team
            ? {
                id: project.team.id,
                name: project.team.name,
                memberCount: project.team._count.members,
              }
            : null,
          taskStats,
        };
      }
    );

    return {
      projects: projectsWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting projects:", error);
    throw new Error("Failed to get projects");
  }
};

// Get projects by owner
export const getProjectsByOwner = async (
  ownerId: string,
  filters?: Omit<ProjectFilters, "ownerId">
): Promise<PaginatedProjects> => {
  return getProjects({ ...filters, ownerId });
};

// Get projects by team
export const getProjectsByTeam = async (
  teamId: string,
  filters?: Omit<ProjectFilters, "teamId">
): Promise<PaginatedProjects> => {
  return getProjects({ ...filters, teamId });
};

// Update project progress
export const updateProjectProgress = async (
  id: string,
  progress: number
): Promise<Project | null> => {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { progress: Math.max(0, Math.min(100, progress)) }, // Clamp between 0-100
    });

    return mapPrismaProjectToProject(project);
  } catch (error: any) {
    if (error.code === "P2025") {
      return null; // Project not found
    }
    console.error("Error updating project progress:", error);
    throw new Error("Failed to update project progress");
  }
};

// Update project status
export const updateProjectStatus = async (
  id: string,
  status: ProjectStatus
): Promise<Project | null> => {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { status },
    });

    return mapPrismaProjectToProject(project);
  } catch (error: any) {
    if (error.code === "P2025") {
      return null; // Project not found
    }
    console.error("Error updating project status:", error);
    throw new Error("Failed to update project status");
  }
};

// Archive project
export const archiveProject = async (id: string): Promise<boolean> => {
  try {
    await prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      return false; // Project not found
    }
    console.error("Error archiving project:", error);
    throw new Error("Failed to archive project");
  }
};

// Restore project
export const restoreProject = async (id: string): Promise<boolean> => {
  try {
    await prisma.project.update({
      where: { id },
      data: { isActive: true },
    });
    return true;
  } catch (error: any) {
    if (error.code === "P2025") {
      return false; // Project not found
    }
    console.error("Error restoring project:", error);
    throw new Error("Failed to restore project");
  }
};

// Calculate and update project progress based on tasks
export const calculateProjectProgress = async (id: string): Promise<number> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          select: {
            status: true,
          },
          where: {
            isArchived: false,
          },
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const totalTasks = project.tasks.length;
    if (totalTasks === 0) {
      return 0;
    }

    const completedTasks = project.tasks.filter(
      (task: { status: string }) => task.status === "completed"
    ).length;
    const progress = Math.round((completedTasks / totalTasks) * 100);

    // Update the project with calculated progress
    await prisma.project.update({
      where: { id },
      data: { progress },
    });

    return progress;
  } catch (error) {
    console.error("Error calculating project progress:", error);
    throw new Error("Failed to calculate project progress");
  }
};

// Check if user is a project member
export const isProjectMember = async (
  projectId: string,
  userId: string
): Promise<string | null> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          include: {
            members: {
              where: { userId },
              select: { role: true },
            },
          },
        },
      },
    });

    if (!project) {
      return null;
    }

    // Check if user is the owner
    if (project.ownerId === userId) {
      return "owner";
    }

    // Check if user is a team member
    if (project.team && project.team.members.length > 0) {
      return project.team.members[0]?.role || "member";
    }

    return null;
  } catch (error) {
    console.error("Error checking project membership:", error);
    throw new Error("Failed to check project membership");
  }
};

// Get project members
export const getProjectMembers = async (projectId: string) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        team: {
          include: {
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
        },
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    const members = [
      {
        ...project.owner,
        role: "owner",
      },
    ];

    if (project.team) {
      project.team.members.forEach((member: any) => {
        members.push({
          ...member.user,
          role: member.role,
        });
      });
    }

    return members;
  } catch (error) {
    console.error("Error getting project members:", error);
    throw new Error("Failed to get project members");
  }
};

// Add project member (via team)
export const addProjectMember = async (
  projectId: string,
  userId: string,
  role: string = "member"
) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { teamId: true },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (!project.teamId) {
      throw new Error("Project does not have a team");
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: project.teamId,
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

    return {
      ...member.user,
      role: member.role,
    };
  } catch (error) {
    console.error("Error adding project member:", error);
    throw new Error("Failed to add project member");
  }
};

// Remove project member
export const removeProjectMember = async (
  projectId: string,
  userId: string
): Promise<boolean> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { teamId: true },
    });

    if (!project || !project.teamId) {
      return false;
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: project.teamId,
          userId,
        },
      },
    });

    return true;
  } catch (error) {
    console.error("Error removing project member:", error);
    throw new Error("Failed to remove project member");
  }
};

// Get user projects (owned or member)
export const getUserProjects = async (
  userId: string,
  filters?: Omit<ProjectFilters, "ownerId">
) => {
  try {
    const whereCondition: any = {
      OR: [
        { ownerId: userId },
        {
          team: {
            members: {
              some: {
                userId,
              },
            },
          },
        },
      ],
    };

    // Apply additional filters
    if (filters?.status) {
      whereCondition.status = Array.isArray(filters.status)
        ? { in: filters.status }
        : filters.status;
    }

    if (filters?.isActive !== undefined) {
      whereCondition.isActive = filters.isActive;
    }

    if (filters?.search) {
      whereCondition.AND = [
        {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereCondition,
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
          tasks: {
            select: {
              status: true,
            },
            where: {
              isArchived: false,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where: whereCondition }),
    ]);

    const projectsWithDetails = projects.map((project: any) => {
      const baseProject = mapPrismaProjectToProject(project);

      const taskStats = {
        total: project.tasks.length,
        completed: project.tasks.filter(
          (task: { status: string }) => task.status === "completed"
        ).length,
        inProgress: project.tasks.filter(
          (task: { status: string }) => task.status === "in_progress"
        ).length,
        todo: project.tasks.filter(
          (task: { status: string }) => task.status === "todo"
        ).length,
      };

      return {
        ...baseProject,
        owner: project.owner,
        team: project.team
          ? {
              id: project.team.id,
              name: project.team.name,
              memberCount: project.team._count.members,
            }
          : undefined,
        taskStats,
      };
    });

    return {
      projects: projectsWithDetails,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error getting user projects:", error);
    throw new Error("Failed to get user projects");
  }
};

// Alias for backward compatibility
export const getAllProjects = getProjects;
