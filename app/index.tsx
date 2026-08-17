import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors, type DesignVariant } from '@/hooks/useColors';
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
type IconName = React.ComponentProps<typeof Ionicons>['name'];

type AuthScreenProps = {
  screen: AuthScreenName;
  theme: Theme;
  designVariant: DesignVariant;
  onBack: () => void;
  onNavigate: (screen: AuthScreenName) => void;
  onToggleTheme: () => void;
  onAuthenticated: () => void;
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
  designVariant,
  onBack,
  onNavigate,
  onToggleTheme,
  onAuthenticated,
}: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const colors = useColors(theme, designVariant);
  const styles = makeStyles(colors);
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
      onAuthenticated();
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

type HomeTab = 'Home' | 'Rewards' | 'Finance' | 'Cards' | 'Me';

type HomeAction = {
  label: string;
  icon: IconName;
  tone: 'primary' | 'secondary' | 'accent';
};

const homeActions: HomeAction[] = [
  { label: 'To DRCS User', icon: 'paper-plane-outline', tone: 'primary' },
  { label: 'To Bank', icon: 'business-outline', tone: 'secondary' },
  { label: 'Add Money', icon: 'add-circle-outline', tone: 'accent' },
];

const homeServices: HomeAction[] = [
  { label: 'Airtime', icon: 'phone-portrait-outline', tone: 'primary' },
  { label: 'Data', icon: 'wifi-outline', tone: 'secondary' },
  { label: 'Electricity', icon: 'flash-outline', tone: 'accent' },
  { label: 'TV', icon: 'tv-outline', tone: 'primary' },
];

const homeTabs: { label: HomeTab; icon: IconName }[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Rewards', icon: 'gift-outline' },
  { label: 'Finance', icon: 'wallet-outline' },
  { label: 'Cards', icon: 'card-outline' },
  { label: 'Me', icon: 'person-outline' },
];

type PromoSlide = {
  title: string;
  description: string;
  cta: string;
  background: ImageSourcePropType;
  illustration?: ImageSourcePropType;
  tone: 'light' | 'dark';
};

const promoSlides: PromoSlide[] = [
  {
    title: 'Giveaway season is here',
    description: 'Enter today for a chance to win something special.',
    cta: 'Join the giveaway',
    background: require('../assets/images/promos/promo-pink.png'),
    illustration: require('../assets/images/promos/giveaway-bro.png'),
    tone: 'light',
  },
  {
    title: 'Your next gift could be waiting',
    description: 'DRCS DATA is bringing more rewards closer to you.',
    cta: 'See what is up for grabs',
    background: require('../assets/images/promos/promo-dark.png'),
    illustration: require('../assets/images/promos/giveaway-amico.png'),
    tone: 'dark',
  },
  {
    title: 'Tap into something exciting',
    description: 'Stay close. New giveaway moments are landing soon.',
    cta: 'Keep me in the loop',
    background: require('../assets/images/promos/promo-pink.png'),
    illustration: require('../assets/images/promos/giveaway-rafiki.png'),
    tone: 'light',
  },
  {
    title: 'Do not miss your chance',
    description: 'A little DRCS DATA surprise could be yours next.',
    cta: 'Explore the giveaway',
    background: require('../assets/images/promos/promo-dark.png'),
    illustration: require('../assets/images/promos/giveaway-bro.png'),
    tone: 'dark',
  },
];

function HomeScreen({
  theme,
  designVariant,
  onToggleTheme,
  onToggleDesign,
}: {
  theme: Theme;
  designVariant: DesignVariant;
  onToggleTheme: () => void;
  onToggleDesign: () => void;
}) {
  const insets = useSafeAreaInsets();
  const colors = useColors(theme, designVariant);
  const styles = makeStyles(colors);
  const [activeTab, setActiveTab] = useState<HomeTab>('Home');
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notice, setNotice] = useState('');
  const [promoIndex, setPromoIndex] = useState(0);
  const promoScrollRef = useRef<ScrollView>(null);
  const promoWidth = Math.max(SCREEN_WIDTH - 36, 280);

  const showNotice = (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotice(message);
  };

  const handleTabPress = (tab: HomeTab) => {
    setActiveTab(tab);
    if (tab !== 'Home') {
      showNotice(`${tab} is ready for your DRCS DATA account.`);
    } else {
      setNotice('');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (promoIndex + 1) % promoSlides.length;
      promoScrollRef.current?.scrollTo({
        animated: true,
        x: nextIndex * promoWidth,
      });
      setPromoIndex(nextIndex);
    }, 5200);

    return () => clearInterval(timer);
  }, [promoIndex, promoWidth]);

  return (
    <View
      style={[
        styles.homeContainer,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 10),
          paddingBottom: Math.max(insets.bottom, 12) + (Platform.OS === 'web' ? 34 : 0),
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeHeader}>
          <View style={styles.homeBrandRow}>
            <View style={[styles.homeLogoBadge, { backgroundColor: colors.primary }]}>
              <Image
                source={require('../assets/images/logo-icon.png')}
                style={styles.homeLogo}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={[styles.homeGreeting, { color: colors.grayGray1 }]}>Welcome back</Text>
              <Text style={[styles.homeName, { color: colors.grayBlack }]}>DRCS User</Text>
            </View>
          </View>
          <View style={styles.homeHeaderActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Toggle light and dark mode"
              onPress={onToggleTheme}
              style={({ pressed }) => [
                styles.homeHeaderIcon,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={theme === 'light' ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={colors.primary}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Switch to Design ${designVariant === 'A' ? 'B' : 'A'}`}
              onPress={onToggleDesign}
              style={({ pressed }) => [
                styles.homeHeaderIcon,
                {
                  backgroundColor: designVariant === 'B' ? colors.primary : colors.card,
                  borderColor: colors.primary,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={{
                  fontFamily: colors.fontBodySemiBold,
                  fontSize: 11,
                  color: designVariant === 'B' ? colors.primaryForeground : colors.primary,
                  letterSpacing: 0.5,
                }}
              >
                {designVariant === 'A' ? 'B' : 'A'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              onPress={() => showNotice('You are all caught up.')}
              style={({ pressed }) => [
                styles.homeHeaderIcon,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="notifications-outline" size={19} color={colors.grayBlack} />
              <View style={[styles.notificationDot, { backgroundColor: colors.accent }]} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceCardTop}>
            <Text style={[styles.balanceLabel, { color: colors.primaryForeground }]}>
              Available balance
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={balanceVisible ? 'Hide balance' : 'Show balance'}
              hitSlop={10}
              onPress={() => setBalanceVisible((current) => !current)}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Ionicons
                name={balanceVisible ? 'eye-outline' : 'eye-off-outline'}
                size={21}
                color={colors.primaryForeground}
              />
            </Pressable>
          </View>
          <Text style={[styles.balanceAmount, { color: colors.primaryForeground }]}>
            {balanceVisible ? '₦24,590.00' : '₦••••••••'}
          </Text>
          <View style={styles.balanceMeta}>
            <View style={styles.balanceMetaItem}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.primaryForeground} />
              <Text style={[styles.balanceMetaText, { color: colors.primaryForeground }]}>
                Wallet protected
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View transaction history"
              onPress={() => showNotice('Your transaction history is coming next.')}
              style={({ pressed }) => [styles.balanceHistoryButton, pressed && styles.pressed]}
            >
              <Text style={[styles.balanceHistoryText, { color: colors.primaryForeground }]}>
                History
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>

        <View style={styles.homeSectionHeading}>
          <Text style={[styles.homeSectionTitle, { color: colors.grayBlack }]}>Move money</Text>
          <Text style={[styles.homeSectionCaption, { color: colors.grayGray1 }]}>
            Fast, safe and simple
          </Text>
        </View>
        <View style={styles.actionRow}>
          {homeActions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              onPress={() => showNotice(`${action.label} selected.`)}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.actionCardPressed,
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      action.tone === 'primary'
                        ? colors.brandPrimaryLight
                        : action.tone === 'secondary'
                          ? colors.secondary
                          : colors.successLight,
                  },
                ]}
              >
                <Ionicons
                  name={action.icon}
                  size={22}
                  color={
                    action.tone === 'accent'
                      ? colors.success
                      : action.tone === 'secondary'
                        ? colors.secondaryForeground
                        : colors.primary
                  }
                />
              </View>
              <Text style={[styles.actionLabel, { color: colors.grayBlack }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.homeSectionHeading}>
          <Text style={[styles.homeSectionTitle, { color: colors.grayBlack }]}>Everyday services</Text>
          <Text style={[styles.homeSectionCaption, { color: colors.primary }]}>See all</Text>
        </View>
        <View style={styles.servicesGrid}>
          {homeServices.map((service) => (
            <Pressable
              key={service.label}
              accessibilityRole="button"
              accessibilityLabel={service.label}
              onPress={() => showNotice(`${service.label} service selected.`)}
              style={({ pressed }) => [
                styles.serviceCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                pressed && styles.actionCardPressed,
              ]}
            >
              <View
                style={[
                  styles.serviceIcon,
                  {
                    backgroundColor:
                      service.tone === 'primary'
                        ? colors.brandPrimaryLight
                        : service.tone === 'secondary'
                          ? colors.secondary
                          : colors.successLight,
                  },
                ]}
              >
                <Ionicons
                  name={service.icon}
                  size={21}
                  color={
                    service.tone === 'accent'
                      ? colors.success
                      : service.tone === 'secondary'
                        ? colors.secondaryForeground
                        : colors.primary
                  }
                />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.grayBlack }]}>{service.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.promoRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refer and Earn"
            onPress={() => showNotice('Your referral invite is ready to share.')}
            style={({ pressed }) => [
              styles.promoCard,
              { backgroundColor: colors.brandPrimaryDark },
              pressed && styles.pressed,
            ]}
          >
              <View style={[styles.promoIconCircle, { backgroundColor: colors.card }]}>
              <Ionicons name="gift-outline" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.promoTitle, { color: colors.primaryForeground }]}>Refer and Earn</Text>
            <Text style={[styles.promoDescription, { color: colors.primaryForeground }]}>
              Invite friends and get rewarded
            </Text>
            <Ionicons name="arrow-forward" size={17} color={colors.primaryForeground} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Education"
            onPress={() => showNotice('Learn more with DRCS DATA Education.')}
            style={({ pressed }) => [
              styles.promoCard,
              { backgroundColor: colors.secondary },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.promoIconCircle, { backgroundColor: colors.card }]}>
              <Ionicons name="school-outline" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.promoTitle, { color: colors.secondaryForeground }]}>Education</Text>
            <Text style={[styles.promoDescription, { color: colors.secondaryForeground }]}>
              Build your digital money skills
            </Text>
            <Ionicons name="arrow-forward" size={17} color={colors.secondaryForeground} />
          </Pressable>
        </View>

        <View style={styles.promoCarouselSection}>
          <ScrollView
            ref={promoScrollRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            snapToInterval={promoWidth}
            snapToAlignment="start"
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / promoWidth,
              );
              setPromoIndex(Math.max(0, Math.min(nextIndex, promoSlides.length - 1)));
            }}
          >
            {promoSlides.map((slide, index) => {
              const textColor = colors.primaryForeground;
              const secondaryTextColor = colors.primaryForeground;

              return (
                <Pressable
                  key={slide.title}
                  accessibilityRole="button"
                  accessibilityLabel={slide.cta}
                  onPress={() => showNotice(`${slide.title}. Giveaway details coming soon.`)}
                  style={({ pressed }) => [
                    styles.promoBanner,
                    { width: promoWidth },
                    pressed && styles.pressed,
                  ]}
                >
                  <ImageBackground
                    source={slide.background}
                    resizeMode="cover"
                    style={[
                      styles.promoBannerBackground,
                      { backgroundColor: colors.primary },
                    ]}
                    imageStyle={[styles.promoBannerImage, { opacity: 0.16 }]}
                  >
                    <View
                      style={[
                        styles.promoBannerOverlay,
                        { backgroundColor: 'transparent' },
                      ]}
                    />
                    <View style={styles.promoBannerCopy}>
                      <View style={styles.promoBannerKicker}>
                        <Ionicons name="gift-outline" size={13} color={colors.accent} />
                        <Text style={[styles.promoBannerKickerText, { color: textColor }]}>
                          DRCS PROMO
                        </Text>
                      </View>
                      <Text style={[styles.promoBannerTitle, { color: textColor }]}>
                        {slide.title}
                      </Text>
                      <Text style={[styles.promoBannerDescription, { color: secondaryTextColor }]}>
                        {slide.description}
                      </Text>
                      <View style={styles.promoBannerCta}>
                        <Text style={[styles.promoBannerCtaText, { color: textColor }]}>
                          {slide.cta}
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={textColor} />
                      </View>
                    </View>
                    {slide.illustration ? (
                      <Image
                        source={slide.illustration}
                        resizeMode="contain"
                        style={styles.promoBannerIllustration}
                      />
                    ) : null}
                    <View style={styles.promoBannerCounter}>
                      <Text style={[styles.promoBannerCounterText, { color: textColor }]}>
                        {index + 1}/{promoSlides.length}
                      </Text>
                    </View>
                  </ImageBackground>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.promoDots} accessibilityLabel="Giveaway promo slides">
            {promoSlides.map((slide, index) => (
              <View
                key={slide.title}
                style={[
                  styles.promoDot,
                  {
                    backgroundColor:
                      index === promoIndex ? colors.primary : colors.grayGray4,
                    width: index === promoIndex ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {notice ? (
          <View style={[styles.homeNotice, { backgroundColor: colors.successLight }]}>
            <Ionicons name="checkmark-circle" size={17} color={colors.success} />
            <Text style={[styles.homeNoticeText, { color: colors.success }]}>{notice}</Text>
          </View>
        ) : null}

        <View style={styles.recentHeading}>
          <Text style={[styles.homeSectionTitle, { color: colors.grayBlack }]}>Recent activity</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="See all recent activity"
            onPress={() => showNotice('Your full activity list is coming next.')}
          >
            <Text style={[styles.homeSectionCaption, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>
        <View style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.transactionIcon, { backgroundColor: colors.successLight }]}>
            <Ionicons name="arrow-up-outline" size={19} color={colors.success} />
          </View>
          <View style={styles.transactionCopy}>
            <Text style={[styles.transactionTitle, { color: colors.grayBlack }]}>Data bundle</Text>
            <Text style={[styles.transactionSubtitle, { color: colors.grayGray1 }]}>
              Today, 10:42 AM
            </Text>
          </View>
          <Text style={[styles.transactionAmount, { color: colors.grayBlack }]}>-₦2,000</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {homeTabs.map((tab) => {
          const isActive = activeTab === tab.label;
          return (
            <Pressable
              key={tab.label}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              onPress={() => handleTabPress(tab.label)}
              style={({ pressed }) => [styles.bottomNavItem, pressed && styles.pressed]}
            >
              <View
                style={[
                  styles.bottomNavIcon,
                  isActive && { backgroundColor: colors.brandPrimaryLight },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={21}
                  color={isActive ? colors.primary : colors.grayGray1}
                />
              </View>
              <Text
                style={[
                  styles.bottomNavLabel,
                  { color: isActive ? colors.primary : colors.grayGray1 },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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

const DESIGN_VARIANT_KEY = '@drcs_design_variant';

export default function OnboardingScreen() {
  const systemScheme = useColorScheme();
  const [language, setLanguage] = useState<Language | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [authScreen, setAuthScreen] = useState<AuthScreenName | null>(null);
  const [isHome, setIsHome] = useState(false);
  const [theme, setTheme] = useState<Theme>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );
  const [designVariant, setDesignVariant] = useState<DesignVariant>('A');
  const insets = useSafeAreaInsets();
  const colors = useColors(theme, designVariant);
  const styles = makeStyles(colors);

  // Load persisted design variant on mount
  useEffect(() => {
    AsyncStorage.getItem(DESIGN_VARIANT_KEY).then((stored) => {
      if (stored === 'A' || stored === 'B') setDesignVariant(stored);
    }).catch(() => {});
  }, []);
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

  const toggleDesign = () => {
    const next: DesignVariant = designVariant === 'A' ? 'B' : 'A';
    setDesignVariant(next);
    AsyncStorage.setItem(DESIGN_VARIANT_KEY, next).catch(() => {});
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

  if (isHome) {
    return (
      <HomeScreen
        onToggleTheme={toggleTheme}
        onToggleDesign={toggleDesign}
        theme={theme}
        designVariant={designVariant}
      />
    );
  }

  if (authScreen) {
    return (
      <AuthScreen
        onBack={() => setAuthScreen(null)}
        onNavigate={setAuthScreen}
        onAuthenticated={() => {
          setAuthScreen(null);
          setIsHome(true);
        }}
        onToggleTheme={toggleTheme}
        screen={authScreen}
        theme={theme}
        designVariant={designVariant}
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

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Switch to Design ${designVariant === 'A' ? 'B' : 'A'}`}
            hitSlop={10}
            onPress={toggleDesign}
            style={({ pressed }) => [
              styles.themeButton,
              {
                backgroundColor: designVariant === 'B' ? colors.primary : colors.secondary,
                minWidth: 36,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={{
                fontFamily: colors.fontBodySemiBold,
                fontSize: 12,
                color: designVariant === 'B' ? colors.primaryForeground : colors.primary,
                letterSpacing: 0.5,
              }}
            >
              {designVariant === 'A' ? 'B' : 'A'}
            </Text>
          </Pressable>
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

const makeStyles = (c: ReturnType<typeof useColors>) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  homeContainer: {
    flex: 1,
    paddingHorizontal: 18,
  },
  homeScrollContent: {
    paddingBottom: 16,
  },
  homeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  homeBrandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  homeLogoBadge: {
    alignItems: 'center',
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  homeLogo: {
    height: 25,
    width: 19,
  },
  homeGreeting: {
    fontFamily: c.fontBody,
    fontSize: 12,
    marginBottom: 2,
  },
  homeName: {
    fontFamily: c.fontBrand,
    fontSize: 18,
  },
  homeHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  homeHeaderIcon: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    width: 36,
  },
  notificationDot: {
    borderRadius: 4,
    height: 7,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 7,
  },
  balanceCard: {
    borderRadius: 24,
    marginBottom: 24,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  promoCarouselSection: {
    marginBottom: 24,
    marginHorizontal: -18,
  },
  promoBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    paddingHorizontal: 18,
  },
  promoBannerBackground: {
    borderRadius: 24,
    height: 188,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  promoBannerImage: {
    borderRadius: 24,
  },
  promoBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  promoBannerCopy: {
    maxWidth: '58%',
    paddingBottom: 16,
    paddingLeft: 16,
    paddingTop: 16,
    zIndex: 2,
  },
  promoBannerKicker: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  promoBannerKickerText: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  promoBannerTitle: {
    fontFamily: c.fontHeading,
    fontSize: 20,
    lineHeight: 23,
  },
  promoBannerDescription: {
    fontFamily: c.fontBody,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },
  promoBannerCta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 12,
  },
  promoBannerCtaText: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 11,
  },
  promoBannerIllustration: {
    bottom: -6,
    height: 186,
    position: 'absolute',
    right: -18,
    width: 186,
    zIndex: 1,
  },
  promoBannerCounter: {
    bottom: 13,
    position: 'absolute',
    right: 15,
    zIndex: 3,
  },
  promoBannerCounterText: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 10,
    opacity: 0.78,
  },
  promoDots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 9,
  },
  promoDot: {
    borderRadius: 4,
    height: 6,
  },
  balanceCardTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceLabel: {
    fontFamily: c.fontBody,
    fontSize: 13,
    opacity: 0.88,
  },
  balanceAmount: {
    fontFamily: c.fontHeading,
    fontSize: 32,
    letterSpacing: -0.8,
    marginTop: 9,
  },
  balanceMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  balanceMetaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  balanceMetaText: {
    fontFamily: c.fontBody,
    fontSize: 11,
    opacity: 0.82,
  },
  balanceHistoryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  balanceHistoryText: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 12,
  },
  homeSectionHeading: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  homeSectionTitle: {
    fontFamily: c.fontHeading,
    fontSize: 18,
  },
  homeSectionCaption: {
    fontFamily: c.fontBody,
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  actionCard: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    flex: 1,
    minHeight: 110,
    paddingHorizontal: 5,
    paddingVertical: 14,
  },
  actionCardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    marginBottom: 11,
    width: 44,
  },
  actionLabel: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 11,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 26,
  },
  serviceCard: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    minHeight: 105,
    paddingVertical: 13,
    width: '22%',
  },
  serviceIcon: {
    alignItems: 'center',
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    marginBottom: 9,
    width: 40,
  },
  serviceLabel: {
    fontFamily: c.fontBody,
    fontSize: 11,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  promoCard: {
    borderRadius: 20,
    flex: 1,
    minHeight: 142,
    overflow: 'hidden',
    padding: 15,
  },
  promoIconCircle: {
    alignItems: 'center',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    marginBottom: 12,
    width: 30,
  },
  promoTitle: {
    fontFamily: c.fontHeading,
    fontSize: 15,
  },
  promoDescription: {
    fontFamily: c.fontBody,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 11,
    marginTop: 4,
    maxWidth: 122,
  },
  homeNotice: {
    alignItems: 'center',
    borderRadius: 13,
    flexDirection: 'row',
    gap: 7,
    marginBottom: 18,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  homeNoticeText: {
    flex: 1,
    fontFamily: c.fontBody,
    fontSize: 12,
  },
  recentHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 11,
  },
  transactionCard: {
    alignItems: 'center',
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  transactionIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  transactionCopy: {
    flex: 1,
    marginLeft: 11,
  },
  transactionTitle: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 13,
  },
  transactionSubtitle: {
    fontFamily: c.fontBody,
    fontSize: 11,
    marginTop: 3,
  },
  transactionAmount: {
    fontFamily: c.fontBodySemiBold,
    fontSize: 13,
  },
  bottomNav: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    minHeight: 70,
    paddingHorizontal: 5,
    paddingTop: 5,
  },
  bottomNavItem: {
    alignItems: 'center',
    flex: 1,
    minHeight: 61,
  },
  bottomNavIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 34,
    justifyContent: 'center',
    width: 42,
  },
  bottomNavLabel: {
    fontFamily: c.fontBody,
    fontSize: 10,
    marginTop: 2,
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
    fontFamily: c.fontBrand,
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
    fontFamily: c.fontBodySemiBold,
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
    fontFamily: c.fontBodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 11,
  },
  title: {
    fontFamily: c.fontHeading,
    fontSize: 29,
    lineHeight: 35,
    textAlign: 'center',
  },
  description: {
    fontFamily: c.fontBody,
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
    fontFamily: c.fontBodySemiBold,
    fontSize: 16,
  },
  languageNative: {
    fontFamily: c.fontBody,
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
    fontFamily: c.fontBodySemiBold,
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
    fontFamily: c.fontBodySemiBold,
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
    fontFamily: c.fontBrand,
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
    fontFamily: c.fontHeading,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
  },
  authDescription: {
    fontFamily: c.fontBody,
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
    fontFamily: c.fontBody,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  pinInput: {
    alignSelf: 'center',
    borderRadius: 14,
    borderWidth: 1,
    fontFamily: c.fontHeading,
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
    fontFamily: c.fontBodySemiBold,
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
    fontFamily: c.fontBodySemiBold,
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
    fontFamily: c.fontBody,
    fontSize: 14,
  },
  loginThumb: {
    alignSelf: 'center',
    height: 98,
    marginTop: 10,
    width: 46,
  },
  pinHint: {
    fontFamily: c.fontBody,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 20,
    maxWidth: 290,
    textAlign: 'center',
  },
});