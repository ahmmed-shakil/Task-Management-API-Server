#!/usr/bin/env ts-node

/**
 * Prisma Integration Demo Script
 *
 * This script demonstrates how to use Prisma ORM with your task management system.
 * Run this with: npx ts-node demo-prisma.ts
 */

import { prisma } from "./src/config/prisma";
import * as userMethods from "./src/methods/users.prisma";
import * as projectMethods from "./src/methods/projects.prisma";
import * as taskMethods from "./src/methods/tasks.prisma";

async function demonstratePrismaUsage() {
  console.log("🚀 Starting Prisma ORM Demo...\n");

  try {
    // Test database connection
    console.log("1. Testing database connection...");
    await prisma.$connect();
    console.log("✅ Connected to database successfully!\n");

    // 1. Create a test user
    console.log("2. Creating a test user...");
    const userData = {
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      firstName: "John",
      lastName: "Doe",
    };

    const user = await userMethods.createUser(userData);
    console.log("✅ User created:", {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });

    // 2. Create a test project
    console.log("\n3. Creating a test project...");
    const projectData = {
      name: "Demo Project",
      description: "A project created with Prisma ORM",
      status: "active" as const,
      priority: "high" as const,
      ownerId: user.id,
    };

    const project = await projectMethods.createProject(projectData);
    console.log("✅ Project created:", {
      id: project.id,
      name: project.name,
      status: project.status,
      owner: project.owner_id,
    });

    // 3. Create a test task
    console.log("\n4. Creating a test task...");
    const taskData = {
      title: "Demo Task",
      description: "A task created with Prisma ORM",
      status: "todo" as const,
      priority: "medium" as const,
      reporterId: user.id,
      projectId: project.id,
      assigneeId: user.id,
    };

    const task = await taskMethods.createTask(taskData);
    console.log("✅ Task created:", {
      id: task.id,
      title: task.title,
      status: task.status,
      assignee: task.assignee_id,
    });

    // 4. Fetch data with relationships
    console.log("\n5. Fetching project with details...");
    const projectWithDetails = await projectMethods.getProjectWithDetails(
      project.id
    );
    if (projectWithDetails) {
      console.log("✅ Project details:", {
        name: projectWithDetails.name,
        owner:
          projectWithDetails.owner.firstName +
          " " +
          projectWithDetails.owner.lastName,
        taskStats: projectWithDetails.taskStats,
      });
    }

    // 5. Fetch task with details
    console.log("\n6. Fetching task with details...");
    const taskWithDetails = await taskMethods.getTaskWithDetails(task.id);
    if (taskWithDetails) {
      console.log("✅ Task details:", {
        title: taskWithDetails.title,
        assignee:
          taskWithDetails.assignee?.firstName +
          " " +
          taskWithDetails.assignee?.lastName,
        reporter:
          taskWithDetails.reporter.firstName +
          " " +
          taskWithDetails.reporter.lastName,
        project: taskWithDetails.project.name,
      });
    }

    // 6. Update task status
    console.log("\n7. Updating task status...");
    const updatedTask = await taskMethods.updateTaskStatus(
      task.id,
      "completed"
    );
    if (updatedTask) {
      console.log("✅ Task status updated to:", updatedTask.status);
    }

    // 7. Get user's tasks
    console.log("\n8. Getting user's assigned tasks...");
    const userTasks = await taskMethods.getTasksByAssignee(user.id, {
      limit: 10,
    });
    console.log("✅ User has", userTasks.total, "assigned tasks");

    // 8. Clean up test data
    console.log("\n9. Cleaning up test data...");
    await taskMethods.deleteTask(task.id);
    await projectMethods.deleteProject(project.id);
    await userMethods.deleteUser(user.id);
    console.log("✅ Test data cleaned up");

    console.log("\n🎉 Prisma demo completed successfully!");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  } finally {
    await prisma.$disconnect();
    console.log("\n📡 Disconnected from database");
  }
}

// Check if this script is being run directly
if (require.main === module) {
  demonstratePrismaUsage()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Demo script failed:", error);
      process.exit(1);
    });
}

export { demonstratePrismaUsage };
