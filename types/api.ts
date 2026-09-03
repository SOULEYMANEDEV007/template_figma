// types/api.ts
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    errors?: Record<string, string[]>;
    code?: string;
}

// User Types
export interface User {
    id: number;
    slug: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    role: "teacher" | "principal" | "inspector" | "super_admin" | "admin";
    roleLabel: string;
    matricule: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    school?: School;
    classes?: Classroom[];
    permissions?: string[];
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

// School Types
export interface School {
    id: number;
    slug: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

// Classroom Types
export interface Classroom {
    id: number;
    slug: string;
    name: string;
    level: string;
    academicYear: string;
    isActive: boolean;
    totalStudents?: number;
    boysCount?: number;
    girlsCount?: number;
    absentCount?: number;
    teacher?: Teacher;
    school?: School;
    students?: Student[];
    studentsCount?: number;
    recentTextbookEntries?: TextbookEntry[];
    statistics?: any;
    createdAt: string;
    updatedAt: string;
}

// Teacher subset of User
export interface Teacher {
    id: number;
    slug: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
}

// Student Types
export interface Student {
    id: number;
    slug: string;
    first_name: string;
    last_name: string;
    full_name: string;
    matricule: string;
    date_of_birth?: string;
    age?: number;
    gender: "male" | "female";
    gender_label: string;
    avatar?: string;
    parent_phone?: string;
    parent_email?: string;
    is_active: boolean;
    class?: Classroom;
    recent_attendance?: Attendance[];
    attendance_summary?: AttendanceSummary;
    created_at: string;
    updated_at: string;
}

// Attendance Types
export interface Attendance {
    id: number;
    slug: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
    isOfflineCreated: boolean;
    syncVersion?: number;
    student?: Student;
    class?: Classroom;
    teacher?: Teacher;
    sync_metadata?: SyncMetadata;
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceSummary {
    total_records: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendance_rate: number;
}

// Textbook Entry Types
export interface TextbookEntry {
    id: number;
    slug: string;
    title: string;
    description?: string;
    subject: string;
    content: string;
    sessionDate: string;
    sessionTime?: string;
    nextSession?: string;
    nextSessionTime?: string;
    submissionDate?: string;
    isSubmitted: boolean;
    isOfflineCreated: boolean;
    syncVersion?: number;
    syncMetadata?: SyncMetadata;
    class?: Classroom;
    teacher?: Teacher;
    school?: string;
    principalTeacher?: string;
    classroom?: string;
    principalStatus: "pending" | "viewed" | "validated" | "rejected";
    principalComment?: string;
    principalCommentedAt?: string;
    inspectorStatus: "pending" | "viewed" | "validated" | "rejected";
    inspectorComment?: string;
    inspectorCommentedAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Sync Metadata Types
export interface SyncMetadata {
    id: number;
    syncStatus: "pending" | "synced" | "conflict" | "failed";
    lastSyncAt?: string;
    hasConflict: boolean;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
    role?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
    expires_at: string;
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
}

export interface UpdatePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

// Request Types
export interface CreateClassroomData {
    name: string;
    level: string;
    academic_year: string;
    teacher_id?: number;
}

export interface UpdateClassroomData {
    name?: string;
    level?: string;
    academic_year?: string;
    teacher_id?: number;
    is_active?: boolean;
}

export interface CreateStudentData {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender: "male" | "female";
    matricule: string;
    class_id: number;
    parent_phone?: string;
    parent_email?: string;
}

export interface UpdateStudentData {
    first_name?: string;
    last_name?: string;
    date_of_birth?: string;
    gender?: "male" | "female";
    matricule?: string;
    class_id?: number;
    parent_phone?: string;
    parent_email?: string;
    is_active?: boolean;
}

export interface CreateAttendanceData {
    student_id: number;
    class_id: number;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    notes?: string;
}

export interface UpdateAttendanceData {
    status?: "present" | "absent" | "late" | "excused";
    notes?: string;
}

export interface CreateTextbookEntryData {
    title: string;
    description?: string;
    subject: string;
    content: string;
    class_id: number;
    session_date: string;
    session_time?: string;
    next_session_date?: string;
    next_session_time?: string;
}

export interface UpdateTextbookEntryData {
    title?: string;
    class_id?: number;
    description?: string;
    subject?: string;
    content?: string;
    session_date?: string;
    session_time?: string;
    next_session_date?: string;
    next_session_time?: string;
    is_submitted?: boolean;
    principal_status?: "pending" | "viewed" | "validated" | "rejected";
    principal_comment?: string;
    inspector_status?: "pending" | "viewed" | "validated" | "rejected";
    inspector_comment?: string;
}

// Dashboard Types
export interface DashboardStats {
    totalClasses: number;
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number;
    recentActivity: any[];
}

// Pagination Types
export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

// Query Parameters
export interface QueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    filter?: Record<string, any>;
}

// Error Types
export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    code?: string;
    status?: number;
}
