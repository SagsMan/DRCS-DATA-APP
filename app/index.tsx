import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { cacheDirectory, writeAsStringAsync } from 'expo-file-system/legacy';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useColors, type DesignVariant } from '@/hooks/useColors';
import { DesignBApp } from '@/components/DesignBApp';
import {
  AirtimeIcon, BettingIcon, CableTVIcon, DataIcon, EducationIcon, ElectricityIcon,
  CardsNavIcon, HistoryNavIcon, HomeNavIcon, ProfileNavIcon, RewardsNavIcon,
  DepositIcon, TransferIcon,
} from '@/components/icons/DrcsIcons';
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

type HomeTab = 'Home' | 'Rewards' | 'History' | 'Cards' | 'Profile';

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

type ServiceItem = { id: string; label: string; Icon: React.ComponentType<{size?:number;color?:string;strokeWidth?:number}> };
const homeServices: ServiceItem[] = [
  { id:'airtime',     label:'Airtime',     Icon: AirtimeIcon     },
  { id:'data',        label:'Data',        Icon: DataIcon        },
  { id:'electricity', label:'Electricity', Icon: ElectricityIcon },
  { id:'tv',          label:'TV',          Icon: CableTVIcon     },
  { id:'betting',     label:'Betting',     Icon: BettingIcon     },
  { id:'education',   label:'Education',   Icon: EducationIcon   },
];

type ANavIconComponent = React.ComponentType<{size?:number;color?:string;strokeWidth?:number}>;
const homeTabs: { label: HomeTab; Icon: ANavIconComponent }[] = [
  { label: 'Home',    Icon: HomeNavIcon    },
  { label: 'Rewards', Icon: RewardsNavIcon },
  { label: 'History', Icon: HistoryNavIcon },
  { label: 'Cards',   Icon: CardsNavIcon   },
  { label: 'Profile', Icon: ProfileNavIcon },
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

// ─── A: Flow types & shared data ──────────────────────────────────────────────
interface AReceiptData {
  status: 'success' | 'failed';
  title: string;
  amount: string;
  rows: { label: string; value: string }[];
}

type AFlow =
  | null
  | { kind: 'telecomPicker'; service: string }
  | { kind: 'serviceForm';   service: string; network: string }
  | { kind: 'tvPicker' }
  | { kind: 'tvForm';        providerId: string; providerLabel: string }
  | { kind: 'educationPicker' }
  | { kind: 'educationForm';  bodyId: string; bodyLabel: string }
  | { kind: 'bettingPicker' }
  | { kind: 'sendToDRCS' }
  | { kind: 'sendToBank' }
  | { kind: 'addMoney' }
  | { kind: 'pin';    onConfirm: () => void }
  | { kind: 'receipt'; data: AReceiptData };

const A_TELECOMS = [
  { id:'mtn',     label:'MTN',    color:'#ffcc00', tc:'#000' },
  { id:'airtel',  label:'Airtel', color:'#e8001c', tc:'#fff' },
  { id:'glo',     label:'Glo',    color:'#0a8234', tc:'#fff' },
  { id:'9mobile', label:'9Mobile',color:'#006b50', tc:'#fff' },
];
const A_DISCOS = ['AEDC','IKEDC','EKEDC','KANO Electricity'];
type ADataPlan = { size: string; validity: string; price: string; naira: number };
type ADataCategory = 'Daily'|'Weekly'|'Monthly'|'SMS'|'Gift'|'Corporate'|'SM2';
const A_DATA_CATEGORIES: ADataCategory[] = ['Daily','Weekly','Monthly','SMS','Gift','Corporate','SM2'];
const A_DATA_PLANS: Record<string, Record<ADataCategory, ADataPlan[]>> = {
  MTN: {
    Daily:     [{size:'500MB',validity:'1 Day',price:'₦200',naira:200},{size:'1GB',validity:'1 Day',price:'₦350',naira:350},{size:'2GB',validity:'1 Day',price:'₦500',naira:500}],
    Weekly:    [{size:'1GB',validity:'7 Days',price:'₦500',naira:500},{size:'3GB',validity:'7 Days',price:'₦1,000',naira:1000},{size:'5GB',validity:'7 Days',price:'₦1,500',naira:1500}],
    Monthly:   [{size:'5GB',validity:'30 Days',price:'₦2,000',naira:2000},{size:'10GB',validity:'30 Days',price:'₦3,000',naira:3000},{size:'20GB',validity:'30 Days',price:'₦5,000',naira:5000},{size:'50GB',validity:'30 Days',price:'₦10,000',naira:10000}],
    SMS:       [{size:'50 SMS',validity:'1 Day',price:'₦10',naira:10},{size:'100 SMS',validity:'7 Days',price:'₦20',naira:20},{size:'250 SMS',validity:'30 Days',price:'₦50',naira:50}],
    Gift:      [{size:'1GB',validity:'7 Days',price:'₦500',naira:500},{size:'2GB',validity:'30 Days',price:'₦1,000',naira:1000},{size:'5GB',validity:'30 Days',price:'₦2,000',naira:2000}],
    Corporate: [{size:'5GB',validity:'30 Days',price:'₦1,800',naira:1800},{size:'10GB',validity:'30 Days',price:'₦2,800',naira:2800},{size:'20GB',validity:'30 Days',price:'₦4,500',naira:4500}],
    SM2:       [{size:'200MB',validity:'1 Day',price:'₦100',naira:100},{size:'500MB',validity:'7 Days',price:'₦200',naira:200},{size:'1GB',validity:'30 Days',price:'₦350',naira:350}],
  },
  Airtel: {
    Daily:     [{size:'300MB',validity:'1 Day',price:'₦200',naira:200},{size:'1GB',validity:'1 Day',price:'₦350',naira:350},{size:'2GB',validity:'1 Day',price:'₦500',naira:500}],
    Weekly:    [{size:'1GB',validity:'7 Days',price:'₦500',naira:500},{size:'3GB',validity:'7 Days',price:'₦1,000',naira:1000},{size:'6GB',validity:'7 Days',price:'₦1,500',naira:1500}],
    Monthly:   [{size:'6GB',validity:'30 Days',price:'₦2,000',naira:2000},{size:'15GB',validity:'30 Days',price:'₦3,000',naira:3000},{size:'30GB',validity:'30 Days',price:'₦5,000',naira:5000}],
    SMS:       [{size:'50 SMS',validity:'1 Day',price:'₦10',naira:10},{size:'100 SMS',validity:'7 Days',price:'₦25',naira:25},{size:'300 SMS',validity:'30 Days',price:'₦55',naira:55}],
    Gift:      [{size:'1GB',validity:'7 Days',price:'₦500',naira:500},{size:'3GB',validity:'30 Days',price:'₦1,000',naira:1000},{size:'6GB',validity:'30 Days',price:'₦2,000',naira:2000}],
    Corporate: [{size:'6GB',validity:'30 Days',price:'₦1,800',naira:1800},{size:'15GB',validity:'30 Days',price:'₦2,800',naira:2800},{size:'30GB',validity:'30 Days',price:'₦4,500',naira:4500}],
    SM2:       [{size:'200MB',validity:'1 Day',price:'₦100',naira:100},{size:'500MB',validity:'7 Days',price:'₦200',naira:200},{size:'1GB',validity:'30 Days',price:'₦400',naira:400}],
  },
  Glo: {
    Daily:     [{size:'1GB',validity:'1 Day',price:'₦300',naira:300},{size:'2GB',validity:'1 Day',price:'₦500',naira:500},{size:'3GB',validity:'1 Day',price:'₦700',naira:700}],
    Weekly:    [{size:'2GB',validity:'7 Days',price:'₦500',naira:500},{size:'5GB',validity:'7 Days',price:'₦1,000',naira:1000},{size:'10GB',validity:'7 Days',price:'₦2,000',naira:2000}],
    Monthly:   [{size:'5GB',validity:'30 Days',price:'₦1,500',naira:1500},{size:'10GB',validity:'30 Days',price:'₦2,500',naira:2500},{size:'20GB',validity:'30 Days',price:'₦4,000',naira:4000},{size:'50GB',validity:'30 Days',price:'₦8,000',naira:8000}],
    SMS:       [{size:'50 SMS',validity:'1 Day',price:'₦10',naira:10},{size:'150 SMS',validity:'7 Days',price:'₦25',naira:25},{size:'400 SMS',validity:'30 Days',price:'₦55',naira:55}],
    Gift:      [{size:'2GB',validity:'7 Days',price:'₦500',naira:500},{size:'5GB',validity:'30 Days',price:'₦1,500',naira:1500},{size:'10GB',validity:'30 Days',price:'₦2,500',naira:2500}],
    Corporate: [{size:'5GB',validity:'30 Days',price:'₦1,400',naira:1400},{size:'10GB',validity:'30 Days',price:'₦2,200',naira:2200},{size:'20GB',validity:'30 Days',price:'₦3,800',naira:3800}],
    SM2:       [{size:'200MB',validity:'1 Day',price:'₦100',naira:100},{size:'500MB',validity:'7 Days',price:'₦200',naira:200},{size:'1.5GB',validity:'30 Days',price:'₦400',naira:400}],
  },
  '9Mobile': {
    Daily:     [{size:'500MB',validity:'1 Day',price:'₦150',naira:150},{size:'1GB',validity:'1 Day',price:'₦300',naira:300},{size:'2GB',validity:'1 Day',price:'₦500',naira:500}],
    Weekly:    [{size:'1.5GB',validity:'7 Days',price:'₦500',naira:500},{size:'3GB',validity:'7 Days',price:'₦1,000',naira:1000},{size:'5GB',validity:'7 Days',price:'₦1,500',naira:1500}],
    Monthly:   [{size:'3GB',validity:'30 Days',price:'₦1,000',naira:1000},{size:'7.5GB',validity:'30 Days',price:'₦2,000',naira:2000},{size:'12GB',validity:'30 Days',price:'₦3,000',naira:3000}],
    SMS:       [{size:'50 SMS',validity:'1 Day',price:'₦10',naira:10},{size:'100 SMS',validity:'7 Days',price:'₦20',naira:20},{size:'200 SMS',validity:'30 Days',price:'₦45',naira:45}],
    Gift:      [{size:'1.5GB',validity:'7 Days',price:'₦500',naira:500},{size:'3GB',validity:'30 Days',price:'₦1,000',naira:1000},{size:'7.5GB',validity:'30 Days',price:'₦2,000',naira:2000}],
    Corporate: [{size:'3GB',validity:'30 Days',price:'₦900',naira:900},{size:'7.5GB',validity:'30 Days',price:'₦1,800',naira:1800},{size:'12GB',validity:'30 Days',price:'₦2,700',naira:2700}],
    SM2:       [{size:'150MB',validity:'1 Day',price:'₦80',naira:80},{size:'400MB',validity:'7 Days',price:'₦180',naira:180},{size:'1GB',validity:'30 Days',price:'₦350',naira:350}],
  },
};
function flatADataPlans(network: string): ADataPlan[] {
  const net = A_DATA_PLANS[network] ?? A_DATA_PLANS['MTN'];
  return A_DATA_CATEGORIES.flatMap(cat => net[cat]);
}
const A_TV_PROVIDERS = [
  { id:'dstv',      label:'DSTV',      color:'#0065BD', tc:'#fff' },
  { id:'gotv',      label:'GOTV',      color:'#E8001C', tc:'#fff' },
  { id:'startimes', label:'StarTimes', color:'#D4111E', tc:'#fff' },
];
const A_TV_BOUQUETS: Record<string,{name:string;price:string;naira:number}[]> = {
  dstv:      [{name:'Padi',price:'₦2,500',naira:2500},{name:'Yanga',price:'₦3,500',naira:3500},{name:'Confam',price:'₦6,200',naira:6200},{name:'Compact',price:'₦10,500',naira:10500},{name:'Premium',price:'₦29,500',naira:29500}],
  gotv:      [{name:'GOTV Lite',price:'₦410',naira:410},{name:'GOTV Smallie',price:'₦1,575',naira:1575},{name:'GOTV Jolli',price:'₦2,460',naira:2460},{name:'GOTV Jinja',price:'₦3,300',naira:3300},{name:'GOTV Max',price:'₦4,850',naira:4850}],
  startimes: [{name:'Nova',price:'₦1,700',naira:1700},{name:'Basic',price:'₦2,200',naira:2200},{name:'Smart',price:'₦2,800',naira:2800},{name:'Classic',price:'₦2,500',naira:2500},{name:'Super',price:'₦4,200',naira:4200}],
};
const A_AIRTIME_QUICK = ['₦50','₦100','₦200','₦500','₦1,000'];
const A_BANKS = ['Access Bank','GTBank','First Bank','Zenith Bank','UBA','Fidelity Bank','Sterling Bank','Kuda Bank','OPay','PalmPay'];
const A_EDUCATION_BODIES = [
  { id:'waec',   label:'WAEC',   sub:'West African Examinations Council',      color:'#003087', tc:'#fff' },
  { id:'jamb',   label:'JAMB',   sub:'Joint Admissions & Matriculation Board', color:'#2E7D32', tc:'#fff' },
  { id:'neco',   label:'NECO',   sub:'National Examinations Council',          color:'#B71C1C', tc:'#fff' },
  { id:'nabteb', label:'NABTEB', sub:'National Business & Technical Exams',    color:'#E65100', tc:'#fff' },
];
const A_RECENT_TXS = [
  { id:'1', title:'Airtime Top-up',    sub:'MTN  0812 345 6789', amt:'-₦500',   date:'Today, 10:42 AM',      icon:'phone-portrait-outline' as const },
  { id:'2', title:'Electricity Bill',  sub:'AEDC  0905 783 9231',amt:'-₦5,000', date:'Today, 08:15 AM',      icon:'flash-outline'           as const },
  { id:'3', title:'Data Bundle',       sub:'Glo  0812 345 6789', amt:'-₦1,000', date:'Yesterday, 03:30 PM',  icon:'wifi-outline'            as const },
  { id:'4', title:'DSTV Subscription', sub:'SmartCard: 9012345', amt:'-₦10,500',date:'Jan 28, 2026',          icon:'tv-outline'              as const },
];

function aTxRef() { return Math.floor(Math.random()*9e15).toString().slice(0,16); }
function aNow() {
  const n = new Date();
  return n.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
    + '  ' + n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

// ─── A: Sub-screen components ─────────────────────────────────────────────────
type AColors = ReturnType<typeof useColors>;

function AHeader({ title, onBack, colors }: { title:string; onBack:()=>void; colors:AColors }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'center',
      paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingHorizontal:20, paddingBottom:16,
      backgroundColor:colors.card, borderBottomWidth:1, borderBottomColor:colors.border }}>
      <Pressable onPress={onBack} style={{ position:'absolute', left:20 }} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </Pressable>
      <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:17, color:colors.grayBlack }}>{title}</Text>
    </View>
  );
}

function ATelecomPickerScreen({ service, colors, onBack, onSelect }: {
  service:string; colors:AColors; onBack:()=>void; onSelect:(network:string)=>void;
}) {
  const networks = service==='Electricity' ? A_DISCOS.map(d=>({id:d,label:d,color:'#1e3a8a',tc:'#fff'})) : A_TELECOMS;
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <AHeader title={`Select Network — ${service}`} onBack={onBack} colors={colors} />
      <ScrollView contentContainerStyle={{ padding:20 }}>
        {networks.map(n => (
          <Pressable key={n.id} onPress={() => onSelect(n.label)}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
              borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:colors.border,
              opacity:pressed?0.8:1 }]}>
            <View style={{ width:44, height:44, borderRadius:22, backgroundColor:n.color,
              alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:10, color:n.tc }}>{n.label.slice(0,4)}</Text>
            </View>
            <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{n.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.grayGray1} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function AServiceFormScreen({ service, network, colors, onBack, onProceed }: {
  service:string; network:string; colors:AColors;
  onBack:()=>void;
  onProceed:(data:{phone:string;amount:string;plan?:string;meterType?:string})=>void;
}) {
  const [phone,        setPhone]        = useState('');
  const [amount,       setAmount]       = useState('');
  const [plan,         setPlan]         = useState<string|null>(null);
  const [planCategory, setPlanCategory] = useState<ADataCategory>('Daily');
  const [meterType,    setMeterType]    = useState<'Prepaid'|'Postpaid'>('Prepaid');
  const isAirtime = service==='Airtime', isData=service==='Data', isElec=service==='Electricity';
  const networkPlans = A_DATA_PLANS[network] ?? A_DATA_PLANS['MTN'];
  const plans = networkPlans[planCategory];
  const canGo = isData ? phone.length>=11&&!!plan : phone.length>=(isElec?11:11)&&amount.length>0;
  const inp:object = { backgroundColor:colors.background, borderRadius:12, height:50, paddingHorizontal:14,
    fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border };
  return (
    <KeyboardAwareScrollViewCompat style={{ flex:1, backgroundColor:colors.background }}>
      <AHeader title={`${network} ${service}`} onBack={onBack} colors={colors} />
      <View style={{ padding:20, gap:16 }}>
        <View>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>
            {isElec?'Meter Number':'Phone Number'}
          </Text>
          <TextInput value={phone} onChangeText={setPhone}
            placeholder={isElec?'Enter meter number':'080 XXXX XXXX'}
            placeholderTextColor={colors.grayGray1} keyboardType={isElec?'numeric':'phone-pad'}
            maxLength={isElec?13:11} style={inp} />
        </View>
        {isAirtime && (
          <View>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Amount</Text>
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:10 }}>
              {A_AIRTIME_QUICK.map(q => {
                const raw=q.replace('₦','').replace(',',''); const active=amount===raw;
                return (
                  <Pressable key={q} onPress={() => setAmount(raw)}
                    style={({ pressed }) => [{ paddingHorizontal:14, paddingVertical:9, borderRadius:20,
                      backgroundColor:active?colors.primary:colors.card, borderWidth:1, borderColor:colors.primary,
                      opacity:pressed?0.75:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:active?colors.primaryForeground:colors.primary }}>{q}</Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput value={amount} onChangeText={t=>setAmount(t.replace(/\D/g,''))}
              placeholder="Or enter custom amount (₦)" placeholderTextColor={colors.grayGray1}
              keyboardType="numeric" style={inp} />
          </View>
        )}
        {isData && (
          <View>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:10 }}>Select Plan</Text>
            {/* Category tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={{ marginBottom:12 }} contentContainerStyle={{ gap:8, paddingRight:4 }}>
              {A_DATA_CATEGORIES.map(cat => {
                const active = planCategory === cat;
                return (
                  <Pressable key={cat} onPress={() => { Haptics.selectionAsync(); setPlanCategory(cat); setPlan(null); }}
                    style={({ pressed }) => [{ paddingHorizontal:14, paddingVertical:7, borderRadius:20,
                      backgroundColor:active?colors.primary:colors.card,
                      borderWidth:1, borderColor:active?colors.primary:colors.border,
                      opacity:pressed?0.75:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:12,
                      color:active?colors.primaryForeground:colors.grayGray1 }}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {/* 3-column grid */}
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8 }}>
              {plans.map(p => {
                const key=`${p.size}/${p.validity}`, active=plan===key;
                return (
                  <Pressable key={key} onPress={() => setPlan(key)}
                    style={({ pressed }) => [{ width:'31%', borderRadius:12, padding:10, alignItems:'center',
                      backgroundColor:active?colors.primary:colors.card,
                      borderWidth:1, borderColor:active?colors.primary:colors.border,
                      opacity:pressed?0.8:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, textAlign:'center',
                      color:active?colors.primaryForeground:colors.grayBlack }}>{p.size}</Text>
                    <Text style={{ fontFamily:colors.fontBody, fontSize:10, marginTop:2, textAlign:'center',
                      color:active?colors.primaryForeground+'cc':colors.grayGray1 }}>{p.validity}</Text>
                    <View style={{ marginTop:6, paddingHorizontal:8, paddingVertical:3, borderRadius:8,
                      backgroundColor:active?'rgba(255,255,255,0.22)':colors.brandPrimaryLight }}>
                      <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:11,
                        color:active?colors.primaryForeground:colors.primary }}>{p.price}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
        {isElec && (
          <>
            <View>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Amount (₦)</Text>
              <TextInput value={amount} onChangeText={t=>setAmount(t.replace(/\D/g,''))}
                placeholder="Enter amount" placeholderTextColor={colors.grayGray1} keyboardType="numeric" style={inp} />
            </View>
            <View>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Meter Type</Text>
              <View style={{ flexDirection:'row', gap:12 }}>
                {(['Prepaid','Postpaid'] as const).map(mt => (
                  <Pressable key={mt} onPress={() => setMeterType(mt)}
                    style={[{ flex:1, paddingVertical:13, borderRadius:12, alignItems:'center',
                      backgroundColor:meterType===mt?colors.primary:colors.card,
                      borderWidth:1, borderColor:colors.primary }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14,
                      color:meterType===mt?colors.primaryForeground:colors.primary }}>{mt}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}
        <Pressable onPress={() => { if(canGo) onProceed({phone,amount,plan:plan??undefined,meterType}); }}
          style={({ pressed }) => [{ backgroundColor:canGo?colors.primary:colors.grayGray4,
            borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center',
            opacity:pressed?0.82:1 }]}>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Proceed</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function ATVPickerScreen({ colors, onBack, onSelect }: {
  colors:AColors; onBack:()=>void; onSelect:(id:string,label:string)=>void;
}) {
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <AHeader title="Cable TV Subscription" onBack={onBack} colors={colors} />
      <ScrollView contentContainerStyle={{ padding:20 }}>
        {A_TV_PROVIDERS.map(p => (
          <Pressable key={p.id} onPress={() => onSelect(p.id, p.label)}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
              borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:colors.border,
              opacity:pressed?0.8:1 }]}>
            <View style={{ width:44, height:44, borderRadius:22, backgroundColor:p.color,
              alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:10, color:p.tc }}>{p.label.slice(0,4)}</Text>
            </View>
            <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{p.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.grayGray1} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function ATVFormScreen({ providerId, providerLabel, colors, onBack, onProceed }: {
  providerId:string; providerLabel:string; colors:AColors;
  onBack:()=>void; onProceed:(sc:string,bq:string,px:string)=>void;
}) {
  const [smartCard,  setSmartCard] = useState('');
  const [bouquet,    setBouquet]   = useState<string|null>(null);
  const [bouquetPx,  setBouquetPx] = useState('');
  const plans = A_TV_BOUQUETS[providerId] ?? A_TV_BOUQUETS['gotv'];
  const inp:object = { backgroundColor:colors.background, borderRadius:12, height:50, paddingHorizontal:14,
    fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border };
  return (
    <KeyboardAwareScrollViewCompat style={{ flex:1, backgroundColor:colors.background }}>
      <AHeader title={`${providerLabel} Subscription`} onBack={onBack} colors={colors} />
      <View style={{ padding:20, gap:16 }}>
        <View>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Smart Card / IUC Number</Text>
          <TextInput value={smartCard} onChangeText={setSmartCard} placeholder="Enter smart card number"
            placeholderTextColor={colors.grayGray1} keyboardType="numeric" maxLength={12} style={inp} />
        </View>
        <View>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Select Bouquet</Text>
          {plans.map(p => {
            const active=bouquet===p.name;
            return (
              <Pressable key={p.name} onPress={() => { setBouquet(p.name); setBouquetPx(p.price); }}
                style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                  backgroundColor:active?colors.brandPrimaryLight:colors.card, borderRadius:12, padding:14, marginBottom:8,
                  borderWidth:active?1.5:1, borderColor:active?colors.primary:colors.border, opacity:pressed?0.8:1 }]}>
                <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{p.name}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.primary }}>{p.price}</Text>
                  {active && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => { if(smartCard.length>=6&&bouquet) onProceed(smartCard,bouquet,bouquetPx); }}
          style={({ pressed }) => [{ backgroundColor:(smartCard.length>=6&&bouquet)?colors.primary:colors.grayGray4,
            borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Proceed</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

function ASendToDRCSScreen({ colors, onBack, onProceed }: {
  colors:AColors; onBack:()=>void;
  onProceed:(p:{username:string;amount:string;note:string})=>void;
}) {
  const ins = useSafeAreaInsets();
  const [username,setUsername]=useState('');
  const [amount,  setAmount]  =useState('');
  const [note,    setNote]    =useState('');
  const inp:object = { backgroundColor:colors.background, borderRadius:12, height:50, paddingHorizontal:14,
    fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Send to DRCS User</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:8, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:20, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          {[
            {label:'DRCS Username',ph:'Enter username or phone',val:username,set:setUsername,kb:'default'  as const},
            {label:'Amount (₦)',  ph:'Enter amount',           val:amount,  set:(t:string)=>setAmount(t.replace(/\D/g,'')),kb:'numeric' as const},
            {label:'Note (optional)',ph:'What is this for?',  val:note,    set:setNote,    kb:'default'  as const},
          ].map(f => (
            <View key={f.label} style={{ marginBottom:16 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>{f.label}</Text>
              <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph}
                placeholderTextColor={colors.grayGray1} keyboardType={f.kb} style={inp} />
            </View>
          ))}
          <Pressable onPress={() => { if(username.length>=3&&amount) onProceed({username,amount,note}); }}
            style={({ pressed }) => [{ backgroundColor:(username.length>=3&&amount)?colors.primary:colors.grayGray4,
              borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Proceed</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ASendToBankScreen({ colors, onBack, onProceed }: {
  colors:AColors; onBack:()=>void;
  onProceed:(p:{accountNo:string;bankName:string;accountName:string;amount:string})=>void;
}) {
  const ins = useSafeAreaInsets();
  const [accountNo,  setAccountNo]  = useState('');
  const [bankName,   setBankName]   = useState('');
  const [amount,     setAmount]     = useState('');
  const [showBanks,  setShowBanks]  = useState(false);
  const accountName = 'John Doe'; // simulated lookup
  const canGo = accountNo.length===10 && bankName && amount.length>0;
  const inp:object = { backgroundColor:colors.background, borderRadius:12, height:50, paddingHorizontal:14,
    fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Send to Bank</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:8, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:20, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          <View style={{ marginBottom:16 }}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Account Number</Text>
            <TextInput value={accountNo} onChangeText={t=>setAccountNo(t.replace(/\D/g,'').slice(0,10))}
              placeholder="10-digit account number" placeholderTextColor={colors.grayGray1} keyboardType="numeric" style={inp} />
          </View>
          <View style={{ marginBottom:16 }}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Bank</Text>
            <Pressable onPress={() => setShowBanks(s=>!s)}
              style={[inp, { justifyContent:'center' }]}>
              <Text style={{ fontFamily:colors.fontBody, fontSize:15, color:bankName?colors.grayBlack:colors.grayGray1 }}>
                {bankName||'Select bank'}
              </Text>
            </Pressable>
            {showBanks && (
              <View style={{ backgroundColor:colors.card, borderRadius:12, borderWidth:1, borderColor:colors.border, maxHeight:180, overflow:'hidden', marginTop:4 }}>
                <ScrollView nestedScrollEnabled>
                  {A_BANKS.map(b => (
                    <Pressable key={b} onPress={() => { setBankName(b); setShowBanks(false); }}
                      style={({ pressed }) => [{ paddingHorizontal:14, paddingVertical:12,
                        borderBottomWidth:1, borderBottomColor:colors.border, opacity:pressed?0.7:1,
                        backgroundColor:b===bankName?colors.brandPrimaryLight:colors.card }]}>
                      <Text style={{ fontFamily:b===bankName?colors.fontBodySemiBold:colors.fontBody,
                        fontSize:14, color:colors.grayBlack }}>{b}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          {accountNo.length===10 && bankName ? (
            <View style={{ backgroundColor:colors.successLight, borderRadius:12, padding:12, marginBottom:16 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.success }}>{accountName}</Text>
            </View>
          ) : null}
          <View style={{ marginBottom:16 }}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>Amount (₦)</Text>
            <TextInput value={amount} onChangeText={t=>setAmount(t.replace(/\D/g,''))}
              placeholder="Enter amount" placeholderTextColor={colors.grayGray1} keyboardType="numeric" style={inp} />
          </View>
          <Pressable onPress={() => { if(canGo) onProceed({accountNo,bankName,accountName,amount}); }}
            style={({ pressed }) => [{ backgroundColor:canGo?colors.primary:colors.grayGray4,
              borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Proceed</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AAddMoneyScreen({ colors, onBack }: { colors:AColors; onBack:()=>void }) {
  const ins = useSafeAreaInsets();
  const ACCOUNT = { bank:'DRCS Microfinance Bank', name:'DRCS User', number:'1234567890' };
  const [copied, setCopied] = useState(false);
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Deposit</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }}>
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:20, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1, textAlign:'center', marginBottom:20 }}>
            Transfer to the account below to fund your wallet
          </Text>
          {[{label:'Bank Name',value:ACCOUNT.bank},{label:'Account Name',value:ACCOUNT.name},{label:'Account No.',value:ACCOUNT.number}].map((r,i,arr) => (
            <View key={r.label}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:13 }}>
                <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1 }}>{r.label}</Text>
                <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:colors.grayBlack }}>{r.value}</Text>
              </View>
              {i<arr.length-1 && <View style={{ height:1, backgroundColor:colors.border }} />}
            </View>
          ))}
          <View style={{ height:16 }} />
          <Pressable onPress={() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }}
            style={({ pressed }) => [{ backgroundColor:copied?colors.successLight:colors.primary,
              borderRadius:26, minHeight:50, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:copied?colors.success:colors.primaryForeground }}>
              {copied?'Copied!':'Copy Account Number'}
            </Text>
          </Pressable>
          <View style={{ height:10 }} />
          <Pressable onPress={onBack}
            style={({ pressed }) => [{ borderWidth:1.5, borderColor:colors.primary,
              borderRadius:26, minHeight:50, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.primary }}>Done</Text>
          </Pressable>
        </View>
        <View style={{ backgroundColor:colors.brandPrimaryLight, borderRadius:14, padding:16, marginTop:16 }}>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.primary, marginBottom:4 }}>Note</Text>
          <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:colors.grayBlack, lineHeight:20 }}>
            Your wallet will be credited within minutes after transfer. Use your registered phone number as payment reference.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function APinModal({ colors, onClose, onSubmit }: { colors:AColors; onClose:()=>void; onSubmit:()=>void }) {
  const [pin, setPin] = useState('');
  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const press = (k:string) => {
    if (k==='⌫') { setPin(p=>p.slice(0,-1)); return; }
    if (k==='' || pin.length>=4) return;
    const next = pin+k;
    setPin(next);
    if (next.length===4) setTimeout(onSubmit, 180);
  };
  return (
    <View style={{ flex:1, backgroundColor:colors.background, alignItems:'center', justifyContent:'center', padding:32 }}>
      <Pressable onPress={onClose} style={{ position:'absolute', top:60, left:20 }} hitSlop={12}>
        <Ionicons name="close" size={26} color={colors.grayBlack} />
      </Pressable>
      <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:22, color:colors.grayBlack, marginBottom:8 }}>Enter PIN</Text>
      <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1, marginBottom:32 }}>Confirm your transaction with your 4-digit PIN</Text>
      <View style={{ flexDirection:'row', gap:16, marginBottom:40 }}>
        {[0,1,2,3].map(i => (
          <View key={i} style={{ width:18, height:18, borderRadius:9,
            backgroundColor:i<pin.length?colors.primary:colors.grayGray4 }} />
        ))}
      </View>
      <View style={{ width:'100%', flexDirection:'row', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
        {KEYS.map((k,i) => (
          <Pressable key={i} onPress={() => press(k)}
            style={({ pressed }) => [{ width:72, height:72, borderRadius:36,
              backgroundColor:k===''?'transparent':pressed?colors.brandPrimaryLight:colors.card,
              borderWidth:k===''?0:1, borderColor:colors.border,
              alignItems:'center', justifyContent:'center' }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:22, color:colors.grayBlack }}>{k}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Receipt share helpers ────────────────────────────────────────────────────
function makeReceiptHTML(title:string, amount:string, status:string, rows:{label:string;value:string}[]):string {
  const sc = status==='success'?'#22c55e':'#ef4444';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,Arial,sans-serif;background:#f0f4ff;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}.card{background:#fff;border-radius:20px;max-width:420px;width:100%;padding:32px;box-shadow:0 4px 24px rgba(0,0,0,.1)}.top{text-align:center;padding-bottom:24px;border-bottom:1px solid #eee}.badge{width:64px;height:64px;border-radius:50%;background:${sc};color:#fff;font-size:32px;line-height:64px;margin:0 auto 12px;text-align:center}.amount{font-size:30px;font-weight:700;color:#012d80;margin:8px 0 4px}.title{color:#666;font-size:15px}.rows{padding:8px 0}.row{display:flex;justify-content:space-between;align-items:flex-start;padding:12px 0;border-bottom:1px solid #f3f3f3}.row:last-child{border-bottom:none}.lbl{color:#888;font-size:13px}.val{color:#111;font-size:13px;font-weight:600;text-align:right;max-width:55%;margin-left:12px}.footer{text-align:center;margin-top:20px;font-size:11px;color:#bbb}</style>
</head><body><div class="card"><div class="top"><div class="badge">${status==='success'?'✓':'✗'}</div><div class="amount">${amount}</div><div class="title">${title}</div></div><div class="rows">${rows.map(r=>`<div class="row"><span class="lbl">${r.label}</span><span class="val">${r.value}</span></div>`).join('')}</div><div class="footer">DRCS DATA — Official Transaction Receipt</div></div></body></html>`;
}
function buildReceiptCanvasHTML(title:string, amount:string, status:string, rows:{label:string;value:string}[]):string {
  const payload = JSON.stringify({title,amount,status,rows}).replace(/<\/script>/gi,'<\\/script>');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="margin:0;padding:0;background:#fff"><canvas id="c"></canvas><script>(function(){var d=${payload};var rows=d.rows,title=d.title,amount=d.amount,ok=d.status==='success';var W=800,rowH=62,H=310+rows.length*rowH+64;var c=document.getElementById('c');c.width=W;c.height=H;var ctx=c.getContext('2d');ctx.fillStyle='#012d80';ctx.fillRect(0,0,W,248);ctx.fillStyle='#eef2ff';ctx.fillRect(0,248,W,H-248);ctx.beginPath();ctx.arc(W/2,76,38,0,Math.PI*2);ctx.fillStyle=ok?'#22c55e':'#ef4444';ctx.fill();ctx.font='bold 38px Arial';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ok?'\u2713':'\u2717',W/2,76);ctx.textBaseline='alphabetic';ctx.font='bold 44px Arial';ctx.fillStyle='#fff';ctx.fillText(amount,W/2,160);ctx.font='21px Arial';ctx.fillStyle='rgba(255,255,255,0.82)';ctx.fillText(ok?'Transaction Successful':'Transaction Failed',W/2,202);ctx.save();ctx.shadowColor='rgba(0,0,0,0.09)';ctx.shadowBlur=28;ctx.shadowOffsetY=4;rr(ctx,40,222,W-80,H-262,24);ctx.fillStyle='#fff';ctx.fill();ctx.restore();ctx.font='bold 26px Arial';ctx.fillStyle='#1a1a2e';ctx.textAlign='center';ctx.fillText('Transaction Details',W/2,274);ctx.strokeStyle='#eee';ctx.lineWidth=1;ln(ctx,80,292,W-80,292);rows.forEach(function(row,i){var y=336+i*rowH;ctx.font='19px Arial';ctx.fillStyle='#8a8fa8';ctx.textAlign='left';ctx.fillText(row.label,80,y);ctx.font='bold 19px Arial';ctx.fillStyle='#1a1a2e';ctx.textAlign='right';var v=row.value.length>28?row.value.slice(0,28)+'\u2026':row.value;ctx.fillText(v,W-80,y);if(i<rows.length-1){ctx.strokeStyle='#f0f0f0';ctx.lineWidth=1;ln(ctx,80,y+22,W-80,y+22);}});ctx.font='16px Arial';ctx.fillStyle='#aab0c8';ctx.textAlign='center';ctx.fillText('DRCS DATA \u2014 Official Transaction Receipt',W/2,H-36);window.ReactNativeWebView.postMessage(c.toDataURL('image/jpeg',0.93));function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}function ln(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}})();<\/script></body></html>`;
}

function AReceiptScreen({ data, colors, onClose, onRetry }: {
  data:AReceiptData; colors:AColors; onClose:()=>void; onRetry:()=>void;
}) {
  const ins = useSafeAreaInsets();
  const ok = data.status==='success';
  const [busy, setBusy] = useState(false);
  const [imgHTML, setImgHTML] = useState<string|null>(null);
  const [imgBusy, setImgBusy] = useState(false);

  const handleSharePDF = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const html = makeReceiptHTML(data.title, data.amount, data.status, data.rows);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle:'Share Receipt' });
    } catch {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    } finally { setBusy(false); }
  };

  const handleShareImage = () => {
    if (imgBusy) return;
    setImgBusy(true);
    setImgHTML(buildReceiptCanvasHTML(data.title, data.amount, data.status, data.rows));
  };

  const onWebViewMsg = async (event:{nativeEvent:{data:string}}) => {
    const b64 = event.nativeEvent.data.replace(/^data:image\/jpeg;base64,/,'');
    setImgHTML(null); setImgBusy(false);
    try {
      const uri = (cacheDirectory ?? '') + 'drcs_receipt.jpg';
      await writeAsStringAsync(uri, b64, { encoding: 'base64' });
      await Sharing.shareAsync(uri, { mimeType:'image/jpeg', dialogTitle:'Share Receipt Image' });
    } catch { Alert.alert('Error','Could not share image. Please try again.'); }
  };

  return (
    <View style={{ flex:1, backgroundColor:colors.primary }}>
      <View style={{ alignItems:'center', paddingTop:ins.top+(Platform.OS==='web'?67:52), paddingBottom:32 }}>
        <View style={{ width:64, height:64, borderRadius:32,
          backgroundColor:ok?colors.success:'#ef4444',
          alignItems:'center', justifyContent:'center', marginBottom:14 }}>
          <Ionicons name={ok?'checkmark':'close'} size={34} color={colors.primaryForeground} />
        </View>
        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:colors.primaryForeground, marginBottom:8 }}>
          {ok?'Transaction Successful':'Transaction Failed'}
        </Text>
        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:34, color:colors.primaryForeground }}>{data.amount}</Text>
      </View>
      <View style={{ flex:1, backgroundColor:colors.card, borderTopLeftRadius:28, borderTopRightRadius:28,
        paddingHorizontal:24, paddingTop:24 }}>
        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:colors.grayBlack, textAlign:'center', marginBottom:20 }}>
          Transaction Details
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {data.rows.map((r,i) => (
            <View key={i}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:12 }}>
                <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1 }}>{r.label}</Text>
                <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:colors.grayBlack, maxWidth:'58%', textAlign:'right' }}>{r.value}</Text>
              </View>
              {i<data.rows.length-1 && <View style={{ height:1, backgroundColor:colors.border }} />}
            </View>
          ))}
        </ScrollView>
        <View style={{ gap:10, paddingTop:16, paddingBottom:Math.max(ins.bottom,12) }}>
          {ok ? (
            <>
              <View style={{ flexDirection:'row', gap:12 }}>
                <Pressable onPress={handleShareImage} disabled={imgBusy}
                  style={({ pressed }) => [{ flex:1, flexDirection:'row', gap:5,
                    borderWidth:1.5, borderColor:colors.primary, borderRadius:26, paddingVertical:13,
                    alignItems:'center', justifyContent:'center', opacity:(pressed||imgBusy)?0.55:1 }]}>
                  <Ionicons name="image-outline" size={15} color={colors.primary} />
                  <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:12, color:colors.primary }}>{imgBusy?'Generating…':'Share as Image'}</Text>
                </Pressable>
                <Pressable onPress={handleSharePDF} disabled={busy}
                  style={({ pressed }) => [{ flex:1, flexDirection:'row', gap:5,
                    borderWidth:1.5, borderColor:colors.primary, borderRadius:26, paddingVertical:13,
                    alignItems:'center', justifyContent:'center', opacity:(pressed||busy)?0.55:1 }]}>
                  <Ionicons name="document-outline" size={15} color={colors.primary} />
                  <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:12, color:colors.primary }}>{busy?'Generating…':'Share as PDF'}</Text>
                </Pressable>
              </View>
              <Pressable onPress={onClose} style={({ pressed }) => [{ backgroundColor:colors.primary,
                borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
                <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Complete / Exit</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={onRetry} style={({ pressed }) => [{ backgroundColor:colors.primary,
              borderRadius:26, minHeight:52, alignItems:'center', justifyContent:'center', opacity:pressed?0.82:1 }]}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Try Again</Text>
            </Pressable>
          )}
        </View>
      </View>
      {imgHTML ? (
        <View style={{ position:'absolute', top:-2000, left:-2000, width:400, height:600 }}>
          <WebView source={{ html:imgHTML }} onMessage={onWebViewMsg} javaScriptEnabled />
        </View>
      ) : null}
    </View>
  );
}

function ATransferPickerScreen({ colors, onBack, onToDRCS, onToBank }: {
  colors:AColors; onBack:()=>void; onToDRCS:()=>void; onToBank:()=>void;
}) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Transfer Money</Text>
        </View>
      </View>
      <View style={{ margin:18, marginTop:8, backgroundColor:colors.card, borderRadius:24, padding:16,
        borderWidth:1, borderColor:colors.border, gap:8 }}>
        {[
          { label:'To DRCS User', icon:'person-outline' as const, sub:'Send to any DRCS account', fn:onToDRCS },
          { label:'To Bank',      icon:'business-outline' as const, sub:'Send to any Nigerian bank', fn:onToBank },
        ].map(o => (
          <Pressable key={o.label} onPress={o.fn}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
              borderRadius:16, padding:18, borderWidth:1, borderColor:colors.border, opacity:pressed?0.8:1 }]}>
            <View style={{ width:44, height:44, borderRadius:22, backgroundColor:colors.brandPrimaryLight,
              alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Ionicons name={o.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{o.label}</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:12, color:colors.grayGray1, marginTop:2 }}>{o.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grayGray1} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function AEducationPickerScreen({ colors, onBack, onSelect }: {
  colors: AColors; onBack: () => void;
  onSelect: (id: string, label: string) => void;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AHeader title="Select Exam Body" onBack={onBack} colors={colors} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {A_EDUCATION_BODIES.map(b => (
          <Pressable key={b.id} onPress={() => onSelect(b.id, b.label)}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
              borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:colors.border,
              opacity:pressed?0.8:1 }]}>
            <View style={{ width:44, height:44, borderRadius:12, backgroundColor:b.color,
              alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:10, color:b.tc }}>{b.label}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{b.label}</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:12, color:colors.grayGray1, marginTop:2 }}>{b.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grayGray1} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function AEducationFormScreen({ bodyId, bodyLabel, colors, onBack, onProceed }: {
  bodyId: string; bodyLabel: string; colors: AColors;
  onBack: () => void;
  onProceed: (regNo: string, examYear: string, amount: string) => void;
}) {
  const [regNo,    setRegNo]    = useState('');
  const [examYear, setExamYear] = useState('2025');
  const [amount,   setAmount]   = useState('');
  const bodyMeta   = A_EDUCATION_BODIES.find(b => b.id === bodyId);
  const canProceed = regNo.trim().length >= 6 && examYear.length === 4 && amount.length > 0;
  const YEARS      = ['2023','2024','2025','2026'];
  const inputSt    = {
    fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1,
    borderColor:colors.border, borderRadius:12, paddingHorizontal:14, paddingVertical:12,
    backgroundColor:colors.card,
  };
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <AHeader title={`${bodyLabel} Payment`} onBack={onBack} colors={colors} />
      <ScrollView contentContainerStyle={{ padding:20 }} keyboardShouldPersistTaps="handled">
        {/* Body badge */}
        <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
          borderRadius:16, padding:16, borderWidth:1, borderColor:colors.border, marginBottom:20 }}>
          <View style={{ width:44, height:44, borderRadius:12, backgroundColor:bodyMeta?.color??'#003087',
            alignItems:'center', justifyContent:'center', marginRight:14 }}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:10, color:bodyMeta?.tc??'#fff' }}>{bodyLabel}</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{bodyLabel}</Text>
            <Text style={{ fontFamily:colors.fontBody, fontSize:12, color:colors.grayGray1, marginTop:2 }}>
              {bodyMeta?.sub ?? ''}
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>
          Registration / Candidate Number
        </Text>
        <TextInput value={regNo} onChangeText={setRegNo}
          placeholder="Enter reg / candidate number" placeholderTextColor={colors.grayGray1}
          autoCapitalize="characters" maxLength={20} style={[inputSt, { marginBottom:18 }]} />

        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>
          Exam Year
        </Text>
        <View style={{ flexDirection:'row', gap:10, marginBottom:18 }}>
          {YEARS.map(y => (
            <Pressable key={y} onPress={() => setExamYear(y)}
              style={({ pressed }) => [{
                flex:1, paddingVertical:12, borderRadius:12, alignItems:'center',
                backgroundColor: examYear===y ? colors.primary : colors.card,
                borderWidth:1, borderColor: examYear===y ? colors.primary : colors.border,
                opacity: pressed?0.8:1,
              }]}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14,
                color: examYear===y ? colors.primaryForeground : colors.grayBlack }}>{y}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayGray1, marginBottom:8 }}>
          Amount (₦)
        </Text>
        <TextInput value={amount} onChangeText={t => setAmount(t.replace(/\D/g,''))}
          placeholder="Enter amount" placeholderTextColor={colors.grayGray1}
          keyboardType="numeric" style={[inputSt, { marginBottom:24 }]} />

        <Pressable onPress={() => onProceed(regNo.trim(), examYear, amount)} disabled={!canProceed}
          style={({ pressed }) => [{ backgroundColor: canProceed ? colors.primary : colors.grayGray4,
            borderRadius:14, paddingVertical:15, alignItems:'center', opacity:pressed?0.85:1 }]}>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16,
            color:colors.primaryForeground }}>Proceed</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── A: Profile sub-screens ───────────────────────────────────────────────────
function AProfileSettingsScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName:'John', middleName:'-', lastName:'Doe', email:'johndoe239@gmail.com', dob:'20/09/2001' });
  const fields = [
    { key:'firstName' as const, label:'First Name' },
    { key:'middleName' as const, label:'Middle Name' },
    { key:'lastName' as const, label:'Last Name' },
    { key:'email' as const, label:'Email Address' },
    { key:'dob' as const, label:'Date of Birth' },
  ];
  const inputSt = { fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border, borderRadius:14, paddingHorizontal:16, paddingVertical:13, backgroundColor:colors.card };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8, flex:1 }}>Profile Settings</Text>
          <Pressable onPress={() => setEditing(e => !e)}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:'rgba(255,255,255,0.85)' }}>{editing?'Done':'Edit'}</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:18, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          <View style={{ alignItems:'center', marginBottom:24, paddingTop:8 }}>
            <View style={{ position:'relative' }}>
              <Image source={require('../assets/images/design-b/avatar.png')} style={{ width:96, height:96, borderRadius:48 }} />
              <Pressable onPress={() => Alert.alert('Change Photo','Photo picker would open here.')}
                style={{ position:'absolute', bottom:0, right:0, width:32, height:32, borderRadius:16, backgroundColor:colors.card, borderWidth:1.5, borderColor:colors.primary, alignItems:'center', justifyContent:'center' }}>
                <Ionicons name="camera-outline" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>
          {fields.map(f => (
            <View key={f.key} style={{ marginBottom:16 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayBlack, marginBottom:8 }}>{f.label}</Text>
              {editing
                ? <TextInput value={form[f.key]} onChangeText={v => setForm(p=>({...p,[f.key]:v}))} style={inputSt} />
                : <View style={{ backgroundColor:colors.card, borderRadius:14, minHeight:50, justifyContent:'center', paddingHorizontal:16, borderWidth:1, borderColor:colors.border }}>
                    <Text style={{ fontFamily:colors.fontBody, fontSize:15, color:colors.grayGray1 }}>{form[f.key]}</Text>
                  </View>
              }
            </View>
          ))}
          {editing && (
            <Pressable onPress={() => setEditing(false)} style={({ pressed }) => [{ backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, opacity:pressed?0.85:1 }]}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Save</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ASecurityScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [fp, setFp] = useState(true);
  const [sub, setSub] = useState<'main'|'changePassword'|'twoFA'>('main');
  if (sub === 'changePassword') return <AChangePasswordScreen colors={colors} insets={insets} onBack={() => setSub('main')} />;
  if (sub === 'twoFA')          return <ATwoFAScreen          colors={colors} insets={insets} onBack={() => setSub('main')} />;
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Security</Text>
        </View>
      </View>
      <View style={{ margin:18, marginTop:8, backgroundColor:colors.card, borderRadius:24, padding:12,
        borderWidth:1, borderColor:colors.border }}>
        {([
          { icon:'lock-closed-outline' as const, label:'Change Password', sub:'changePassword' as const },
          { icon:'shield-checkmark-outline' as const, label:'2FA Authentication', sub:'twoFA' as const },
        ]).map(item => (
          <Pressable key={item.label} onPress={() => setSub(item.sub)}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', borderRadius:16, padding:16, marginBottom:4, opacity:pressed?0.8:1 }]}>
            <View style={{ width:38, height:38, borderRadius:12, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Ionicons name={item.icon} size={19} color={colors.primary} />
            </View>
            <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.grayGray1} />
          </Pressable>
        ))}
        <Pressable style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', borderRadius:16, padding:16, opacity:pressed?0.8:1 }]}
          onPress={() => setFp(f => !f)}>
          <View style={{ width:38, height:38, borderRadius:12, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginRight:14 }}>
            <Ionicons name="finger-print-outline" size={19} color={colors.primary} />
          </View>
          <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>Enable Fingerprint</Text>
          <Switch value={fp} onValueChange={setFp} trackColor={{ true: colors.primary }} thumbColor="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

function AAccountDetailsScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [sub,  setSub]  = useState<'main'|'bvn'|'nin'|'face'>('main');
  const [val,  setVal]  = useState('');
  const [done, setDone] = useState(false);
  const inputSt = { fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border, borderRadius:14, paddingHorizontal:16, paddingVertical:13, backgroundColor:colors.card };
  if (sub !== 'main') {
    const labels = { bvn:'BVN Verification', nin:'NIN Verification', face:'Face Verification' };
    const isFace = sub === 'face';
    return (
      <View style={{ flex:1, backgroundColor:colors.background }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
        <View style={{ backgroundColor:colors.brandPrimaryDark,
          paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
          <Image source={require('../assets/images/design-b/logo-hex.png')}
            style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
            resizeMode="contain" />
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <Pressable onPress={() => { setSub('main'); setDone(false); setVal(''); }} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>{labels[sub]}</Text>
          </View>
        </View>
        {isFace
          ? <View style={{ flex:1, margin:18, marginTop:8, backgroundColor:colors.card, borderRadius:24,
              borderWidth:1, borderColor:colors.border, alignItems:'center', justifyContent:'center', paddingHorizontal:32 }}>
              <View style={{ width:120, height:120, borderRadius:60, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                <Ionicons name={done?'checkmark-circle':'scan-circle-outline'} size={56} color={done?colors.success:colors.primary} />
              </View>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:colors.grayBlack, marginBottom:10, textAlign:'center' }}>{done?'Verified!':'Face ID Setup'}</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1, textAlign:'center', lineHeight:20, marginBottom:32 }}>
                {done ? 'Your face has been verified successfully.' : 'Position your face in the frame and hold steady.'}
              </Text>
              {!done
                ? <Pressable onPress={() => Alert.alert('Camera','Allow camera access?',[{text:'Allow',onPress:()=>setTimeout(()=>setDone(true),800)},{text:'Deny',style:'cancel'}])}
                    style={({ pressed }) => [{ backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, paddingHorizontal:32, opacity:pressed?0.85:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Start Verification</Text>
                  </Pressable>
                : <Pressable onPress={() => { setSub('main'); setDone(false); }}
                    style={({ pressed }) => [{ backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, paddingHorizontal:32, opacity:pressed?0.85:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Done</Text>
                  </Pressable>
              }
            </View>
          : <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
              <View style={{ backgroundColor:colors.card, borderRadius:24, padding:18, marginTop:8, borderWidth:1, borderColor:colors.border }}>
              <View style={{ backgroundColor:colors.brandPrimaryLight, borderRadius:16, padding:16, marginBottom:20 }}>
                <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.primary }}>Why we need your {sub.toUpperCase()}</Text>
                <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:colors.grayBlack, marginTop:6, lineHeight:19 }}>
                  {sub==='bvn' ? 'Required by the CBN to verify your identity and protect your account.' : 'Required by Nigerian law for identity verification on financial platforms.'}
                </Text>
              </View>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayBlack, marginBottom:8 }}>{labels[sub]} Number</Text>
              <TextInput value={val} onChangeText={t => setVal(t.replace(/\D/g,'').slice(0,11))}
                placeholder="Enter your 11-digit number" placeholderTextColor={colors.grayGray1}
                keyboardType="numeric" style={inputSt} />
              {done
                ? <View style={{ flexDirection:'row', alignItems:'center', gap:8, justifyContent:'center', padding:16, backgroundColor:colors.brandPrimaryLight, borderRadius:16, marginTop:24 }}>
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.success }}>Verified Successfully</Text>
                  </View>
                : <Pressable onPress={() => { if(val.length===11){Alert.alert('Processing','Verifying...');setTimeout(()=>setDone(true),1500);}else Alert.alert('Invalid','Enter a valid 11-digit number.'); }}
                    style={({ pressed }) => [{ backgroundColor:colors.primary, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:24, opacity:pressed?0.85:1 }]}>
                    <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Verify</Text>
                  </Pressable>
              }
              </View>
            </ScrollView>
        }
      </View>
    );
  }
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Account Details</Text>
        </View>
      </View>
      <View style={{ margin:18, marginTop:8, backgroundColor:colors.card, borderRadius:24, padding:12,
        borderWidth:1, borderColor:colors.border }}>
        {([
          { icon:'card-outline' as const, label:'BVN', sub:'bvn' as const },
          { icon:'id-card-outline' as const, label:'NIN', sub:'nin' as const },
          { icon:'scan-circle-outline' as const, label:'Face Verification', sub:'face' as const },
        ]).map(item => (
          <Pressable key={item.label} onPress={() => setSub(item.sub)}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', borderRadius:16, padding:16, marginBottom:4, opacity:pressed?0.8:1 }]}>
            <View style={{ width:38, height:38, borderRadius:12, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginRight:14 }}>
              <Ionicons name={item.icon} size={19} color={colors.primary} />
            </View>
            <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.grayGray1} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── A: Additional profile sub-screens ────────────────────────────────────────
function AReferralScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const code = 'DRCS-JD239';
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Referral</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }}>
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:18, marginTop:8,
          borderWidth:1, borderColor:colors.border, marginBottom:16 }}>
        <View style={{ alignItems:'center', paddingVertical:12, marginBottom:8 }}>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:11, color:colors.grayGray1, letterSpacing:1.2, marginBottom:8 }}>YOUR REFERRAL CODE</Text>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:30, color:colors.primary, letterSpacing:4, marginBottom:14 }}>{code}</Text>
          <Pressable onPress={() => Alert.alert('Copied!', `Code ${code} copied.`)}
            style={({ pressed }) => [{ flexDirection:'row', gap:6, alignItems:'center', backgroundColor:colors.brandPrimaryLight, borderRadius:20, paddingHorizontal:20, paddingVertical:10, opacity:pressed?0.8:1 }]}>
            <Ionicons name="copy-outline" size={15} color={colors.primary} />
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.primary }}>Copy Code</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => Alert.alert('Share', `Share your referral code: ${code}`)}
          style={({ pressed }) => [{ flexDirection:'row', gap:8, alignItems:'center', justifyContent:'center',
            backgroundColor:colors.primary, borderRadius:28, paddingVertical:14, marginBottom:24, opacity:pressed?0.85:1 }]}>
          <Ionicons name="share-social-outline" size={18} color={colors.primaryForeground} />
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.primaryForeground }}>Share Invite Link</Text>
        </Pressable>
        <View style={{ flexDirection:'row', gap:12, marginBottom:24 }}>
          {([{ label:'Referred', value:'3' }, { label:'Earned', value:'₦750' }] as const).map(s => (
            <View key={s.label} style={{ flex:1, backgroundColor:colors.card, borderRadius:16, padding:16, alignItems:'center', borderWidth:1, borderColor:colors.border }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:22, color:colors.primary }}>{s.value}</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:12, color:colors.grayGray1, marginTop:4 }}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.grayBlack, marginBottom:12 }}>How it works</Text>
        {[
          { n:'1', t:'Share your referral code with friends' },
          { n:'2', t:'Friend signs up and makes first transaction' },
          { n:'3', t:'You both earn ₦250 bonus credit!' },
        ].map(s => (
          <View key={s.n} style={{ flexDirection:'row', gap:14, alignItems:'flex-start', marginBottom:14 }}>
            <View style={{ width:28, height:28, borderRadius:14, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.primaryForeground }}>{s.n}</Text>
            </View>
            <Text style={{ flex:1, fontFamily:colors.fontBody, fontSize:14, color:colors.grayBlack, lineHeight:20, paddingTop:4 }}>{s.t}</Text>
          </View>
        ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ANotificationScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [items, setItems] = useState([
    { id:'1', icon:'gift-outline',            title:'₦250 referral bonus!',      body:'Your friend signed up using your code.',    time:'2h ago', read:false },
    { id:'2', icon:'checkmark-circle-outline', title:'Data purchase successful', body:'2GB data for 08012345678 activated.',       time:'5h ago', read:false },
    { id:'3', icon:'alert-circle-outline',     title:'Low balance alert',        body:'Your wallet balance is below ₦500.',        time:'1d ago', read:true  },
    { id:'4', icon:'star-outline',             title:'Welcome to DRCS DATA!',    body:'Your account is ready. Start transacting.', time:'3d ago', read:true  },
  ]);
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8, flex:1 }}>Notifications</Text>
          <Pressable onPress={() => setItems(i => i.map(n => ({ ...n, read:true })))}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:'rgba(255,255,255,0.85)' }}>Mark all</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:8, paddingBottom:24 }}>
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:10, paddingTop:20, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          {items.map(item => (
            <Pressable key={item.id} onPress={() => setItems(i => i.map(n => n.id===item.id ? { ...n, read:true } : n))}
              style={({ pressed }) => [{ flexDirection:'row', alignItems:'flex-start',
                backgroundColor: item.read ? colors.card : colors.brandPrimaryLight,
                borderRadius:16, padding:14, marginBottom:6, opacity:pressed?0.8:1 }]}>
              <View style={{ width:38, height:38, borderRadius:12,
                backgroundColor: item.read ? colors.background : colors.primary,
                alignItems:'center', justifyContent:'center', marginRight:14 }}>
                <Ionicons name={item.icon as any} size={19} color={item.read ? colors.grayGray1 : colors.primaryForeground} />
              </View>
              <View style={{ flex:1 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:colors.grayBlack }}>{item.title}</Text>
                  <Text style={{ fontFamily:colors.fontBody, fontSize:11, color:colors.grayGray1 }}>{item.time}</Text>
                </View>
                <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:colors.grayGray1, lineHeight:18 }}>{item.body}</Text>
              </View>
              {!item.read && <View style={{ width:8, height:8, borderRadius:4, backgroundColor:colors.primary, marginLeft:8, marginTop:4 }} />}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function AChangePasswordScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [cur, setCur] = useState(''); const [nw, setNw] = useState(''); const [cf, setCf] = useState('');
  const ok = cur.length >= 6 && nw.length >= 6 && nw === cf;
  const inputSt = { fontFamily:colors.fontBody, fontSize:15, color:colors.grayBlack, borderWidth:1, borderColor:colors.border, borderRadius:14, paddingHorizontal:16, paddingVertical:13, backgroundColor:colors.card };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>Change Password</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:18, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          {([{ label:'Current Password', val:cur, set:setCur }, { label:'New Password', val:nw, set:setNw }, { label:'Confirm Password', val:cf, set:setCf }] as const).map(f => (
            <View key={f.label} style={{ marginBottom:18 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:13, color:colors.grayBlack, marginBottom:8 }}>{f.label}</Text>
              <TextInput value={f.val} onChangeText={f.set} secureTextEntry placeholder={f.label} placeholderTextColor={colors.grayGray1} style={inputSt} />
            </View>
          ))}
          {nw.length > 0 && cf.length > 0 && nw !== cf && <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:'#fe0d0d', marginBottom:12 }}>Passwords do not match</Text>}
          <Pressable onPress={() => ok && (Alert.alert('Success','Password updated successfully.'), onBack())}
            style={({ pressed }) => [{ backgroundColor: ok ? colors.primary : colors.grayGray4, borderRadius:14, paddingVertical:14, alignItems:'center', marginTop:8, opacity:pressed?0.85:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:colors.primaryForeground }}>Update Password</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ATwoFAScreen({ colors, insets, onBack }: { colors: AColors; insets: { top: number }; onBack: () => void }) {
  const [enabled, setEnabled] = useState(false);
  return (
    <View style={{ flex:1, backgroundColor:colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.brandPrimaryDark} />
      <View style={{ backgroundColor:colors.brandPrimaryDark,
        paddingTop:insets.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:18 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:'#fff', marginLeft:8 }}>2FA Authentication</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:18, paddingTop:0, paddingBottom:32 }}>
        <View style={{ backgroundColor:colors.card, borderRadius:24, padding:18, marginTop:8,
          borderWidth:1, borderColor:colors.border }}>
          <View style={{ alignItems:'center', paddingVertical:20 }}>
            <View style={{ width:80, height:80, borderRadius:40, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <Ionicons name="shield-checkmark-outline" size={40} color={colors.primary} />
            </View>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:colors.grayBlack, marginBottom:8 }}>Two-Factor Authentication</Text>
            <Text style={{ fontFamily:colors.fontBody, fontSize:14, color:colors.grayGray1, textAlign:'center', lineHeight:20, paddingHorizontal:8 }}>
              Add an extra layer of security. When enabled, you'll need a code in addition to your password.
            </Text>
          </View>
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
            backgroundColor:colors.background, borderRadius:16, padding:18, marginBottom:16 }}>
            <View style={{ flex:1, marginRight:12 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack, marginBottom:4 }}>Enable 2FA</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:colors.grayGray1 }}>Secure with authenticator app</Text>
            </View>
            <Switch value={enabled} onValueChange={v => { setEnabled(v); if (v) Alert.alert('2FA Enabled','Your account is now more secure.'); }} trackColor={{ true:colors.primary }} thumbColor="#fff" />
          </View>
          {enabled && (
            <View style={{ backgroundColor:colors.brandPrimaryLight, borderRadius:16, padding:16 }}>
              <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:14, color:colors.primary, marginBottom:8 }}>Next Steps</Text>
              <Text style={{ fontFamily:colors.fontBody, fontSize:13, color:colors.grayBlack, lineHeight:20 }}>
                {'1. Download Google Authenticator\n2. Scan the QR code during setup\n3. Enter the 6-digit code to confirm'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── A: Receipt builder ────────────────────────────────────────────────────────
function buildAReceipt(flow: AFlow, extra: Record<string,string> = {}): AReceiptData {
  const ref = aTxRef(), ts = aNow();
  if (flow?.kind==='serviceForm') {
    const svc = flow.service;
    const isData = svc==='Data';
    const amt = isData ? (extra.planPrice||'') : `₦${Number(extra.amount||0).toLocaleString()}`;
    return { status:'success', title:`${flow.network} ${svc}`, amount:amt, rows:[
      { label:'Bill Type', value:`${flow.network} ${svc}` },
      { label:svc==='Electricity'?'Meter Number':'Phone', value:extra.phone||'' },
      ...(isData?[{label:'Data Plan',value:extra.plan||''},{label:'Validity',value:extra.validity||''}]:[]),
      ...(svc==='Electricity'?[{label:'Meter Type',value:extra.meterType||'Prepaid'}]:[]),
      { label:'Amount', value:amt },
      { label:'Transaction No.', value:ref },
      { label:'Transaction Date', value:ts },
    ]};
  }
  if (flow?.kind==='tvForm') {
    return { status:'success', title:`${extra.provider} Cable TV`, amount:extra.price||'', rows:[
      { label:'Provider', value:extra.provider||'' },
      { label:'Smart Card / IUC', value:extra.smartCard||'' },
      { label:'Bouquet', value:extra.bouquet||'' },
      { label:'Amount', value:extra.price||'' },
      { label:'Transaction No.', value:ref },
      { label:'Transaction Date', value:ts },
    ]};
  }
  if (flow?.kind==='sendToDRCS') {
    const fmt=`₦${Number(extra.amount||0).toLocaleString()}`;
    return { status:'success', title:'DRCS Transfer', amount:fmt, rows:[
      { label:'Transfer Type', value:'DRCS User' },
      { label:'Recipient', value:`@${extra.username}` },
      { label:'Amount', value:fmt },
      { label:'Note', value:extra.note||'—' },
      { label:'Transaction No.', value:ref },
      { label:'Transaction Date', value:ts },
    ]};
  }
  if (flow?.kind==='sendToBank') {
    const fmt=`₦${Number(extra.amount||0).toLocaleString()}`;
    return { status:'success', title:'Bank Transfer', amount:fmt, rows:[
      { label:'Transfer Type', value:'Bank Transfer' },
      { label:'Account Name', value:extra.accountName||'' },
      { label:'Account Number', value:extra.accountNo||'' },
      { label:'Bank', value:extra.bankName||'' },
      { label:'Amount', value:fmt },
      { label:'Transaction No.', value:ref },
      { label:'Transaction Date', value:ts },
    ]};
  }
  return { status:'success', title:'Transaction', amount:'₦0', rows:[{ label:'Transaction No.', value:ref }]};
}

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
  const [activeTab,   setActiveTab]   = useState<HomeTab>('Home');
  const [profileSub,  setProfileSub]  = useState<'profileSettings'|'accountDetails'|'security'|'referral'|'notification'|'changePassword'|'twoFA'|null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notice, setNotice] = useState('');
  const [promoIndex, setPromoIndex] = useState(0);
  const promoScrollRef = useRef<ScrollView>(null);
  const promoWidth = Math.max(SCREEN_WIDTH - 36, 280);

  // ── Flow state ──────────────────────────────────────────────────────────────
  const [flow,       setFlow]       = useState<AFlow>(null);
  const [flowMeta,   setFlowMeta]   = useState<Record<string,string>>({});
  const [processing, setProcessing] = useState(false);

  const openFlow = (f: AFlow) => { setFlow(f); setFlowMeta({}); };
  const closeFlow = () => { setFlow(null); setFlowMeta({}); };
  const showReceipt = (r: AReceiptData)  => setFlow({ kind:'receipt', data:r });
  const showPin = (onConfirm: ()=>void) => setFlow({
    kind:'pin',
    onConfirm: () => {
      setProcessing(true);
      setTimeout(() => { setProcessing(false); onConfirm(); }, 1600);
    },
  });

  const showNotice = (message: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotice(message);
  };

  const handleTabPress = (tab: HomeTab) => {
    setActiveTab(tab);
    setProfileSub(null);
    setNotice('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (promoIndex + 1) % promoSlides.length;
      promoScrollRef.current?.scrollTo({ animated: true, x: nextIndex * promoWidth });
      setPromoIndex(nextIndex);
    }, 5200);
    return () => clearInterval(timer);
  }, [promoIndex, promoWidth]);

  // ── Flow screens (rendered instead of home when active) ─────────────────────
  if (flow?.kind === 'receipt')
    return <AReceiptScreen data={flow.data} colors={colors} onClose={closeFlow} onRetry={closeFlow} />;

  if (flow?.kind === 'pin')
    return <APinModal colors={colors} onClose={closeFlow} onSubmit={() => { const fn=flow.onConfirm; closeFlow(); fn(); }} />;

  if (flow?.kind === 'telecomPicker')
    return <ATelecomPickerScreen service={flow.service} colors={colors} onBack={closeFlow}
      onSelect={network => setFlow({ kind:'serviceForm', service:flow.service, network })} />;

  if (flow?.kind === 'serviceForm')
    return <AServiceFormScreen service={flow.service} network={flow.network} colors={colors}
      onBack={() => setFlow({ kind:'telecomPicker', service:flow.service })}
      onProceed={data => {
        const f = flow;
        const planMeta = f.service==='Data' ? flatADataPlans(f.network).find(p=>`${p.size}/${p.validity}`===data.plan) : undefined;
        showPin(() => showReceipt(buildAReceipt(f, {
          phone:    data.phone,
          amount:   data.amount,
          plan:     data.plan ?? '',
          validity: planMeta?.validity ?? '',
          planPrice:planMeta?.price ?? '',
          meterType:data.meterType ?? 'Prepaid',
        })));
      }} />;

  if (flow?.kind === 'tvPicker')
    return <ATVPickerScreen colors={colors} onBack={closeFlow}
      onSelect={(id,label) => setFlow({ kind:'tvForm', providerId:id, providerLabel:label })} />;

  if (flow?.kind === 'tvForm')
    return <ATVFormScreen providerId={flow.providerId} providerLabel={flow.providerLabel} colors={colors}
      onBack={() => setFlow({ kind:'tvPicker' })}
      onProceed={(sc,bq,px) => {
        const f = flow;
        showPin(() => showReceipt(buildAReceipt({ kind:'tvForm', providerId:f.providerId, providerLabel:f.providerLabel },
          { provider:f.providerLabel, smartCard:sc, bouquet:bq, price:px })));
      }} />;

  if (flow?.kind === 'educationPicker')
    return <AEducationPickerScreen colors={colors} onBack={closeFlow}
      onSelect={(id,label) => setFlow({ kind:'educationForm', bodyId:id, bodyLabel:label })} />;

  if (flow?.kind === 'educationForm')
    return <AEducationFormScreen bodyId={flow.bodyId} bodyLabel={flow.bodyLabel} colors={colors}
      onBack={() => setFlow({ kind:'educationPicker' })}
      onProceed={(regNo,examYear,amount) => {
        const f = flow;
        showPin(() => showReceipt({
          status:'success', title:'Education Payment', amount:`₦${Number(amount).toLocaleString()}`,
          rows:[
            { label:'Exam Body',           value:f.bodyLabel },
            { label:'Reg / Candidate No.', value:regNo },
            { label:'Exam Year',           value:examYear },
            { label:'Amount',              value:`₦${Number(amount).toLocaleString()}` },
            { label:'Transaction No.',     value:aTxRef() },
            { label:'Transaction Date',    value:aNow() },
          ],
        }));
      }} />;

  if (flow?.kind === 'bettingPicker')
    return (
      <View style={{ flex:1, backgroundColor:colors.background }}>
        <View style={{ flexDirection:'row', alignItems:'center', paddingTop:insets.top+16, paddingHorizontal:18, paddingBottom:14 }}>
          <Pressable onPress={closeFlow}><Ionicons name="chevron-back" size={24} color={colors.primary} /></Pressable>
          <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:18, color:colors.grayBlack, marginLeft:12 }}>Betting Top-Up</Text>
        </View>
        <ScrollView contentContainerStyle={{ paddingHorizontal:18, paddingBottom:32 }} keyboardShouldPersistTaps="handled">
          {[
            { id:'sportybet', label:'SportyBet',    icon:'trophy-outline' as const },
            { id:'bet9ja',    label:'Bet9ja',        icon:'dice-outline' as const },
            { id:'betway',    label:'Betway',         icon:'football-outline' as const },
            { id:'1xbet',     label:'1xBet',          icon:'game-controller-outline' as const },
          ].map(p => (
            <Pressable key={p.id} onPress={() =>
              Alert.alert('Betting Top-Up', `Top up your ${p.label} account`, [
                { text:'Cancel', style:'cancel' },
                { text:'Continue', onPress: () => {
                  showPin(() => showReceipt({ status:'success', title:`${p.label} Top-Up`,
                    amount:'₦500', rows:[
                      { label:'Provider', value: p.label },
                      { label:'Account',  value:'BET12345' },
                      { label:'Amount',   value:'₦500' },
                      { label:'Ref',      value: aTxRef() },
                      { label:'Date',     value: aNow() },
                    ]}));
                }}
              ])}
              style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card, borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:colors.border, opacity:pressed?0.8:1 }]}>
              <View style={{ width:44, height:44, borderRadius:12, backgroundColor:colors.brandPrimaryLight, alignItems:'center', justifyContent:'center', marginRight:14 }}>
                <Ionicons name={p.icon} size={22} color={colors.primary} />
              </View>
              <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{p.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.grayGray1} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );

  if (flow?.kind === 'sendToDRCS')
    return <ASendToDRCSScreen colors={colors} onBack={closeFlow}
      onProceed={p => showPin(() => showReceipt(buildAReceipt({ kind:'sendToDRCS' },
        { username:p.username, amount:p.amount, note:p.note })))} />;

  if (flow?.kind === 'sendToBank')
    return <ASendToBankScreen colors={colors} onBack={closeFlow}
      onProceed={p => showPin(() => showReceipt(buildAReceipt({ kind:'sendToBank' },
        { accountNo:p.accountNo, bankName:p.bankName, accountName:p.accountName, amount:p.amount })))} />;

  if (flow?.kind === 'addMoney')
    return <AAddMoneyScreen colors={colors} onBack={closeFlow} />;

  if ((flow as any)?.kind === 'transferPicker')
    return <ATransferPickerScreen colors={colors} onBack={closeFlow}
      onToDRCS={() => setFlow({ kind:'sendToDRCS' })}
      onToBank={() => setFlow({ kind:'sendToBank' })} />;

  if (profileSub === 'profileSettings')
    return <AProfileSettingsScreen colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'accountDetails')
    return <AAccountDetailsScreen  colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'security')
    return <ASecurityScreen        colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'referral')
    return <AReferralScreen        colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'notification')
    return <ANotificationScreen    colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'changePassword')
    return <AChangePasswordScreen  colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;
  if (profileSub === 'twoFA')
    return <ATwoFAScreen           colors={colors} insets={insets} onBack={() => setProfileSub(null)} />;

  return (
    <View
      style={[
        styles.homeContainer,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 10),
          ...(processing ? { pointerEvents: 'none' as any } : {}),
          paddingBottom: Math.max(insets.bottom, 12) + (Platform.OS === 'web' ? 34 : 0),
        },
      ]}
    >
      {activeTab === 'Home' && (
      <ScrollView
        contentContainerStyle={styles.homeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.homeHeader}>
          <View style={styles.homeBrandRow}>
            <Image
              source={require('../assets/images/design-b/avatar.png')}
              style={{ width: 44, height: 44, borderRadius: 22 }}
            />
            <View>
              <Text style={[styles.homeGreeting, { color: colors.grayGray1 }]}>Welcome back</Text>
              <Text style={[styles.homeName, { color: colors.grayBlack }]}>John Doe</Text>
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
              onPress={() => setActiveTab('History')}
              style={({ pressed }) => [styles.balanceHistoryButton, pressed && styles.pressed]}
            >
              <Text style={[styles.balanceHistoryText, { color: colors.primaryForeground }]}>
                History
              </Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primaryForeground} />
            </Pressable>
          </View>
        </View>

        {/* Deposit + Transfer — matches Design B */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {([
            { lbl: 'Deposit',  Icon: DepositIcon,  fn: () => openFlow({ kind: 'addMoney' }) },
            { lbl: 'Transfer', Icon: TransferIcon, fn: () => openFlow({ kind: 'transferPicker' } as any) },
          ] as { lbl: string; Icon: ANavIconComponent; fn: () => void }[]).map(a => (
            <Pressable key={a.lbl} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); a.fn(); }}
              style={({ pressed }) => [{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, borderRadius: 28, borderWidth: 1.5, borderColor: colors.primary,
                paddingVertical: 13, opacity: pressed ? 0.75 : 1,
              }]}>
              <a.Icon size={18} color={colors.primary} strokeWidth={1.8} />
              <Text style={{ fontFamily: colors.fontBodySemiBold, fontSize: 15, color: colors.primary }}>{a.lbl}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.homeSectionHeading}>
          <Text style={[styles.homeSectionTitle, { color: colors.grayBlack }]}>Everyday services</Text>
          <Text style={[styles.homeSectionCaption, { color: colors.primary }]}>See all</Text>
        </View>
        <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 8,
          borderWidth: 1, borderColor: colors.border, marginBottom: 26 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {homeServices.map(service => (
              <Pressable key={service.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (service.label === 'Airtime' || service.label === 'Data' || service.label === 'Electricity')
                    openFlow({ kind: 'telecomPicker', service: service.label });
                  else if (service.label === 'TV')
                    openFlow({ kind: 'tvPicker' });
                  else if (service.label === 'Education')
                    openFlow({ kind: 'educationPicker' });
                  else if (service.label === 'Betting')
                    openFlow({ kind: 'bettingPicker' });
                  else
                    showNotice(`${service.label} service selected.`);
                }}
                style={({ pressed }) => [{ width: '33.33%', alignItems: 'center', paddingVertical: 16, opacity: pressed ? 0.7 : 1 }]}>
                <View style={{ width: 52, height: 52, borderRadius: 16,
                  backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                  borderWidth: 1, borderColor: colors.border }}>
                  <service.Icon size={24} color={colors.primary} strokeWidth={1.6} />
                </View>
                <Text style={{ fontFamily: colors.fontBody, fontSize: 12, color: colors.grayBlack }}>{service.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.promoRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Refer and Earn"
            onPress={() => setProfileSub('referral')}
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
            onPress={() => openFlow({ kind: 'educationPicker' })}
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
                  onPress={() => setProfileSub('referral')}
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
            onPress={() => setActiveTab('History')}
          >
            <Text style={[styles.homeSectionCaption, { color: colors.primary }]}>See all</Text>
          </Pressable>
        </View>
        {A_RECENT_TXS.map(tx => (
          <View key={tx.id} style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.transactionIcon, { backgroundColor: colors.brandPrimaryLight }]}>
              <Ionicons name={tx.icon} size={19} color={colors.primary} />
            </View>
            <View style={styles.transactionCopy}>
              <Text style={[styles.transactionTitle, { color: colors.grayBlack }]}>{tx.title}</Text>
              <Text style={[styles.transactionSubtitle, { color: colors.grayGray1 }]}>{tx.date}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: colors.grayBlack }]}>{tx.amt}</Text>
          </View>
        ))}
      </ScrollView>
      )}

      {(activeTab === 'Rewards' || activeTab === 'History' || activeTab === 'Cards') && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="construct-outline" size={52} color={colors.primary} style={{ opacity: 0.3 }} />
          <Text style={{ fontFamily: colors.fontBodySemiBold, fontSize: 18, color: colors.grayGray1, marginTop: 16 }}>{activeTab}</Text>
          <Text style={{ fontFamily: colors.fontBody, fontSize: 14, color: colors.grayGray1, marginTop: 6 }}>Coming soon</Text>
        </View>
      )}

      {activeTab === 'Profile' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={{ fontFamily: colors.fontBodySemiBold, fontSize: 20, color: colors.grayBlack, textAlign: 'center', marginBottom: 22 }}>Profile</Text>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image source={require('../assets/images/design-b/avatar.png')} style={{ width: 130, height: 130, borderRadius: 65 }} />
            <Text style={{ fontFamily: colors.fontBodySemiBold, fontSize: 18, color: colors.grayBlack, marginTop: 16 }}>John Doe</Text>
            <Text style={{ fontFamily: colors.fontBody, fontSize: 12, color: colors.grayGray1, marginTop: 4 }}>johndoe239@gmail.com</Text>
          </View>
          {([
            { icon: 'person-outline',        label: 'Profile',         sub: 'profileSettings' },
            { icon: 'list-outline',          label: 'Account Details', sub: 'accountDetails'  },
            { icon: 'shield-outline',        label: 'Security',        sub: 'security'        },
            { icon: 'people-outline',        label: 'Referral',        sub: 'referral'      },
            { icon: 'notifications-outline', label: 'Notification',    sub: 'notification'  },
          ] as { icon: string; label: string; sub: string|null }[]).map(item => (
            <Pressable key={item.label} onPress={() => item.sub && setProfileSub(item.sub as any)}
              style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:colors.card,
                borderRadius:16, padding:16, marginBottom:10, borderWidth:1, borderColor:colors.border, opacity:pressed?0.8:1 }]}>
              <View style={{ width:38, height:38, borderRadius:12, backgroundColor:colors.brandPrimaryLight,
                alignItems:'center', justifyContent:'center', marginRight:14 }}>
                <Ionicons name={item.icon as any} size={19} color={colors.primary} />
              </View>
              <Text style={{ flex:1, fontFamily:colors.fontBodySemiBold, fontSize:15, color:colors.grayBlack }}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grayGray1} />
            </Pressable>
          ))}
          <Pressable onPress={() => Alert.alert('Log Out','Are you sure you want to log out?',[{text:'Cancel',style:'cancel'},{text:'Log Out',style:'destructive',onPress:()=>{}}])}
            style={({ pressed }) => [{ backgroundColor:'#fe0d0d', borderRadius:40, paddingVertical:14,
              alignItems:'center', marginTop:4, opacity:pressed?0.85:1 }]}>
            <Text style={{ fontFamily:colors.fontBodySemiBold, fontSize:16, color:'#fff' }}>Log Out</Text>
          </Pressable>
        </ScrollView>
      )}

      <View style={{
        flexDirection: 'row', backgroundColor: colors.card,
        paddingBottom: Math.max(insets.bottom, 6),
        paddingTop: 8, paddingHorizontal: 4,
        borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        {homeTabs.map(tab => {
          const on = activeTab === tab.label;
          return (
            <Pressable key={tab.label}
              accessibilityRole="button" accessibilityLabel={tab.label}
              onPress={() => handleTabPress(tab.label)}
              style={{ flex: 1, alignItems: 'center' }}>
              <View style={{
                width: 46, height: 34, borderRadius: 12,
                backgroundColor: on ? colors.primary : 'transparent',
                alignItems: 'center', justifyContent: 'center', marginBottom: 2,
              }}>
                <tab.Icon size={20} color={on ? '#fff' : colors.grayGray1} strokeWidth={1.7} />
              </View>
              <Text style={{ fontFamily: colors.fontBodyMedium, fontSize: 10, lineHeight: 13,
                color: on ? colors.primary : colors.grayGray1 }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Processing overlay shown while purchase is being confirmed */}
      {processing && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.52)',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{
            backgroundColor: colors.card, borderRadius: 24, padding: 32,
            alignItems: 'center', minWidth: 160,
          }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{
              fontFamily: colors.fontBodySemiBold, fontSize: 15,
              color: colors.grayBlack, marginTop: 16,
            }}>Processing…</Text>
          </View>
        </View>
      )}
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

  // ─── Design B: hand off to the complete Design B app ─────────────────────
  const isDesignB = designVariant === 'B';
  if (isDesignB) {
    return <DesignBApp onSwitchDesign={toggleDesign} />;
  }

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
                backgroundColor: (designVariant as string) === 'B' ? colors.primary : colors.secondary,
                minWidth: 36,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={{
                fontFamily: colors.fontBodySemiBold,
                fontSize: 12,
                color: (designVariant as string) === 'B' ? colors.primaryForeground : colors.primary,
                letterSpacing: 0.5,
              }}
            >
              {(designVariant as string) === 'A' ? 'B' : 'A'}
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