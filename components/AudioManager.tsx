
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameScreen } from '../types';
import { AUDIO_URLS } from '../constants';

interface AudioManagerProps {
  currentScreen: GameScreen;
  settings: { music: number; sfx: number };
  onPlaySfx?: (key: string) => void; // Optional listener for debugging
  sfxTrigger?: string | null; // Trigger from parent
}

export const AudioManager: React.FC<AudioManagerProps> = ({ currentScreen, settings, sfxTrigger }) => {
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const requestedTrackRef = useRef<string | null>(null);
  const autoplayWarnedRef = useRef(false);
  const [unlockTick, setUnlockTick] = useState(0);
  
  // Track specific fading process
  const fadeIntervalRef = useRef<number | null>(null);
  const pendingAudioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);

  // Unlock audio only after first user gesture (browser autoplay policy).
  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      setUnlockTick(t => t + 1);
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Map screens to tracks
  const getTrackForScreen = (screen: GameScreen) => {
    switch (screen) {
      case 'LOGIN': return AUDIO_URLS.bgm.mainTheme;
      case 'HUB':
      case 'PROFILE':
      case 'LIBRARY':
      case 'TRAINING':
      case 'CUSTOMIZE':
        return AUDIO_URLS.bgm.goodTheme;
      case 'WORLD': return AUDIO_URLS.bgm.adventure;
      case 'QUEST_SELECT': return AUDIO_URLS.bgm.mystery;
      case 'BATTLE': return AUDIO_URLS.bgm.battle;
      default: return AUDIO_URLS.bgm.goodTheme;
    }
  };

  // --- MUSIC LOGIC ---
  useEffect(() => {
    const targetUrl = getTrackForScreen(currentScreen);
    requestedTrackRef.current = targetUrl;

    // Don't call play() before user has interacted with the page.
    if (!audioUnlockedRef.current) return;
    
    // Avoid re-triggering if the same track is requested
    if (targetUrl === currentTrackUrl) return;

    const fadeDuration = 2000; // 2 seconds
    const steps = 20;
    const stepTime = fadeDuration / steps;
    const maxVol = settings.music / 100;

    // CLEAR PREVIOUS FADE
    if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
    }

    // CLEANUP PENDING AUDIO if any (user switched screen before previous fade finished)
    if (pendingAudioRef.current) {
        pendingAudioRef.current.pause();
        pendingAudioRef.current = null;
    }

    // 1. Create new audio element for the next track
    const newAudio = new Audio(targetUrl);
    newAudio.loop = true;
    newAudio.volume = 0;
    
    pendingAudioRef.current = newAudio;

    // Play immediately but volume 0
    newAudio.play().then(() => {
        let stepCount = 0;
        
        fadeIntervalRef.current = window.setInterval(() => {
            stepCount++;
            const progress = stepCount / steps;
            
            // Fade In New
            if (pendingAudioRef.current) {
                pendingAudioRef.current.volume = Math.min(maxVol, progress * maxVol);
            }

            // Fade Out Old
            if (bgmRef.current) {
                bgmRef.current.volume = Math.max(0, maxVol - (progress * maxVol));
            }

            if (stepCount >= steps) {
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
                
                // Cleanup old
                if (bgmRef.current) {
                    bgmRef.current.pause();
                    bgmRef.current = null;
                }
                
                // Swap refs
                if (pendingAudioRef.current) {
                    bgmRef.current = pendingAudioRef.current;
                    pendingAudioRef.current = null;
                    setCurrentTrackUrl(targetUrl);
                }
            }
        }, stepTime);

    }).catch((e) => {
        if (!autoplayWarnedRef.current) {
            autoplayWarnedRef.current = true;
            console.warn("Audio blocked by browser autoplay policy until user interaction.", e);
        }
        pendingAudioRef.current = null; // Reset if failed
    });

    // CLEANUP FUNCTION FOR EFFECT RE-RUN
    return () => {
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }
        // NOTE: We don't pause `bgmRef` here because we want the OLD track to keep playing 
        // until the NEW track (created in the next effect cycle) starts fading it out.
        // However, we MUST pause `pendingAudioRef` because it was "about to be" the new track
        // but now we are switching again, so it is abandoned.
        if (pendingAudioRef.current) {
            pendingAudioRef.current.pause();
            pendingAudioRef.current = null;
        }
    };
  }, [currentScreen, settings.music, unlockTick]); // Re-run after unlock gesture too

  // --- VOLUME UPDATE ---
  // If user drags volume slider, update current active tracks immediately
  useEffect(() => {
      const vol = settings.music / 100;
      // Only update if NOT currently fading (fading handles volume its own way)
      if (!fadeIntervalRef.current && bgmRef.current) {
          bgmRef.current.volume = vol;
      }
  }, [settings.music]);

  // --- SFX TRIGGER ---
  useEffect(() => {
      if (!sfxTrigger) return;
      if (!audioUnlockedRef.current) return;
      
      let sfxUrl = '';
      if (sfxTrigger === 'VICTORY') sfxUrl = AUDIO_URLS.sfx.victory;
      if (sfxTrigger === 'DEFEAT') sfxUrl = AUDIO_URLS.sfx.defeat;
      if (sfxTrigger === 'ATTACK') sfxUrl = AUDIO_URLS.sfx.attack;
      if (sfxTrigger === 'DAMAGE') sfxUrl = AUDIO_URLS.sfx.damage;
      
      if (sfxUrl) {
          // Duck music volume temporarily
          if (bgmRef.current) {
              const originalVol = bgmRef.current.volume;
              // Smooth ducking
              const duckVol = originalVol * 0.2;
              bgmRef.current.volume = duckVol;
              
              setTimeout(() => {
                  // Restore if still same track and no fade happening
                  if (bgmRef.current && !fadeIntervalRef.current) {
                      bgmRef.current.volume = originalVol;
                  }
              }, 1500); // Shorter ducking time for combat
          }

          const sfx = new Audio(sfxUrl);
          sfxRef.current = sfx;
          sfx.volume = settings.sfx / 100;
          sfx.play().catch(() => {
              // Ignore autoplay failures for SFX until user unlocks audio.
          });
      }
  }, [sfxTrigger]);

  return null; // Headless component
};
