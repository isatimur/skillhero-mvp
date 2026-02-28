import { describe, it, expect } from 'vitest';
import { LIBRARY_BOOKS } from '@/lib/content/flashcards';
import { QUESTS } from '@/lib/content/quests';

describe('LIBRARY_BOOKS content', () => {
  it('all books have at least 10 questions', () => {
    for (const book of LIBRARY_BOOKS) {
      expect(book.questions.length, `${book.id} has too few questions`).toBeGreaterThanOrEqual(10);
    }
  });

  it('all questions have correctIndex in bounds', () => {
    for (const book of LIBRARY_BOOKS) {
      for (const q of book.questions) {
        expect(q.correctIndex, `${q.id} correctIndex out of bounds`).toBeLessThan(q.options.length);
        expect(q.correctIndex, `${q.id} correctIndex negative`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('all questions have xpReward >= 50', () => {
    for (const book of LIBRARY_BOOKS) {
      for (const q of book.questions) {
        expect(q.xpReward, `${q.id} xpReward too low`).toBeGreaterThanOrEqual(50);
      }
    }
  });

  it('all question IDs are unique across all books', () => {
    const ids = LIBRARY_BOOKS.flatMap(b => b.questions.map(q => q.id));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('has at least 15 library books total (10 existing + 5 new)', () => {
    expect(LIBRARY_BOOKS.length).toBeGreaterThanOrEqual(15);
  });

  const NEW_BOOK_IDS = ['book_soft_arch', 'book_ai_ml', 'book_mobile', 'book_os', 'book_ts_advanced'];
  it('all 5 new topic books exist', () => {
    const ids = LIBRARY_BOOKS.map(b => b.id);
    for (const id of NEW_BOOK_IDS) {
      expect(ids, `${id} missing`).toContain(id);
    }
  });
});

describe('QUESTS content', () => {
  it('has at least 27 quests total (existing + 7 new)', () => {
    expect(QUESTS.length).toBeGreaterThanOrEqual(27);
  });

  const NEW_QUEST_IDS = ['q_ddd_golem', 'q_clean_arch_lich', 'q_gradient_wraith', 'q_transformer_dragon', 'q_react_native_chimera', 'q_deadlock_daemon', 'q_generic_hydra'];
  it('all 7 new quests exist', () => {
    const ids = QUESTS.map(q => q.id);
    for (const id of NEW_QUEST_IDS) {
      expect(ids, `${id} missing`).toContain(id);
    }
  });

  it('all quest question IDs are unique', () => {
    const ids = QUESTS.flatMap(q => q.questions.map(qu => qu.id));
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all quest questions have correctIndex in bounds', () => {
    for (const quest of QUESTS) {
      for (const q of quest.questions) {
        expect(q.correctIndex, `${q.id} out of bounds`).toBeLessThan(q.options.length);
        expect(q.correctIndex, `${q.id} negative`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
