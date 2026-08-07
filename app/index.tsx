import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const { width: SW, height: SH } = Dimensions.get('window');

// Proportions from Figma (295 × 640 design)
const TOP_RATIO = 364 / 640; // ~57% — warm cream section

export default function OnboardingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const insets = useSafeAreaInsets();
  const colors = useColors();

  // Web platform insets
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const topHeight = SH * TOP_RATIO;

  const handleDot = (index: number) => {
    setActiveSlide(index);
    Haptics.selectionAsync();
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── TOP SECTION: warm cream ── */}
      <View
        style={[
          styles.topSection,
          {
            height: topHeight,
            paddingTop: insets.top + webTopInset,
            backgroundColor: colors.brandPrimaryLight,
          },
        ]}
      >
        {/* Logo row */}
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/images/logo-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>DRCS-DATA</Text>
        </View>

        {/* Illustration layer */}
        <View style={styles.illustrationContainer}>
          {/* Left figure — person sitting */}
          <Image
            source={require('../assets/images/illustration-left.png')}
            style={[
              styles.illustrationLeft,
              { width: SW * 0.39, height: SW * 0.32 },
            ]}
            resizeMode="contain"
          />
          {/* Right figure — person with phone */}
          <Image
            source={require('../assets/images/illustration-right.png')}
            style={[
              styles.illustrationRight,
              { width: SW * 0.14, height: SW * 0.49 },
            ]}
            resizeMode="contain"
          />
          {/* Main bottom scene */}
          <Image
            source={require('../assets/images/illustration-main.png')}
            style={[
              styles.illustrationMain,
              { width: SW, height: SW * 0.57 },
            ]}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* ── BOTTOM SECTION ── */}
      <View
        style={[
          styles.bottomSection,
          {
            paddingBottom: Math.max(insets.bottom, 20) + webBottomInset,
          },
        ]}
      >
        {/* Slide dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleDot(i)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.dot,
                activeSlide === i
                  ? [styles.dotActive, { borderColor: colors.grayBlack }]
                  : [styles.dotInactive, { backgroundColor: colors.grayGray4 }],
              ]}
            />
          ))}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.grayBlack }]}>
          Easy Online Payment
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.grayGray1 }]}>
          Make your payment experience more better today.{'\n'}No additional admin fee
        </Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={handleLogin}
          >
            <Text style={[styles.loginButtonText, { color: colors.primaryForeground }]}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signUpButton, { borderColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={handleSignUp}
          >
            <Text style={[styles.signUpButtonText, { color: colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Top section ──
  topSection: {
    overflow: 'hidden',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 9,
    marginTop: 4,
    marginBottom: 4,
  },
  logoIcon: {
    width: 14,
    height: 20,
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 19,
    color: '#0B0A0A',
    letterSpacing: -0.3,
  },
  illustrationContainer: {
    flex: 1,
    position: 'relative',
  },
  illustrationLeft: {
    position: 'absolute',
    left: SW * 0.13,
    top: '8%',
  },
  illustrationRight: {
    position: 'absolute',
    right: SW * 0.04,
    top: '0%',
  },
  illustrationMain: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },

  // ── Bottom section ──
  bottomSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    borderRadius: 2,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderWidth: 1.6,
    backgroundColor: '#D0D3D8',
  },
  dotInactive: {
    width: 7,
    height: 7,
  },
  title: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
  },
  buttonsContainer: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  loginButton: {
    borderRadius: 4,
    paddingVertical: 13,
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderRadius: 4,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
