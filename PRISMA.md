# Prisma ORM Integration

This document explains how to use Prisma ORM in your task management system.

## 🚀 Quick Start

### 1. Database Setup

Make sure your PostgreSQL database is running and the connection string is configured in `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_management?schema=public"
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 4. Test the Integration

```bash
npx ts-node demo-prisma.ts
```

## 📚 Usage Examples

### Basic Prisma Client Usage

```typescript
import { prisma } from "./src/config/prisma";

// Create a user
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    password: "hashedPassword",
    firstName: "John",
    lastName: "Doe",
  },
});

// Find a user with relations
const userWithProjects = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    ownedProjects: true,
    assignedTasks: true,
  },
});
```

### Using the Prisma Methods

The codebase includes Prisma-based methods that provide type-safe database operations:

```typescript
import * as userMethods from "./src/methods/users.prisma";
import * as projectMethods from "./src/methods/projects.prisma";
import * as taskMethods from "./src/methods/tasks.prisma";

// Create a user with validation
const user = await userMethods.createUser({
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe",
});

// Get paginated projects
const projects = await projectMethods.getProjects({
  page: 1,
  limit: 10,
  status: "active",
});

// Create a task with relationships
const task = await taskMethods.createTask({
  title: "New Task",
  description: "Task description",
  reporterId: user.id,
  projectId: project.id,
  assigneeId: user.id,
});
```

## 🗂️ Database Schema

### Core Models

- **User**: User accounts and authentication
- **Team**: Teams with leaders and members
- **TeamMember**: Team membership relations
- **Project**: Projects with owners and teams
- **Task**: Tasks with assignees, reporters, and hierarchy
- **TaskComment**: Comments on tasks
- **TaskAttachment**: File attachments for tasks
- **Notification**: User notifications
- **RefreshToken**: JWT refresh tokens

### Key Relationships

```
User 1:N Project (owner)
User 1:N Task (assignee/reporter)
User 1:N Team (leader)
User N:M Team (member via TeamMember)
Project 1:N Task
Task 1:N Task (parent/child hierarchy)
Task 1:N TaskComment
Task 1:N TaskAttachment
```

## 🔧 Prisma Commands

### Development

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name description

# Reset database (WARNING: destroys data)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### Production

```bash
# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## 📊 Type Safety

Prisma provides full TypeScript type safety:

```typescript
// Auto-completion and type checking
const user = await prisma.user.findUnique({
  where: { id: "user-id" },
  select: {
    id: true,
    email: true,
    firstName: true,
    // TypeScript will suggest available fields
  },
});

// user is typed as { id: string; email: string; firstName: string }
```

## 🎯 Best Practices

### 1. Use Transactions for Complex Operations

```typescript
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const project = await tx.project.create({
    data: { ...projectData, ownerId: user.id },
  });
  return { user, project };
});
```

### 2. Handle Errors Properly

```typescript
try {
  const user = await prisma.user.create({ data: userData });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new Error("User with this email already exists");
    }
  }
  throw error;
}
```

### 3. Use Raw Queries When Needed

```typescript
const result = await prisma.$queryRaw`
  SELECT * FROM users 
  WHERE created_at > ${startDate}
  AND created_at < ${endDate}
`;
```

### 4. Optimize Queries with Select and Include

```typescript
// Only select needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
  },
});

// Include relations efficiently
const projectsWithDetails = await prisma.project.findMany({
  include: {
    owner: {
      select: { id: true, firstName: true, lastName: true },
    },
    _count: {
      select: { tasks: true },
    },
  },
});
```

## 🔄 Migration from Raw SQL

The codebase includes both raw SQL methods (`.ts` files) and Prisma methods (`.prisma.ts` files).

To migrate a service:

1. Import the Prisma method instead of the raw SQL method:

   ```typescript
   // Old
   import * as userMethods from "../methods/users";

   // New
   import * as userMethods from "../methods/users.prisma";
   ```

2. Update method calls to match new signatures:

   ```typescript
   // Old
   const user = await userMethods.updateUser(id, { first_name: "John" });

   // New
   const user = await userMethods.updateUser(id, { firstName: "John" });
   ```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Check environment variables
echo $DATABASE_URL
```

### Schema Issues

```bash
# Validate schema
npx prisma validate

# Check migration status
npx prisma migrate status
```

### Type Issues

```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma TypeScript Guide](https://www.prisma.io/docs/concepts/overview/prisma-in-your-stack/is-prisma-an-orm)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [PostgreSQL with Prisma](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
