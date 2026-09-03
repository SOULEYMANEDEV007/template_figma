"use client";

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui";
import {
    getClassById,
    getTextbookEntriesByClassId,
    mockAttendanceStats,
} from "@/lib/mockData";
import {
    ArrowLeft,
    Edit,
    Eye,
    Package,
    Trash2,
    UserCheck,
    Users,
    UserX,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from "recharts";

export default function ClassDetailPage() {
    const params = useParams();
    const classId = params.id as string;
    const [activeTab, setActiveTab] = useState("textbook");

    const classData = getClassById(classId);
    const textbookEntries = getTextbookEntriesByClassId(classId);

    if (!classData) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-semibold text-gray-900">
                        Classe non trouvée
                    </h2>
                    <Link href="/dashboard/classes">
                        <Button variant="outline">Retour aux classes</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: "Effectifs total",
            value: classData.totalStudents,
            icon: Package,
            color: "bg-yellow-100 text-yellow-600",
        },
        {
            title: "Nombre de garçons",
            value: classData.boysCount,
            icon: Users,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "Nombre de filles",
            value: classData.girlsCount,
            icon: UserCheck,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Nombre d'absents",
            value: classData.absentCount,
            icon: UserX,
            color: "bg-red-100 text-red-600",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/dashboard/classes">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Revenir aux classes
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {classData.name}
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                                <div
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Statistics Chart */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Statistique</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>2024</span>
                        <button>›</button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockAttendanceStats}>
                                <defs>
                                    <linearGradient
                                        id="colorAbsents"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#22c55e"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#22c55e"
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#666" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#666" }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="absents"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorAbsents)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Highlight point */}
                    <div className="mt-4 flex items-center justify-center">
                        <div className="rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
                            10 Absents
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex w-fit space-x-1 rounded-lg bg-gray-100 p-1">
                <button
                    onClick={() => setActiveTab("textbook")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "textbook"
                            ? "bg-green-500 text-white"
                            : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                    Cahier de texte
                </button>
                <button
                    onClick={() => setActiveTab("attendance")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === "attendance"
                            ? "bg-green-500 text-white"
                            : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                    Cahier de présence
                </button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "textbook" && (
                <Card>
                    <CardHeader>
                        <div className="rounded bg-green-500 px-4 py-2 text-white">
                            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                                <div>Description</div>
                                <div>Action</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-200">
                            {textbookEntries.length === 0 ? (
                                <div className="px-6 py-8 text-center text-gray-500">
                                    Aucun cahier de texte disponible pour cette
                                    classe
                                </div>
                            ) : (
                                textbookEntries.map(entry => (
                                    <div
                                        key={entry.id}
                                        className="grid grid-cols-2 items-center gap-4 px-6 py-4 hover:bg-gray-50"
                                    >
                                        <div>
                                            <h3 className="mb-1 font-medium text-gray-900">
                                                {entry.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {entry.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Link
                                                href={`/dashboard/textbooks/${entry.id}`}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-500 text-white hover:bg-orange-600"
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    Voir
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/dashboard/textbooks/${entry.id}/edit`}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="bg-purple-500 text-white hover:bg-purple-600"
                                                >
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Éditer
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                            >
                                                <Trash2 className="mr-1 h-4 w-4" />
                                                supprimer
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === "attendance" && (
                <Card>
                    <CardContent className="p-6">
                        <div className="py-8 text-center text-gray-500">
                            Fonctionnalité du cahier de présence à venir...
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
