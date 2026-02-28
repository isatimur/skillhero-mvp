
import { createClient } from '@supabase/supabase-js';
import { Quest, LibraryBook, Question, RaceData, ClassData, CosmeticItem, User, Npc, Spell, SkillNode } from '../types';
import { QUESTS, LIBRARY_BOOKS, RACE_OPTIONS, CLASS_OPTIONS, COSMETIC_ITEMS, WORLD_NPCS, SPELLS, SKILL_TREE, INITIAL_USER } from '../constants';

// Prefer environment config, keep fallback for local bootstrap.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qnurovjrxgproedytlyk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFudXJvdmpyeGdwcm9lZHl0bHlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTk0NzIsImV4cCI6MjA4MzQ3NTQ3Mn0.B9_iJ7XjbPANrM-6OgOFRmyzkwoTyv9Sj6I2V549ZX8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadAvatar(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (e) {
    console.error("Upload failed", e);
    return null;
  }
}

// --- DATA FETCHING FUNCTIONS ---

interface GameData {
    races: RaceData[];
    classes: ClassData[];
    items: CosmeticItem[];
    npcs: Npc[];
    spells: Spell[];
    skillNodes: SkillNode[];
}

export async function fetchGameData(): Promise<GameData> {
    const fallbackData = {
        races: RACE_OPTIONS,
        classes: CLASS_OPTIONS,
        items: COSMETIC_ITEMS,
        npcs: WORLD_NPCS,
        spells: Object.values(SPELLS),
        skillNodes: SKILL_TREE
    };

    try {
        const [racesRes, classesRes, itemsRes, npcsRes, spellsRes, skillNodesRes] = await Promise.all([
            supabase.from('hero_races').select('*'),
            supabase.from('hero_classes').select('*'),
            supabase.from('cosmetic_items').select('*'),
            supabase.from('world_npcs').select('*'),
            supabase.from('spells').select('*'),
            supabase.from('skill_nodes').select('*')
        ]);

        if (racesRes.error || classesRes.error || itemsRes.error) {
            console.warn("Supabase returned error for metadata, using fallback.");
            return fallbackData;
        }

        const races: RaceData[] = (racesRes.data || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            iconId: r.icon_id,
            desc: r.description,
            stats: r.stats,
            spritePos: r.sprite_pos,
            imgUrl: r.img_url,
            passiveName: r.passive_name,
            passiveDesc: r.passive_desc
        }));

        const classes: ClassData[] = (classesRes.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            iconId: c.icon_id,
            desc: c.description,
            stats: c.stats,
            bodyId: c.body_id,
            weaponId: c.weapon_id
        }));

        const items: CosmeticItem[] = (itemsRes.data || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            type: i.type,
            levelRequired: i.level_required,
            iconId: i.icon_id,
            styleClass: i.style_class,
            rarity: i.rarity
        }));

        const npcs: Npc[] = (npcsRes.data || []).map((n: any) => ({
            id: n.id,
            name: n.name,
            sprite: n.sprite,
            position: n.position, 
            dialogueTree: n.dialogue_tree,
            startingNodeId: n.starting_node_id,
            rewardXp: n.reward_xp,
            hasMet: false,
            isPlayer: false,
            dynamicStart: n.dynamic_start
        }));

        const spells: Spell[] = (spellsRes.data || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            iconId: s.icon_id,
            school: s.school,
            color: s.color
        }));

        const skillNodes: SkillNode[] = (skillNodesRes.data || []).map((n: any) => ({
            id: n.id,
            bookId: n.book_id,
            x: n.x,
            y: n.y,
            parents: n.parents || [],
            label: n.label
        }));

        return { 
            races: races.length ? races : RACE_OPTIONS, 
            classes: classes.length ? classes : CLASS_OPTIONS, 
            items: items.length ? items : COSMETIC_ITEMS,
            npcs: npcs.length ? npcs : WORLD_NPCS,
            spells: spells.length ? spells : Object.values(SPELLS),
            skillNodes: skillNodes.length ? skillNodes : SKILL_TREE
        };

    } catch (err) {
        console.warn("Network error fetching game metadata (likely offline), using local constants.", err);
        return fallbackData;
    }
}

export async function fetchQuests(): Promise<Quest[]> {
  try {
    const { data: questsData, error: questsError } = await supabase.from('quests').select('*');

    if (questsError || !questsData || questsData.length === 0) return QUESTS;

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .not('quest_id', 'is', null);

    if (questionsError) return QUESTS;

    const mappedQuests: Quest[] = questsData.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        levelRequired: q.level_required,
        narrativeIntro: q.narrative_intro || [],
        narrativeOutro: q.narrative_outro || '',
        rewardXp: q.reward_xp,
        enemyName: q.enemy_name,
        enemyImage: q.enemy_image,
        enemyMaxHp: q.enemy_max_hp,
        enemyAttackDamage: q.enemy_attack_damage,
        nextQuestIds: q.next_quest_ids,
        isPvP: q.is_pvp,
        questions: questionsData
            .filter((qn: any) => qn.quest_id === q.id)
            .map((qn: any) => ({
                id: qn.id,
                text: qn.text,
                options: qn.options,
                correctIndex: qn.correct_index,
                explanation: qn.explanation,
                difficulty: qn.difficulty,
                xpReward: qn.xp_reward
            }))
    }));

    return mappedQuests;

  } catch (err) {
    console.warn("Error fetching quests, using fallback.", err);
    return QUESTS;
  }
}

export async function fetchLibraryBooks(): Promise<LibraryBook[]> {
  try {
    const { data: booksData, error: booksError } = await supabase.from('library_books').select('*');

    if (booksError || !booksData || booksData.length === 0) return LIBRARY_BOOKS;

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .not('book_id', 'is', null);

    const mappedBooks: LibraryBook[] = booksData.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description,
        content: b.content || [],
        rewardXp: b.reward_xp,
        rewardItemId: b.reward_item_id,
        spellId: b.spell_id,
        questions: questionsData
            ?.filter((qn: any) => qn.book_id === b.id)
            .map((qn: any) => ({
                id: qn.id,
                text: qn.text,
                options: qn.options,
                correctIndex: qn.correct_index,
                explanation: qn.explanation,
                difficulty: qn.difficulty,
                xpReward: qn.xp_reward
            })) || []
    }));

    return mappedBooks;

  } catch (err) {
    console.warn("Error fetching books, using fallback.", err);
    return LIBRARY_BOOKS;
  }
}

export async function findPvPOpponent(currentUserId: string, level: number): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUserId)
            .limit(10);

        if (error) throw error;
        if (!data || data.length === 0) return null;

        const opponent = data[Math.floor(Math.random() * data.length)];
        
        return {
            username: opponent.username,
            level: opponent.level,
            xp: opponent.xp,
            maxXp: opponent.max_xp,
            completedQuests: opponent.completed_quests || [],
            completedBooks: opponent.completed_books || [],
            unlockedItems: opponent.unlocked_items || [],
            title: opponent.title,
            heroClass: opponent.hero_class,
            heroRace: opponent.hero_race,
            gender: opponent.gender,
            appearance: opponent.appearance,
            stats: opponent.stats
        } as User;

    } catch (err) {
        console.warn("PvP Matchmaking Error (Offline?):", err);
        return {
            ...INITIAL_USER,
            username: "Bot Gladiator",
            level: level,
            heroRace: 'ORC',
            heroClass: 'WARRIOR',
            stats: { str: 3, int: 1, agi: 1 }
        };
    }
}

// --- ADMIN CMS FUNCTIONS ---

export async function adminFetchAll(table: string) {
    try {
        const { data, error } = await supabase.from(table).select('*').order('id');
        if (error) throw error;
        return data;
    } catch (e) {
        throw new Error("Fetch failed: " + (e as any).message);
    }
}

export async function adminUpsert(table: string, data: any) {
    try {
        const { data: result, error } = await supabase.from(table).upsert(data).select();
        if (error) throw error;
        return result;
    } catch (e) {
        throw new Error("Upsert failed: " + (e as any).message);
    }
}

export async function adminDelete(table: string, id: string) {
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
    } catch (e) {
        throw new Error("Delete failed: " + (e as any).message);
    }
}
