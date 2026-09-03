// lib/hooks/api-hooks.ts - Refactored and simplified, with consistent cache management and less duplication

import {
    useMutation,
    UseMutationOptions,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import type {
    ApiError,
    Attendance,
    Classroom,
    CreateAttendanceData,
    CreateClassroomData,
    CreateStudentData,
    CreateTextbookEntryData,
    LoginCredentials,
    QueryParams,
    Student,
    TextbookEntry,
    UpdateClassroomData,
    UpdateTextbookEntryData,
} from "../../types/api";
import api, { handleApiError } from "../api-client";
import inspectorApi from "../api/inspector";
import schoolsApi from "../api/schools";

// Query Keys
export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    dashboard: {
        stats: (period?: string) => ["dashboard", "stats", period] as const,
        recentActivity: (limit?: number) =>
            ["dashboard", "recent-activity", limit] as const,
    },
    classrooms: {
        all: (params?: QueryParams) => ["classrooms", "list", params] as const,
        detail: (slug: string, include?: string[]) =>
            ["classrooms", "detail", slug, include] as const,
        students: (slug: string, params?: QueryParams) =>
            ["classrooms", slug, "students", params] as const,
        attendance: (slug: string, params?: QueryParams) =>
            ["classrooms", slug, "attendance", params] as const,
        textbookEntries: (slug: string, params?: QueryParams) =>
            ["classrooms", slug, "textbook-entries", params] as const,
        statistics: (slug: string, params?: any) =>
            ["classrooms", slug, "statistics", params] as const,
    },
    students: {
        all: (params?: QueryParams) => ["students", "list", params] as const,
        detail: (slug: string, include?: string[]) =>
            ["students", "detail", slug, include] as const,
        attendanceHistory: (slug: string, params?: QueryParams) =>
            ["students", slug, "attendance", params] as const,
    },
    attendance: {
        all: (params?: QueryParams) => ["attendance", "list", params] as const,
        detail: (slug: string, include?: string[]) =>
            ["attendance", "detail", slug, include] as const,
        reports: (params?: any) => ["attendance", "reports", params] as const,
    },
    textbooks: {
        all: (params?: QueryParams) => ["textbooks", "list", params] as const,
        detail: (slug: string, include?: string[]) =>
            ["textbooks", "detail", slug, include] as const,
    },
    reports: {
        attendance: (params?: any) =>
            ["reports", "attendance", params] as const,
        classroomPerformance: (params?: any) =>
            ["reports", "classroom-performance", params] as const,
        teacherActivity: (params?: any) =>
            ["reports", "teacher-activity", params] as const,
    },
} as const;

// --- Auth Hooks ---
export const useAuth = () =>
    useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: api.auth.me,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

export const useLogin = (
    options?: UseMutationOptions<any, ApiError, LoginCredentials>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.auth.login,
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData(queryKeys.auth.me, data.user);
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

export const useLogout = (
    options?: UseMutationOptions<void, ApiError, void>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.auth.logout,
        onSuccess: (data, variables, context) => {
            queryClient.clear();
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

// --- Dashboard Hooks ---
export const useDashboardStats = (period?: any) =>
    useQuery({
        queryKey: queryKeys.dashboard.stats(period),
        queryFn: () => api.dashboard.getStats(period ? { period } : undefined),
        staleTime: 2 * 60 * 1000,
    });

export const useRecentActivity = (limit?: number) =>
    useQuery({
        queryKey: queryKeys.dashboard.recentActivity(limit),
        queryFn: () =>
            api.dashboard.getRecentActivity(limit ? { limit } : undefined),
        staleTime: 1 * 60 * 1000,
    });

// --- Classroom Hooks ---
export const useClassrooms = (params?: QueryParams) =>
    useQuery({
        queryKey: queryKeys.classrooms.all(params),
        queryFn: () => api.classrooms.getAll(params),
        staleTime: 5 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useClassroom = (slug: string, include?: string[]) =>
    useQuery({
        queryKey: queryKeys.classrooms.detail(slug, include),
        queryFn: () => api.classrooms.getBySlug(slug, include),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });

export const useCreateClassroom = (
    options?: UseMutationOptions<Classroom, ApiError, CreateClassroomData>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.classrooms.create,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

export const useUpdateClassroom = (
    options?: UseMutationOptions<
        Classroom,
        ApiError,
        { slug: string; data: UpdateClassroomData }
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, data }) => api.classrooms.update(slug, data),
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.setQueryData(
                queryKeys.classrooms.detail(variables.slug),
                data
            );
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

export const useDeleteClassroom = (
    options?: UseMutationOptions<void, ApiError, string>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.classrooms.delete,
        onSuccess: (data, slug, context) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.removeQueries({
                queryKey: queryKeys.classrooms.detail(slug),
            });
            options?.onSuccess?.(data, slug, context);
        },
        onError: (error, slug, context) => {
            options?.onError?.(handleApiError(error), slug, context);
        },
        ...options,
    });
};

// --- Student Hooks ---
export const useStudents = (params?: QueryParams) =>
    useQuery({
        queryKey: queryKeys.students.all(params),
        queryFn: () => api.students.getAll(params),
        staleTime: 5 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useStudent = (slug: string, include?: string[]) =>
    useQuery({
        queryKey: queryKeys.students.detail(slug, include),
        queryFn: () => api.students.getBySlug(slug, include),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        select: data => data,
    });

export const useCreateStudent = (
    options?: UseMutationOptions<Student, ApiError, CreateStudentData>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.students.create,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

// --- Textbook Hooks ---
export const useTextbooks = (params?: QueryParams) =>
    useQuery({
        queryKey: ["textbooks", "list", params],
        queryFn: async () => {
            const response = await api.textbooks.getAll(params);
            return response; // This should be the full API response with data and meta
        },
        staleTime: 3 * 60 * 1000,
        select: data => ({
            data: data.data || [],
            meta: data.data.meta || {
                total: 0,
                per_page: 15,
                current_page: 1,
                last_page: 1,
                from: null,
                to: null,
            },
        }),
    });

export const useTextbook = (slug: string, include?: string[]) =>
    useQuery({
        queryKey: ["textbooks", "detail", slug, include],
        queryFn: () => api.textbooks.getBySlug(slug, include),
        enabled: !!slug,
        staleTime: 1 * 60 * 1000,
        select: data => data,
    });

export const useCreateTextbook = (
    options?: UseMutationOptions<
        TextbookEntry,
        ApiError,
        CreateTextbookEntryData
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.textbooks.create,
        onMutate: async (newData: any) => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old) return old;
                const optimisticEntry = {
                    id: Date.now(),
                    slug: `temp-${Date.now()}`,
                    title: newData.title,
                    subject: newData.subject,
                    content: newData.content,
                    sessionDate: newData.session_date,
                    sessionTime: newData.session_time,
                    isSubmitted: false,
                    isOfflineCreated: false,
                    createdAt: new Date().toISOString(),
                };
                return {
                    ...old,
                    data: [optimisticEntry, ...(old.data || [])],
                };
            });
            return { previousTextbooks };
        },
        onError: (err, newData, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            options?.onError?.(handleApiError(err), newData, context);
        },
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                const filteredData = old.data.filter(
                    (item: any) => !item.slug.startsWith("temp-")
                );
                return {
                    ...old,
                    data: [data, ...filteredData],
                };
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            options?.onSuccess?.(data, variables, context);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
        },
        ...options,
    });
};

export const useUpdateTextbook = (
    options?: UseMutationOptions<
        TextbookEntry,
        ApiError,
        { slug: string; data: UpdateTextbookEntryData }
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, data }: any) => api.textbooks.update(slug, data),
        onMutate: async ({ slug, data: updateData }: any) => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            await queryClient.cancelQueries({
                queryKey: ["textbooks", "detail", slug],
            });
            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);
            const previousTextbook = queryClient.getQueryData([
                "textbooks",
                "detail",
                slug,
            ]);
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.slug === slug
                            ? {
                                  ...item,
                                  ...updateData,
                                  updatedAt: new Date().toISOString(),
                              }
                            : item
                    ),
                };
            });
            queryClient.setQueryData(
                ["textbooks", "detail", slug],
                (old: any) =>
                    old
                        ? {
                              ...old,
                              ...updateData,
                              updatedAt: new Date().toISOString(),
                          }
                        : old
            );
            return { previousTextbooks, previousTextbook };
        },
        onError: (err, variables, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            if (context?.previousTextbook) {
                queryClient.setQueryData(
                    ["textbooks", "detail", variables.slug],
                    context.previousTextbook
                );
            }
            options?.onError?.(handleApiError(err), variables, context);
        },
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData(
                ["textbooks", "detail", variables.slug],
                data
            );
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.slug === variables.slug ? data : item
                    ),
                };
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            options?.onSuccess?.(data, variables, context);
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks", "detail", variables.slug],
            });
        },
        ...options,
    });
};

export const useDeleteTextbook = (
    options?: UseMutationOptions<void, ApiError, string>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.textbooks.delete,
        onMutate: async (slug: any) => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.filter((item: any) => item.slug !== slug),
                };
            });
            return { previousTextbooks };
        },
        onError: (err, slug, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            options?.onError?.(handleApiError(err), slug, context);
        },
        onSuccess: (data, slug, context) => {
            queryClient.removeQueries({
                queryKey: ["textbooks", "detail", slug],
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            options?.onSuccess?.(data, slug, context);
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
        },
        ...options,
    });
};

export const useSubmitTextbook = (
    options?: UseMutationOptions<TextbookEntry, ApiError, string>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.textbooks.submit,
        onMutate: async (slug: any) => {
            await queryClient.cancelQueries({ queryKey: ["textbooks"] });
            await queryClient.cancelQueries({
                queryKey: ["textbooks", "detail", slug],
            });
            const previousTextbooks = queryClient.getQueryData([
                "textbooks",
                "list",
            ]);
            const previousTextbook = queryClient.getQueryData([
                "textbooks",
                "detail",
                slug,
            ]);
            queryClient.setQueryData(
                ["textbooks", "detail", slug],
                (old: any) =>
                    old
                        ? {
                              ...old,
                              isSubmitted: true,
                              submissionDate: new Date().toLocaleDateString(
                                  "fr-FR"
                              ),
                          }
                        : old
            );
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.slug === slug
                            ? {
                                  ...item,
                                  isSubmitted: true,
                                  submissionDate: new Date().toLocaleDateString(
                                      "fr-FR"
                                  ),
                              }
                            : item
                    ),
                };
            });
            return { previousTextbooks, previousTextbook };
        },
        onError: (err, slug, context: any) => {
            if (context?.previousTextbooks) {
                queryClient.setQueryData(
                    ["textbooks", "list"],
                    context.previousTextbooks
                );
            }
            if (context?.previousTextbook) {
                queryClient.setQueryData(
                    ["textbooks", "detail", slug],
                    context.previousTextbook
                );
            }
            options?.onError?.(handleApiError(err), slug, context);
        },
        onSuccess: (data, slug, context) => {
            queryClient.setQueryData(["textbooks", "detail", slug], data);
            queryClient.setQueryData(["textbooks", "list"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) =>
                        item.slug === slug ? data : item
                    ),
                };
            });
            options?.onSuccess?.(data, slug, context);
        },
        onSettled: (data, error, slug) => {
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks", "detail", slug],
            });
        },
        ...options,
    });
};

export const useTextbookSubjects = () =>
    useQuery({
        queryKey: ["textbooks", "subjects"],
        queryFn: api.textbooks.getSubjects,
        staleTime: 10 * 60 * 1000,
        select: data => data,
    });

export const useTextbookStatistics = (params?: any) =>
    useQuery({
        queryKey: ["textbooks", "statistics", params],
        queryFn: () => api.textbooks.getStatistics(params),
        staleTime: 2 * 60 * 1000,
        select: data => data,
    });

// --- Attendance Hooks ---
export const useAttendance = (params?: QueryParams) =>
    useQuery({
        queryKey: queryKeys.attendance.all(params),
        queryFn: () => api.attendance.getAll(params),
        staleTime: 2 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useCreateAttendance = (
    options?: UseMutationOptions<Attendance, ApiError, CreateAttendanceData>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.attendance.create,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

export const useBulkCreateAttendance = (
    options?: UseMutationOptions<Attendance[], ApiError, CreateAttendanceData[]>
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.attendance.bulkCreate,
        onSuccess: (data, variables, context) => {
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

// --- Principal/Inspector Review Hooks ---
export const usePrincipalReviews = (params?: {
    class_id?: number;
    subject?: string;
    per_page?: number;
    page?: number;
}) =>
    useQuery({
        queryKey: ["textbooks", "principal-reviews", params],
        queryFn: () => api.textbooks.getNeedsPrincipalReview(params),
        enabled: !!params,
        staleTime: 2 * 60 * 1000,
        select: data => ({
            data: data.data || [],
            meta: data.data.meta || {
                total: 0,
                per_page: 15,
                current_page: 1,
                last_page: 1,
                from: null,
                to: null,
            },
        }),
    });

export const useInspectorReviews = (params?: {
    class_id?: number;
    subject?: string;
    school_id?: number;
    per_page?: number;
    page?: number;
}) =>
    useQuery({
        queryKey: ["textbooks", "inspector-reviews", params],
        queryFn: () => api.textbooks.getNeedsInspectorReview(params),
        enabled: !!params,
        staleTime: 2 * 60 * 1000,
        select: data => ({
            data: data.data || [],
            meta: data.data.meta || {
                total: 0,
                per_page: 15,
                current_page: 1,
                last_page: 1,
                from: null,
                to: null,
            },
        }),
    });

export const useUpdatePrincipalComment = (
    options?: UseMutationOptions<
        TextbookEntry,
        ApiError,
        {
            slug: string;
            data: {
                principal_status:
                    | "pending"
                    | "viewed"
                    | "validated"
                    | "rejected";
                principal_comment?: string;
            };
        }
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, data }) =>
            api.textbooks.updatePrincipalComment(slug, data),
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData(
                ["textbooks", "detail", variables.slug],
                data
            );
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks", "principal-reviews"],
                exact: false,
            });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

export const useUpdateInspectorComment = (
    options?: UseMutationOptions<
        TextbookEntry,
        ApiError,
        {
            slug: string;
            data: {
                inspector_status:
                    | "pending"
                    | "viewed"
                    | "validated"
                    | "rejected";
                inspector_comment?: string;
            };
        }
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slug, data }) =>
            api.textbooks.updateInspectorComment(slug, data),
        onSuccess: (data, variables, context) => {
            queryClient.setQueryData(
                ["textbooks", "detail", variables.slug],
                data
            );
            queryClient.invalidateQueries({
                queryKey: ["textbooks"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["textbooks", "inspector-reviews"],
                exact: false,
            });
            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};

// --- Schools Hooks ---
export const useSchools = (params?: {
    page?: number;
    per_page?: number;
    search?: string;
}) =>
    useQuery({
        queryKey: ["schools", "list", params],
        queryFn: () => schoolsApi.getAllSchools(params),
        staleTime: 5 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useSchool = (slug: string) =>
    useQuery({
        queryKey: ["schools", "detail", slug],
        queryFn: () => schoolsApi.getSchool(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        select: data => data,
    });

export const useSchoolTextbooks = (
    slug: string,
    params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
    }
) =>
    useQuery({
        queryKey: ["schools", slug, "textbooks", params],
        queryFn: () => schoolsApi.getSchoolTextbooks(slug, params),
        enabled: !!slug,
        staleTime: 2 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useSchoolTeachers = (
    slug: string,
    params?: {
        page?: number;
        per_page?: number;
        search?: string;
    }
) =>
    useQuery({
        queryKey: ["schools", slug, "teachers", params],
        queryFn: () => schoolsApi.getSchoolTeachers(slug, params),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

// --- Inspector Hooks ---
export const useInspectorDashboardStats = () =>
    useQuery({
        queryKey: ["inspector", "dashboard", "stats"],
        queryFn: () => inspectorApi.getDashboardStats(),
        staleTime: 5 * 60 * 1000,
        select: data => data,
    });

export const useInspectorSchools = (params?: {
    page?: number;
    per_page?: number;
    search?: string;
}) =>
    useQuery({
        queryKey: ["inspector", "schools", params],
        queryFn: () => inspectorApi.getSchools(params),
        staleTime: 5 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useInspectorSchoolTextbooks = (
    schoolSlug: string,
    params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
        teacher?: string;
    }
) =>
    useQuery({
        queryKey: ["inspector", "schools", schoolSlug, "textbooks", params],
        queryFn: () => inspectorApi.getSchoolTextbooks(schoolSlug, params),
        enabled: !!schoolSlug,
        staleTime: 2 * 60 * 1000,
        select: data => {
            if (Array.isArray(data)) {
                return {
                    data,
                    meta: {
                        total: data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.length,
                    },
                };
            }
            if (
                data &&
                typeof data === "object" &&
                "data" in data &&
                Array.isArray(data.data)
            ) {
                return {
                    data: data.data,
                    meta: data.meta || {
                        total: data.data.length,
                        per_page: 15,
                        current_page: 1,
                        last_page: 1,
                        from: 1,
                        to: data.data.length,
                    },
                };
            }
            return {
                data: [],
                meta: {
                    total: 0,
                    per_page: 15,
                    current_page: 1,
                    last_page: 1,
                    from: null,
                    to: null,
                },
            };
        },
    });

export const useInspectorTextbookDetail = (
    schoolSlug: string,
    textbookSlug: string
) =>
    useQuery({
        queryKey: [
            "inspector",
            "schools",
            schoolSlug,
            "textbooks",
            textbookSlug,
        ],
        queryFn: () => inspectorApi.getTextbookDetail(schoolSlug, textbookSlug),
        enabled: !!schoolSlug && !!textbookSlug,
        staleTime: 2 * 60 * 1000,
        select: data => data,
    });

export const useInspectorUpdateTextbookStatus = (
    options?: UseMutationOptions<
        TextbookEntry,
        ApiError,
        {
            schoolSlug: string;
            textbookSlug: string;
            data: {
                status: "pending" | "viewed" | "validated" | "rejected";
                comment?: string;
            };
        }
    >
) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ schoolSlug, textbookSlug, data }) =>
            inspectorApi.updateTextbookStatus(schoolSlug, textbookSlug, data),
        onSuccess: (data, variables, context) => {
            // Update the specific textbook detail
            queryClient.setQueryData(
                [
                    "inspector",
                    "schools",
                    variables.schoolSlug,
                    "textbooks",
                    variables.textbookSlug,
                ],
                data
            );

            // Invalidate related queries
            queryClient.invalidateQueries({
                queryKey: [
                    "inspector",
                    "schools",
                    variables.schoolSlug,
                    "textbooks",
                ],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["inspector", "reviews"],
                exact: false,
            });

            options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
            options?.onError?.(handleApiError(error), variables, context);
        },
        ...options,
    });
};
