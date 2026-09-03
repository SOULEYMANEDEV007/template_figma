// routes/web.ts
export const WEB_ROUTES = {
    // Public routes
    HOME: "/",
    LOGIN: "/login",

    // Dashboard routes
    DASHBOARD: {
        INDEX: "/dashboard",
        SETTINGS: "/dashboard/settings",
    },

    // Classes routes
    CLASSES: {
        INDEX: "/dashboard/classes",
        SHOW: (id: string) => `/dashboard/classes/${id}`,
        CREATE: "/dashboard/classes/create",
        EDIT: (id: string) => `/dashboard/classes/${id}/edit`,
    },

    // Students routes (if you plan to add them)
    STUDENTS: {
        INDEX: "/dashboard/students",
        SHOW: (id: string) => `/dashboard/students/${id}`,
        CREATE: "/dashboard/students/create",
        EDIT: (id: string) => `/dashboard/students/${id}/edit`,
    },

    // Textbooks routes
    TEXTBOOKS: {
        INDEX: "/dashboard/textbooks",
        SHOW: (id: string) => `/dashboard/textbooks/${id}`,
        CREATE: "/dashboard/textbooks/create",
        EDIT: (id: string) => `/dashboard/textbooks/${id}/edit`,
    },

    // Attendance routes (if you plan to add them)
    ATTENDANCE: {
        INDEX: "/dashboard/attendance",
        CLASS: (classId: string) => `/dashboard/attendance/class/${classId}`,
        REPORTS: "/dashboard/attendance/reports",
    },

    // Reports routes (if you plan to add them)
    REPORTS: {
        INDEX: "/dashboard/reports",
        ATTENDANCE: "/dashboard/reports/attendance",
        PERFORMANCE: "/dashboard/reports/performance",
        TEACHER_ACTIVITY: "/dashboard/reports/teacher-activity",
    },
} as const;

// Helper function to check if a route requires authentication
export const isProtectedRoute = (pathname: string): boolean => {
    const publicRoutes = [WEB_ROUTES.HOME, WEB_ROUTES.LOGIN];
    return !publicRoutes.includes(pathname as any);
};

// Helper function to get the active navigation item
export const getActiveRoute = (pathname: string): string => {
    if (pathname.startsWith("/dashboard/classes")) return "classes";
    if (pathname.startsWith("/dashboard/textbooks")) return "textbooks";
    if (pathname.startsWith("/dashboard/students")) return "students";
    if (pathname.startsWith("/dashboard/attendance")) return "attendance";
    if (pathname.startsWith("/dashboard/reports")) return "reports";
    if (pathname.startsWith("/dashboard/settings")) return "settings";
    if (pathname === "/dashboard") return "dashboard";
    return "";
};

// Helper function to build web URLs with query parameters
export const buildWebUrl = (
    route: string,
    params?: Record<string, string | number>
): string => {
    if (!params || Object.keys(params).length === 0) {
        return route;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value.toString());
    });

    return `${route}?${searchParams.toString()}`;
};

// Navigation items for sidebar/header
export const NAVIGATION_ITEMS = [
    {
        label: "Dashboard",
        route: WEB_ROUTES.DASHBOARD.INDEX,
        icon: "dashboard",
        key: "dashboard",
    },
    {
        label: "Classes",
        route: WEB_ROUTES.CLASSES.INDEX,
        icon: "school",
        key: "classes",
    },
    {
        label: "Textbooks",
        route: WEB_ROUTES.TEXTBOOKS.INDEX,
        icon: "book",
        key: "textbooks",
    },
    // Add more navigation items as needed
] as const;

// Breadcrumb helpers
export const getBreadcrumbs = (
    pathname: string
): Array<{ label: string; href?: string }> => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href?: string }> = [];

    if (segments.length === 0) {
        return [{ label: "Home" }];
    }

    // Always start with Dashboard for protected routes
    if (segments[0] === "dashboard") {
        breadcrumbs.push({
            label: "Dashboard",
            href: WEB_ROUTES.DASHBOARD.INDEX,
        });

        if (segments.length > 1) {
            switch (segments[1]) {
                case "classes":
                    breadcrumbs.push({
                        label: "Classes",
                        href:
                            segments.length === 2
                                ? undefined
                                : WEB_ROUTES.CLASSES.INDEX,
                    });
                    if (segments.length > 2 && segments[2] !== "create") {
                        breadcrumbs.push({ label: "Class Details" });
                    } else if (segments[2] === "create") {
                        breadcrumbs.push({ label: "Create Class" });
                    }
                    break;
                case "textbooks":
                    breadcrumbs.push({
                        label: "Textbooks",
                        href:
                            segments.length === 2
                                ? undefined
                                : WEB_ROUTES.TEXTBOOKS.INDEX,
                    });
                    if (segments.length > 2 && segments[2] !== "create") {
                        breadcrumbs.push({ label: "Textbook Details" });
                    } else if (segments[2] === "create") {
                        breadcrumbs.push({ label: "Create Entry" });
                    }
                    break;
                case "settings":
                    breadcrumbs.push({ label: "Settings" });
                    break;
                default:
                    breadcrumbs.push({
                        label:
                            segments[1].charAt(0).toUpperCase() +
                            segments[1].slice(1),
                    });
            }
        }
    }

    return breadcrumbs;
};

// Export types for better type safety
export type WebRoutes = typeof WEB_ROUTES;
export type NavigationItem = (typeof NAVIGATION_ITEMS)[number];
