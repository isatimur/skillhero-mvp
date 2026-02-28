import type { CombatPhase } from '../types';

export type CombatAction =
  | 'ADVANCE'
  | 'ANSWER_CORRECT'
  | 'ANSWER_WRONG'
  | 'ENEMY_ALIVE'
  | 'ENEMY_DEAD'
  | 'PLAYER_ALIVE'
  | 'PLAYER_DEAD';

export function nextCombatPhase(current: CombatPhase, action: CombatAction): CombatPhase {
  switch (current.phase) {
    case 'INTRO':
      if (action === 'ADVANCE') return { phase: 'PLAYER_TURN' };
      break;
    case 'PLAYER_TURN':
      if (action === 'ANSWER_CORRECT') return { phase: 'RESOLVING', wasCorrect: true };
      if (action === 'ANSWER_WRONG') return { phase: 'RESOLVING', wasCorrect: false };
      break;
    case 'RESOLVING':
      if (action === 'ENEMY_DEAD') return { phase: 'VICTORY' };
      if (action === 'ENEMY_ALIVE' || action === 'PLAYER_ALIVE') return { phase: 'ENEMY_TURN' };
      if (action === 'PLAYER_DEAD') return { phase: 'DEFEAT' };
      break;
    case 'ENEMY_TURN':
      if (action === 'PLAYER_ALIVE') return { phase: 'PLAYER_TURN' };
      if (action === 'PLAYER_DEAD') return { phase: 'DEFEAT' };
      break;
    case 'VICTORY':
    case 'DEFEAT':
      break;
  }
  return current;
}
