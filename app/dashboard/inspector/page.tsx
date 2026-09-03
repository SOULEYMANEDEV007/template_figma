"use client";

import { Card } from "@/components/ui";
import {
    useInspectorDashboardStats,
    useInspectorSchools,
} from "@/lib/hooks/api-hooks";
import { mockAbsenceData } from "@/lib/mockData";
import {
    ChevronRight,
    GraduationCap,
    School,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

const InspectorDashboard = () => {
    const { data: stats, isLoading: statsLoading } =
        useInspectorDashboardStats();
    const { data: schoolsResponse, isLoading: schoolsLoading } =
        useInspectorSchools();

    // Dashboard metrics with trend indicators
    const metrics = [
        {
            title: "Taux de réussite",
            value: "80%",
            change: "-10% que l'année passée",
            trend: "down",
            icon: TrendingUp,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Total des élèves",
            value: "2000",
            change: "+8.5% que l'année passée",
            trend: "up",
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Progression annuelle",
            value: "30",
            change: "+1.3% que l'année passée",
            trend: "up",
            icon: School,
            color: "bg-yellow-100 text-yellow-600",
        },
        {
            title: "Total enseignants",
            value: "10",
            change: "+1.8% que l'année passée",
            trend: "up",
            icon: GraduationCap,
            color: "bg-orange-100 text-orange-600",
        },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="text-2xl">👋</div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Bonjour Mr Eddy Murphy
                    </h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Inspector"
                            alt="Inspector Avatar"
                            className="h-8 w-8 rounded-full"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const TrendIcon =
                        metric.trend === "up" ? TrendingUp : TrendingDown;
                    const trendColor =
                        metric.trend === "up"
                            ? "text-green-500"
                            : "text-red-500";

                    return (
                        <Card key={index} className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {metric.title}
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-gray-900">
                                        {metric.value}
                                    </p>
                                    <div
                                        className={`mt-2 flex items-center text-sm ${trendColor}`}
                                    >
                                        <TrendIcon className="mr-1 h-4 w-4" />
                                        {metric.change}
                                    </div>
                                </div>
                                <div
                                    className={`rounded-full p-3 ${metric.color}`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Double Absence Chart */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Absence Chart 1 */}
                <Card className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Taux d'absence
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>2024</span>
                            <button className="text-gray-400 hover:text-gray-600">
                                <TrendingUp className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockAbsenceData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="absent"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="#10b981"
                                    fillOpacity={0.1}
                                    dot={{
                                        fill: "#10b981",
                                        strokeWidth: 2,
                                        r: 4,
                                    }}
                                    activeDot={{ r: 6, fill: "#10b981" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                            10 Absents
                        </div>
                    </div>
                </Card>

                {/* Absence Chart 2 */}
                <Card className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Taux d'absence
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>2024</span>
                            <button className="text-gray-400 hover:text-gray-600">
                                <TrendingUp className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockAbsenceData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#6b7280", fontSize: 12 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="absent"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fill="#10b981"
                                    fillOpacity={0.1}
                                    dot={{
                                        fill: "#10b981",
                                        strokeWidth: 2,
                                        r: 4,
                                    }}
                                    activeDot={{ r: 6, fill: "#10b981" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                            10 Absents
                        </div>
                    </div>
                </Card>
            </div>

            {/* Schools List - Inspector specific */}
            <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Établissements
                    </h2>
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            placeholder="Cliquez pour rechercher"
                            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                        />
                        <button className="rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600">
                            Rechercher
                        </button>
                    </div>
                </div>

                {/* Schools Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-green-500 text-white">
                                <th className="px-6 py-4 text-left font-medium">
                                    Établissement
                                </th>
                                <th className="px-6 py-4 text-left font-medium">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {schoolsLoading ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="inline-flex items-center">
                                            <div className="mr-3 h-6 w-6 animate-spin rounded-full border-b-2 border-green-500"></div>
                                            <span className="text-gray-600">
                                                Chargement des écoles...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                (schoolsResponse?.data || []).map(school => (
                                    <tr
                                        key={school.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900">
                                                {school.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="flex items-center text-gray-600 transition-colors hover:text-gray-900">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InspectorDashboard;
