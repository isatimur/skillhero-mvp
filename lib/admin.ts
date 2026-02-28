import { supabase } from './supabase';
import { Quest, LibraryBook, Question } from '../types';

export interface QuizUploadData {
    quest: Omit<Quest, 'questions'>;
    questions: Omit<Question, 'id'>[];
}

export interface AdminStats {
    totalQuests: number;
    totalBooks: number;
    totalQuestions: number;
    totalUsers: number;
    activeUsers: number;
}

/**
 * Upload a complete quiz (quest + questions)
 */
export async function uploadQuiz(data: QuizUploadData): Promise<{ success: boolean; error?: string; questId?: string }> {
    try {
        // 1. Insert quest
        const { data: questData, error: questError } = await supabase
            .from('quests')
            .insert({
                id: data.quest.id,
                title: data.quest.title,
                description: data.quest.description,
                level_required: data.quest.levelRequired,
                narrative_intro: data.quest.narrativeIntro,
                narrative_outro: data.quest.narrativeOutro,
                reward_xp: data.quest.rewardXp,
                enemy_name: data.quest.enemyName,
                enemy_image: data.quest.enemyImage,
                enemy_max_hp: data.quest.enemyMaxHp,
                enemy_attack_damage: data.quest.enemyAttackDamage,
                next_quest_ids: data.quest.nextQuestIds,
                is_pvp: data.quest.isPvP || false,
            })
            .select()
            .single();

        if (questError) {
            console.error('Quest upload error:', questError);
            return { success: false, error: questError.message };
        }

        // 2. Insert questions
        if (data.questions.length > 0) {
            const questionsToInsert = data.questions.map((q, index) => ({
                id: `${data.quest.id}_q${index + 1}`,
                quest_id: data.quest.id,
                text: q.text,
                options: q.options,
                correct_index: q.correctIndex,
                explanation: q.explanation,
                difficulty: q.difficulty,
                xp_reward: q.xpReward,
            }));

            const { error: questionsError } = await supabase
                .from('questions')
                .insert(questionsToInsert);

            if (questionsError) {
                console.error('Questions upload error:', questionsError);
                // Rollback: delete the quest
                await supabase.from('quests').delete().eq('id', data.quest.id);
                return { success: false, error: questionsError.message };
            }
        }

        return { success: true, questId: data.quest.id };

    } catch (error: any) {
        console.error('Upload quiz error:', error);
        return { success: false, error: error.message || 'Failed to upload quiz' };
    }
}

/**
 * Upload a single question
 */
export async function uploadQuestion(question: {
    questId?: string;
    bookId?: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    difficulty: string;
    xpReward: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const { error } = await supabase
            .from('questions')
            .insert({
                id,
                quest_id: question.questId || null,
                book_id: question.bookId || null,
                text: question.text,
                options: question.options,
                correct_index: question.correctIndex,
                explanation: question.explanation,
                difficulty: question.difficulty,
                xp_reward: question.xpReward,
            });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (error: any) {
        console.error('Upload question error:', error);
        return { success: false, error: error.message || 'Failed to upload question' };
    }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
    file: File,
    bucket: 'quest-images' | 'enemy-sprites' | 'avatars',
    path: string
): Promise<{ success: boolean; error?: string; url?: string }> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                upsert: true,
                contentType: file.type
            });

        if (error) {
            return { success: false, error: error.message };
        }

        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return { success: true, url: urlData.publicUrl };

    } catch (error: any) {
        console.error('Upload image error:', error);
        return { success: false, error: error.message || 'Failed to upload image' };
    }
}

/**
 * Bulk import questions from JSON
 */
export async function bulkImportQuestions(
    questions: Array<{
        questId?: string;
        bookId?: string;
        text: string;
        options: string[];
        correctIndex: number;
        explanation: string;
        difficulty: string;
        xpReward: number;
    }>
): Promise<{ success: boolean; error?: string; imported?: number }> {
    try {
        const questionsToInsert = questions.map((q, index) => ({
            id: `bulk_${Date.now()}_${index}`,
            quest_id: q.questId || null,
            book_id: q.bookId || null,
            text: q.text,
            options: q.options,
            correct_index: q.correctIndex,
            explanation: q.explanation,
            difficulty: q.difficulty,
            xp_reward: q.xpReward,
        }));

        const { error, data } = await supabase
            .from('questions')
            .insert(questionsToInsert)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, imported: data?.length || 0 };

    } catch (error: any) {
        console.error('Bulk import error:', error);
        return { success: false, error: error.message || 'Failed to import questions' };
    }
}

/**
 * Get admin statistics
 */
export async function getAdminStats(): Promise<AdminStats | null> {
    try {
        const [questsRes, booksRes, questionsRes, usersRes] = await Promise.all([
            supabase.from('quests').select('id', { count: 'exact', head: true }),
            supabase.from('library_books').select('id', { count: 'exact', head: true }),
            supabase.from('questions').select('id', { count: 'exact', head: true }),
            supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        ]);

        // Calculate active users (logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = usersRes.data?.filter(
            u => new Date(u.created_at) > sevenDaysAgo
        ).length || 0;

        return {
            totalQuests: questsRes.count || 0,
            totalBooks: booksRes.count || 0,
            totalQuestions: questionsRes.count || 0,
            totalUsers: usersRes.count || 0,
            activeUsers,
        };

    } catch (error) {
        console.error('Get admin stats error:', error);
        return null;
    }
}

/**
 * Manage user role (admin only)
 */
export async function manageUserRole(
    userId: string,
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (error: any) {
        console.error('Manage user role error:', error);
        return { success: false, error: error.message || 'Failed to update user role' };
    }
}

/**
 * Delete quest and all associated questions
 */
export async function deleteQuest(questId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Questions will be deleted automatically due to CASCADE
        const { error } = await supabase
            .from('quests')
            .delete()
            .eq('id', questId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (error: any) {
        console.error('Delete quest error:', error);
        return { success: false, error: error.message || 'Failed to delete quest' };
    }
}

/**
 * Update quest
 */
export async function updateQuest(
    questId: string,
    updates: Partial<Quest>
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('quests')
            .update({
                title: updates.title,
                description: updates.description,
                level_required: updates.levelRequired,
                narrative_intro: updates.narrativeIntro,
                narrative_outro: updates.narrativeOutro,
                reward_xp: updates.rewardXp,
                enemy_name: updates.enemyName,
                enemy_image: updates.enemyImage,
                enemy_max_hp: updates.enemyMaxHp,
                enemy_attack_damage: updates.enemyAttackDamage,
            })
            .eq('id', questId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };

    } catch (error: any) {
        console.error('Update quest error:', error);
        return { success: false, error: error.message || 'Failed to update quest' };
    }
}
