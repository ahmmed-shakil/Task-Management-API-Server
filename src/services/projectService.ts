import * as projectMethods from "../methods/projects.prisma";
import { AppError } from "../middleware/errorHandler";
import {
  Project,
  CreateProjectData,
  ProjectStatus,
  ProjectPriority,
  ApiResponse,
} from "../types/index";

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

class ProjectService {
  async getAllProjects(
    userId: string,
    filters: ProjectFilters = {}
  ): Promise<ApiResponse<any>> {
    try {
      const { page = 1, limit = 10, status, priority, search } = filters;

      const projectFilters: any = {
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
        userId, // This will filter to projects the user is a member of
      };

      if (status) projectFilters.status = status;
      if (priority) projectFilters.priority = priority;
      if (search) projectFilters.search = search;

      const projects = await projectMethods.getAllProjects(projectFilters);

      return {
        success: true,
        data: projects.projects,
        message: "Projects retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, 500);
    }
  }

  async createProject(
    userId: string,
    projectData: CreateProjectData
  ): Promise<ApiResponse<Project>> {
    try {
      // Validate required fields
      if (!projectData.name) {
        throw new AppError("Project name is required", 400);
      }

      // Add owner ID to project data
      const dataWithOwner: CreateProjectData = {
        ...projectData,
        ownerId: userId,
      };

      const project = await projectMethods.createProject(dataWithOwner);

      return {
        success: true,
        data: project,
        message: "Project created successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getProjectById(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user has access to this project
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this project", 403);
      }

      const project = await projectMethods.getProjectById(projectId);
      if (!project) {
        throw new AppError("Project not found", 404);
      }

      return {
        success: true,
        data: project,
        message: "Project retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async updateProject(
    projectId: string,
    userId: string,
    updateData: Partial<CreateProjectData>
  ): Promise<ApiResponse<Project>> {
    try {
      // Check if user has permission to update this project (owner or admin role)
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
        throw new AppError("Permission denied to update this project", 403);
      }

      const project = await projectMethods.updateProject(projectId, updateData);
      if (!project) {
        throw new AppError("Project not found", 404);
      }

      return {
        success: true,
        data: project,
        message: "Project updated successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async deleteProject(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<null>> {
    try {
      // Check if user is the project owner
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole || memberRole !== "owner") {
        throw new AppError("Only project owner can delete the project", 403);
      }

      await projectMethods.deleteProject(projectId);

      return {
        success: true,
        data: null,
        message: "Project deleted successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getProjectMembers(
    projectId: string,
    userId: string
  ): Promise<ApiResponse<any[]>> {
    try {
      // Check if user has access to this project
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole) {
        throw new AppError("Access denied to this project", 403);
      }

      const members = await projectMethods.getProjectMembers(projectId);

      return {
        success: true,
        data: members,
        message: "Project members retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async addProjectMember(
    projectId: string,
    userId: string,
    memberData: AddMemberData
  ): Promise<ApiResponse<any>> {
    try {
      // Check if user has permission to add members (owner or admin)
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
        throw new AppError(
          "Permission denied to add members to this project",
          403
        );
      }

      const member = await projectMethods.addProjectMember(
        projectId,
        memberData.userId,
        memberData.role || "member"
      );

      return {
        success: true,
        data: member,
        message: "Member added to project successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string
  ): Promise<ApiResponse<null>> {
    try {
      // Check if user has permission to remove members (owner or admin)
      const memberRole = await projectMethods.isProjectMember(
        projectId,
        userId
      );
      if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
        throw new AppError(
          "Permission denied to remove members from this project",
          403
        );
      }

      await projectMethods.removeProjectMember(projectId, memberId);

      return {
        success: true,
        data: null,
        message: "Member removed from project successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }

  async getUserProjects(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<any[]>> {
    try {
      const projects = await projectMethods.getUserProjects(userId, {
        page,
        limit,
      });

      return {
        success: true,
        data: projects.projects,
        message: "User projects retrieved successfully",
      };
    } catch (error: any) {
      throw new AppError(error.message, error.statusCode || 500);
    }
  }
}

export default new ProjectService();
