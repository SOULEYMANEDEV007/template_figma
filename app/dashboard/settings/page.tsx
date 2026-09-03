"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Card,
    CardContent,
    Input,
    Label,
} from "@/components/ui";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { Edit, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const { user, logout } = useAuthStore();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        matricule: user?.matricule || "",
        phone: user?.phone || "",
        currentPassword: "",
        newPassword: "",
    });

    if (!user) return null;

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {
        // Here you would typically make an API call to update the user
        console.log("Saving user data:", formData);
        setIsEditing(false);
    };

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

            {/* Personal Information */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div className="rounded-lg bg-green-100 px-4 py-2 text-green-700">
                                <h2 className="font-medium">
                                    Informations personnelles
                                </h2>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(!isEditing)}
                                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                            </Button>
                        </div>

                        {/* Profile Picture */}
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage
                                    src={user.avatar}
                                    alt={user.firstName}
                                />
                                <AvatarFallback className="bg-purple-500 text-lg text-white">
                                    {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Form Fields */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label htmlFor="firstName">Nom</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={e =>
                                        handleInputChange(
                                            "firstName",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-gray-50 text-gray-600"
                                            : ""
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="lastName">Prénom</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={e =>
                                        handleInputChange(
                                            "lastName",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-gray-50 text-gray-600"
                                            : ""
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={e =>
                                        handleInputChange(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-gray-50 text-gray-600"
                                            : ""
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="matricule">Matricule</Label>
                                <Input
                                    id="matricule"
                                    value={formData.matricule}
                                    onChange={e =>
                                        handleInputChange(
                                            "matricule",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-gray-50 text-gray-600"
                                            : ""
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">
                                    Numéro de téléphone
                                </Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={e =>
                                        handleInputChange(
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                    disabled={!isEditing}
                                    className={
                                        !isEditing
                                            ? "bg-gray-50 text-gray-600"
                                            : ""
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="rounded-lg bg-green-100 px-4 py-2 text-green-700">
                            <h2 className="font-medium">Sécurité du compte</h2>
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Label htmlFor="currentPassword">
                                    Mot de passe
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={formData.currentPassword}
                                        onChange={e =>
                                            handleInputChange(
                                                "currentPassword",
                                                e.target.value
                                            )
                                        }
                                        placeholder="••••••••••••"
                                        disabled={!isEditing}
                                        className={
                                            !isEditing
                                                ? "bg-gray-50 text-gray-600"
                                                : ""
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400"
                                        disabled={!isEditing}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="newPassword">
                                    Nouveau mot de passe
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="newPassword"
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={formData.newPassword}
                                        onChange={e =>
                                            handleInputChange(
                                                "newPassword",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Cliquez pour saisir"
                                        disabled={!isEditing}
                                        className={
                                            !isEditing
                                                ? "bg-gray-50 text-gray-600"
                                                : ""
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(!showNewPassword)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400"
                                        disabled={!isEditing}
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            {isEditing && (
                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                    >
                        Annuler
                    </Button>
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Enregistrer
                        </Button>
                        <Button
                            onClick={() => setShowLogoutModal(true)}
                            variant="destructive"
                        >
                            Se déconnecter
                        </Button>
                    </div>
                </div>
            )}

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div className="mx-4 max-w-md rounded-lg bg-white p-6">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                                    <span className="text-sm text-white">
                                        !
                                    </span>
                                </div>
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                Déconnexion de votre compte
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Souhaitez-vous vous déconnecter ? Cette action
                                vous déconnectera de votre compte. Vous pourrez
                                vous reconnecter facilement à tout moment en
                                saisissant vos identifiants.
                            </p>
                            <div className="flex space-x-4">
                                <Button
                                    onClick={handleLogout}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    Oui
                                </Button>
                                <Button
                                    onClick={() => setShowLogoutModal(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Non
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
