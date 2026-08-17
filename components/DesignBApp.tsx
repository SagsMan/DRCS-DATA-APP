/**
 * Design B — Figma-faithful implementation (revised)
 * Fixes: splash logo, onboarding clip, auth proportions, avatar photo,
 *        telecom picker, loading overlay, bottom-nav icons
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  AirtimeIcon,
  BettingIcon,
  CableTVIcon,
  CardsNavIcon,
  DataIcon,
  DepositIcon,
  EducationIcon,
  ElectricityIcon,
  HistoryNavIcon,
  HomeNavIcon,
  ProfileNavIcon,
  RewardsNavIcon,
  TransferIcon,
} from './icons/DrcsIcons';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: W, height: H } = Dimensions.get('window');

// ─── Tokens ──────────────────────────────────────────────────────────────────
// Values extracted from Figma (file DH0zgCNw5OK8qWo4VlnWIC) via REST API
const C = {
  primary:      '#014dd4',   // Figma primary blue
  primaryMid:   '#0245c0',
  primaryDark:  '#012d80',
  primaryLight: '#caddff',   // Figma balance-card wrapper fill
  link:         '#0073d2',   // Figma secondary/link blue ("Help", icons)
  bg:           '#f1f7ff',   // Figma screen background
  text:         '#17000e',   // Figma primary text
  subtext:      '#636e88',
  label:        '#9aa5bb',
  card:         '#ffffff',
  border:       '#dde5f5',
  inputBg:      '#f4f9ff',   // Figma "Input" component fill
  authInput:    '#f8f8f8',   // Figma auth-form input fill
  success:      '#22c55e',
  error:        '#ef4444',
  logoutRed:    '#fe0d0d',   // Figma logout BTN fill
  divider:      '#eef2fb',
  heavy:        'DMSans_700Bold',
  inter:        'Inter_400Regular',
  bold:         'DMSans_600SemiBold',
  medium:       'DMSans_500Medium',
  regular:      'DMSans_400Regular',
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
type DBScreen = 'splash'|'onboarding'|'login'|'signup'|'home'|'profile'
  |'profileSettings'|'accountDetails'|'security'|'receipt'|'telecomPicker';
type HomeTab  = 'Home'|'Rewards'|'History'|'Cards'|'Profile';
interface ReceiptData {
  status: 'success'|'failed';
  type: string; amount: string;
  details: { label: string; value: string }[];
}

const BETTING_PROVIDERS = [
  { id: 'sportybet', label: 'SportyBet',  color: '#1D7A3A', tc: '#fff' },
  { id: 'bet9ja',    label: 'Bet9ja',     color: '#006634', tc: '#fff' },
  { id: '1xbet',     label: '1xBet',      color: '#FF6600', tc: '#fff' },
  { id: 'nairabet',  label: 'NairaBet',   color: '#003399', tc: '#fff' },
  { id: 'betking',   label: 'BetKing',    color: '#C8102E', tc: '#fff' },
  { id: 'parimatch', label: 'Parimatch',  color: '#F5A623', tc: '#000' },
] as const;
const TV_PROVIDERS = [
  { id: 'dstv',      label: 'DSTV',     color: '#0065BD', tc: '#fff' },
  { id: 'gotv',      label: 'GOTV',     color: '#E8001C', tc: '#fff' },
  { id: 'startimes', label: 'StarTimes',color: '#D4111E', tc: '#fff' },
] as const;

const TV_BOUQUETS: Record<string, { name: string; price: string; naira: number }[]> = {
  dstv:      [{ name:'Padi',price:'₦2,500',naira:2500},{name:'Yanga',price:'₦3,500',naira:3500},{name:'Confam',price:'₦6,200',naira:6200},{name:'Compact',price:'₦10,500',naira:10500},{name:'Premium',price:'₦29,500',naira:29500}],
  gotv:      [{ name:'GOTV Lite',price:'₦410',naira:410},{name:'GOTV Smallie',price:'₦1,575',naira:1575},{name:'GOTV Jolli',price:'₦2,460',naira:2460},{name:'GOTV Jinja',price:'₦3,300',naira:3300},{name:'GOTV Max',price:'₦4,850',naira:4850}],
  startimes: [{ name:'Nova',price:'₦1,700',naira:1700},{name:'Basic',price:'₦2,200',naira:2200},{name:'Smart',price:'₦2,800',naira:2800},{name:'Classic',price:'₦2,500',naira:2500},{name:'Super',price:'₦4,200',naira:4200}],
};

// ─── Data plans per network ──────────────────────────────────────────────────
const DATA_PLANS: Record<string, { size: string; validity: string; price: string; naira: number }[]> = {
  MTN: [
    { size: '500MB', validity: '1 Day',   price: '₦200',   naira: 200   },
    { size: '1GB',   validity: '7 Days',  price: '₦500',   naira: 500   },
    { size: '2GB',   validity: '30 Days', price: '₦1,000', naira: 1000  },
    { size: '5GB',   validity: '30 Days', price: '₦2,000', naira: 2000  },
    { size: '10GB',  validity: '30 Days', price: '₦3,000', naira: 3000  },
  ],
  Airtel: [
    { size: '300MB', validity: '1 Day',   price: '₦200',   naira: 200   },
    { size: '1GB',   validity: '7 Days',  price: '₦500',   naira: 500   },
    { size: '3GB',   validity: '30 Days', price: '₦1,000', naira: 1000  },
    { size: '6GB',   validity: '30 Days', price: '₦2,000', naira: 2000  },
    { size: '15GB',  validity: '30 Days', price: '₦3,000', naira: 3000  },
  ],
  Glo: [
    { size: '1GB',   validity: '1 Day',   price: '₦300',   naira: 300   },
    { size: '2GB',   validity: '7 Days',  price: '₦500',   naira: 500   },
    { size: '5GB',   validity: '30 Days', price: '₦1,500', naira: 1500  },
    { size: '10GB',  validity: '30 Days', price: '₦2,500', naira: 2500  },
    { size: '20GB',  validity: '30 Days', price: '₦4,000', naira: 4000  },
  ],
  '9Mobile': [
    { size: '500MB', validity: '1 Day',   price: '₦150',   naira: 150   },
    { size: '1.5GB', validity: '7 Days',  price: '₦500',   naira: 500   },
    { size: '3GB',   validity: '30 Days', price: '₦1,000', naira: 1000  },
    { size: '7.5GB', validity: '30 Days', price: '₦2,000', naira: 2000  },
    { size: '12GB',  validity: '30 Days', price: '₦3,000', naira: 3000  },
  ],
};


const AIRTIME_QUICK = ['₦50', '₦100', '₦200', '₦500', '₦1,000'];

const RECENT_BENEFICIARIES_KEY = 'drcs_recent_beneficiaries';
interface Beneficiary { name: string; phone: string; network: string; }
const MAX_RECENT = 5;

interface TelecomItem {
  id: string;

  label: string;

  color: string;

  textColor: string;

  initial: string;
  /**
   * Metro always resolves this to a bundled asset number — either the real
   * logo or the NO_LOGO sentinel (1×1 transparent PNG) when the file is
   * absent.  Compare with NO_LOGO to decide whether to render an Image or the
   * coloured-badge fallback.
   */
  logo: number;
}

/**
 * Sentinel asset: metro.config.js remaps any missing image require() to this
 * 1×1 transparent PNG so the bundle never fails.  Comparing net.logo === NO_LOGO
 * at runtime tells us a real logo file was absent and the badge should show.
 */
const NO_LOGO: number = require('../assets/images/no-logo.png');

const TELECOMS: TelecomItem[] = [
  { id: 'mtn',    label: 'MTN',    color: '#ffcc00', textColor: '#000', initial: 'MTN',
    logo: require('../assets/images/design-b/telecoms/mtn-logo.png') },
  { id: 'airtel', label: 'Airtel', color: '#e8001c', textColor: '#fff', initial: 'AIR',
    logo: require('../assets/images/design-b/telecoms/airtel-logo.png') },
  { id: 'glo',    label: 'Glo',    color: '#0a8234', textColor: '#fff', initial: 'glo',
    logo: require('../assets/images/design-b/glo-logo.png') },
  { id: '9mobile',label: '9Mobile',color: '#006b50', textColor: '#fff', initial: '9m',
    logo: require('../assets/images/design-b/telecoms/9mobile-logo.png') },
];

// ─── Shared UI atoms ─────────────────────────────────────────────────────────
function Btn({
  label, onPress, variant = 'primary', style, disabled,
}: {
  label: string; onPress: () => void;
  variant?: 'primary'|'outline'|'ghost'|'danger'; style?: object; disabled?: boolean;
}) {
  const bg = variant === 'primary' ? C.primary
    : variant === 'danger'  ? C.logoutRed
    : variant === 'ghost'   ? C.bg
    : 'transparent';
  const tc = variant === 'primary' || variant === 'danger' ? '#fff'
    : variant === 'outline' ? C.primary
    : C.subtext;
  const bdr = variant === 'outline' ? { borderWidth: 1.5, borderColor: C.primary } : {};
  return (
    <Pressable
      onPress={() => { if (!disabled) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
      style={({ pressed }) => [{
        // Figma "Frame 6" button: cornerRadius 40, height 56
        backgroundColor: bg, borderRadius: 40, minHeight: 56,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
        opacity: pressed ? 0.82 : disabled ? 0.5 : 1, ...bdr, ...style,
      }]}
    >
      {/* Figma: DM Sans 500, 16px, lineHeight 20.8 */}
      <Text style={{ fontFamily: C.medium, fontSize: 16, lineHeight: 21, color: tc }}>{label}</Text>
    </Pressable>
  );
}

function Field({
  placeholder, value, onChangeText, secure = false, keyboard = 'default', autoCapitalize = 'words',
}: {
  placeholder: string; value: string; onChangeText: (v: string) => void;
  secure?: boolean; keyboard?: any; autoCapitalize?: any;
}) {
  const [show, setShow] = useState(false);
  return (
    <View>
      <TextInput
        placeholder={placeholder} placeholderTextColor={C.label}
        value={value} onChangeText={onChangeText}
        secureTextEntry={secure && !show}
        keyboardType={keyboard} autoCapitalize={autoCapitalize}
        style={{
          // Figma auth input: fill #f8f8f8, cornerRadius 40, height 56, padH 16
          backgroundColor: C.authInput, borderRadius: 40, minHeight: 56,
          paddingHorizontal: 16, paddingRight: secure ? 50 : 16,
          // Figma placeholder: DM Sans 500, 14px, lineHeight 18.2
          fontFamily: C.medium, fontSize: 14, color: C.text,
        }}
      />
      {secure && (
        <Pressable onPress={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 18, top: 18 }}>
          <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.label} />
        </Pressable>
      )}
    </View>
  );
}

function MenuRow({
  icon, label, onPress, right,
}: { icon: string; label: string; onPress?: () => void; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onPress}
      style={({ pressed }) => [{
        // Figma: menu row r=16, height 56, padH 16, gap 12, white fill
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
        borderRadius: 16, paddingHorizontal: 16, minHeight: 56,
        marginBottom: 10, opacity: pressed ? 0.8 : 1,
      }]}>
      <View style={{
        width: 32, height: 32, borderRadius: 16, backgroundColor: C.bg,
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
      }}>
        <Ionicons name={icon as any} size={18} color={C.primary} />
      </View>
      {/* Figma: row label DM Sans 400 16/20.8 */}
      <Text style={{ fontFamily: C.regular, fontSize: 16, lineHeight: 21, color: C.text, flex: 1 }}>{label}</Text>
      {right ?? <Ionicons name="chevron-forward" size={18} color={C.label} />}
    </Pressable>
  );
}

type NavIconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
const NAV_TABS: { id: HomeTab; Icon: NavIconComponent }[] = [
  { id: 'Home',    Icon: HomeNavIcon    },
  { id: 'Rewards', Icon: RewardsNavIcon },
  { id: 'History', Icon: HistoryNavIcon },
  { id: 'Cards',   Icon: CardsNavIcon   },
  { id: 'Profile', Icon: ProfileNavIcon },
];

function BottomNav({ active, onSelect }: { active: HomeTab; onSelect: (t: HomeTab) => void }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{
      flexDirection: 'row', backgroundColor: C.card,
      paddingBottom: Math.max(ins.bottom, 6) + (Platform.OS === 'web' ? 10 : 0),
      paddingTop: 8, paddingHorizontal: 4,
      borderTopWidth: 1, borderTopColor: C.border,
    }}>
      {NAV_TABS.map(t => {
        const on = active === t.id;
        return (
          <Pressable key={t.id} onPress={() => { Haptics.selectionAsync(); onSelect(t.id); }}
            style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 46, height: 34, borderRadius: 12,
              backgroundColor: on ? C.primary : 'transparent',
              alignItems: 'center', justifyContent: 'center', marginBottom: 2,
            }}>
              <t.Icon size={20} color={on ? '#fff' : C.subtext} strokeWidth={1.7} />
            </View>
            {/* Figma: nav label DM Sans 500 10/13 */}
            <Text style={{ fontFamily: C.medium, fontSize: 10, lineHeight: 13, color: on ? C.primary : C.subtext }}>
              {t.id}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── 1. Splash ────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {/* Figma: logo block 140×195 (hexagon 140×160 + DRCSDATA 24px text) */}
      <Image
        source={require('../assets/images/design-b/splash-logo.png')}
        style={{ width: 140, height: 195 }}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── 2. Onboarding ────────────────────────────────────────────────────────────
// Illustration-only exports pulled straight from Figma (nodes 1:3693, 1:4429,
// 1:3849, 1:4092) — no full-frame clipping workaround needed anymore.
const SLIDES = [
  { img: require('../assets/images/design-b/illus1.png'),
    title: 'Pay Bills Without\nStress',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/illus2.png'),
    title: 'Get More\nValue',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/illus3.png'),
    title: 'Safe, Instant\nTransaction',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/illus4.png'),
    title: 'Earn While your\nRecharge',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Get Started' },
] as const;

// Figma: white sheet is 324 of 852 px → blue illustration zone ≈ 62 % of height
const ILLUS_H = H * (528 / 852);
// Figma illustration: 320×320 on a 393-wide frame
const ILLUS_SIZE = W * (320 / 393);

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const ins = useSafeAreaInsets();
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  const next = () => { Haptics.selectionAsync(); isLast ? onDone() : setIdx(i => i + 1); };
  const skip = () => { Haptics.selectionAsync(); onDone(); };

  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── Blue illustration zone ── */}
      <View style={{ height: ILLUS_H, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={slide.img}
          style={{ width: ILLUS_SIZE, height: ILLUS_SIZE, marginTop: ins.top / 2 }}
          resizeMode="contain"
        />

        {/* Progress bars — Figma: 4×16 active / 4×12 inactive, r=10, gap 2 */}
        <View style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2,
        }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width: 4,
              height: i === idx ? 16 : 12,
              borderRadius: 10,
              backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.38)',
            }} />
          ))}
        </View>
      </View>

      {/* ── White bottom sheet (Figma: r=24 top, pad 20 sides, gap 32) ── */}
      <View style={{
        flex: 1, backgroundColor: C.card,
        borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24,
        paddingHorizontal: 20, paddingTop: 40,
        paddingBottom: Math.max(ins.bottom, 16) + (Platform.OS === 'web' ? 20 : 0),
      }}>
        {/* Skip — Figma: Inter 400 14/17 black */}
        {!isLast && (
          <Pressable onPress={skip} style={{ position: 'absolute', top: 18, right: 22 }}>
            <Text style={{ fontFamily: C.inter, fontSize: 14, lineHeight: 17, color: C.text }}>Skip</Text>
          </Pressable>
        )}

        {/* Figma: DM Sans 700, 24px, lh 31.2, ls -1.2 */}
        <Text style={{ fontFamily: C.heavy, fontSize: 24, color: C.text, lineHeight: 31, letterSpacing: -1.2, marginBottom: 16 }}>
          {slide.title}
        </Text>
        {/* Figma: Inter 400, 14px, lh 16.9 */}
        <Text style={{ fontFamily: C.inter, fontSize: 14, color: C.subtext, lineHeight: 17, marginBottom: 32 }}>
          {slide.body}
        </Text>
        <Btn label={slide.cta} onPress={next} />
      </View>
    </View>
  );
}

// ─── 3. Auth shared shell ──────────────────────────────────────────────────────
// Tall blue header (~38 % screen) with watermark hexagon; white form card below.
function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  const ins = useSafeAreaInsets();
  const topH = H * 0.35 + ins.top;
  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Blue header */}
      <View style={{ height: topH, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 32, overflow: 'hidden' }}>
        {/* Watermark hexagon (logo-hex, low opacity, top-right) */}
        <Image
          source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position: 'absolute', right: -24, top: ins.top + 8, width: 160, height: 160, opacity: 0.12 }}
          resizeMode="contain"
        />
        {/* Figma: DM Sans 600, 32px, lh 41.7, ls -0.64 */}
        <Text style={{ fontFamily: C.bold, fontSize: 32, color: '#fff', lineHeight: 42, letterSpacing: -0.64 }}>{title}</Text>
      </View>

      {/* White form card */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            // Figma: white form card r=24 top, pad 20 sides / 40 top
            backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            paddingHorizontal: 20, paddingTop: 40, flexGrow: 1,
            paddingBottom: Math.max(ins.bottom, 24) + (Platform.OS === 'web' ? 32 : 0),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialButtons() {
  return (
    <>
      {/* Figma: "or" DM Sans 400 14/18.2 ls -0.28, black */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ fontFamily: C.regular, fontSize: 14, lineHeight: 18, letterSpacing: -0.28, color: C.text }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>
      {/* Figma: social buttons 44×44, r=40, white fill, gap 12 */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
        {/* Google */}
        <Pressable style={({ pressed }) => [{
          width: 44, height: 44, borderRadius: 40, backgroundColor: C.card,
          borderWidth: 1, borderColor: C.border,
          alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
        }]}>
          <Image source={require('../assets/images/design-b/google-logo.png')}
            style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        {/* Apple */}
        <Pressable style={({ pressed }) => [{
          width: 44, height: 44, borderRadius: 40, backgroundColor: C.card,
          borderWidth: 1, borderColor: C.border,
          alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
        }]}>
          <Ionicons name="logo-apple" size={24} color={C.text} />
        </Pressable>
      </View>
    </>
  );
}

function LoginScreen({ onLogin, onGoSignup }: { onLogin: () => void; onGoSignup: () => void }) {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  return (
    <AuthShell title="Login">
      <View style={{ gap: 12 }}>
        <Field placeholder="Email" value={email} onChangeText={setEmail} keyboard="email-address" autoCapitalize="none" />
        <Field placeholder="Password" value={pass} onChangeText={setPass} secure />
        <Pressable onPress={() => {}} style={{ alignSelf: 'flex-end' }}>
          <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.label, fontStyle: 'italic' }}>Forget Password</Text>
        </Pressable>
      </View>
      <Btn label="Login" onPress={onLogin} style={{ marginTop: 18 }} />
      <SocialButtons />
      {/* Figma: DM Sans 400 14/18.2 ls -0.28; link is #014dd4 */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, letterSpacing: -0.28, color: C.text }}>New here? </Text>
        <Pressable onPress={onGoSignup}>
          <Text style={{ fontFamily: C.regular, fontSize: 14, letterSpacing: -0.28, color: C.primary }}>Create an account</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

function SignUpScreen({ onSignup, onGoLogin }: { onSignup: () => void; onGoLogin: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [pass,      setPass]      = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [agreed,    setAgreed]    = useState(false);
  return (
    <AuthShell title={'Create an\naccount'}>
      <View style={{ gap: 12 }}>
        <Field placeholder="First Name"       value={firstName} onChangeText={setFirstName} />
        <Field placeholder="Last Name"        value={lastName}  onChangeText={setLastName} />
        <Field placeholder="Email"            value={email}     onChangeText={setEmail} keyboard="email-address" autoCapitalize="none" />
        <Field placeholder="Password"         value={pass}      onChangeText={setPass} secure />
        <Field placeholder="Confirm Password" value={confirm}   onChangeText={setConfirm} secure />
        <Pressable onPress={() => setAgreed(a => !a)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
          <View style={{
            width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, marginTop: 1,
            borderColor: agreed ? C.primary : C.border,
            backgroundColor: agreed ? C.primary : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {agreed && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, flex: 1, lineHeight: 18 }}>
            I agree to the <Text style={{ color: C.primary }}>Terms & Conditions</Text> and <Text style={{ color: C.primary }}>Privacy Policy</Text>
          </Text>
        </Pressable>
      </View>
      <Btn label="Create account" onPress={onSignup} style={{ marginTop: 20 }} />
      <SocialButtons />
      {/* Figma: DM Sans 400 14/18.2 ls -0.28; link is #014dd4 */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, letterSpacing: -0.28, color: C.text }}>Have an account? </Text>
        <Pressable onPress={onGoLogin}>
          <Text style={{ fontFamily: C.regular, fontSize: 14, letterSpacing: -0.28, color: C.primary }}>Login</Text>
        </Pressable>
      </View>
    </AuthShell>
  );
}

// ─── 4. PIN modal ──────────────────────────────────────────────────────────────
function PinModal({ visible, onClose, onSubmit }: {
  visible: boolean; onClose: () => void; onSubmit: () => void;
}) {
  const [pin, setPin] = useState('');
  const PAD = ['1','2','3','4','5','6','7','8','9','','0','Del'];
  const tap = (k: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (k === 'Del')       setPin(p => p.slice(0, -1));
    else if (pin.length < 4 && k) setPin(p => p + k);
  };
  const btnW = (W - 56 - 24) / 3;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.48)' }} onPress={onClose} />
      <View style={{
        backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 14, paddingBottom: 32,
      }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 22 }} />
        <Text style={{ fontFamily: C.bold, fontSize: 20, color: C.text, textAlign: 'center', marginBottom: 28 }}>
          Input Pin
        </Text>
        {/* 4 dot slots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <View key={i} style={{
              width: 56, height: 56, borderRadius: 14,
              borderWidth: 1.5,
              borderColor: pin.length > i ? C.primary : C.border,
              backgroundColor: pin.length > i ? '#e8f0ff' : C.inputBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {pin.length > i && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary }} />}
            </View>
          ))}
        </View>
        {/* Keypad */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {PAD.map((k, i) => (
            <Pressable key={i} onPress={() => k && tap(k)} disabled={!k}
              style={({ pressed }) => [{
                width: btnW, height: 58, borderRadius: 14,
                backgroundColor: k === 'Del' ? C.bg : k === '' ? 'transparent' : C.inputBg,
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.7 : !k ? 0 : 1,
              }]}>
              {k === 'Del'
                ? <Ionicons name="backspace-outline" size={22} color={C.subtext} />
                : <Text style={{ fontFamily: C.bold, fontSize: 22, color: C.text }}>{k}</Text>
              }
            </Pressable>
          ))}
        </View>
        <Btn label="Submit" onPress={() => { onSubmit(); setPin(''); }} style={{ marginTop: 22 }} />
      </View>
    </Modal>
  );
}

function TelecomPicker({
  serviceLabel, onBack, onSelect,
}: { serviceLabel: string; onBack: () => void; onSelect: (network: string) => void }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={serviceLabel === 'Electricity' ? 'dark-content' : 'light-content'} />
      {/* Header — dark blue with hex watermark for Airtime/Data; plain for Electricity */}
      {serviceLabel !== 'Electricity' ? (
        <View style={{
          backgroundColor: C.primaryDark,
          paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
          paddingBottom: 88, paddingHorizontal: 20,
        }}>
          <Image source={require('../assets/images/design-b/logo-hex.png')}
            style={{ position: 'absolute', right: 12, bottom: 0, width: 160, height: 160, opacity: 0.12 }}
            resizeMode="contain" />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={onBack} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8 }}>
              {`Select Network — ${serviceLabel}`}
            </Text>
          </View>
        </View>
      ) : (
        <View style={{
          backgroundColor: C.primaryDark,
          paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
          paddingBottom: 88, paddingHorizontal: 20,
        }}>
          <Image source={require('../assets/images/design-b/logo-hex.png')}
            style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
            resizeMode="contain" />
          <View style={{ flexDirection:'row', alignItems:'center' }}>
            <Pressable onPress={onBack} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </Pressable>
            <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8 }}>Select DisCo</Text>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {serviceLabel === 'Electricity'
          ? ['AEDC','IKEDC','EKEDC','KANO'].map(c => (
            <Pressable key={c} onPress={() => { Haptics.selectionAsync(); onSelect(c); }}
              style={({ pressed }) => [{
                flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
                borderRadius: 18, padding: 16, marginBottom: 12, opacity: pressed ? 0.8 : 1,
              }]}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1e3a8a', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Text style={{ fontFamily: C.bold, fontSize: 10, color: '#fff' }}>{c}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: C.bold, fontSize: 16, color: C.text }}>{c}</Text>
                <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 2 }}>Electricity DisCo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.label} />
            </Pressable>
          ))
          : TELECOMS.map(net => (
            <Pressable key={net.id} onPress={() => { Haptics.selectionAsync(); onSelect(net.label); }}
              style={({ pressed }) => [{
                flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
                borderRadius: 18, padding: 16, marginBottom: 12,
                opacity: pressed ? 0.8 : 1,
              }]}>
              {/* Logo — coloured badge when the file was absent at build time */}
              {net.logo !== NO_LOGO ? (
                <Image source={net.logo}
                  style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }} resizeMode="cover" />
              ) : (
                <View style={{
                  width: 48, height: 48, borderRadius: 24, marginRight: 16,
                  backgroundColor: net.color, alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontFamily: C.bold, fontSize: 11, color: net.textColor }}>{net.initial}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: C.bold, fontSize: 16, color: C.text }}>{net.label}</Text>
                <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 2 }}>
                  Tap to {serviceLabel.toLowerCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.label} />
            </Pressable>
          ))
        }
      </ScrollView>
    </View>
  );
}

// ─── 5b. Service form (Airtime / Data / Electricity) ─────────────────────────
interface FormPayload {
  serviceLabel: string;
  network: string;
  phone: string;
  amount: string;     // naira value string e.g. "500"
  plan?: string;      // data plan description e.g. "1GB / 7 Days"
  meterType?: string; // 'Prepaid' | 'Postpaid'
}

function ServiceFormScreen({
  serviceLabel, network, onBack, onProceed,
}: {
  serviceLabel: string;
  network: string;
  onBack: () => void;
  onProceed: (payload: FormPayload) => void;
}) {
  const ins = useSafeAreaInsets();
  const [phone,      setPhone]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [plan,       setPlan]       = useState<string | null>(null);
  const [meterType,  setMeterType]  = useState<'Prepaid'|'Postpaid'>('Prepaid');
  const [recentBeneficiaries, setRecentBeneficiaries] = useState<Beneficiary[]>([]);

  const isAirtime     = serviceLabel === 'Airtime';
  const isData        = serviceLabel === 'Data';
  const isElectricity = serviceLabel === 'Electricity';
  const showBeneficiaries = isAirtime || isData;

  const plans = DATA_PLANS[network] ?? DATA_PLANS['MTN'];

  // network badge/logo (same logic as TelecomPicker)
  const telecomMeta = TELECOMS.find(t => t.label === network);

  // Load recent beneficiaries from AsyncStorage on mount
  useEffect(() => {
    if (!showBeneficiaries) return;
    AsyncStorage.getItem(RECENT_BENEFICIARIES_KEY).then(raw => {
      if (raw) {
        const all: Beneficiary[] = JSON.parse(raw);
        // Show only beneficiaries matching this network
        setRecentBeneficiaries(all.filter(b => b.network === network).slice(0, MAX_RECENT));
      }
    }).catch(() => {});
  }, [network, showBeneficiaries]);

  // Save beneficiary then call onProceed
  const saveAndProceed = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (showBeneficiaries && phone.length >= 11) {
      try {
        const raw = await AsyncStorage.getItem(RECENT_BENEFICIARIES_KEY);
        const all: Beneficiary[] = raw ? JSON.parse(raw) : [];
        const entry: Beneficiary = { name: phone, phone, network };
        // Deduplicate by phone number and move to front
        const filtered = all.filter(b => b.phone !== phone);
        const updated = [entry, ...filtered].slice(0, MAX_RECENT * 4); // keep a larger pool across networks
        await AsyncStorage.setItem(RECENT_BENEFICIARIES_KEY, JSON.stringify(updated));
      } catch {}
    }
    onProceed({ serviceLabel, network, phone, amount, plan: plan ?? undefined, meterType });
  };

  // Pick from device contacts
  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Allow contacts access to pick a number from your contacts.');
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });
    if (!data.length) {
      Alert.alert('No Contacts', 'No contacts found on this device.');
      return;
    }
    // Build a simple picker list (show a modal with contacts)
    setContactsList(data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0));
    setContactsModalVisible(true);
  };

  const [contactsList, setContactsList] = useState<Contacts.Contact[]>([]);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);

  const selectContact = (contact: Contacts.Contact) => {
    const raw = contact.phoneNumbers?.[0]?.number ?? '';
    // Normalize: remove spaces, dashes, plus prefix
    const normalized = raw.replace(/[\s\-]/g, '').replace(/^\+234/, '0').slice(0, 11);
    setPhone(normalized);
    setContactsModalVisible(false);
  };

  const canProceed = isElectricity
    ? phone.length >= 11 && amount.length > 0
    : isData
      ? phone.length >= 11 && !!plan
      : phone.length >= 11 && amount.length > 0;

  const handleProceed = () => saveAndProceed();

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>{label}</Text>
      {children}
    </View>
  );

  const inputSt: object = {
    backgroundColor: C.inputBg, borderRadius: 14, height: 52,
    paddingHorizontal: 16, fontFamily: C.regular, fontSize: 15, color: C.text,
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* Blue header — primaryDark + hex watermark for Airtime/Data */}
      <View style={{
        backgroundColor: isAirtime || isData ? C.primaryDark : C.primary,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
        paddingBottom: 88, paddingHorizontal: 20,
      }}>
        {(isAirtime || isData) && (
          <Image source={require('../assets/images/design-b/logo-hex.png')}
            style={{ position: 'absolute', right: 12, bottom: 0, width: 160, height: 160, opacity: 0.12 }}
            resizeMode="contain" />
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8, flex: 1 }}>
            {network} {serviceLabel}
          </Text>
          {/* Network badge — coloured fallback when logo was absent at build time */}
          {telecomMeta && telecomMeta.logo !== NO_LOGO ? (
            <Image source={telecomMeta.logo}
              style={{ width: 40, height: 40, borderRadius: 20 }} resizeMode="cover" />
          ) : (
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: telecomMeta ? telecomMeta.color : 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: C.bold, fontSize: 10, color: telecomMeta ? telecomMeta.textColor : '#fff' }}>
                {(telecomMeta?.initial ?? network).slice(0, 4)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Card pulled up over blue */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          backgroundColor: C.card, borderRadius: 24, padding: 24,
          marginTop: -20, marginBottom: 24,
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4,
        }}>

          {/* Phone / Meter number */}
          <Row label={isElectricity ? 'Meter Number' : 'Phone Number'}>
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  value={phone} onChangeText={setPhone}
                  placeholder={isElectricity ? 'Enter meter number' : '080 XXXX XXXX'}
                  placeholderTextColor={C.label}
                  keyboardType={isElectricity ? 'numeric' : 'phone-pad'}
                  maxLength={isElectricity ? 13 : 11}
                  style={[inputSt, { flex: 1 }]}
                />
                {showBeneficiaries && (
                  <Pressable
                    onPress={pickContact}
                    style={({ pressed }) => [{
                      width: 52, height: 52, borderRadius: 14,
                      backgroundColor: C.primaryLight,
                      alignItems: 'center', justifyContent: 'center',
                      opacity: pressed ? 0.75 : 1,
                    }]}>
                    <Ionicons name="people-outline" size={22} color={C.primary} />
                  </Pressable>
                )}
              </View>

              {/* Recent beneficiaries */}
              {showBeneficiaries && recentBeneficiaries.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontFamily: C.bold, fontSize: 11, color: C.label, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Recent
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                    {recentBeneficiaries.map((b, i) => (
                      <Pressable
                        key={`${b.phone}-${i}`}
                        onPress={() => { Haptics.selectionAsync(); setPhone(b.phone); }}
                        style={({ pressed }) => [{
                          alignItems: 'center', marginHorizontal: 4,
                          opacity: pressed ? 0.7 : 1,
                        }]}>
                        <View style={{
                          width: 48, height: 48, borderRadius: 24,
                          backgroundColor: phone === b.phone ? C.primary : C.primaryLight,
                          alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                        }}>
                          <Ionicons name="person-outline" size={20}
                            color={phone === b.phone ? '#fff' : C.primary} />
                        </View>
                        <Text style={{ fontFamily: C.regular, fontSize: 10, color: C.subtext, maxWidth: 64, textAlign: 'center' }}
                          numberOfLines={1}>
                          {b.phone.length > 7 ? b.phone.slice(0, 4) + '…' + b.phone.slice(-4) : b.phone}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          </Row>

          {/* Contacts picker modal */}
          <Modal visible={contactsModalVisible} transparent animationType="slide" onRequestClose={() => setContactsModalVisible(false)}>
            <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.48)' }} onPress={() => setContactsModalVisible(false)} />
            <View style={{
              backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28,
              paddingTop: 14, paddingHorizontal: 20, paddingBottom: 32, maxHeight: '70%',
            }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 }} />
              <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text, marginBottom: 14 }}>Pick a Contact</Text>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {contactsList.map((c, i) => {
                  const num = c.phoneNumbers?.[0]?.number ?? '';
                  return (
                    <Pressable key={i} onPress={() => selectContact(c)}
                      style={({ pressed }) => [{
                        flexDirection: 'row', alignItems: 'center',
                        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.divider,
                        opacity: pressed ? 0.7 : 1,
                      }]}>
                      <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 14,
                      }}>
                        <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.primary }}>
                          {(c.name ?? '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text }}>{c.name}</Text>
                        <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 1 }}>{num}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </Modal>

          {/* AIRTIME: quick amounts + custom */}
          {isAirtime && (
            <Row label="Amount">
              <>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {AIRTIME_QUICK.map(q => {
                    const raw = q.replace('₦', '').replace(',', '');
                    const active = amount === raw;
                    return (
                      <Pressable key={q}
                        onPress={() => { Haptics.selectionAsync(); setAmount(raw); }}
                        style={({ pressed }) => [{
                          paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                          backgroundColor: active ? C.primary : C.inputBg,
                          opacity: pressed ? 0.75 : 1,
                        }]}>
                        <Text style={{ fontFamily: C.bold, fontSize: 13, color: active ? '#fff' : C.primary }}>{q}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <TextInput
                  value={amount} onChangeText={t => { setAmount(t.replace(/\D/g, '')); }}
                  placeholder="Or enter custom amount (₦)"
                  placeholderTextColor={C.label}
                  keyboardType="numeric"
                  style={inputSt}
                />
              </>
            </Row>
          )}

          {/* DATA: plan list */}
          {isData && (
            <Row label="Select Data Plan">
              <>
                {plans.map(p => {
                  const key = `${p.size}/${p.validity}`;
                  const active = plan === key;
                  return (
                    <Pressable key={key} onPress={() => { Haptics.selectionAsync(); setPlan(key); }}
                      style={({ pressed }) => [{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                        backgroundColor: active ? '#eaf0ff' : C.inputBg,
                        borderRadius: 14, padding: 16, marginBottom: 10,
                        borderWidth: active ? 1.5 : 0, borderColor: C.primary,
                        opacity: pressed ? 0.8 : 1,
                      }]}>
                      <View>
                        <Text style={{ fontFamily: C.bold, fontSize: 16, color: C.text }}>{p.size}</Text>
                        <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 2 }}>{p.validity}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontFamily: C.bold, fontSize: 16, color: C.primary }}>{p.price}</Text>
                        {active && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
                      </View>
                    </Pressable>
                  );
                })}
              </>
            </Row>
          )}

          {/* ELECTRICITY: amount + meter type */}
          {isElectricity && (
            <>
              <Row label="Amount (₦)">
                <TextInput
                  value={amount} onChangeText={t => setAmount(t.replace(/\D/g, ''))}
                  placeholder="Enter amount"
                  placeholderTextColor={C.label}
                  keyboardType="numeric"
                  style={inputSt}
                />
              </Row>
              <Row label="Meter Type">
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {(['Prepaid', 'Postpaid'] as const).map(mt => {
                    const active = meterType === mt;
                    return (
                      <Pressable key={mt} onPress={() => setMeterType(mt)}
                        style={[{
                          flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
                          backgroundColor: active ? C.primary : C.inputBg,
                        }]}>
                        <Text style={{ fontFamily: C.bold, fontSize: 14, color: active ? '#fff' : C.subtext }}>{mt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Row>
            </>
          )}

          <Btn label="Proceed" onPress={handleProceed} disabled={!canProceed} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── 5c. Cable TV screens ─────────────────────────────────────────────────────
function TVPickerScreen({ onBack, onSelect }: {
  onBack: () => void;
  onSelect: (providerId: string, providerLabel: string) => void;
}) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={{
        backgroundColor: C.primaryDark,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
        paddingBottom: 88, paddingHorizontal: 20,
      }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8 }}>Cable TV Subscription</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal:20, paddingTop:16 }}>
        {TV_PROVIDERS.map(p => (
          <Pressable key={p.id} onPress={() => { Haptics.selectionAsync(); onSelect(p.id, p.label); }}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:C.card,
              borderRadius:18, padding:16, marginBottom:12, opacity:pressed?0.8:1 }]}>
            <View style={{ width:48, height:48, borderRadius:24, backgroundColor:p.color,
              alignItems:'center', justifyContent:'center', marginRight:16 }}>
              <Text style={{ fontFamily:C.bold, fontSize:11, color:p.tc }}>{p.label}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:C.bold, fontSize:16, color:C.text }}>{p.label}</Text>
              <Text style={{ fontFamily:C.regular, fontSize:12, color:C.subtext, marginTop:2 }}>Select a bouquet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.label} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function TVFormScreen({ providerId, providerLabel, onBack, onProceed }: {
  providerId: string; providerLabel: string;
  onBack: () => void;
  onProceed: (smartCard: string, bouquet: string, price: string) => void;
}) {
  const ins = useSafeAreaInsets();
  const [smartCard,  setSmartCard]  = useState('');
  const [bouquet,    setBouquet]    = useState<string | null>(null);
  const [bouquetPx,  setBouquetPx]  = useState('');
  const plans = TV_BOUQUETS[providerId] ?? TV_BOUQUETS['gotv'];
  const prov  = TV_PROVIDERS.find(p => p.id === providerId);

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{ backgroundColor:C.primaryDark,
        paddingTop:ins.top+(Platform.OS==='web'?67:44), paddingBottom:88, paddingHorizontal:20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center', marginBottom:20 }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8, flex:1 }}>{providerLabel} Subscription</Text>
          {prov && <View style={{ width:40, height:40, borderRadius:20, backgroundColor:prov.color,
            alignItems:'center', justifyContent:'center' }}>
            <Text style={{ fontFamily:C.bold, fontSize:9, color:prov.tc }}>{prov.label}</Text>
          </View>}
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:20, paddingTop:0 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:C.card, borderRadius:24, padding:24, marginTop:-20, marginBottom:24,
          shadowColor:'#000', shadowOpacity:0.06, shadowRadius:12, elevation:4 }}>
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>Smart Card / IUC Number</Text>
          <TextInput value={smartCard} onChangeText={setSmartCard}
            placeholder="Enter smart card number" placeholderTextColor={C.label} keyboardType="numeric" maxLength={12}
            style={{ backgroundColor:C.inputBg, borderRadius:14, height:52, paddingHorizontal:16,
              fontFamily:C.regular, fontSize:15, color:C.text, marginBottom:20 }} />
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>Select Bouquet</Text>
          {plans.map(p => {
            const active = bouquet === p.name;
            return (
              <Pressable key={p.name} onPress={() => { Haptics.selectionAsync(); setBouquet(p.name); setBouquetPx(p.price); }}
                style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', justifyContent:'space-between',
                  backgroundColor:active?'#eaf0ff':C.inputBg, borderRadius:14, padding:16, marginBottom:10,
                  borderWidth:active?1.5:0, borderColor:C.primary, opacity:pressed?0.8:1 }]}>
                <Text style={{ fontFamily:C.bold, fontSize:15, color:C.text }}>{p.name}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <Text style={{ fontFamily:C.bold, fontSize:15, color:C.primary }}>{p.price}</Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color={C.primary} />}
                </View>
              </Pressable>
            );
          })}
          <View style={{ height:12 }} />
          <Btn label="Proceed" onPress={() => onProceed(smartCard, bouquet!, bouquetPx)}
            disabled={smartCard.length < 6 || !bouquet} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function BettingFormScreen({ onBack, onProceed }: {
  onBack: () => void;
  onProceed: (provider: string, accountId: string, amount: string) => void;
}) {
  const ins = useSafeAreaInsets();
  const [provider,  setProvider]  = useState<string | null>(null);
  const [accountId, setAccountId] = useState('');
  const [amount,    setAmount]    = useState('');
  const canProceed = !!provider && accountId.length >= 4 && amount.length > 0;
  const inp: object = {
    backgroundColor: C.inputBg, borderRadius: 14, height: 52,
    paddingHorizontal: 16, fontFamily: C.regular, fontSize: 15, color: C.text,
  };
  const selectedProv = BETTING_PROVIDERS.find(p => p.id === provider);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      {/* Dark header */}
      <View style={{ backgroundColor: C.primaryDark,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
        paddingBottom: 88, paddingHorizontal: 20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8, flex: 1 }}>
            {selectedProv ? `${selectedProv.label} Top-Up` : 'Betting Top-Up'}
          </Text>
          {selectedProv && (
            <View style={{ width: 40, height: 40, borderRadius: 20,
              backgroundColor: selectedProv.color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: C.bold, fontSize: 8, color: selectedProv.tc, textAlign: 'center' }}>
                {selectedProv.label.slice(0, 4)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 24, marginTop: -20, marginBottom: 24,
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 }}>

          {/* Provider selection */}
          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 10 }}>
            Select Betting Platform
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
            {BETTING_PROVIDERS.map(p => {
              const active = provider === p.id;
              return (
                <Pressable key={p.id}
                  onPress={() => { Haptics.selectionAsync(); setProvider(p.id); }}
                  style={({ pressed }) => [{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
                    backgroundColor: active ? p.color : C.inputBg,
                    borderWidth: active ? 0 : 1.5, borderColor: C.border,
                    opacity: pressed ? 0.75 : 1,
                  }]}>
                  <Text style={{ fontFamily: C.bold, fontSize: 13,
                    color: active ? p.tc : C.subtext }}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Account / User ID */}
          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>
            Account / User ID
          </Text>
          <TextInput
            value={accountId}
            onChangeText={t => setAccountId(t.replace(/\s/g, ''))}
            placeholder="Enter your betting account ID"
            placeholderTextColor={C.label}
            keyboardType="default"
            autoCapitalize="none"
            style={[inp, { marginBottom: 20 }]}
          />

          {/* Amount */}
          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>
            Amount (₦)
          </Text>
          <TextInput
            value={amount}
            onChangeText={t => setAmount(t.replace(/\D/g, ''))}
            placeholder="Enter amount"
            placeholderTextColor={C.label}
            keyboardType="numeric"
            style={[inp, { marginBottom: 24 }]}
          />

          <Btn label="Proceed"
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onProceed(selectedProv!.label, accountId, amount); }}
            disabled={!canProceed} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
function AddMoneyScreen({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const ins = useSafeAreaInsets();
  const ACCOUNT = { bank:'DRCS Microfinance Bank', name:'John Doe', number:'1234567890' };
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{ backgroundColor:C.primaryDark, paddingTop:ins.top+(Platform.OS==='web'?67:44),
        paddingBottom:88, paddingHorizontal:20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8 }}>Add Money</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:20, paddingTop:0 }}>
        <View style={{ backgroundColor:C.card, borderRadius:24, padding:24, marginTop:-20,
          shadowColor:'#000', shadowOpacity:0.06, shadowRadius:12, elevation:4 }}>
          <Text style={{ fontFamily:C.regular, fontSize:14, color:C.subtext, textAlign:'center', marginBottom:20 }}>
            Transfer to the account below to fund your wallet
          </Text>
          {[
            { label:'Bank Name',    value:ACCOUNT.bank   },
            { label:'Account Name', value:ACCOUNT.name   },
            { label:'Account No.',  value:ACCOUNT.number },
          ].map((r,i) => (
            <View key={r.label}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', paddingVertical:14 }}>
                <Text style={{ fontFamily:C.regular, fontSize:14, color:C.subtext }}>{r.label}</Text>
                <Text style={{ fontFamily:C.bold, fontSize:14, color:C.text }}>{r.value}</Text>
              </View>
              {i < 2 && <View style={{ height:1, backgroundColor:C.divider }} />}
            </View>
          ))}
          <View style={{ height:16 }} />
          <Btn label={copied?'Copied!':'Copy Account Number'} onPress={copy}
            variant={copied?'ghost':'primary'} style={copied?{ backgroundColor:C.success+'22' }:{}} />
          <View style={{ height:10 }} />
          <Btn label="Done" onPress={onDone} variant="outline" />
        </View>
        <View style={{ marginTop:20, padding:16, backgroundColor:C.primaryLight, borderRadius:16 }}>
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.primary, marginBottom:4 }}>Note</Text>
          <Text style={{ fontFamily:C.regular, fontSize:13, color:C.primaryDark, lineHeight:20 }}>
            Your wallet will be credited within minutes after transfer.
            Use your registered phone number as payment reference.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SendToDRCSScreen({ onBack, onProceed }: {
  onBack: () => void;
  onProceed: (payload: { username: string; amount: string; note: string }) => void;
}) {
  const ins = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [amount,   setAmount]   = useState('');
  const [note,     setNote]     = useState('');
  const canProceed = username.length >= 3 && amount.length > 0;
  const inp: object = { backgroundColor:C.inputBg, borderRadius:14, height:52, paddingHorizontal:16,
    fontFamily:C.regular, fontSize:15, color:C.text };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{ backgroundColor:C.primaryDark, paddingTop:ins.top+(Platform.OS==='web'?67:44),
        paddingBottom:88, paddingHorizontal:20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8 }}>Send to DRCS User</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:20, paddingTop:0 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:C.card, borderRadius:24, padding:24, marginTop:-20,
          shadowColor:'#000', shadowOpacity:0.06, shadowRadius:12, elevation:4 }}>
          {[
            { label:'DRCS Username',   val:username, set:setUsername, ph:'Enter username or phone',   kb:'default'  as const },
            { label:'Amount (₦)',       val:amount,   set:(t:string)=>setAmount(t.replace(/\D/g,'')), ph:'Enter amount', kb:'numeric' as const },
            { label:'Note (optional)', val:note,     set:setNote,     ph:'What is this for?',         kb:'default'  as const },
          ].map(f => (
            <View key={f.label} style={{ marginBottom:18 }}>
              <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>{f.label}</Text>
              <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph}
                placeholderTextColor={C.label} keyboardType={f.kb} style={inp} />
            </View>
          ))}
          <Btn label="Proceed" onPress={() => onProceed({ username, amount, note })} disabled={!canProceed} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SendToBankScreen({ onBack, onProceed }: {
  onBack: () => void;
  onProceed: (payload: { accountNo: string; bankName: string; accountName: string; amount: string }) => void;
}) {
  const ins = useSafeAreaInsets();
  const BANKS = ['Access Bank','GTBank','First Bank','Zenith Bank','UBA','Fidelity Bank','Sterling Bank','Kuda Bank','OPay','PalmPay'];
  const [accountNo,   setAccountNo]   = useState('');
  const [bankName,    setBankName]    = useState('');
  const [accountName, setAccountName] = useState('John Doe'); // simulated lookup
  const [amount,      setAmount]      = useState('');
  const [showBanks,   setShowBanks]   = useState(false);
  const canProceed = accountNo.length===10 && bankName && amount.length>0;
  const inp: object = { backgroundColor:C.inputBg, borderRadius:14, height:52, paddingHorizontal:16,
    fontFamily:C.regular, fontSize:15, color:C.text };
  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{ backgroundColor:C.primaryDark, paddingTop:ins.top+(Platform.OS==='web'?67:44),
        paddingBottom:88, paddingHorizontal:20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={onBack} hitSlop={12}><Ionicons name="chevron-back" size={24} color="#fff" /></Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8 }}>Send to Bank</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding:20, paddingTop:0 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor:C.card, borderRadius:24, padding:24, marginTop:-20,
          shadowColor:'#000', shadowOpacity:0.06, shadowRadius:12, elevation:4 }}>
          {/* Account number */}
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>Account Number</Text>
          <TextInput value={accountNo} onChangeText={t => { setAccountNo(t.replace(/\D/g,'').slice(0,10)); }}
            placeholder="10-digit account number" placeholderTextColor={C.label} keyboardType="numeric" style={{ ...inp, marginBottom:18 }} />
          {/* Bank picker */}
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>Bank</Text>
          <Pressable onPress={() => setShowBanks(s=>!s)} style={{ ...inp, justifyContent:'center', marginBottom:showBanks?0:18 }}>
            <Text style={{ fontFamily:C.regular, fontSize:15, color:bankName?C.text:C.label }}>
              {bankName || 'Select bank'}
            </Text>
          </Pressable>
          {showBanks && (
            <View style={{ backgroundColor:C.inputBg, borderRadius:14, marginBottom:18, maxHeight:200, overflow:'hidden' }}>
              <ScrollView nestedScrollEnabled>
                {BANKS.map(b => (
                  <Pressable key={b} onPress={() => { setBankName(b); setShowBanks(false); }}
                    style={({ pressed }) => [{ paddingHorizontal:16, paddingVertical:13,
                      borderBottomWidth:1, borderBottomColor:C.divider, opacity:pressed?0.7:1 }]}>
                    <Text style={{ fontFamily:b===bankName?C.bold:C.regular, fontSize:14, color:C.text }}>{b}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Account name (simulated) */}
          {accountNo.length===10 && bankName ? (
            <View style={{ backgroundColor:'#eafaf1', borderRadius:12, padding:12, marginBottom:18 }}>
              <Text style={{ fontFamily:C.bold, fontSize:13, color:C.success }}>{accountName}</Text>
            </View>
          ) : null}
          {/* Amount */}
          <Text style={{ fontFamily:C.bold, fontSize:13, color:C.subtext, marginBottom:8 }}>Amount (₦)</Text>
          <TextInput value={amount} onChangeText={t => setAmount(t.replace(/\D/g,''))}
            placeholder="Enter amount" placeholderTextColor={C.label} keyboardType="numeric"
            style={{ ...inp, marginBottom:20 }} />
          <Btn label="Proceed" onPress={() => onProceed({ accountNo, bankName, accountName, amount })} disabled={!canProceed} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── 5f. Education picker & form ─────────────────────────────────────────────
const EDUCATION_BODIES = [
  { id: 'waec',   label: 'WAEC',   sub: 'West African Examinations Council',       color: '#003087', tc: '#fff' },
  { id: 'jamb',   label: 'JAMB',   sub: 'Joint Admissions & Matriculation Board',  color: '#2E7D32', tc: '#fff' },
  { id: 'neco',   label: 'NECO',   sub: 'National Examinations Council',           color: '#B71C1C', tc: '#fff' },
  { id: 'nabteb', label: 'NABTEB', sub: 'National Business & Technical Exams',     color: '#E65100', tc: '#fff' },
] as const;

function EducationPickerScreen({ onBack, onSelect }: {
  onBack: () => void;
  onSelect: (id: string, label: string) => void;
}) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />
      <View style={{
        backgroundColor: C.primaryDark,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
        paddingBottom: 88, paddingHorizontal: 20,
      }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8 }}>Select Exam Body</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {EDUCATION_BODIES.map(b => (
          <Pressable key={b.id} onPress={() => { Haptics.selectionAsync(); onSelect(b.id, b.label); }}
            style={({ pressed }) => [{
              flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
              borderRadius: 18, padding: 16, marginBottom: 12, opacity: pressed ? 0.8 : 1,
            }]}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: b.color,
              alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Text style={{ fontFamily: C.bold, fontSize: 11, color: b.tc }}>{b.label}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: C.bold, fontSize: 16, color: C.text }}>{b.label}</Text>
              <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 2 }}>{b.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.label} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function EducationFormScreen({ bodyId, bodyLabel, onBack, onProceed }: {
  bodyId: string; bodyLabel: string;
  onBack: () => void;
  onProceed: (regNo: string, examYear: string, amount: string) => void;
}) {
  const ins = useSafeAreaInsets();
  const [regNo,    setRegNo]    = useState('');
  const [examYear, setExamYear] = useState('2025');
  const [amount,   setAmount]   = useState('');

  const bodyMeta  = EDUCATION_BODIES.find(b => b.id === bodyId);
  const canProceed = regNo.trim().length >= 6 && examYear.length === 4 && amount.length > 0;
  const inp = {
    backgroundColor: C.inputBg, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    fontFamily: C.regular, fontSize: 15, color: C.text, borderWidth: 1, borderColor: C.divider,
  };
  const YEARS = ['2023', '2024', '2025', '2026'];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{
        backgroundColor: C.primaryDark,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44),
        paddingBottom: 88, paddingHorizontal: 20,
      }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Pressable onPress={onBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginLeft: 8, flex: 1 }}>
            {bodyLabel} Payment
          </Text>
          <View style={{ width: 40, height: 40, borderRadius: 12,
            backgroundColor: bodyMeta?.color ?? '#003087',
            alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: C.bold, fontSize: 10, color: bodyMeta?.tc ?? '#fff' }}>{bodyLabel}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 24, marginTop: -20, marginBottom: 24,
          shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 }}>

          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>
            Registration / Candidate Number
          </Text>
          <TextInput value={regNo} onChangeText={setRegNo}
            placeholder="Enter reg / candidate number" placeholderTextColor={C.label}
            autoCapitalize="characters" maxLength={20}
            style={{ ...inp, marginBottom: 18 }} />

          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>Exam Year</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {YEARS.map(y => (
              <Pressable key={y} onPress={() => setExamYear(y)}
                style={({ pressed }) => [{
                  flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
                  backgroundColor: examYear === y ? C.primary : C.inputBg,
                  borderWidth: 1, borderColor: examYear === y ? C.primary : C.divider,
                  opacity: pressed ? 0.8 : 1,
                }]}>
                <Text style={{ fontFamily: C.bold, fontSize: 14,
                  color: examYear === y ? '#fff' : C.text }}>{y}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.subtext, marginBottom: 8 }}>Amount (₦)</Text>
          <TextInput value={amount} onChangeText={t => setAmount(t.replace(/\D/g, ''))}
            placeholder="Enter amount" placeholderTextColor={C.label} keyboardType="numeric"
            style={{ ...inp, marginBottom: 20 }} />

          <Btn label="Proceed" onPress={() => onProceed(regNo.trim(), examYear, amount)} disabled={!canProceed} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function buildEducationReceipt(body: string, regNo: string, examYear: string, amount: string): ReceiptData {
  return {
    status: 'success', type: 'Education',
    amount: `₦${Number(amount).toLocaleString()}`,
    details: [
      { label: 'Exam Body',           value: body },
      { label: 'Reg / Candidate No.', value: regNo },
      { label: 'Exam Year',           value: examYear },
      { label: 'Amount',              value: `₦${Number(amount).toLocaleString()}` },
      { label: 'Transaction No.',     value: makeTxRef() },
      { label: 'Transaction Date',    value: nowStr() },
    ],
  };
}

type ServiceIconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
const SERVICES: { id: string; label: string; Icon: ServiceIconComponent }[] = [
  { id: 'electricity', label: 'Electricity', Icon: ElectricityIcon },
  { id: 'airtime',     label: 'Airtime',     Icon: AirtimeIcon     },
  { id: 'data',        label: 'Data',        Icon: DataIcon        },
  { id: 'tv',          label: 'Cable TV',    Icon: CableTVIcon     },
  { id: 'betting',     label: 'Betting',     Icon: BettingIcon     },
  { id: 'education',   label: 'Education',   Icon: EducationIcon   },
];

const TXS = [
  { id:'1', name:'Electricity',       sub:'AEDC  905 783 9231',  amt:'₦5,000', date:'Today, 08:15 AM',      lbl:'AEDC', bg:'#e8f0ff', fg:'#014dd4' },
  { id:'2', name:'Airtime',           sub:'Glo  0905 783 9231',  amt:'₦500',   date:'Today, 10:42 AM',      lbl:'glo',  bg:'#d4f5e0', fg:'#0d8f47', logo: require('../assets/images/design-b/glo-logo.png') },
  { id:'3', name:'GOTV Subscription', sub:'SmartCard: 9012345',  amt:'₦4,850', date:'Yesterday, 03:30 PM',  lbl:'GOTV', bg:'#fff3e0', fg:'#e67e00' },
  { id:'4', name:'Data Bundle',       sub:'MTN  0812 345 6789',  amt:'₦1,000', date:'Jan. 28 2026 02:14 PM',lbl:'MTN',  bg:'#fff8dc', fg:'#b8860b' },
] as const;

function LoadingOverlay() {
  return (
    <View style={{
      ...StyleFill, backgroundColor: 'rgba(0,0,0,0.48)',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Image source={require('../assets/images/design-b/logo-hex.png')}
        style={{ width: 80, height: 80 }} resizeMode="contain" />
      <ActivityIndicator color="#fff" size="large" style={{ marginTop: 16 }} />
    </View>
  );
}

const StyleFill = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

function HomeTab({
  onShowReceipt, onOpenPicker, onOpenTVPicker, onOpenBetting, onOpenEducationPicker, onShowPin, onShowAddMoney, onShowTransfer,
}: {
  onShowReceipt: (d: ReceiptData) => void;
  onOpenPicker: (svc: string) => void;
  onOpenTVPicker: () => void;
  onOpenBetting: () => void;
  onOpenEducationPicker: () => void;
  onShowPin: () => void;
  onShowAddMoney: () => void;
  onShowTransfer: () => void;
}) {
  const ins = useSafeAreaInsets();
  const [balHidden, setBalHidden] = useState(false);
  const [loading, setLoading] = useState(false);

  const tapService = (id: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (id === 'airtime' || id === 'data' || id === 'electricity') {
      onOpenPicker(label);
    } else if (id === 'tv') {
      onOpenTVPicker();
    } else if (id === 'betting') {
      onOpenBetting();
    } else if (id === 'education') {
      onOpenEducationPicker();
    } else {
      onShowPin();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ position:'absolute', right:-30, bottom:100 }} pointerEvents="none">
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ width:260, height:260, opacity:0.02 }}
          resizeMode="contain" />
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: ins.top + (Platform.OS === 'web' ? 80 : 16),
          paddingBottom: 16,
        }}>
          {/* Avatar */}
          <Image source={require('../assets/images/design-b/avatar.png')}
            style={{ width: 44, height: 44, borderRadius: 22 }} />
          {/* Name */}
          <View style={{ alignItems: 'center' }}>
            {/* Figma: Welcome DM Sans 400 12/15.6; name DM Sans 600 18/23.4 */}
            <Text style={{ fontFamily: C.regular, fontSize: 12, lineHeight: 16, color: C.text }}>Welcome</Text>
            <Text style={{ fontFamily: C.bold, fontSize: 18, lineHeight: 23, color: C.text }}>John Doe</Text>
          </View>
          {/* Bell */}
          <Pressable>
            <View>
              <Ionicons name="notifications-outline" size={26} color={C.text} />
              <View style={{
                position: 'absolute', top: -2, right: -2,
                width: 16, height: 16, borderRadius: 8,
                backgroundColor: C.error, alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontFamily: C.bold, fontSize: 8, color: '#fff' }}>99+</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          {/* Balance card */}
          {/* Figma: balance card r=40, pad 10, fill #014dd4 (wrapper #caddff) */}
          <View style={{ backgroundColor: C.primary, borderRadius: 40, paddingVertical: 20, paddingHorizontal: 22, marginBottom: 14 }}>
            {/* Figma: DM Sans 600 14/18.2 ls -0.28 white */}
            <Text style={{ fontFamily: C.bold, fontSize: 14, lineHeight: 18, letterSpacing: -0.28, color: '#fff', marginBottom: 6 }}>
              Available Balance
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Figma: DM Sans 600 32/41.7 ls -0.64 */}
              <Text style={{ fontFamily: C.bold, fontSize: 32, lineHeight: 42, color: '#fff', letterSpacing: -0.64 }}>
                {balHidden ? '• • • • • •' : '₦30,000.34'}
              </Text>
              <Pressable onPress={() => setBalHidden(h => !h)}>
                <Ionicons name={balHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={22} color="rgba(255,255,255,0.65)" />
              </Pressable>
            </View>
          </View>

          {/* Deposit + Transfer */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {([
              { lbl: 'Deposit',  Icon: DepositIcon,  fn: onShowAddMoney },
              { lbl: 'Transfer', Icon: TransferIcon, fn: onShowTransfer },
            ] as { lbl: string; Icon: ServiceIconComponent; fn: () => void }[]).map(a => (
              <Pressable key={a.lbl} onPress={a.fn}
                style={({ pressed }) => [{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, borderRadius: 28, borderWidth: 1.5, borderColor: C.primary,
                  paddingVertical: 13, opacity: pressed ? 0.75 : 1,
                }]}>
                <a.Icon size={18} color={C.primary} strokeWidth={1.8} />
                <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.primary }}>{a.lbl}</Text>
              </Pressable>
            ))}
          </View>

          {/* Services grid */}
          <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 8, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {SERVICES.map(s => (
                <Pressable key={s.id} onPress={() => tapService(s.id, s.label)}
                  style={({ pressed }) => [{
                    width: '33.33%', alignItems: 'center', paddingVertical: 16,
                    opacity: pressed ? 0.7 : 1,
                  }]}>
                  <View style={{
                    width: 52, height: 52, borderRadius: 16, backgroundColor: C.bg,
                    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                  }}>
                    <s.Icon size={24} color={C.primary} strokeWidth={1.6} />
                  </View>
                  <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.text }}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recent transactions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            {/* Figma: DM Sans 600 16/20.8 ls -0.8 */}
            <Text style={{ fontFamily: C.bold, fontSize: 16, lineHeight: 21, letterSpacing: -0.8, color: C.text }}>Recent Transactions</Text>
            {/* Figma: DM Sans 400 12/15.6 ls -0.6 */}
            <Pressable><Text style={{ fontFamily: C.regular, fontSize: 12, lineHeight: 16, letterSpacing: -0.6, color: C.primary }}>See More</Text></Pressable>
          </View>

          <View style={{ gap: 10 }}>
            {TXS.map(tx => (
              <Pressable key={tx.id}
                onPress={() => onShowReceipt({
                  status: 'success', type: tx.name, amount: tx.amt,
                  details: [
                    { label: 'Bill Type',        value: tx.name },
                    { label: 'Phone',            value: tx.sub  },
                    { label: 'Transaction No.',  value: '1098469208461910' },
                    { label: 'Transaction Date', value: 'Jun 21st, 2026  02:36:34' },
                  ],
                })}
                style={({ pressed }) => [{
                  flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
                  borderRadius: 16, padding: 14, opacity: pressed ? 0.8 : 1,
                }]}>
                {'logo' in tx
                  ? <Image source={(tx as any).logo}
                      style={{ width: 42, height: 42, borderRadius: 12, marginRight: 12 }} resizeMode="cover" />
                  : <View style={{
                      width: 42, height: 42, borderRadius: 12,
                      backgroundColor: tx.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      <Text style={{ fontFamily: C.bold, fontSize: 9, color: tx.fg }}>{tx.lbl}</Text>
                    </View>
                }
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text }}>{tx.name}</Text>
                  <Text style={{ fontFamily: C.regular, fontSize: 11, color: C.subtext, marginTop: 2 }}>{tx.sub}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text }}>{tx.amt}</Text>
                  <Text style={{ fontFamily: C.regular, fontSize: 10, color: C.subtext, marginTop: 2 }}>{tx.date}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {loading && <LoadingOverlay />}
    </View>
  );
}

// ─── 7. Profile tab ───────────────────────────────────────────────────────────
function ProfileTab({ onNavigate }: { onNavigate: (s: DBScreen) => void }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ position:'absolute', right:-30, bottom:80 }} pointerEvents="none">
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ width:260, height:260, opacity:0.02 }}
          resizeMode="contain" />
      </View>
    <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingHorizontal: 20, paddingBottom: 24,
        paddingTop: ins.top + (Platform.OS === 'web' ? 80 : 16),
      }}>
      {/* Figma: header DM Sans 600 20/26 ls -1.0 */}
      <Text style={{ fontFamily: C.bold, fontSize: 20, lineHeight: 26, letterSpacing: -1, color: C.text, textAlign: 'center', marginBottom: 22 }}>
        Profile
      </Text>
      {/* Figma: avatar 130×130; name DM Sans 600 18/23.4; email DM Sans 400 12/15.6 */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image source={require('../assets/images/design-b/avatar.png')}
          style={{ width: 130, height: 130, borderRadius: 65 }} />
        <Text style={{ fontFamily: C.bold, fontSize: 18, lineHeight: 23, color: C.text, marginTop: 16 }}>John Doe</Text>
        <Text style={{ fontFamily: C.regular, fontSize: 12, lineHeight: 16, color: C.text, marginTop: 4 }}>
          johndoe239@gmail.com
        </Text>
      </View>
      <MenuRow icon="person-outline"         label="Profile"          onPress={() => onNavigate('profileSettings')} />
      <MenuRow icon="list-outline"           label="Account Details"  onPress={() => onNavigate('accountDetails')} />
      <MenuRow icon="shield-outline"         label="Security"         onPress={() => onNavigate('security')} />
      <MenuRow icon="people-outline"         label="Referral"         onPress={() => {}} />
      <MenuRow icon="notifications-outline"  label="Notification"     onPress={() => {}} />
      {/* Figma: logout BTN r=40, height 44, fill #fe0d0d */}
      <Btn label="Log Out" onPress={() => {}} variant="danger" style={{ marginTop: 14, minHeight: 44 }} />
    </ScrollView>
    </View>
  );
}

// ─── 8. Profile settings ──────────────────────────────────────────────────────
function ProfileSettingsScreen({ onBack }: { onBack: () => void }) {
  const ins = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: 'John', middleName: '-', lastName: 'Doe',
    email: 'johndoe239@gmail.com', dob: '20/09/2001',
  });
  const fields = [
    { key: 'firstName' as const, label: 'First Name' },
    { key: 'middleName' as const, label: 'Middle Name' },
    { key: 'lastName' as const, label: 'Last Name' },
    { key: 'email' as const, label: 'Email Address' },
    { key: 'dob' as const, label: 'Date of Birth' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16,
      }}>
        <Pressable onPress={onBack}><Ionicons name="chevron-back" size={24} color={C.primary} /></Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Profile Settings</Text>
        <Pressable onPress={() => setEditing(e => !e)}>
          <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.primary }}>{editing ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ position: 'relative' }}>
            <Image source={require('../assets/images/design-b/avatar.png')}
              style={{ width: 96, height: 96, borderRadius: 48 }} />
            {editing && (
              <Pressable style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 32, height: 32, borderRadius: 16, backgroundColor: C.card,
                borderWidth: 1.5, borderColor: C.primary, alignItems: 'center', justifyContent: 'center',
              }}>
                <Ionicons name="camera-outline" size={16} color={C.primary} />
              </Pressable>
            )}
          </View>
        </View>
        {fields.map(f => (
          <View key={f.key} style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.text, marginBottom: 8 }}>{f.label}</Text>
            {editing
              ? <Field placeholder={f.label} value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} />
              : <View style={{ backgroundColor: C.inputBg, borderRadius: 28, minHeight: 52, justifyContent: 'center', paddingHorizontal: 20 }}>
                  <Text style={{ fontFamily: C.regular, fontSize: 15, color: C.subtext }}>{form[f.key]}</Text>
                </View>
            }
          </View>
        ))}
        {editing && <Btn label="Save" onPress={() => setEditing(false)} style={{ marginTop: 8 }} />}
      </ScrollView>
    </View>
  );
}

// ─── 9. Security ──────────────────────────────────────────────────────────────
function SecurityScreen({ onBack }: { onBack: () => void }) {
  const ins = useSafeAreaInsets();
  const [fp, setFp] = useState(true);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16,
      }}>
        <Pressable onPress={onBack} style={{ position: 'absolute', left: 20 }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Settings</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <MenuRow icon="lock-closed-outline"      label="Change Password"      onPress={() => {}} />
        <MenuRow icon="finger-print-outline"     label="Enable Fingerprint"
          right={<Switch value={fp} onValueChange={setFp} trackColor={{ true: C.primary }} thumbColor="#fff" />}
          onPress={() => setFp(f => !f)} />
        <MenuRow icon="shield-checkmark-outline" label="2FA Authentication"   onPress={() => {}} />
      </View>
    </View>
  );
}

// ─── 10. Account details ──────────────────────────────────────────────────────
function AccountDetailsScreen({ onBack }: { onBack: () => void }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16,
      }}>
        <Pressable onPress={onBack} style={{ position: 'absolute', left: 20 }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Account Details</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <MenuRow icon="card-outline"        label="BVN"               onPress={() => {}} />
        <MenuRow icon="id-card-outline"     label="NIN"               onPress={() => {}} />
        <MenuRow icon="scan-circle-outline" label="Face Verification"  onPress={() => {}} />
      </View>
    </View>
  );
}

// ─── 11. Transaction receipt ──────────────────────────────────────────────────
function ReceiptScreen({
  data, onClose, onRetry,
}: { data: ReceiptData; onClose: () => void; onRetry: () => void }) {
  const ins = useSafeAreaInsets();
  const ok = data.status === 'success';
  return (
    <View style={{ flex: 1, backgroundColor: C.primaryDark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      {/* Watermark hexagon */}
      <Image source={require('../assets/images/design-b/logo-hex.png')}
        style={{ position: 'absolute', right: 20, top: ins.top + 30, width: 140, height: 140, opacity: 0.1 }}
        resizeMode="contain" />
      {/* Status */}
      <View style={{ alignItems: 'center', paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44), paddingBottom: 32 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          backgroundColor: ok ? C.success : C.error,
          alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}>
          <Ionicons name={ok ? 'checkmark' : 'close'} size={34} color="#fff" />
        </View>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginBottom: 8 }}>
          {ok ? 'Transaction Successful' : 'Transaction Failed'}
        </Text>
        <Text style={{ fontFamily: C.bold, fontSize: 34, color: '#fff' }}>{data.amount}</Text>
      </View>
      {/* White receipt */}
      <View style={{
        flex: 1, backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 28,
      }}>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text, textAlign: 'center', marginBottom: 22 }}>
          Transaction Details
        </Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {data.details.map((row, i) => (
            <View key={i}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13 }}>
                <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>{row.label}</Text>
                <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text, maxWidth: '58%', textAlign: 'right' }}>
                  {row.value}
                </Text>
              </View>
              {i < data.details.length - 1 && <View style={{ height: 1, backgroundColor: C.divider }} />}
            </View>
          ))}
        </ScrollView>

        <View style={{ marginTop: 16 }}>
          {ok ? (
            <>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                {[{ icon: 'download-outline', lbl: 'Download Receipt' }, { icon: 'share-outline', lbl: 'Share Receipt' }].map(b => (
                  <Pressable key={b.lbl}
                    style={({ pressed }) => [{
                      flex: 1, flexDirection: 'row', gap: 6,
                      borderWidth: 1.5, borderColor: C.primary, borderRadius: 28,
                      paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
                      opacity: pressed ? 0.75 : 1,
                    }]}>
                    <Ionicons name={b.icon as any} size={16} color={C.primary} />
                    <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.primary }}>{b.lbl}</Text>
                  </Pressable>
                ))}
              </View>
              <Btn label="Complete" onPress={onClose} variant="ghost" style={{ backgroundColor: C.bg }} />
            </>
          ) : (
            <Btn label="Try Again" onPress={onRetry} />
          )}
        </View>
        <View style={{ height: Math.max(ins.bottom, 8) + (Platform.OS === 'web' ? 16 : 0) }} />
      </View>
    </View>
  );
}

// ─── 12. Placeholder tabs ─────────────────────────────────────────────────────
function PlaceholderTab({ label }: { label: string }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingTop: ins.top }}>
      <Ionicons name="construct-outline" size={52} color={C.primaryLight} />
      <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.subtext, marginTop: 16 }}>{label}</Text>
      <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.label, marginTop: 6 }}>Coming soon</Text>
    </View>
  );
}

// ─── Receipt builder from FormPayload ────────────────────────────────────────
function buildReceipt(tx: FormPayload): ReceiptData {
  const txNo = Math.floor(Math.random() * 9e15).toString().slice(0, 16);
  const now  = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
    + '  ' + now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  if (tx.serviceLabel === 'Airtime') {
    return {
      status: 'success', type: 'Airtime',
      amount: `₦${Number(tx.amount).toLocaleString()}`,
      details: [
        { label: 'Bill Type',        value: `${tx.network} Airtime` },
        { label: 'Recipient Mobile', value: tx.phone },
        { label: 'Amount',           value: `₦${Number(tx.amount).toLocaleString()}` },
        { label: 'Transaction No.',  value: txNo },
        { label: 'Transaction Date', value: dateStr },
      ],
    };
  }
  if (tx.serviceLabel === 'Data') {
    const [size, validity] = (tx.plan ?? '').split('/');
    const planMeta = (DATA_PLANS[tx.network] ?? DATA_PLANS['MTN']).find(
      p => `${p.size}/${p.validity}` === tx.plan
    );
    return {
      status: 'success', type: 'Data',
      amount: planMeta?.price ?? tx.plan ?? '',
      details: [
        { label: 'Bill Type',        value: `${tx.network} Data` },
        { label: 'Recipient Mobile', value: tx.phone },
        { label: 'Data Bundle',      value: size?.trim() ?? '' },
        { label: 'Validity',         value: validity?.trim() ?? '' },
        { label: 'Transaction No.',  value: txNo },
        { label: 'Transaction Date', value: dateStr },
      ],
    };
  }
  // Electricity
  return {
    status: 'success', type: 'Electricity',
    amount: `₦${Number(tx.amount).toLocaleString()}`,
    details: [
      { label: 'Bill Type',        value: `${tx.network} Electricity` },
      { label: 'Meter Number',     value: tx.phone },
      { label: 'Meter Type',       value: tx.meterType ?? 'Prepaid' },
      { label: 'Amount',           value: `₦${Number(tx.amount).toLocaleString()}` },
      { label: 'Transaction No.',  value: txNo },
      { label: 'Transaction Date', value: dateStr },
    ],
  };
}

// ─── Extra receipt builders ───────────────────────────────────────────────────
function makeTxRef() { return Math.floor(Math.random()*9e15).toString().slice(0,16); }
function nowStr() {
  const n = new Date();
  return n.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
    + '  ' + n.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}

function buildTVReceipt(provider: string, smartCard: string, bouquet: string, price: string): ReceiptData {
  return { status:'success', type:'Cable TV', amount:price,
    details:[
      { label:'Provider',         value:provider  },
      { label:'Smart Card / IUC', value:smartCard  },
      { label:'Bouquet',          value:bouquet    },
      { label:'Amount',           value:price      },
      { label:'Transaction No.',  value:makeTxRef()},
      { label:'Transaction Date', value:nowStr()   },
    ],
  };
}
function buildDRCSReceipt(username: string, amount: string, note: string): ReceiptData {
  const fmt = `₦${Number(amount).toLocaleString()}`;
  return { status:'success', type:'Transfer', amount:fmt,
    details:[
      { label:'Transfer Type',    value:'DRCS User'  },
      { label:'Recipient',        value:`@${username}` },
      { label:'Amount',           value:fmt           },
      { label:'Note',             value:note||'—'    },
      { label:'Transaction No.',  value:makeTxRef()  },
      { label:'Transaction Date', value:nowStr()     },
    ],
  };
}
function buildBankReceipt(accountNo: string, bankName: string, accountName: string, amount: string): ReceiptData {
  const fmt = `₦${Number(amount).toLocaleString()}`;
  return { status:'success', type:'Bank Transfer', amount:fmt,
    details:[
      { label:'Transfer Type',    value:'Bank Transfer' },
      { label:'Account Name',     value:accountName     },
      { label:'Account Number',   value:accountNo       },
      { label:'Bank',             value:bankName        },
      { label:'Amount',           value:fmt             },
      { label:'Transaction No.',  value:makeTxRef()     },
      { label:'Transaction Date', value:nowStr()        },
    ],
  };
}

function buildBettingReceipt(provider: string, accountId: string, amount: string): ReceiptData {
  const fmt = `₦${Number(amount).toLocaleString()}`;
  return { status:'success', type:'Betting Top-Up', amount:fmt,
    details:[
      { label:'Platform',         value:provider       },
      { label:'Account / User ID',value:accountId      },
      { label:'Amount',           value:fmt            },
      { label:'Transaction No.',  value:makeTxRef()    },
      { label:'Transaction Date', value:nowStr()       },
    ],
  };
}
type BPending =
  | { kind:'service';   payload: FormPayload }
  | { kind:'tv';        provider:string; smartCard:string; bouquet:string; price:string }
  | { kind:'education'; body:string; regNo:string; examYear:string; amount:string }
  | { kind:'drcs';      username:string; amount:string; note:string }
  | { kind:'bank';      accountNo:string; bankName:string; accountName:string; amount:string }
  | { kind:'betting';   provider:string; accountId:string; amount:string };

function MainApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const ins = useSafeAreaInsets();
  const [tab,             setTab]             = useState<HomeTab>('Home');
  const [subScreen,       setSubScreen]       = useState<DBScreen | null>(null);
  const [receipt,         setReceipt]         = useState<ReceiptData | null>(null);
  const [pinOpen,         setPinOpen]         = useState(false);
  const [pending,         setPending]         = useState<BPending | null>(null);

  // Service (Airtime/Data/Electricity) flow
  const [picker,          setPicker]          = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // TV flow
  const [tvPicker,        setTvPicker]        = useState(false);
  const [tvProvider,      setTvProvider]      = useState<{id:string;label:string}|null>(null);

  // Education flow
  const [educationPicker, setEducationPicker] = useState(false);
  const [educationBody,   setEducationBody]   = useState<{id:string;label:string}|null>(null);

  // Betting flow
  const [bettingForm,     setBettingForm]     = useState(false);

  // Money flows
  const [addMoney,        setAddMoney]        = useState(false);
  const [transferPicker,  setTransferPicker]  = useState(false);
  const [sendToDRCS,      setSendToDRCS]      = useState(false);
  const [sendToBank,      setSendToBank]      = useState(false);

  const goSub = useCallback((s: DBScreen) => setSubScreen(s), []);

  const openPin = (p: BPending) => { setPending(p); setPinOpen(true); };
  const [processing, setProcessing] = useState(false);

  const handlePinSubmit = () => {
    setPinOpen(false);
    const p = pending; setPending(null);
    if (!p) return;
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      if (p.kind==='service')        setReceipt(buildReceipt(p.payload));
      else if (p.kind==='tv')        setReceipt(buildTVReceipt(p.provider, p.smartCard, p.bouquet, p.price));
      else if (p.kind==='education') setReceipt(buildEducationReceipt(p.body, p.regNo, p.examYear, p.amount));
      else if (p.kind==='drcs')      setReceipt(buildDRCSReceipt(p.username, p.amount, p.note));
      else if (p.kind==='bank')      setReceipt(buildBankReceipt(p.accountNo, p.bankName, p.accountName, p.amount));
      else if (p.kind==='betting')   setReceipt(buildBettingReceipt(p.provider, p.accountId, p.amount));
    }, 1600);
  };

  // Sub-screens
  if (subScreen==='profileSettings') return <ProfileSettingsScreen onBack={() => setSubScreen(null)} />;
  if (subScreen==='security')        return <SecurityScreen        onBack={() => setSubScreen(null)} />;
  if (subScreen==='accountDetails')  return <AccountDetailsScreen  onBack={() => setSubScreen(null)} />;

  // Telecom service flows
  if (picker && !selectedNetwork)
    return <TelecomPicker serviceLabel={picker} onBack={() => setPicker(null)}
              onSelect={n => setSelectedNetwork(n)} />;
  if (picker && selectedNetwork)
    return <ServiceFormScreen serviceLabel={picker} network={selectedNetwork}
              onBack={() => setSelectedNetwork(null)}
              onProceed={payload => { setSelectedNetwork(null); setPicker(null);
                openPin({ kind:'service', payload }); }} />;

  // TV flows
  if (tvPicker && !tvProvider)
    return <TVPickerScreen onBack={() => setTvPicker(false)}
              onSelect={(id,label) => setTvProvider({id,label})} />;
  if (tvPicker && tvProvider)
    return <TVFormScreen providerId={tvProvider.id} providerLabel={tvProvider.label}
              onBack={() => setTvProvider(null)}
              onProceed={(sc,bq,px) => { setTvProvider(null); setTvPicker(false);
                openPin({ kind:'tv', provider:tvProvider.label, smartCard:sc, bouquet:bq, price:px }); }} />;

  // Education flows
  if (educationPicker && !educationBody)
    return <EducationPickerScreen onBack={() => setEducationPicker(false)}
              onSelect={(id,label) => setEducationBody({id,label})} />;
  if (educationPicker && educationBody)
    return <EducationFormScreen bodyId={educationBody.id} bodyLabel={educationBody.label}
              onBack={() => setEducationBody(null)}
              onProceed={(regNo,examYear,amount) => {
                const b = educationBody;
                setEducationBody(null); setEducationPicker(false);
                openPin({ kind:'education', body:b.label, regNo, examYear, amount });
              }} />;

  // Betting flow
  if (bettingForm)
    return <BettingFormScreen onBack={() => setBettingForm(false)}
              onProceed={(prov, acId, amt) => { setBettingForm(false);
                openPin({ kind:'betting', provider:prov, accountId:acId, amount:amt }); }} />;

  // Money flows
  if (addMoney) return <AddMoneyScreen onBack={() => setAddMoney(false)} onDone={() => setAddMoney(false)} />;

  if (transferPicker) return (
    <View style={{ flex:1, backgroundColor:C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      <View style={{ backgroundColor:C.primaryDark,
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 44), paddingBottom:88, paddingHorizontal:20 }}>
        <Image source={require('../assets/images/design-b/logo-hex.png')}
          style={{ position:'absolute', right:12, bottom:0, width:160, height:160, opacity:0.12 }}
          resizeMode="contain" />
        <View style={{ flexDirection:'row', alignItems:'center' }}>
          <Pressable onPress={() => setTransferPicker(false)} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </Pressable>
          <Text style={{ fontFamily:C.bold, fontSize:18, color:'#fff', marginLeft:8 }}>Transfer Money</Text>
        </View>
      </View>
      <View style={{ paddingHorizontal:20, paddingTop:20, gap:14 }}>
        {[
          { label:'To DRCS User', icon:'person-outline' as const, sub:'Send to any DRCS account',  fn:() => { setTransferPicker(false); setSendToDRCS(true); } },
          { label:'To Bank',      icon:'business-outline' as const, sub:'Send to any Nigerian bank', fn:() => { setTransferPicker(false); setSendToBank(true); } },
        ].map(o => (
          <Pressable key={o.label} onPress={o.fn}
            style={({ pressed }) => [{ flexDirection:'row', alignItems:'center', backgroundColor:C.card,
              borderRadius:18, padding:18, opacity:pressed?0.8:1 }]}>
            <View style={{ width:48, height:48, borderRadius:24, backgroundColor:C.primaryLight,
              alignItems:'center', justifyContent:'center', marginRight:16 }}>
              <Ionicons name={o.icon} size={22} color={C.primary} />
            </View>
            <View style={{ flex:1 }}>
              <Text style={{ fontFamily:C.bold, fontSize:16, color:C.text }}>{o.label}</Text>
              <Text style={{ fontFamily:C.regular, fontSize:12, color:C.subtext, marginTop:2 }}>{o.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.label} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (sendToDRCS) return <SendToDRCSScreen onBack={() => setSendToDRCS(false)}
    onProceed={p => { setSendToDRCS(false); openPin({ kind:'drcs', ...p }); }} />;
  if (sendToBank) return <SendToBankScreen onBack={() => setSendToBank(false)}
    onProceed={p => { setSendToBank(false); openPin({ kind:'bank', ...p }); }} />;

  // Receipt
  if (receipt) return (
    <ReceiptScreen data={receipt} onClose={() => setReceipt(null)} onRetry={() => setReceipt(null)} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <Pressable onPress={onSwitchDesign} style={{
        position:'absolute', top:Platform.OS==='web'?76:52, right:16, zIndex:99,
        backgroundColor:C.primary, borderRadius:14, paddingHorizontal:11, paddingVertical:5,
      }}>
        <Text style={{ fontFamily:C.bold, fontSize:11, color:'#fff', letterSpacing:0.5 }}>A ↔ B</Text>
      </Pressable>
      <View style={{ flex: 1 }}>
        {tab==='Home' && (
          <HomeTab
            onShowReceipt={setReceipt}
            onOpenPicker={svc => setPicker(svc)}
            onOpenTVPicker={() => setTvPicker(true)}
            onOpenBetting={() => setBettingForm(true)}
            onOpenEducationPicker={() => setEducationPicker(true)}
            onShowPin={() => setPinOpen(true)}
            onShowAddMoney={() => setAddMoney(true)}
            onShowTransfer={() => setTransferPicker(true)}
          />
        )}
        {tab==='Rewards' && <PlaceholderTab label="Rewards" />}
        {tab==='History' && <PlaceholderTab label="History" />}
        {tab==='Cards'   && <PlaceholderTab label="Cards"   />}
        {tab==='Profile' && <ProfileTab onNavigate={goSub} />}
      </View>
      <BottomNav active={tab} onSelect={t => { Haptics.selectionAsync(); setTab(t); setSubScreen(null); }} />
      <PinModal visible={pinOpen}
        onClose={() => { setPinOpen(false); setPending(null); }}
        onSubmit={handlePinSubmit} />
      {processing && <LoadingOverlay />}
    </View>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type Flow = 'splash'|'onboarding'|'login'|'signup'|'app';

export function DesignBApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const [flow, setFlow] = useState<Flow>('splash');
  return (
    <>
      {flow === 'splash'     && <SplashScreen    onDone={() => setFlow('onboarding')} />}
      {flow === 'onboarding' && <OnboardingScreen onDone={() => setFlow('login')} />}
      {flow === 'login'      && <LoginScreen  onLogin={() => setFlow('app')} onGoSignup={() => setFlow('signup')} />}
      {flow === 'signup'     && <SignUpScreen  onSignup={() => setFlow('app')} onGoLogin={() => setFlow('login')} />}
      {flow === 'app'        && <MainApp onSwitchDesign={onSwitchDesign} />}
    </>
  );
}
