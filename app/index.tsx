import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type OnboardingSlide = {
  title: string;
  description: string;
  images: [ImageSourcePropType, ImageSourcePropType];
};

const slides: OnboardingSlide[] = [
  {
    title: 'Stay connected everywhere',
    description:
      'Buy airtime and data bundles for every network, wherever you are.',
    images: [
      require('../assets/images/onboarding-online-world.png'),
      require('../assets/images/onboarding-globalization.png'),
    ],
  },
  {
    title: 'Power your digital life',
    description:
      'Get reliable VTU services that keep your calls, data and devices running.',
    images: [
      require('../assets/images/onboarding-programming.png'),
      require('../assets/images/onboarding-server.png'),
    ],
  },
  {
    title: 'Fast, secure and reliable',
    description:
      'Every transaction is designed to be simple, protected and completed in seconds.',
    images: [
      require('../assets/images/onboarding-progress.png'),
      require('../assets/images/onboarding-security.png'),
    ],
  },
  {
    title: 'Everything you need, always available',
    description:
      'Enjoy convenient VTU services and responsive support from DRCS DATA.',
    images: [
      require('../assets/images/onboarding-wallet.png'),
      require('../assets/images/onboarding-service.png'),
    ],
  },
];

const LAST_SLIDE = slides.length - 1;

export default function OnboardingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const slide = slides[activeSlide];

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const imageSize = useMemo(
    () => Math.min(SCREEN_WIDTH * 0.42, SCREEN_HEIGHT * 0.25),
    [],
  );

  const goToSlide = (index: number) => {
    setActiveSlide(Math.max(0, Math.min(index, LAST_SLIDE)));
    Haptics.selectionAsync();
  };

  const handleNext = () => {
    if (activeSlide < LAST_SLIDE) {
      goToSlide(activeSlide + 1);
    }
  };

  const handleSkip = () => {
    goToSlide(LAST_SLIDE);
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + webTopInset,
          paddingBottom: Math.max(insets.bottom, 18) + webBottomInset,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image
            source={require('../assets/images/logo-icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>DRCS DATA</Text>
        </View>

        {activeSlide < LAST_SLIDE ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            hitSlop={12}
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.skipText, { color: colors.grayGray1 }]}>
              Skip
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationRow}>
          {slide.images.map((image, index) => (
            <View
              key={index}
              style={[
                styles.imageCard,
                {
                  backgroundColor: colors.brandPrimaryLight,
                  width: imageSize,
                  height: imageSize,
                },
              ]}
            >
              <Image
                source={image}
                accessibilityLabel={`DRCS DATA illustration ${index + 1}`}
                resizeMode="contain"
                style={styles.illustration}
              />
            </View>
          ))}
        </View>

        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            DRCS DATA VTU SERVICES
          </Text>
          <Text style={[styles.title, { color: colors.grayBlack }]}>
            {slide.title}
          </Text>
          <Text style={[styles.description, { color: colors.grayGray1 }]}>
            {slide.description}
          </Text>
        </View>

        <View style={styles.dotsRow}>
          {slides.map((item, index) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={`Go to onboarding slide ${index + 1}`}
              hitSlop={10}
              onPress={() => goToSlide(index)}
              style={[
                styles.dot,
                index === activeSlide
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : [
                      styles.dotInactive,
                      { backgroundColor: colors.grayGray4 },
                    ],
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        {activeSlide < LAST_SLIDE ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next onboarding slide"
            onPress={handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[styles.primaryButtonText, { color: colors.primaryForeground }]}
            >
              Next
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign up"
              onPress={handleSignUp}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: colors.primaryForeground },
                ]}
              >
                Sign Up
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log in"
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.secondaryButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.primary }]}
              >
                Login
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoIcon: {
    height: 22,
    width: 16,
  },
  logoText: {
    color: '#0B0A0A',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },
  skipButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  skipText: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 14,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  illustrationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  imageCard: {
    alignItems: 'center',
    borderRadius: 24,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustration: {
    height: '100%',
    width: '100%',
  },
  copy: {
    alignItems: 'center',
    marginTop: 34,
    maxWidth: 360,
  },
  eyebrow: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 11,
  },
  title: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 29,
    lineHeight: 35,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
  },
  dotsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 28,
  },
  dot: {
    borderRadius: 5,
    height: 8,
  },
  dotActive: {
    borderRadius: 5,
    width: 25,
  },
  dotInactive: {
    width: 8,
  },
  actions: {
    gap: 10,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 54,
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    minHeight: 54,
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.78,
  },
});