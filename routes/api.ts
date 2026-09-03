// routes/api.ts
export const API_ROUTES = {
    // Authentication
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        ME: "/auth/me",
        REFRESH: "/auth/refresh",
        UPDATE_PROFILE: "/auth/profile",
        UPDATE_PASSWORD: "/auth/password",
    },

    // Dashboard
    DASHBOARD: {
        STATS: "/dashboard/stats",
        RECENT_ACTIVITY: "/dashboard/recent-activity",
    },

    // Classes/Classrooms
    CLASSROOMS: {
        INDEX: "/classrooms",
        STORE: "/classrooms",
        SHOW: (slug: string) => `/classrooms/${slug}`,
        UPDATE: (slug: string) => `/classrooms/${slug}`,
        DELETE: (slug: string) => `/classrooms/${slug}`,
        STUDENTS: (slug: string) => `/classrooms/${slug}/students`,
        ATTENDANCE: (slug: string) => `/classrooms/${slug}/attendance`,
        TEXTBOOK_ENTRIES: (slug: string) =>
            `/classrooms/${slug}/textbook-entries`,
        STATISTICS: (slug: string) => `/classrooms/${slug}/statistics`,
    },

    // Students
    STUDENTS: {
        INDEX: "/students",
        STORE: "/students",
        SHOW: (slug: string) => `/students/${slug}`,
        UPDATE: (slug: string) => `/students/${slug}`,
        DELETE: (slug: string) => `/students/${slug}`,
        IMPORT: "/students/import",
        EXPORT: "/students/export",
        ATTENDANCE_HISTORY: (slug: string) => `/students/${slug}/attendance`,
    },

    // Attendance
    ATTENDANCE: {
        INDEX: "/attendance",
        STORE: "/attendance",
        SHOW: (slug: string) => `/attendance/${slug}`,
        UPDATE: (slug: string) => `/attendance/${slug}`,
        DELETE: (slug: string) => `/attendance/${slug}`,
        BULK_STORE: "/attendance/bulk",
        REPORTS: "/attendance/reports",
        EXPORT: "/attendance/export",
    },

    // Textbook Entries
    TEXTBOOKS: {
        INDEX: "/textbooks",
        STORE: "/textbooks",
        SHOW: (slug: string) => `/textbooks/${slug}`,
        UPDATE: (slug: string) => `/textbooks/${slug}`,
        DELETE: (slug: string) => `/textbooks/${slug}`,
        SUBMIT: (slug: string) => `/textbooks/${slug}/submit`,
        EXPORT: "/textbooks/export",
    },

    // Reports
    REPORTS: {
        ATTENDANCE: "/reports/attendance",
        CLASSROOM_PERFORMANCE: "/reports/classroom-performance",
        TEACHER_ACTIVITY: "/reports/teacher-activity",
        EXPORT: {
            ATTENDANCE: "/reports/attendance/export",
            CLASSROOM_PERFORMANCE: "/reports/classroom-performance/export",
            TEACHER_ACTIVITY: "/reports/teacher-activity/export",
        },
    },

    // Sync
    SYNC: {
        TEXTBOOK_ENTRIES: "/sync/textbook",
        ATTENDANCE: "/sync/attendance",
        CHANGES: "/sync/changes",
        RESOLVE_CONFLICTS: "/sync/resolve-conflicts",
        STATUS: "/sync/status",
    },

    // Schools - For inspector access
    SCHOOLS: {
        INDEX: "/schools",
        SHOW: (slug: string) => `/schools/${slug}`,
        TEXTBOOKS: (slug: string) => `/schools/${slug}/textbooks`,
        TEACHERS: (slug: string) => `/schools/${slug}/teachers`,
        STATS: (slug: string) => `/schools/${slug}/stats`,
    },

    // Inspector specific routes
    INSPECTOR: {
        DASHBOARD_STATS: "/inspector/stats",
        SCHOOLS: "/inspector/schools",
        SCHOOL_TEXTBOOKS: (schoolSlug: string) =>
            `/inspector/schools/${schoolSlug}/textbooks`,
        TEXTBOOK_DETAIL: (schoolSlug: string, textbookSlug: string) =>
            `/inspector/schools/${schoolSlug}/textbooks/${textbookSlug}`,
        UPDATE_TEXTBOOK_STATUS: (schoolSlug: string, textbookSlug: string) =>
            `/inspector/schools/${schoolSlug}/textbooks/${textbookSlug}/status`,
    },

    // Principal specific routes
    PRINCIPAL: {
        DASHBOARD_STATS: "/principal/stats",
        TEXTBOOKS: "/principal/textbooks",
        TEXTBOOK_DETAIL: (textbookSlug: string) =>
            `/principal/textbooks/${textbookSlug}`,
        UPDATE_TEXTBOOK_STATUS: (textbookSlug: string) =>
            `/principal/textbooks/${textbookSlug}/status`,
    },
} as const;

// Helper function to build API URLs with query parameters
export const buildApiUrl = (
    endpoint: string,
    params?: Record<string, any>
): string => {
    if (!params || Object.keys(params).length === 0) {
        return endpoint;
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
                value.forEach(v =>
                    searchParams.append(`${key}[]`, v.toString())
                );
            } else if (typeof value === "object") {
                Object.entries(value).forEach(([subKey, subValue]) => {
                    if (subValue !== undefined && subValue !== null) {
                        searchParams.append(
                            `${key}[${subKey}]`,
                            subValue.toString()
                        );
                    }
                });
            } else {
                searchParams.append(key, value.toString());
            }
        }
    });

    return `${endpoint}?${searchParams.toString()}`;
};

// Export types for better type safety
export type AuthRoutes = typeof API_ROUTES.AUTH;
export type DashboardRoutes = typeof API_ROUTES.DASHBOARD;
export type ClassroomRoutes = typeof API_ROUTES.CLASSROOMS;
export type StudentRoutes = typeof API_ROUTES.STUDENTS;
export type AttendanceRoutes = typeof API_ROUTES.ATTENDANCE;
export type TextbookRoutes = typeof API_ROUTES.TEXTBOOKS;
export type ReportRoutes = typeof API_ROUTES.REPORTS;
export type SyncRoutes = typeof API_ROUTES.SYNC;
