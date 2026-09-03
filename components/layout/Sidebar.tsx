"use client";

import {
    useInspectorReviews,
    usePrincipalReviews,
} from "@/lib/hooks/api-hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import {
    BarChart3,
    BookOpen,
    FileText,
    Home,
    LogOut,
    Settings,
    Users,
    X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Role-based navigation configuration
const getNavigationForRole = (
    role: string,
    pendingCounts: { principal?: number; inspector?: number }
) => {
    const baseNavigation = [
        { name: "Accueil", href: "/dashboard", icon: Home },
    ];

    switch (role) {
        case "teacher":
            return [
                ...baseNavigation,
                {
                    name: "Mes classes",
                    href: "/dashboard/classes",
                    icon: Users,
                },
                {
                    name: "Cahier de présence",
                    href: "/dashboard/attendance",
                    icon: FileText,
                },
                {
                    name: "Cahier de texte",
                    href: "/dashboard/textbooks",
                    icon: BookOpen,
                },
                {
                    name: "Rapport",
                    href: "/dashboard/reports",
                    icon: BarChart3,
                },
            ];

        case "principal":
            return [
                ...baseNavigation,
                {
                    name: "Mes classes",
                    href: "/dashboard/principal/classes",
                    icon: Users,
                },
                {
                    name: "Cahier de textes",
                    href: "/dashboard/principal/textbooks",
                    icon: BookOpen,
                    badge:
                        pendingCounts.principal && pendingCounts.principal > 0
                            ? pendingCounts.principal
                            : undefined,
                },
                {
                    name: "Cahier de présence",
                    href: "/dashboard/principal/attendance",
                    icon: FileText,
                },
            ];

        case "inspector":
            return [
                ...baseNavigation,
                {
                    name: "Cahier de textes",
                    href: "/dashboard/inspector/textbooks",
                    icon: BookOpen,
                    badge:
                        pendingCounts.inspector && pendingCounts.inspector > 0
                            ? pendingCounts.inspector
                            : undefined,
                },
                {
                    name: "Cahier de présences",
                    href: "/dashboard/inspector/attendance",
                    icon: FileText,
                },
            ];

        default:
            return baseNavigation;
    }
};

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user, isMobileSidebarOpen, setMobileSidebarOpen } =
        useAuthStore();

    // Get pending review counts based on user role
    const { data: principalReviews } = usePrincipalReviews(
        user?.role === "principal" || user?.role === "inspector"
            ? { per_page: 1 }
            : undefined
    );
    const { data: inspectorReviews } = useInspectorReviews(
        user?.role === "inspector" ? { per_page: 1 } : undefined
    );

    const pendingCounts = {
        principal: principalReviews?.meta?.total || 0,
        inspector: inspectorReviews?.meta?.total || 0,
    };

    // Get navigation items based on user role
    const navigation = getNavigationForRole(
        user?.role || "teacher",
        pendingCounts
    );

    const handleLogout = () => {
        logout();
    };

    const SidebarContent = () => (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
            {/* Logo */}
            <div className="mt-12 mb-3 flex h-16 items-center">
                <div className="flex items-center space-x-2">
                    <Image
                        src="/images/logo_transparent_bg.png"
                        alt="Metanoia"
                        width={300}
                        height={300}
                        className="h-50 w-50 p-2"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item: any) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== "/dashboard" &&
                                        pathname.startsWith(item.href));

                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                                                isActive
                                                    ? "bg-green-500 text-white"
                                                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                                            )}
                                            onClick={() =>
                                                setMobileSidebarOpen(false)
                                            }
                                        >
                                            <item.icon
                                                className={cn(
                                                    "h-6 w-6 shrink-0",
                                                    isActive
                                                        ? "text-white"
                                                        : "text-gray-400 group-hover:text-green-600"
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span className="flex-1">
                                                {item.name}
                                            </span>
                                            {item.badge && (
                                                <span className="ml-auto flex h-7 w-11 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                                    {item?.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </li>

                    {/* Bottom navigation */}
                    <li className="mt-auto">
                        <ul role="list" className="-mx-2 space-y-1">
                            <li>
                                <Link
                                    href="/dashboard/settings"
                                    className={cn(
                                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors",
                                        pathname === "/dashboard/settings"
                                            ? "bg-green-500 text-white"
                                            : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                                    )}
                                    onClick={() => setMobileSidebarOpen(false)}
                                >
                                    <Settings
                                        className={cn(
                                            "h-6 w-6 shrink-0",
                                            pathname === "/dashboard/settings"
                                                ? "text-white"
                                                : "text-gray-400 group-hover:text-green-600"
                                        )}
                                        aria-hidden="true"
                                    />
                                    Paramètres
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileSidebarOpen(false);
                                    }}
                                    className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                                >
                                    <LogOut
                                        className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600"
                                        aria-hidden="true"
                                    />
                                    Se déconnecter
                                </button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>
    );

    return (
        <>
            {/* Mobile sidebar overlay */}
            <div
                className={cn(
                    "relative z-50 lg:hidden",
                    isMobileSidebarOpen ? "block" : "hidden"
                )}
            >
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-900/80"
                    onClick={() => setMobileSidebarOpen(false)}
                />

                {/* Sidebar panel */}
                <div className="fixed inset-0 flex">
                    <div className="relative mr-16 flex w-full max-w-xs flex-1">
                        {/* Close button */}
                        <div className="absolute top-0 left-full flex w-16 justify-center pt-5">
                            <button
                                type="button"
                                className="-m-2.5 p-2.5"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X
                                    className="h-6 w-6 text-white"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>

                        <SidebarContent />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <SidebarContent />
            </div>
        </>
    );
}
