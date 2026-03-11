/**
 * useNotifications — Gestión de notificaciones diarias de Gemlish
 * Permite al usuario configurar un recordatorio diario a una hora específica
 */
import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_HOUR_KEY = '@gemlish_notification_hour';
const NOTIFICATION_MINUTE_KEY = '@gemlish_notification_minute';
const NOTIFICATION_ENABLED_KEY = '@gemlish_notification_enabled';
const NOTIFICATION_ID_KEY = '@gemlish_notification_id';
const WEEKLY_NOTIFICATION_ID_KEY = '@gemlish_weekly_notification_id';

// Configurar cómo se muestran las notificaciones en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    hour: 20,
    minute: 0,
  });
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar configuración guardada
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [enabled, hour, minute] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY),
        AsyncStorage.getItem(NOTIFICATION_HOUR_KEY),
        AsyncStorage.getItem(NOTIFICATION_MINUTE_KEY),
      ]);
      setSettings({
        enabled: enabled === 'true',
        hour: hour ? parseInt(hour, 10) : 20,
        minute: minute ? parseInt(minute, 10) : 0,
      });

      // Verificar permisos actuales
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === 'granted');
    } catch (err) {
      console.warn('[useNotifications] Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('gemlish-daily', {
          name: 'Recordatorio Diario',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#8E5AF5',
          sound: 'default',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        setPermissionGranted(true);
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.warn('[useNotifications] Error requesting permission:', err);
      return false;
    }
  }, []);

  const scheduleDaily = useCallback(async (hour: number, minute: number): Promise<boolean> => {
    try {
      // Cancelar notificación anterior
      const prevId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
      if (prevId) {
        await Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
      }

      // Programar nueva notificación diaria
      const messages = [
        { title: '🔥 ¡No rompas tu racha!', body: 'Completa tu tarea diaria de inglés en Gemlish.' },
        { title: '💎 ¡Gana diamantes hoy!', body: 'Aprende 30 palabras nuevas y gana recompensas.' },
        { title: '🚀 ¡Sigue avanzando!', body: 'Tu próximo nivel te espera en Gemlish.' },
        { title: '📅 Tarea Diaria lista', body: '30 palabras nuevas te esperan hoy en Gemlish.' },
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: msg.title,
          body: msg.body,
          sound: 'default',
          data: { screen: 'daily' },
          ...(Platform.OS === 'android' && { channelId: 'gemlish-daily' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour,
          minute,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id);
      return true;
    } catch (err) {
      console.warn('[useNotifications] Error scheduling:', err);
      return false;
    }
  }, []);

  const enableNotifications = useCallback(async (hour: number, minute: number): Promise<boolean> => {
    const granted = await requestPermission();
    if (!granted) return false;

    const scheduled = await scheduleDaily(hour, minute);
    if (!scheduled) return false;

    await Promise.all([
      AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'true'),
      AsyncStorage.setItem(NOTIFICATION_HOUR_KEY, String(hour)),
      AsyncStorage.setItem(NOTIFICATION_MINUTE_KEY, String(minute)),
    ]);

    setSettings({ enabled: true, hour, minute });
    return true;
  }, [requestPermission, scheduleDaily]);

  const disableNotifications = useCallback(async () => {
    try {
      const prevId = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
      if (prevId) {
        await Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
        await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
      }
      await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, 'false');
      setSettings(prev => ({ ...prev, enabled: false }));
    } catch (err) {
      console.warn('[useNotifications] Error disabling:', err);
    }
  }, []);

  const updateTime = useCallback(async (hour: number, minute: number) => {
    if (settings.enabled) {
      await enableNotifications(hour, minute);
    } else {
      await Promise.all([
        AsyncStorage.setItem(NOTIFICATION_HOUR_KEY, String(hour)),
        AsyncStorage.setItem(NOTIFICATION_MINUTE_KEY, String(minute)),
      ]);
      setSettings(prev => ({ ...prev, hour, minute }));
    }
  }, [settings.enabled, enableNotifications]);

  /**
   * Programa una notificación de resumen semanal los lunes a las 9:00 AM.
   * Incluye niveles completados la semana pasada, racha actual y palabras aprendidas.
   */
  const scheduleWeeklySummary = useCallback(async (params: {
    levelsLastWeek: number;
    streak: number;
    wordsLearned: number;
  }): Promise<void> => {
    try {
      const granted = await requestPermission();
      if (!granted) return;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('gemlish-weekly', {
          name: 'Resumen Semanal',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      // Cancelar resumen semanal anterior
      const prevId = await AsyncStorage.getItem(WEEKLY_NOTIFICATION_ID_KEY);
      if (prevId) {
        await Notifications.cancelScheduledNotificationAsync(prevId).catch(() => {});
      }

      const { levelsLastWeek, streak, wordsLearned } = params;
      const title = '📊 Tu resumen semanal de Gemlish';
      const body = [
        levelsLastWeek > 0 ? `🏆 ${levelsLastWeek} niveles completados esta semana` : '💪 ¡Empieza esta semana con fuerza!',
        streak > 0 ? `🔥 Racha actual: ${streak} días` : '',
        wordsLearned > 0 ? `📚 ${wordsLearned} palabras aprendidas en total` : '',
      ].filter(Boolean).join(' · ');

      // Programar para el próximo lunes a las 9:00 AM
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data: { screen: 'stats' },
          ...(Platform.OS === 'android' && { channelId: 'gemlish-weekly' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          weekday: 2, // Lunes (1=Domingo, 2=Lunes)
          hour: 9,
          minute: 0,
          repeats: true,
        } as Notifications.CalendarTriggerInput,
      });

      await AsyncStorage.setItem(WEEKLY_NOTIFICATION_ID_KEY, id);
    } catch (err) {
      console.warn('[useNotifications] Error scheduling weekly summary:', err);
    }
  }, [requestPermission]);

  return {
    settings,
    permissionGranted,
    loading,
    enableNotifications,
    disableNotifications,
    updateTime,
    requestPermission,
    scheduleWeeklySummary,
  };
}
