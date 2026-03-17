/**
 * AdBanner — Componente reutilizable de banner AdMob.
 * Solo se renderiza en Android/iOS, nunca en web.
 * Uso: <AdBanner />
 */
import React from 'react';
import { Platform, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/hooks/useAdMob';

interface AdBannerProps {
  style?: object;
}

export function AdBanner({ style }: AdBannerProps) {
  if (Platform.OS === 'web') return null;
  return (
    <View style={style}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER_HOME}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}
