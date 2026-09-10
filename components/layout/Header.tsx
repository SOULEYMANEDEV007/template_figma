// @ts-nocheck
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { getGreeting, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Bell, Menu } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
    const { user, toggleMobileSidebar } = useAuthStore();

    if (!user) return null;

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={toggleMobileSidebar}
            >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Separator */}
            <div
                className="h-6 w-px bg-gray-200 lg:hidden"
                aria-hidden="true"
            />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                {/* Page title */}
                <div className="flex items-center">
                    <h1 className="text-lg font-semibold text-gray-900">
                        {getGreeting()} {user.firstName} 👋
                    </h1>
                </div>

                <div className="ml-auto flex items-center gap-x-4 lg:gap-x-6">
                    {/* Notifications */}
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                    >
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>

                    {/* Separator */}
                    <div
                        className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
                        aria-hidden="true"
                    />

                    <LanguageSwitcher />

                    {/* Profile dropdown */}
                    <div className="flex items-center gap-x-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage
                                src={user.avatar}
                                alt={user.firstName}
                            />
                            <AvatarFallback className="bg-green-500 text-sm text-white">
                                {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex lg:flex-col lg:text-sm lg:leading-5">
                            <span className="font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-gray-500">{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
