import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Language = 'en' | 'ha' | 'ha-ajami';
type Theme = 'light' | 'dark';

type OnboardingSlide = {
  title: string;
  description: string;
  image: ImageSourcePropType;
};

type AuthScreenName = 'signup' | 'login' | 'forgot' | 'pin';

type AuthScreenProps = {
  screen: AuthScreenName;
  theme: Theme;
  onBack: () => void;
  onNavigate: (screen: AuthScreenName) => void;
  onToggleTheme: () => void;
};

const authImages: Record<AuthScreenName, ImageSourcePropType> = {
  signup: require('../assets/images/auth/sign-up.png'),
  login: require('../assets/images/auth/sign-in.png'),
  forgot: require('../assets/images/auth/forgot-password.png'),
  pin: require('../assets/images/auth/mobile-encryption.png'),
};

const loginThumbImage = require('../assets/images/auth/login-thumb.png');

function AuthScreen({
  screen,
  theme,
  onBack,
  onNavigate,
  onToggleTheme,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors(theme);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pin, setPin] = useState('');
  const [notice, setNotice] = useState('');

  const isPinScreen = screen === 'pin';
  const title =
    screen === 'signup'
      ? 'Create your account'
      : screen === 'login'
        ? 'Welcome back'
        : screen === 'forgot'
          ? 'Reset your password'
          : 'Set your six-digit PIN';
  const description =
    screen === 'signup'
      ? 'Join DRCS DATA for easier, safer everyday payments.'
      : screen === 'login'
        ? 'Sign in to keep your bills, airtime and data in one place.'
        : screen === 'forgot'
          ? 'Enter your email and we will help you get back in.'
          : 'Create a six-digit PIN to keep your DRCS DATA account secure.';

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPinScreen) {
      setNotice('Your six-digit PIN has been set.');
      return;
    }
    setNotice('');
    onNavigate('pin');
  };

  return (
    <View
      style={[
        styles.authContainer,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12),
          paddingBottom: Math.max(insets.bottom, 18) + (Platform.OS === 'web' ? 34 : 0),
        },
      ]}
    >
      <View style={styles.authHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.grayBlack} />
        </Pressable>
        <View style={styles.authBrand}>
          <Image
            source={require('../assets/images/logo-icon.png')}
            style={styles.authLogoIcon}
            resizeMode="contain"
          />
          <Text style={[styles.authBrandText, { color: colors.grayBlack }]}>
            DRCS DATA
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle light and dark mode"
          hitSlop={10}
          onPress={onToggleTheme}
          style={({ pressed }) => [
            styles.themeButton,
            { backgroundColor: colors.secondary },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        bottomOffset={24}
        contentContainerStyle={styles.authContent}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={authImages[screen]}
          accessibilityLabel={`${title} illustration`}
          resizeMode="contain"
          style={[styles.authIllustration, isPinScreen && styles.pinIllustration]}
        />
        <Text style={[styles.eyebrow, { color: colors.primary }]}>DRCS DATA</Text>
        <Text style={[styles.authTitle, { color: colors.grayBlack }]}>{title}</Text>
        <Text style={[styles.authDescription, { color: colors.grayGray1 }]}>
          {description}
        </Text>

        <View style={styles.authForm}>
          {screen === 'signup' ? (
            <>
              <TextInput
                accessibilityLabel="Full name"
                autoCapitalize="words"
                onChangeText={setFullName}
                placeholder="Full name"
                placeholderTextColor={colors.grayGray1}
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={fullName}
              />
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.grayGray1}
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={email}
              />
              <TextInput
                accessibilityLabel="Password"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.grayGray1}
                secureTextEntry
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={password}
              />
              <TextInput
                accessibilityLabel="Confirm password"
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                placeholderTextColor={colors.grayGray1}
                secureTextEntry
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={confirmPassword}
              />
            </>
          ) : screen === 'login' ? (
            <>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor={colors.grayGray1}
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={email}
              />
              <TextInput
                accessibilityLabel="Password"
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={colors.grayGray1}
                secureTextEntry
                style={[
                  styles.authInput,
                  { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
                ]}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Forgot password"
                onPress={() => onNavigate('forgot')}
                style={({ pressed }) => [styles.inlineLinkButton, pressed && styles.pressed]}
              >
                <Text style={[styles.inlineLink, { color: colors.primary }]}>
                  Forgot password?
                </Text>
              </Pressable>
            </>
          ) : screen === 'forgot' ? (
            <TextInput
              accessibilityLabel="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={colors.grayGray1}
              style={[
                styles.authInput,
                { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
              ]}
              value={email}
            />
          ) : (
            <TextInput
              accessibilityLabel="Six digit PIN"
              autoCapitalize="none"
              keyboardType="number-pad"
              maxLength={6}
              onChangeText={(value) => setPin(value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              placeholderTextColor={colors.grayGray1}
              style={[
                styles.pinInput,
                { backgroundColor: colors.card, borderColor: colors.input, color: colors.grayBlack },
              ]}
              textAlign="center"
              value={pin}
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPinScreen ? 'Set PIN' : 'Continue'}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.authPrimaryButton,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              {isPinScreen ? 'Set PIN' : 'Continue'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.primaryForeground} />
          </Pressable>

          {notice ? (
            <View style={[styles.notice, { backgroundColor: colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={[styles.noticeText, { color: colors.success }]}>{notice}</Text>
            </View>
          ) : null}
        </View>

        {screen === 'signup' ? (
          <View style={styles.authFooter}>
            <Text style={[styles.footerText, { color: colors.grayGray1 }]}>
              Already have an account?
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log in"
              onPress={() => onNavigate('login')}
              style={({ pressed }) => [styles.inlineLinkButton, pressed && styles.pressed]}
            >
              <Text style={[styles.inlineLink, { color: colors.primary }]}>Log in</Text>
            </Pressable>
          </View>
        ) : screen === 'login' ? (
          <>
            <View style={styles.authFooter}>
              <Text style={[styles.footerText, { color: colors.grayGray1 }]}>
                New to DRCS DATA?
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sign up"
                onPress={() => onNavigate('signup')}
                style={({ pressed }) => [styles.inlineLinkButton, pressed && styles.pressed]}
              >
                <Text style={[styles.inlineLink, { color: colors.primary }]}>Sign up</Text>
              </Pressable>
            </View>
            <Image
              accessibilityLabel="Login with thumbprint"
              source={loginThumbImage}
              style={styles.loginThumb}
            />
          </>
        ) : screen === 'forgot' ? (
          <View style={styles.authFooter}>
            <Text style={[styles.footerText, { color: colors.grayGray1 }]}>
              Remembered your password?
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Log in"
              onPress={() => onNavigate('login')}
              style={({ pressed }) => [styles.inlineLinkButton, pressed && styles.pressed]}
            >
              <Text style={[styles.inlineLink, { color: colors.primary }]}>Log in</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={[styles.pinHint, { color: colors.grayGray1 }]}>
            Choose a six-digit PIN you can remember. You will use it to secure your account.
          </Text>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const slideCopy: Record<Language, OnboardingSlide[]> = {
  en: [
    {
      title: 'Pay bills without stress',
      description:
        'Take care of bills, airtime and data in a few simple taps.',
      image: require('../assets/images/onboarding-online-world.png'),
    },
    {
      title: 'Get more value',
      description:
        'Enjoy reliable VTU services made to give you more every day.',
      image: require('../assets/images/onboarding-programming.png'),
    },
    {
      title: 'Safe, instant transactions',
      description:
        'Your payments are protected and completed in seconds.',
      image: require('../assets/images/onboarding-progress.png'),
    },
    {
      title: 'Refer friends anywhere',
      description:
        'Share DRCS DATA with friends and enjoy more value together.',
      image: require('../assets/images/onboarding-wallet.png'),
    },
  ],
  ha: [
    {
      title: 'Kasance cikin haɗi a ko’ina',
      description:
        'Sayi katin waya da kunshin data na kowace network, a duk inda kake.',
      image: require('../assets/images/onboarding-online-world.png'),
    },
    {
      title: 'Ƙarfafa rayuwarka ta dijital',
      description:
        'Samun ingantattun ayyukan VTU da ke tafiyar da kira, data da na’urorinka.',
      image: require('../assets/images/onboarding-programming.png'),
    },
    {
      title: 'Mai sauri, aminci kuma abin dogaro',
      description:
        'An tsara kowace mu’amala ta kasance mai sauƙi, kariya kuma ta kammala cikin daƙiƙu.',
      image: require('../assets/images/onboarding-progress.png'),
    },
    {
      title: 'Duk abin da kake buƙata, a shirye koyaushe',
      description:
        'Ji daɗin ayyukan VTU masu sauƙi da tallafin DRCS DATA mai amsawa.',
      image: require('../assets/images/onboarding-wallet.png'),
    },
  ],
  'ha-ajami': [
    {
      title: 'کَسَانْسِ چِکِن هَادِی ا کۆئِنَ',
      description:
        'سَیِ کَتِن وَاِیَا دَ کُنْشِن دَاتَا نَ کۆوَچِن نِیْتْوَرْک، ا دُک اِنْدَ کَکِ.',
      image: require('../assets/images/onboarding-online-world.png'),
    },
    {
      title: 'قَرْفَفَ رَیُوَکَ تَ دِجِتَل',
      description:
        'سَمُن اِنْگَنْتَتْتُن اَیُوُکِن ڤِیْتِیُو، دَ کِ تَفِیَر دَ کِرَا، دَاتَا دَ نَوُرِکَ.',
      image: require('../assets/images/onboarding-programming.png'),
    },
    {
      title: 'مَی سَورِی، اَمِنِی کُومَ اَبِن دُوگَرو',
      description:
        'اَن تْسَرَ کُوَچِن مُعَمَلَ تَ کَسَنچِ مَی سَوْقِ، کَرِیَ دَ تَ کَمَمَلَ اِن دَقِقُ.',
      image: require('../assets/images/onboarding-progress.png'),
    },
    {
      title: 'دُک اَبِن دَ کَکِ بُوْقَتَ، ا شِرِی کُوَیْشِ',
      description:
        'جِ دَیِن اَیُوُکِن ڤِیْتِیُو مَسُ سَوْقِ دَ تَلَفِن دَ اَرسیَ دِرْسِس دَاتَا.',
      image: require('../assets/images/onboarding-wallet.png'),
    },
  ],
};

const languageCopy: Record<
  Language,
  {
    languagePrompt: string;
    languageSubtitle: string;
    continueLabel: string;
    backLabel: string;
    skipLabel: string;
    nextLabel: string;
    signUpLabel: string;
    loginLabel: string;
    themeLabel: string;
  }
> = {
  en: {
    languagePrompt: 'What language would you like to continue with?',
    languageSubtitle: 'Choose the language that feels most comfortable to you.',
    continueLabel: 'Continue',
    backLabel: 'Back',
    skipLabel: 'Skip',
    nextLabel: 'Next',
    signUpLabel: 'Sign Up',
    loginLabel: 'Login',
    themeLabel: 'Toggle light and dark mode',
  },
  ha: {
    languagePrompt: 'Wane yare kuke so ku ci gaba da shi?',
    languageSubtitle: 'Zaɓi harshen da ya fi muku sauƙi.',
    continueLabel: 'Ci gaba',
    backLabel: 'Koma',
    skipLabel: 'Tsallake',
    nextLabel: 'Na gaba',
    signUpLabel: 'Yi rajista',
    loginLabel: 'Shiga',
    themeLabel: 'Canza yanayin haske da duhu',
  },
  'ha-ajami': {
    languagePrompt: 'وَانِی یَرِ کُکِ سُ کُ چِ گَبَ دَ شِ؟',
    languageSubtitle: 'زَبِ حَرْشِن دَ یِ فِ مَکُ سَوْقِ.',
    continueLabel: 'چِ گَبَ',
    backLabel: 'کُمْا',
    skipLabel: 'تْسَلَکَ',
    nextLabel: 'نَگَبَ',
    signUpLabel: 'یِ رَجِسْتَ',
    loginLabel: 'شِگَ',
    themeLabel: 'چَنْزَ یَنَیِن هَشِکِ دَ دُهُو',
  },
};

const languages: { key: Language; label: string; nativeLabel: string }[] = [
  { key: 'en', label: 'English', nativeLabel: 'English' },
  { key: 'ha', label: 'Hausa', nativeLabel: 'Hausa' },
  { key: 'ha-ajami', label: 'Hausa Ajami', nativeLabel: 'هَوْسَ' },
];

export default function OnboardingScreen() {
  const systemScheme = useColorScheme();
  const [language, setLanguage] = useState<Language | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [authScreen, setAuthScreen] = useState<AuthScreenName | null>(null);
  const [theme, setTheme] = useState<Theme>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );
  const insets = useSafeAreaInsets();
  const colors = useColors(theme);
  const copy = languageCopy[language ?? 'en'];
  const slides = language ? slideCopy[language] : [];
  const slide = slides[activeSlide];
  const LAST_SLIDE = slides.length - 1;

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;
  const imageSize = useMemo(
    () => Math.min(SCREEN_WIDTH * 0.72, SCREEN_HEIGHT * 0.34),
    [],
  );

  const toggleTheme = () => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
    Haptics.selectionAsync();
  };

  const chooseLanguage = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setActiveSlide(0);
    Haptics.selectionAsync();
  };

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

  const handleBack = () => {
    if (activeSlide > 0) {
      goToSlide(activeSlide - 1);
    } else {
      setLanguage(null);
      setActiveSlide(0);
      Haptics.selectionAsync();
    }
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAuthScreen('login');
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAuthScreen('signup');
  };

  if (authScreen) {
    return (
      <AuthScreen
        onBack={() => setAuthScreen(null)}
        onNavigate={setAuthScreen}
        onToggleTheme={toggleTheme}
        screen={authScreen}
        theme={theme}
      />
    );
  }

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
          <Text style={[styles.logoText, { color: colors.foreground }]}>
            DRCS DATA
          </Text>
        </View>

        {language && activeSlide < LAST_SLIDE ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.skipLabel}
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.themeLabel}
          hitSlop={10}
          onPress={toggleTheme}
          style={({ pressed }) => [
            styles.themeButton,
            { backgroundColor: colors.secondary },
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {!language ? (
        <View style={styles.languageContent}>
          <Image
            source={require('../assets/images/Learning_languages-pana.png')}
            accessibilityLabel="Language learning illustration"
            resizeMode="contain"
            style={styles.languageIllustration}
          />
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            DRCS DATA
          </Text>
          <Text style={[styles.title, { color: colors.grayBlack }]}>
            {languageCopy.en.languagePrompt}
          </Text>
          <Text style={[styles.description, { color: colors.grayGray1 }]}>
            {languageCopy.en.languageSubtitle}
          </Text>
          <View style={styles.languageOptions}>
            {languages.map((item) => (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={() => chooseLanguage(item.key)}
                style={({ pressed }) => [
                  styles.languageButton,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.languageLabel, { color: colors.grayBlack }]}>
                  {item.label}
                </Text>
                <Text style={[styles.languageNative, { color: colors.grayGray1 }]}>
                  {item.nativeLabel}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.primary}
                />
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.content}>
            <View
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
                source={slide.image}
                accessibilityLabel={`DRCS DATA illustration ${activeSlide + 1}`}
                resizeMode="contain"
                style={styles.illustration}
              />
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
                  accessibilityLabel={`${copy.nextLabel} ${index + 1}`}
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.backLabel}
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { borderColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                {copy.backLabel}
              </Text>
            </Pressable>
            {activeSlide < LAST_SLIDE ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.nextLabel}
                onPress={handleNext}
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
                  {copy.nextLabel}
                </Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={copy.signUpLabel}
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
                  {copy.signUpLabel}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                accessibilityLabel={copy.loginLabel}
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
                  {copy.loginLabel}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </>
      )}
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
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    letterSpacing: -0.3,
  },
  headerSpacer: {
    flex: 1,
  },
  themeButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginLeft: 10,
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
  imageCard: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  illustration: {
    height: '100%',
    width: '100%',
  },
  copy: {
    alignItems: 'center',
    marginTop: 28,
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
  languageContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  languageIllustration: {
    height: 190,
    marginBottom: 18,
    maxWidth: 320,
    width: '78%',
  },
  languageOptions: {
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  languageButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 60,
    paddingHorizontal: 18,
  },
  languageLabel: {
    flex: 1,
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 16,
  },
  languageNative: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    marginRight: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
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
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  authHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  iconButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  authBrand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  authLogoIcon: {
    height: 24,
    width: 18,
  },
  authBrandText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    letterSpacing: -0.3,
  },
  authContent: {
    alignItems: 'center',
    flexGrow: 1,
    paddingBottom: 16,
    paddingTop: 12,
  },
  authIllustration: {
    height: Math.min(SCREEN_HEIGHT * 0.28, 230),
    marginBottom: 8,
    maxWidth: 360,
    width: '100%',
  },
  pinIllustration: {
    height: Math.min(SCREEN_HEIGHT * 0.25, 210),
  },
  authTitle: {
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  authDescription: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 340,
    textAlign: 'center',
  },
  authForm: {
    gap: 12,
    marginTop: 22,
    maxWidth: 420,
    width: '100%',
  },
  authInput: {
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  pinInput: {
    alignSelf: 'center',
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: 'IBMPlexSans_600SemiBold',
    fontSize: 28,
    letterSpacing: 8,
    minHeight: 64,
    paddingHorizontal: 16,
    width: '72%',
  },
  authPrimaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 4,
    width: '100%',
  },
  inlineLinkButton: {
    alignSelf: 'flex-start',
    minHeight: 28,
    justifyContent: 'center',
  },
  inlineLink: {
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 14,
  },
  notice: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: '100%',
  },
  noticeText: {
    flex: 1,
    fontFamily: 'Roboto_600SemiBold',
    fontSize: 13,
    lineHeight: 18,
  },
  authFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 22,
  },
  footerText: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
  },
  loginThumb: {
    alignSelf: 'center',
    height: 98,
    marginTop: 10,
    width: 46,
  },
  pinHint: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 20,
    maxWidth: 290,
    textAlign: 'center',
  },
});