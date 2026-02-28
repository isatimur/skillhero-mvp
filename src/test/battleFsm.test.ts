import { describe, it, expect } from 'vitest';
import { nextCombatPhase } from '@/lib/battleFsm';

describe('nextCombatPhase', () => {
  it('transitions INTRO → PLAYER_TURN', () => {
    const next = nextCombatPhase({ phase: 'INTRO' }, 'ADVANCE');
    expect(next.phase).toBe('PLAYER_TURN');
  });

  it('transitions PLAYER_TURN → RESOLVING on correct answer', () => {
    const next = nextCombatPhase({ phase: 'PLAYER_TURN' }, 'ANSWER_CORRECT');
    expect(next).toEqual({ phase: 'RESOLVING', wasCorrect: true });
  });

  it('transitions PLAYER_TURN → RESOLVING with wrong answer', () => {
    const next = nextCombatPhase({ phase: 'PLAYER_TURN' }, 'ANSWER_WRONG');
    expect(next).toEqual({ phase: 'RESOLVING', wasCorrect: false });
  });

  it('transitions RESOLVING → ENEMY_TURN when enemy alive', () => {
    const next = nextCombatPhase({ phase: 'RESOLVING', wasCorrect: true }, 'ENEMY_ALIVE');
    expect(next.phase).toBe('ENEMY_TURN');
  });

  it('transitions RESOLVING → VICTORY when enemy defeated', () => {
    const next = nextCombatPhase({ phase: 'RESOLVING', wasCorrect: true }, 'ENEMY_DEAD');
    expect(next.phase).toBe('VICTORY');
  });

  it('transitions ENEMY_TURN → PLAYER_TURN when player alive', () => {
    const next = nextCombatPhase({ phase: 'ENEMY_TURN' }, 'PLAYER_ALIVE');
    expect(next.phase).toBe('PLAYER_TURN');
  });

  it('transitions ENEMY_TURN → DEFEAT when player defeated', () => {
    const next = nextCombatPhase({ phase: 'ENEMY_TURN' }, 'PLAYER_DEAD');
    expect(next.phase).toBe('DEFEAT');
  });
});
