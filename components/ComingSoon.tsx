import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Calendar,
    Clock,
    Settings,
    Sparkles,
    Users,
} from "lucide-react";

// Language type
type Language = "en" | "fr";

// Translation object
const translations = {
    en: {
        comingSoon: "Coming Soon",
        defaultDescription:
            "We're working hard to bring you this amazing feature. Stay tuned!",
        whatsComingTitle: "What's Coming:",
        expectedLabel: "Expected:",
        notifyButton: "Notify Me When Ready",

        // Dashboard
        dashboardTitle: "Dashboard Analytics",
        dashboardDescription:
            "Get comprehensive insights into your school's performance with advanced analytics and reporting tools.",
        dashboardFeatures: [
            "Real-time student performance metrics",
            "Attendance tracking and trends",
            "Grade distribution analysis",
            "Teacher performance insights",
            "Custom report generation",
            "Export capabilities",
        ],
        dashboardDate: "Coming in Q2 2025",

        // Students
        studentsTitle: "Student Management",
        studentsDescription:
            "Comprehensive student information system to manage profiles, enrollment, and academic records.",
        studentsFeatures: [
            "Student profile management",
            "Enrollment tracking",
            "Academic history records",
            "Parent contact information",
            "Disciplinary records",
            "Medical information",
        ],

        // Attendance
        attendanceTitle: "Attendance Tracking",
        attendanceDescription:
            "Modern attendance management system with real-time tracking and automated reporting.",
        attendanceFeatures: [
            "Real-time attendance marking",
            "Automated absence notifications",
            "Attendance reports and analytics",
            "Parent notifications",
            "Integration with gradebook",
            "Bulk attendance operations",
        ],
        attendanceDate: "Coming in March 2025",

        // Settings
        settingsTitle: "System Settings",
        settingsDescription:
            "Configure and customize your school management system to fit your institution's unique needs.",
        settingsFeatures: [
            "School profile configuration",
            "User roles and permissions",
            "Academic year settings",
            "Grading system setup",
            "Notification preferences",
            "Data backup and restore",
        ],

        comingSoonGeneric: "Coming Soon",
    },
    fr: {
        comingSoon: "Bientôt Disponible",
        defaultDescription:
            "Nous travaillons dur pour vous apporter cette fonctionnalité incroyable. Restez à l'écoute !",
        whatsComingTitle: "À Venir :",
        expectedLabel: "Prévu pour :",
        notifyButton: "Me Notifier Quand C'est Prêt",

        // Dashboard
        dashboardTitle: "Tableaux de Bord Analytiques",
        dashboardDescription:
            "Obtenez des informations complètes sur les performances de votre école avec des outils d'analyse et de reporting avancés.",
        dashboardFeatures: [
            "Métriques de performance des étudiants en temps réel",
            "Suivi des présences et tendances",
            "Analyse de la distribution des notes",
            "Insights sur les performances des enseignants",
            "Génération de rapports personnalisés",
            "Capacités d'exportation",
        ],
        dashboardDate: "Disponible au T2 2025",

        // Students
        studentsTitle: "Gestion des Étudiants",
        studentsDescription:
            "Système d'information étudiant complet pour gérer les profils, les inscriptions et les dossiers académiques.",
        studentsFeatures: [
            "Gestion des profils étudiants",
            "Suivi des inscriptions",
            "Historique académique",
            "Informations de contact des parents",
            "Dossiers disciplinaires",
            "Informations médicales",
        ],

        // Attendance
        attendanceTitle: "Suivi des Présences",
        attendanceDescription:
            "Système moderne de gestion des présences avec suivi en temps réel et rapports automatisés.",
        attendanceFeatures: [
            "Marquage des présences en temps réel",
            "Notifications d'absence automatisées",
            "Rapports et analyses des présences",
            "Notifications aux parents",
            "Intégration avec le carnet de notes",
            "Opérations de présence en lot",
        ],
        attendanceDate: "Bientôt Disponible",

        // Settings
        settingsTitle: "Paramètres Système",
        settingsDescription:
            "Configurez et personnalisez votre système de gestion scolaire pour répondre aux besoins uniques de votre établissement.",
        settingsFeatures: [
            "Configuration du profil de l'école",
            "Rôles et permissions des utilisateurs",
            "Paramètres de l'année académique",
            "Configuration du système de notation",
            "Préférences de notification",
            "Sauvegarde et restauration des données",
        ],

        comingSoonGeneric: "Bientôt Disponible",
    },
};

interface ComingSoonProps {
    title?: string;
    description?: string;
    features?: string[];
    icon?: React.ReactNode;
    expectedDate?: string;
    showNotifyButton?: boolean;
    language?: Language;
}

const ComingSoon = ({
    title,
    description,
    features = [],
    icon,
    expectedDate,
    showNotifyButton = false,
    language = "en",
}: ComingSoonProps) => {
    const t = translations[language];
    const displayTitle = title || t.comingSoon;
    const displayDescription = description || t.defaultDescription;
    const defaultIcon = <Sparkles className="h-16 w-16 text-blue-500" />;

    return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
            <Card className="w-full max-w-2xl border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg">
                <CardContent className="p-12 text-center">
                    {/* Icon */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-blue-500/20 blur-xl"></div>
                            <div className="relative rounded-full bg-white p-6 shadow-lg">
                                {icon || defaultIcon}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="mb-4 text-4xl font-bold text-gray-900">
                        {displayTitle}
                    </h1>

                    {/* Description */}
                    <p className="mb-8 text-lg leading-relaxed text-gray-600">
                        {displayDescription}
                    </p>

                    {/* Features List */}
                    {features.length > 0 && (
                        <div className="mb-8">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800">
                                {t.whatsComingTitle}
                            </h3>
                            <div className="grid grid-cols-1 gap-3 text-left md:grid-cols-2">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-3 rounded-lg bg-white/60 p-3 shadow-sm"
                                    >
                                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-blue-500" />
                                        <span className="text-gray-700">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expected Date */}
                    {expectedDate && (
                        <div className="mb-8">
                            <div className="inline-flex items-center space-x-2 rounded-full bg-blue-100 px-4 py-2 text-blue-800">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">
                                    {/* {t.expectedLabel} */}
                                    {expectedDate}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Notify Button */}
                    {showNotifyButton && (
                        <Button
                            size="lg"
                            className="rounded-lg bg-blue-600 px-8 py-3 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                        >
                            {t.notifyButton}
                        </Button>
                    )}

                    {/* Decorative Elements */}
                    <div className="mt-12 opacity-20">
                        <div className="flex justify-center space-x-4">
                            <BookOpen className="h-6 w-6 text-blue-400" />
                            <Users className="h-6 w-6 text-green-400" />
                            <Calendar className="h-6 w-6 text-purple-400" />
                            <BarChart3 className="h-6 w-6 text-orange-400" />
                            <Settings className="h-6 w-6 text-gray-400" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Predefined variants for common pages
export const DashboardComingSoon = ({
    language = "en",
}: {
    language?: Language;
}) => {
    const t = translations[language];
    return (
        <ComingSoon
            title={t.dashboardTitle}
            description={t.dashboardDescription}
            icon={<BarChart3 className="h-16 w-16 text-blue-500" />}
            features={t.dashboardFeatures}
            expectedDate={t.dashboardDate}
            showNotifyButton={true}
            language={language}
        />
    );
};

export const StudentsComingSoon = ({
    language = "en",
}: {
    language?: Language;
}) => {
    const t = translations[language];
    return (
        <ComingSoon
            title={t.studentsTitle}
            description={t.studentsDescription}
            icon={<Users className="h-16 w-16 text-green-500" />}
            features={t.studentsFeatures}
            expectedDate={t.comingSoonGeneric}
            showNotifyButton={true}
            language={language}
        />
    );
};

export const AttendanceComingSoon = ({
    language = "en",
}: {
    language?: Language;
}) => {
    const t = translations[language];
    return (
        <ComingSoon
            title={t.attendanceTitle}
            description={t.attendanceDescription}
            icon={<Calendar className="h-16 w-16 text-purple-500" />}
            features={t.attendanceFeatures}
            expectedDate={t.attendanceDate}
            showNotifyButton={false}
            language={language}
        />
    );
};

export const SettingsComingSoon = ({
    language = "en",
}: {
    language?: Language;
}) => {
    const t = translations[language];
    return (
        <ComingSoon
            title={t.settingsTitle}
            description={t.settingsDescription}
            icon={<Settings className="h-16 w-16 text-gray-500" />}
            features={t.settingsFeatures}
            expectedDate={t.comingSoonGeneric}
            showNotifyButton={true}
            language={language}
        />
    );
};

export default ComingSoon;
