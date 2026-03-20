/**
 * sound-settings — Gestión de la preferencia de sonidos de Gemlish
 * Persiste si el usuario quiere efectos de sonido activados o no
 */
import { useState, useEffect, useCallback } from 'react';
import { kvGet, kvSet } from './local-kv';

const SOUND_ENABLED_KEY = '@gemlish_sound_enabled';

// Estado global en memoria para que todos los hooks compartan el mismo valor
let _soundEnabled = true;
const _listeners: Array<(v: boolean) => void> = [];

function notifyListeners(v: boolean) {
  _listeners.forEach(fn => fn(v));
}

export function useSoundSettings() {
  const [soundEnabled, setSoundEnabledState] = useState(_soundEnabled);

  useEffect(() => {
    // Cargar preferencia guardada al montar
    kvGet(SOUND_ENABLED_KEY).then(val => {
      const enabled = val !== 'false'; // default: true
      _soundEnabled = enabled;
      setSoundEnabledState(enabled);
    }).catch(() => {});

    // Suscribirse a cambios globales
    _listeners.push(setSoundEnabledState);
    return () => {
      const idx = _listeners.indexOf(setSoundEnabledState);
      if (idx !== -1) _listeners.splice(idx, 1);
    };
  }, []);

  const setSoundEnabled = useCallback((value: boolean) => {
    _soundEnabled = value;
    notifyListeners(value);
    kvSet(SOUND_ENABLED_KEY, String(value)).catch(() => {});
  }, []);

  return { soundEnabled, setSoundEnabled };
}

/** Función utilitaria para leer el estado de sonido fuera de un componente React */
export function isSoundEnabled(): boolean {
  return _soundEnabled;
}
