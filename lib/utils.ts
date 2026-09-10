// @ts-nocheck
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function formatTime(time: string): string {
    return time;
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}



export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 17) return "Bon après-midi";
    return "Bonsoir";
}

export function generateId(): string {
    return Math.random().toString(36).substr(2, 9);
}

// ─── Helpers ViFlo ───────────────────────────────────────────────────────────

export function genererMotDePasse(length: number = 10): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export function formaterNomUtilisateur(nom: string, prenom: string): string {
    return `${prenom.toLowerCase()}.${nom.toLowerCase()}`;
}

export function genererReference(prefix: string = "SUB"): string {
    const n = String(Math.floor(Math.random() * 90000) + 10000);
    return `${prefix}-2026-${n}`;
}
