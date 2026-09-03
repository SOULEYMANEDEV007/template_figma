export type UserRole = "teacher" | "principal" | "inspector";

export type User = {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    avatar?: string;
    matricule?: string;
    phone?: string;
};

export type Class = {
    id: string;
    slug: string;
    name: string;
    level: string;
    totalStudents: number;
    boysCount: number;
    girlsCount: number;
    absentCount: number;
    createdAt: string;
};

export type Student = {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    classId: string;
    className: string;
    isPresent: boolean;
};

export type CalendarEvent = {
    id: string;
    slug: string;
    title: string;
    type: "class" | "exam" | "homework" | "meeting";
    classId?: string;
    className?: string;
    time: string;
    date: string;
    color: string;
};

export type AttendanceStats = {
    month: string;
    absents: number;
};

export type DashboardData = {
    user: User;
    classes: Class[];
    recentStudents: Student[];
    upcomingEvents: CalendarEvent[];
    attendanceStats: AttendanceStats[];
};
