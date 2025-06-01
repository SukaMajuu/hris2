# Module Refactoring Guide: Hook-Centric Architecture

## Overview

This document outlines the refactoring approach used for the work schedule module, which can be applied to any module in the application. The goal is to create a clean, centralized architecture where pages only interact with custom hooks instead of directly importing queries, mutations, or services.

## Architecture Principles

The refactored architecture follows these core principles:

1. **Services** - Handle actual API calls and business logic
2. **Hooks** - Centralize all queries, mutations, and state management
3. **Pages** - Only import and use hooks (no direct API imports)
4. **Store** - Managed automatically within hooks
5. **Single Responsibility** - Each hook has a specific purpose

## Work Schedule Module Example

### Files Structure
- `services/work-schedule.service.ts` - API service methods (getAll, getById, create, update, delete)
- `api/queries/work-schedule.queries.ts` - React Query hooks for data fetching
- `api/mutations/work-schedule.mutation.ts` - React Query hooks for data mutations
- `_hooks/useWorkSchedule.ts` - Centralized hook that uses queries/mutations internally
- `stores/work-schedule.store.ts` - Zustand store for state management

### Page Files (Only use hooks)
- `page.tsx` - Main list page using `useWorkScheduleOperations`
- `add/page.tsx` - Add page using `useWorkScheduleMutations`
- `edit/[id]/page.tsx` - Edit page using `useWorkScheduleDetailData` and `useWorkScheduleMutations`

## Generic Refactoring Steps

### Step 1: Analyze Current Structure
Before refactoring any module, identify:
- Service files (`services/*.service.ts`)
- Query files (`api/queries/*.queries.ts`)
- Mutation files (`api/mutations/*.mutation.ts`)
- Store files (`stores/*.store.ts`)
- Page files that use these directly

### Step 2: Create Hook Architecture
Create a `_hooks/use[ModuleName].ts` file with these exported functions:

#### 2.1 List Hook Pattern
```tsx
export function use[ModuleName]List(page: number, pageSize: number) {
    const { set[ModuleName]s } = use[ModuleName]Store();
    const queryResult = use[ModuleName]s(page, pageSize);

    React.useEffect(() => {
        if (queryResult.data?.items) {
            set[ModuleName]s(queryResult.data.items);
        }
    }, [queryResult.data, set[ModuleName]s]);

    return {
        ...queryResult,
        [moduleNamePlural]: queryResult.data?.items || [],
        totalItems: queryResult.data?.pagination?.total_items || 0,
        totalPages: queryResult.data?.pagination?.total_pages || 0,
        // ... other pagination fields
    };
}
```

#### 2.2 Detail Hook Pattern
```tsx
export function use[ModuleName]DetailData(id: number) {
    const queryResult = use[ModuleName]Detail(id);
    
    return {
        ...queryResult,
        [moduleName]: queryResult.data,
    };
}
```

#### 2.3 Mutations Hook Pattern
```tsx
export function use[ModuleName]Mutations() {
    const router = useRouter();
    const createMutation = useCreate[ModuleName]();
    const updateMutation = useUpdate[ModuleName]();
    const deleteMutation = useDelete[ModuleName]();

    const handleCreate = useCallback(async (data: Partial<[ModuleName]>) => {
        try {
            await createMutation.mutateAsync(data);
            toast({ title: "Success", description: "[ModuleName] successfully created" });
            setTimeout(() => router.push("/path/to/list"), 2000);
        } catch (error) {
            toast({ title: "Failed", description: "Failed to create [moduleName]", variant: "destructive" });
            throw error;
        }
    }, [createMutation, router]);

    // Similar patterns for handleUpdate and handleDelete

    return {
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        handleCreate,
        handleUpdate,
        handleDelete,
    };
}
```

#### 2.4 Dialog/Navigation Hook Pattern
```tsx
export function use[ModuleName]() {
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [[moduleName]ToDelete, set[ModuleName]ToDelete] = useState<[ModuleName] | null>(null);

    const handleOpenDeleteDialog = useCallback(([moduleName]: [ModuleName]) => {
        set[ModuleName]ToDelete([moduleName]);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleEditNavigation = useCallback((id: number) => {
        router.push(`/path/to/edit/${id}`);
    }, [router]);

    return {
        isDeleteDialogOpen,
        [moduleName]ToDelete,
        handleOpenDeleteDialog,
        handleEditNavigation,
        // ... other dialog/navigation handlers
    };
}
```

#### 2.5 Comprehensive Operations Hook Pattern
```tsx
export function use[ModuleName]Operations(page: number, pageSize: number) {
    const listHook = use[ModuleName]List(page, pageSize);
    const dialogHook = use[ModuleName]();
    const mutationHook = use[ModuleName]Mutations();

    return {
        ...listHook,
        ...dialogHook,
        ...mutationHook,
    };
}
```

### Step 3: Update Pages to Use Hooks Only

#### 3.1 List Page Pattern
```tsx
// Before
import { use[ModuleName]s } from "@/api/queries/[module].queries";
import { useDelete[ModuleName] } from "@/api/mutations/[module].mutation";
import { use[ModuleName]Store } from "@/stores/[module].store";

// After
import { use[ModuleName]Operations } from "./_hooks/use[ModuleName]";

export default function [ModuleName]Page() {
    const { 
        [moduleNamePlural], 
        isLoading, 
        handleDelete,
        handleEditNavigation,
        // ... all other functionality
    } = use[ModuleName]Operations(page, pageSize);
}
```

#### 3.2 Add Page Pattern
```tsx
// Before
import { useCreate[ModuleName] } from "@/api/mutations/[module].mutation";
import { toast } from "@/components/ui/use-toast";

// After
import { use[ModuleName]Mutations } from "../_hooks/use[ModuleName]";

export default function Add[ModuleName]Page() {
    const { handleCreate, isCreating } = use[ModuleName]Mutations();
}
```

#### 3.3 Edit Page Pattern
```tsx
// Before
import { use[ModuleName]Detail } from "@/api/queries/[module].queries";
import { useUpdate[ModuleName] } from "@/api/mutations/[module].mutation";

// After
import { use[ModuleName]DetailData, use[ModuleName]Mutations } from "../_hooks/use[ModuleName]";

export default function Edit[ModuleName]Page() {
    const { [moduleName], isLoading } = use[ModuleName]DetailData(id);
    const { handleUpdate, isUpdating } = use[ModuleName]Mutations();
}
```

## Implementation Checklist

### Pre-Refactoring
- [ ] Identify all service, query, mutation, and store files
- [ ] List all pages that directly import API functions
- [ ] Document current functionality and state management

### During Refactoring
- [ ] Create `_hooks/use[ModuleName].ts` file
- [ ] Implement list hook with store integration
- [ ] Implement detail hook for single item fetching
- [ ] Implement mutations hook with error handling
- [ ] Implement dialog/navigation hook
- [ ] Implement comprehensive operations hook
- [ ] Update all pages to use hooks only
- [ ] Remove direct API imports from pages

### Post-Refactoring
- [ ] Run TypeScript type checking
- [ ] Test all CRUD operations
- [ ] Verify error handling and toast messages
- [ ] Test navigation between pages
- [ ] Verify store updates work correctly
- [ ] Update documentation

## File Naming Conventions

- Hook file: `_hooks/use[ModuleName].ts`
- Export functions: `use[ModuleName]List`, `use[ModuleName]DetailData`, etc.
- Comprehensive hook: `use[ModuleName]Operations`
- Keep existing service/query/mutation files for internal use

## Work Schedule Example: Hook API Reference

### `useWorkScheduleOperations(page, pageSize)`
**Usage**: Main list page
**Returns**: Complete list functionality including:
- List data: `workSchedules`, `totalItems`, `totalPages`, etc.
- Dialog management: `isDeleteDialogOpen`, `viewDialogOpen`, handlers
- Navigation: `handleEditNavigation`, `handleAddNavigation`
- Mutations: `handleDelete`, `isDeleting`

### `useWorkScheduleMutations()`
**Usage**: Add and Edit pages
**Returns**: Mutation handlers:
- `handleCreate(data)` - Create with toast and navigation
- `handleUpdate(id, data)` - Update with toast and navigation
- `handleDelete(id)` - Delete with toast
- Loading states: `isCreating`, `isUpdating`, `isDeleting`

### `useWorkScheduleDetailData(id)`
**Usage**: Edit page for fetching detail
**Returns**: 
- `workSchedule` - Detail data
- Loading and error states

### `useWorkSchedule()`
**Usage**: Dialog and navigation management
**Returns**: Dialog states and handlers

### `useWorkSchedulesList(page, pageSize)`
**Usage**: Raw list functionality
**Returns**: List data with pagination

## Work Schedule Example: Usage Patterns

### Main List Page
```tsx
// Before (multiple imports)
import { useWorkSchedules } from "@/api/queries/work-schedule.queries";
import { useDeleteWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { useWorkScheduleStore } from "@/stores/work-schedule.store";

// After (single import)
import { useWorkScheduleOperations } from "./_hooks/useWorkSchedule";

export default function WorkSchedulePage() {
    const {
        workSchedules,
        isLoading,
        handleDelete,
        // ... all other functionality
    } = useWorkScheduleOperations(page, pageSize);
}
```

### Add Page
```tsx
// Before
import { useCreateWorkSchedule } from "@/api/mutations/work-schedule.mutation";
import { toast } from "@/components/ui/use-toast";

// After
import { useWorkScheduleMutations } from "../_hooks/useWorkSchedule";

export default function AddWorkSchedulePage() {
    const { handleCreate, isCreating } = useWorkScheduleMutations();
    
    const handleSave = async (data) => {
        await handleCreate(data); // Includes toast and navigation
    };
}
```

### Edit Page
```tsx
// Before
import { useWorkScheduleDetail } from "@/api/queries/work-schedule.queries";
import { useUpdateWorkSchedule } from "@/api/mutations/work-schedule.mutation";

// After
import { useWorkScheduleDetailData, useWorkScheduleMutations } from "../_hooks/useWorkSchedule";

export default function EditWorkSchedulePage() {
    const { workSchedule, isLoading } = useWorkScheduleDetailData(id);
    const { handleUpdate, isUpdating } = useWorkScheduleMutations();
}
```

## Benefits

1. **Single Import**: Pages only need to import the hook file
2. **Centralized Logic**: All API logic is in one place
3. **Consistent Error Handling**: Toast messages handled in the hook
4. **Automatic Navigation**: Navigation logic included in mutations
5. **Store Integration**: Store updates handled automatically
6. **Type Safety**: Full TypeScript support maintained
7. **Reusability**: Hooks can be reused across different components

## Benefits of This Architecture

1. **Single Import**: Pages only need to import the hook file
2. **Centralized Logic**: All API logic is in one place
3. **Consistent Error Handling**: Toast messages handled in the hook
4. **Automatic Navigation**: Navigation logic included in mutations
5. **Store Integration**: Store updates handled automatically
6. **Type Safety**: Full TypeScript support maintained
7. **Reusability**: Hooks can be reused across different components
8. **Separation of Concerns**: Clear boundaries between layers
9. **Easier Testing**: Hooks can be tested independently
10. **Better Maintainability**: Changes to API logic only affect one file

## Next Steps for Other Modules

### Recommended Module Order
1. **Employee Module** - Similar complexity to work schedule
2. **Location Module** - Simpler, good for testing the pattern
3. **Position Module** - Similar to location
4. **Check Clock Settings** - More complex state management
5. **Leave Request** - Complex approval workflows

### Common Patterns Across Modules
- Always keep the service layer unchanged
- Use the same hook naming conventions
- Implement consistent error handling
- Include navigation logic in mutations
- Integrate with existing stores
- Maintain TypeScript type safety

## Migration Template

For each new module, copy this template structure:

```
[module-folder]/
├── _hooks/
│   └── use[ModuleName].ts          # Central hook file
├── page.tsx                        # List page (uses Operations hook)
├── add/
│   └── page.tsx                    # Add page (uses Mutations hook)
└── edit/[id]/
    └── page.tsx                    # Edit page (uses Detail + Mutations hooks)
```

This architecture ensures consistency across all modules and makes the codebase more maintainable and scalable.
