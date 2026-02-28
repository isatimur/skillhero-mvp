import { supabase } from './supabase';
import { User } from '../types';

export interface AuthResponse {
    success: boolean;
    error?: string;
    user?: User;
    needsVerification?: boolean;
}

export interface SignUpData {
    email: string;
    password: string;
    username: string;
    heroRace: string;
    heroClass: string;
    gender: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    try {
        // 1. Create auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                    username: data.username,
                }
            }
        });

        if (signUpError) {
            return { success: false, error: signUpError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'Failed to create user account' };
        }

        // 2. Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                username: data.username,
                hero_race: data.heroRace,
                hero_class: data.heroClass,
                gender: data.gender,
                level: 1,
                xp: 0,
                max_xp: 500,
                stats: { str: 1, int: 1, agi: 1, cha: 1 },
                appearance: {
                    headId: 'head_novice',
                    bodyId: 'body_novice',
                    weaponId: 'weapon_scroll'
                },
                completed_quests: [],
                completed_books: [],
                unlocked_items: [],
                role: 'USER'
            });

        if (profileError) {
            console.error('Profile creation error:', profileError);
            return { success: false, error: 'Failed to create user profile' };
        }

        // Check if email confirmation is required
        const needsVerification = authData.user.identities?.length === 0;

        return {
            success: true,
            needsVerification,
            user: {
                username: data.username,
                level: 1,
                xp: 0,
                maxXp: 500,
                completedQuests: [],
                completedBooks: [],
                unlockedItems: [],
                title: 'Novice Engineer',
                heroClass: data.heroClass as any,
                heroRace: data.heroRace as any,
                gender: data.gender as any,
                appearance: {
                    headId: 'head_novice',
                    bodyId: 'body_novice',
                    weaponId: 'weapon_scroll'
                },
                stats: { str: 1, int: 1, agi: 1 },
                role: 'USER'
            }
        };

    } catch (error: any) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred' };
    }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data.user) {
            return { success: false, error: 'No user returned from sign in' };
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Failed to load user profile' };
        }

        const user: User = {
            username: profile.username,
            level: profile.level,
            xp: profile.xp,
            maxXp: profile.max_xp,
            completedQuests: profile.completed_quests || [],
            completedBooks: profile.completed_books || [],
            unlockedItems: profile.unlocked_items || [],
            title: profile.title,
            heroClass: profile.hero_class,
            heroRace: profile.hero_race,
            gender: profile.gender,
            appearance: profile.appearance,
            stats: profile.stats,
            role: profile.role
        };

        return { success: true, user };

    } catch (error: any) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message || 'An unexpected error occurred' };
    }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (error: any) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message || 'Failed to sign out' };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Password reset error:', error);
        return { success: false, error: error.message || 'Failed to send reset email' };
    }
}

/**
 * Update password (for logged-in users)
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Password update error:', error);
        return { success: false, error: error.message || 'Failed to update password' };
    }
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Session refresh error:', error);
        return { success: false, error: error.message || 'Failed to refresh session' };
    }
}

/**
 * Get the current user's role
 */
export async function getUserRole(userId: string): Promise<'USER' | 'ADMIN' | 'SUPER_ADMIN' | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return null;
        }

        return data.role;
    } catch (error) {
        console.error('Get user role error:', error);
        return null;
    }
}

/**
 * Check if user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return role === 'SUPER_ADMIN';
}

/**
 * Get current session
 */
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Get session error:', error);
        return null;
    }
    return data.session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Get user error:', error);
        return null;
    }
    return data.user;
}
