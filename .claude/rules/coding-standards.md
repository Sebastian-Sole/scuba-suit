# Coding Standards & Rules

## 🎯 **Core Mission**

Build a responsive web application that displays and analyzes code performance metrics for Knowit projects and their customers' projects. The application provides comprehensive scoreboard functionality with project analytics, performance tracking, and interactive data visualization.

## 🚫 **What NOT to Change**

### **Core Architecture (Locked)**

- **Next.js 15.5.2** with App Router - Do not downgrade or switch to Pages Router
- **React 19.2.0** with TypeScript - Do not downgrade React version
- **Tailwind CSS 3.4.17** for styling - Do not replace with other CSS frameworks
- **NextAuth 5.0.0-beta.29** for authentication - Keep Azure AD integration
- **Vitest 3.2.4+** for testing - Do not switch to Jest
- **Playwright 1.55.0+** for E2E testing - Keep browser automation setup
- **pnpm** as package manager - [[memory:8610311]]

### **File Structure**

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── board/             # Board-specific pages
│   ├── live/              # Live data pages
│   ├── projects/          # Project detail pages
│   └── layout.tsx         # Root layout - minimal changes only
├── components/
│   ├── data-display/      # Charts, tables, metrics display
│   ├── layout/            # Headers, navigation, providers
│   ├── navigation/        # Navigation components
│   └── ui/                # Reusable UI primitives
├── hooks/                 # Custom React hooks
├── lib/
│   ├── api-client/        # Auto-generated API client - DO NOT MODIFY
│   ├── api-client-init.ts # API client configuration
│   ├── auth.ts            # NextAuth configuration
│   ├── sanity/            # Sanity CMS integration
│   └── utils.ts           # Utility functions (cn, etc.)
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### **Essential Type Definitions**

```typescript
// DO NOT REMOVE - Core types for the API
export type ProjectDto = {
  id: string;
  name: string;
  lastUpdated: string;
  previousUpdated: string | null;
  pageCount: number;
  performance: number;
  accessibility: number;
  bestPractice: number;
  seo: number;
  security: number;
  average: number;
  progress: number;
};

// Authentication types
export type Session = {
  user: User;
  accessToken?: string;
  idToken?: string;
};
```

## ✅ **What TO Implement**

### **MVP Features**

- Project performance dashboard with metrics visualization
- Interactive data tables with sorting and filtering
- Responsive design for desktop and mobile
- Real-time data updates and caching
- User authentication via Azure AD
- Route-based navigation with proper loading states

### **Integration Requirements**

- Hey API client for backend communication
- NextAuth for Azure AD authentication
- Tailwind CSS for consistent styling
- Comprehensive testing with Vitest and Playwright
- Type-safe API integration with auto-generated clients

## 📋 **Coding Conventions**

### **TypeScript Standards**

```typescript
// Use explicit types for all props and API responses
interface ComponentProps {
  projects: ProjectDto[];
  onProjectSelect?: (id: string) => void;
  className?: string;
}

// Use Zod for runtime validation when needed
import { z } from "zod";

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  average: z.number().min(0).max(100),
});
```

### **Next.js App Router Patterns**

```typescript
// Server Components for data fetching
export default async function ProjectsPage() {
  const projects = await getApiSitesAllSites();
  return <ProjectsTable projects={projects.data ?? []} />;
}

// Client Components for interactivity
'use client';

export default function InteractiveChart({ data }: ChartProps) {
  const [selectedMetric, setSelectedMetric] = useState('performance');
  return <Chart data={data} metric={selectedMetric} />;
}

// Loading and error boundaries
export default function Loading() {
  return <Spinner aria-label="Loading projects..." />;
}

export default function Error({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>Something went wrong!</h2>
      <details>{error.message}</details>
    </div>
  );
}
```

### **Component Structure & Styling**

```typescript
// Order: imports, types, variants, component
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ProjectDto } from '@/lib/api-client';

// Component variants with CVA
const cardVariants = cva(
  'rounded-lg border bg-card p-4 shadow-sm transition-colors',
  {
    variants: {
      size: {
        sm: 'p-3 text-sm',
        md: 'p-4',
        lg: 'p-6 text-lg',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-accent',
        false: '',
      },
    },
    defaultVariants: { size: 'md', interactive: false },
  }
);

interface ProjectCardProps extends VariantProps<typeof cardVariants> {
  project: ProjectDto;
  onSelect?: (id: string) => void;
  className?: string;
}

export default function ProjectCard({
  project,
  size,
  interactive,
  onSelect,
  className
}: ProjectCardProps) {
  return (
    <div
      className={cn(cardVariants({ size, interactive }), className)}
      onClick={() => interactive && onSelect?.(project.id)}
    >
      {/* Component content */}
    </div>
  );
}

// Conditional styling with cn() utility
<div className={cn(
  "bg-surface text-primary p-4 rounded-md",
  isActive && "ring-2 ring-primary",
  className
)} />

// Responsive design with Tailwind breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {/* Responsive grid */}
</div>
```

### **API Integration Patterns**

```typescript
// Use auto-generated Hey API client
import { getApiSitesAllSites, type ProjectDto } from '@/lib/api-client';

// Server-side data fetching
export default async function ProjectsPage() {
  try {
    const response = await getApiSitesAllSites();
    return <ProjectsTable projects={response.data ?? []} />;
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return <ErrorBoundary error="Failed to load projects" />;
  }
}

// Client-side data fetching hook
const useProjects = () => {
  const [projects, setProjects] = useState<ProjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApiSitesAllSites()
      .then(res => setProjects(res.data ?? []))
      .catch(err => console.error('API Error:', err))
      .finally(() => setLoading(false));
  }, []);

  return { projects, loading };
};
```

### **Authentication Integration**

```typescript
// Server Components
import { auth } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/auth/signin');
  return <Dashboard user={session.user} />;
}

// Client Components
'use client';
import { useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <Spinner />;
  if (!session) return <SignInPrompt />;
  return <Profile user={session.user} />;
}
```

## 🔧 **Development Workflow**

### **Before Making Changes**

```bash
pnpm typecheck && pnpm lint && pnpm test
pnpm codegen  # If API schema changed
```

### **Change Process**

1. Generate API types if backend changes: `pnpm codegen`
2. Create/update components with proper TypeScript types
3. Write tests for new functionality
4. Run linting and type checking
5. Test in browser and run E2E tests

### **Error Resolution Priority**

1. TypeScript compilation errors (highest)
2. ESLint errors
3. Test failures
4. Runtime errors
5. Warnings (address but don't block)

## 🚨 **Critical Don'ts**

### **Architecture Violations**

- ❌ No direct database queries in frontend code
- ❌ No manual API client modifications (use `pnpm codegen`)
- ❌ No Pages Router patterns in App Router project
- ❌ No client-side authentication logic (use NextAuth)
- ❌ No inline styles (use Tailwind CSS classes)

### **Performance & Code Quality**

- ❌ Don't fetch data in client components without caching
- ❌ Don't create objects in render methods
- ❌ Don't forget to memoize expensive calculations
- ❌ No `console.log` statements in production code
- ❌ No `any` types (use proper TypeScript)
- ❌ No hardcoded values (use environment variables/tokens)
- ❌ No commented-out code blocks
- ❌ No missing error boundaries

## 🎨 **UI/UX Guidelines**

### **Design Principles**

- Clean, professional interface for business users
- Data-driven design with clear metrics visualization
- Responsive design for desktop and mobile
- Accessible design following WCAG guidelines
- Consistent spacing and typography using design tokens

### **Interaction Patterns**

- Click to drill down into project details
- Hover states for interactive elements
- Loading states for async operations
- Sort and filter for data tables
- Responsive navigation for mobile

## 🧪 **Testing Standards**

### **Testing Framework Stack**

- **Vitest 3.2.4+** for unit and integration tests
- **React Testing Library** for component testing
- **Playwright 1.55.0+** for E2E testing
- **Storybook** for component documentation and visual testing
- **MSW** for API mocking in tests

### **Testing Philosophy**

Test user behavior, not implementation details:

```typescript
// ✅ CORRECT: Test user behavior
describe('ProjectsTable', () => {
  it('should display and sort projects', async () => {
    render(<ProjectsTable projects={mockProjects} />);

    expect(screen.getByText('Test Project 1')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /sort/i }));

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Test Project 1');
  });
});

// ❌ WRONG: Testing implementation details
expect(component.state.sortColumn).toBe('performance');
```

### **Test Organization**

```
test/
├── unit/           # Component and utility tests
├── integration/    # API integration tests
├── e2e/           # End-to-end tests
├── utils.ts       # Test utilities and mocks
└── vitestSetup.ts # Test environment setup
```

## 📱 **Responsive Design**

### **Tailwind Breakpoints**

- `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px), `2xl` (1536px)

```typescript
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6" />

// Responsive text and spacing
<div className="text-sm p-4 md:text-base md:p-6 lg:text-lg lg:p-8" />

// Responsive visibility
<div className="hidden md:block" />  // Hidden on mobile
<div className="block md:hidden" />  // Visible on mobile only

// Responsive layout
<div className="flex flex-col md:flex-row gap-4" />
```

## 🔒 **Security & Performance**

### **Security Best Practices**

```typescript
// Always validate sessions server-side
export default async function ProtectedApiRoute() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// Use environment variables for sensitive data
import { env } from "@/env";
const apiConfig = {
  baseUrl: env.API_BASE_URL,
  clientSecret: env.AZURE_AD_CLIENT_SECRET, // Never expose in client
};

// Validate all inputs with Zod
const schema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  metrics: z.object({
    performance: z.number().min(0).max(100),
  }),
});
```

### **Performance Optimization**

```typescript
// Next.js caching
export const revalidate = 600; // Cache for 10 minutes

// Dynamic imports for large components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// Memoize expensive calculations
const sortedProjects = useMemo(() =>
  projects.sort((a, b) => b.average - a.average),
  [projects]
);

// Optimize re-renders
const ProjectCard = memo(({ project, onSelect }: Props) => {
  const handleClick = useCallback(() => onSelect?.(project.id), [project.id, onSelect]);
  return <div onClick={handleClick}>{project.name}</div>;
});
```

## 🎯 **Success Metrics**

### **Technical**

- [ ] Zero TypeScript compilation errors
- [ ] All ESLint rules pass
- [ ] Test coverage > 80% for business logic
- [ ] E2E tests pass for critical user journeys
- [ ] Bundle size < 500KB gzipped for initial load

### **Performance**

- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

### **User Experience**

- [ ] Responsive design works on all device sizes
- [ ] Accessible to screen readers (WCAG AA)
- [ ] Fast loading with skeleton states
- [ ] Error states are user-friendly
- [ ] Authentication flow is seamless

---

This document ensures consistency, maintainability, and alignment with the project's core mission of providing a high-quality scoreboard application for code performance analysis.
