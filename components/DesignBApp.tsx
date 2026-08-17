/**
 * Design B — Complete Figma implementation
 * Palette: primary=#014dd4  bg=#f1f7ff  text=#17000e  font=DM Sans
 * Screens: Splash → Onboarding → Login/SignUp → Home → Profile → Settings → Receipt
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
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

const { width: W, height: H } = Dimensions.get('window');

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  primary:      '#014dd4',
  primaryLight: '#c9ddff',
  primaryDark:  '#013aab',
  bg:           '#f1f7ff',
  text:         '#17000e',
  subtext:      '#636e88',
  label:        '#8a95a8',
  card:         '#ffffff',
  border:       '#dde5f5',
  inputBg:      '#f0f4fc',
  success:      '#22c55e',
  successBg:    '#dcfce7',
  error:        '#ef4444',
  errorBg:      '#fee2e2',
  logoutRed:    '#fe0d0d',
  divider:      '#eef2fb',
  bold:         'DMSans_600SemiBold',
  regular:      'DMSans_400Regular',
} as const;

// ─── Types ─────────────────────────────────────────────────────────────────
type DBScreen =
  | 'splash' | 'onboarding' | 'login' | 'signup'
  | 'home' | 'profile' | 'profileSettings'
  | 'accountDetails' | 'security' | 'receipt';

type HomeTab = 'Home' | 'Rewards' | 'History' | 'Cards' | 'Profile';

interface ReceiptData {
  status: 'success' | 'failed';
  type: string;
  amount: string;
  details: { label: string; value: string }[];
}

// ─── Shared primitives ──────────────────────────────────────────────────────
function Btn({
  label, onPress, variant = 'primary', style,
}: { label: string; onPress: () => void; variant?: 'primary' | 'outline' | 'ghost' | 'danger'; style?: object }) {
  const bg = variant === 'primary' ? C.primary
    : variant === 'danger' ? C.logoutRed
    : 'transparent';
  const textColor = variant === 'primary' || variant === 'danger' ? '#fff'
    : variant === 'outline' ? C.primary : C.subtext;
  const border = variant === 'outline' ? { borderWidth: 1.5, borderColor: C.primary } : {};
  return (
    <Pressable
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      style={({ pressed }) => [{
        backgroundColor: bg, borderRadius: 28, minHeight: 52,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
        opacity: pressed ? 0.82 : 1, ...border, ...style,
      }]}
    >
      <Text style={{ fontFamily: C.bold, fontSize: 16, color: textColor }}>{label}</Text>
    </Pressable>
  );
}

function InputField({
  placeholder, value, onChangeText, secureTextEntry = false, keyboardType = 'default',
}: { placeholder: string; value: string; onChangeText: (v: string) => void; secureTextEntry?: boolean; keyboardType?: any }) {
  const [show, setShow] = useState(false);
  return (
    <View style={{ position: 'relative' }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !show}
        keyboardType={keyboardType}
        style={{
          backgroundColor: C.inputBg, borderRadius: 28, minHeight: 52,
          paddingHorizontal: 20, paddingRight: secureTextEntry ? 50 : 20,
          fontFamily: C.regular, fontSize: 15, color: C.text, width: '100%',
        }}
      />
      {secureTextEntry && (
        <Pressable onPress={() => setShow(s => !s)} style={{ position: 'absolute', right: 18, top: 15 }}>
          <Ionicons name={show ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.label} />
        </Pressable>
      )}
    </View>
  );
}

function SettingsRow({
  icon, label, onPress, rightElement, showBorder = true,
}: { icon: string; label: string; onPress?: () => void; rightElement?: React.ReactNode; showBorder?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18,
        marginBottom: 10, opacity: pressed ? 0.8 : 1,
      }]}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        <Ionicons name={icon as any} size={18} color={C.primary} />
      </View>
      <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.text, flex: 1 }}>{label}</Text>
      {rightElement ?? <Ionicons name="chevron-forward" size={18} color={C.subtext} />}
    </Pressable>
  );
}

// ─── Bottom nav ─────────────────────────────────────────────────────────────
function BottomNav({ active, onSelect }: { active: HomeTab; onSelect: (t: HomeTab) => void }) {
  const insets = useSafeAreaInsets();
  const tabs: { id: HomeTab; icon: string; iconActive: string; label: string }[] = [
    { id: 'Home',    icon: 'home-outline',          iconActive: 'home',          label: 'Home' },
    { id: 'Rewards', icon: 'diamond-outline',        iconActive: 'diamond',       label: 'Rewards' },
    { id: 'History', icon: 'stats-chart-outline',    iconActive: 'stats-chart',   label: 'History' },
    { id: 'Cards',   icon: 'card-outline',           iconActive: 'card',          label: 'Cards' },
    { id: 'Profile', icon: 'person-circle-outline',  iconActive: 'person-circle', label: 'Profile' },
  ];
  return (
    <View style={{
      flexDirection: 'row', backgroundColor: C.card,
      paddingBottom: Math.max(insets.bottom, 8) + (Platform.OS === 'web' ? 10 : 0),
      paddingTop: 10, paddingHorizontal: 8,
      borderTopWidth: 1, borderTopColor: C.border,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <Pressable key={t.id} onPress={() => onSelect(t.id)} style={{ flex: 1, alignItems: 'center' }}>
            <View style={{
              width: 44, height: 34, borderRadius: 12,
              backgroundColor: isActive ? C.primary : 'transparent',
              alignItems: 'center', justifyContent: 'center', marginBottom: 3,
            }}>
              <Ionicons name={isActive ? t.iconActive as any : t.icon as any} size={20} color={isActive ? '#fff' : C.subtext} />
            </View>
            <Text style={{ fontFamily: C.regular, fontSize: 10, color: isActive ? C.primary : C.subtext }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── 1. Splash ───────────────────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={{
        width: 120, height: 120, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center', marginBottom: 18,
      }}>
        <Image source={require('../assets/images/logo-icon.png')} style={{ width: 72, height: 72 }} resizeMode="contain" />
      </View>
      <Text style={{ fontFamily: C.regular, fontSize: 22, color: '#fff', letterSpacing: 3 }}>DRCSDATA</Text>
    </View>
  );
}

// ─── 2. Onboarding ──────────────────────────────────────────────────────────
const ONBOARD_SLIDES = [
  {
    image: require('../assets/images/design-b/onboard1.png'),
    title: 'Pay Bills Without\nStress',
    description: 'Pay your bills fast, reliable, and available whenever you need it',
    cta: 'Next',
  },
  {
    image: require('../assets/images/design-b/onboard2.png'),
    title: 'Get More\nValue',
    description: 'Pay your bills fast, reliable, and available whenever you need it',
    cta: 'Next',
  },
  {
    image: require('../assets/images/design-b/onboard3.png'),
    title: 'Safe, Instant\nTransaction',
    description: 'Pay your bills fast, reliable, and available whenever you need it',
    cta: 'Next',
  },
  {
    image: require('../assets/images/design-b/onboard4.png'),
    title: 'Earn While your\nRecharge',
    description: 'Pay your bills fast, reliable, and available whenever you need it',
    cta: 'Get Started',
  },
];

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const insets = useSafeAreaInsets();
  const slide = ONBOARD_SLIDES[idx];
  const isLast = idx === ONBOARD_SLIDES.length - 1;

  const next = () => { Haptics.selectionAsync(); isLast ? onDone() : setIdx(i => i + 1); };
  const skip = () => { Haptics.selectionAsync(); onDone(); };

  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {/* Illustration fills top 58% */}
      <View style={{ height: H * 0.58, overflow: 'hidden' }}>
        <Image source={slide.image} style={{ width: W, height: H * 0.58 }} resizeMode="cover" />
        {/* Progress dots overlay */}
        <View style={{ position: 'absolute', bottom: 18, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          {ONBOARD_SLIDES.map((_, i) => (
            <View key={i} style={{
              height: 6, borderRadius: 3,
              backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.35)',
              width: i === idx ? 28 : 8,
            }} />
          ))}
        </View>
      </View>

      {/* White bottom sheet */}
      <View style={{
        flex: 1, backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 28,
        paddingBottom: Math.max(insets.bottom, 18) + (Platform.OS === 'web' ? 20 : 0),
      }}>
        {!isLast && (
          <Pressable onPress={skip} style={{ position: 'absolute', top: 20, right: 24 }}>
            <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>Skip</Text>
          </Pressable>
        )}
        <Text style={{ fontFamily: C.bold, fontSize: 28, color: C.text, lineHeight: 34, marginBottom: 14 }}>{slide.title}</Text>
        <Text style={{ fontFamily: C.regular, fontSize: 15, color: C.subtext, lineHeight: 22, marginBottom: 32 }}>{slide.description}</Text>
        <Btn label={slide.cta} onPress={next} />
      </View>
    </View>
  );
}

// ─── 3. Auth (Login + SignUp) ────────────────────────────────────────────────
function AuthBg({ title, children }: { title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      {/* Blue header */}
      <View style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingHorizontal: 28, paddingBottom: 36 }}>
        <Text style={{ fontFamily: C.bold, fontSize: 34, color: '#fff' }}>{title}</Text>
      </View>
      {/* White sheet */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            paddingHorizontal: 24, paddingTop: 32,
            paddingBottom: Math.max(insets.bottom, 28) + (Platform.OS === 'web' ? 34 : 0),
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function SocialRow() {
  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.subtext }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
        {(['google', 'apple'] as const).map(p => (
          <Pressable key={p} style={({ pressed }) => [{
            width: 52, height: 52, borderRadius: 26, backgroundColor: C.inputBg,
            alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
          }]}>
            <Ionicons name={p === 'google' ? 'logo-google' : 'logo-apple'} size={22} color={C.text} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

function LoginScreen({ onLogin, onGoSignup }: { onLogin: () => void; onGoSignup: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <AuthBg title="Login">
      <View style={{ gap: 12 }}>
        <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable onPress={() => {}} style={{ alignSelf: 'flex-end', marginTop: 2 }}>
          <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.subtext, fontStyle: 'italic' }}>Forget Password</Text>
        </Pressable>
      </View>
      <Btn label="Login" onPress={onLogin} style={{ marginTop: 20 }} />
      <SocialRow />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>New here? </Text>
        <Pressable onPress={onGoSignup}>
          <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.primary }}>Create an account</Text>
        </Pressable>
      </View>
    </AuthBg>
  );
}

function SignUpScreen({ onSignup, onGoLogin }: { onSignup: () => void; onGoLogin: () => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  return (
    <AuthBg title={'Create an\naccount'}>
      <View style={{ gap: 12 }}>
        <InputField placeholder="First Name" value={firstName} onChangeText={setFirstName} />
        <InputField placeholder="Last Name" value={lastName} onChangeText={setLastName} />
        <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <InputField placeholder="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
        <Pressable onPress={() => setAgreed(a => !a)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={{
            width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
            borderColor: agreed ? C.primary : C.border,
            backgroundColor: agreed ? C.primary : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {agreed && <Ionicons name="checkmark" size={13} color="#fff" />}
          </View>
          <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, flex: 1 }}>
            I agree to the <Text style={{ color: C.primary }}>Terms & Conditions</Text> and <Text style={{ color: C.primary }}>Privacy Policy</Text>
          </Text>
        </Pressable>
      </View>
      <Btn label="Create account" onPress={onSignup} style={{ marginTop: 22 }} />
      <SocialRow />
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>Have an account? </Text>
        <Pressable onPress={onGoLogin}>
          <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.primary }}>Login</Text>
        </Pressable>
      </View>
    </AuthBg>
  );
}

// ─── 4. PIN Modal ────────────────────────────────────────────────────────────
function PinModal({ visible, onClose, onSubmit }: { visible: boolean; onClose: () => void; onSubmit: () => void }) {
  const [pin, setPin] = useState('');
  const PAD = ['1','2','3','4','5','6','7','8','9','0','Del'];

  const tap = (k: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (k === 'Del') setPin(p => p.slice(0, -1));
    else if (pin.length < 4) setPin(p => p + k);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
      <View style={{
        backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 28, paddingTop: 16, paddingBottom: 32,
      }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 20 }} />
        <Text style={{ fontFamily: C.bold, fontSize: 20, color: C.text, textAlign: 'center', marginBottom: 24 }}>Input Pin</Text>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 28 }}>
          {[0,1,2,3].map(i => (
            <View key={i} style={{
              width: 54, height: 54, borderRadius: 12, borderWidth: 1.5,
              borderColor: pin.length > i ? C.primary : C.border,
              backgroundColor: pin.length > i ? C.primaryLight : C.inputBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              {pin.length > i && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary }} />}
            </View>
          ))}
        </View>
        {/* Keypad */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {PAD.map((k, idx) => {
            const empty = k === '' ;
            const isDel = k === 'Del';
            return (
              <Pressable key={idx} onPress={() => tap(k)} disabled={empty}
                style={({ pressed }) => [{
                  width: (W - 56 - 24) / 3, height: 60, borderRadius: 14,
                  backgroundColor: isDel ? C.bg : C.inputBg,
                  alignItems: 'center', justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                  ...(idx === 9 ? { marginLeft: (W - 56 - 24) / 3 + 12 } : {}),
                }]}
              >
                <Text style={{ fontFamily: isDel ? C.regular : C.bold, fontSize: isDel ? 14 : 22, color: isDel ? C.subtext : C.text }}>{k}</Text>
              </Pressable>
            );
          })}
        </View>
        <Btn label="Submit" onPress={() => { onSubmit(); setPin(''); }} style={{ marginTop: 24 }} />
      </View>
    </Modal>
  );
}

// ─── 5. Home ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'electricity', label: 'Electricity', icon: 'flash-outline' },
  { id: 'airtime',     label: 'Airtime',     icon: 'phone-portrait-outline' },
  { id: 'data',        label: 'Data',        icon: 'wifi-outline' },
  { id: 'betting',     label: 'Betting',     icon: 'dice-outline' },
  { id: 'water',       label: 'Water',       icon: 'water-outline' },
  { id: 'more',        label: 'More',        icon: 'grid-outline' },
] as const;

const TRANSACTIONS = [
  { id: '1', name: 'Electricity', sub: '905 783 9231', amount: '$30', date: 'Jan. 25 2026  05:34 PM', color: '#e8f0ff', textColor: '#014dd4', label: 'AEDC' },
  { id: '2', name: 'Airtime',     sub: 'Glo  905 783 9231', amount: '$10', date: 'Jan. 25 2026  05:34 PM', color: '#d4f5e0', textColor: '#0d8f47', label: 'glo' },
  { id: '3', name: 'GOTV Subscription', sub: '905 783 9231', amount: '$30', date: 'Jan. 25 2026  05:34 PM', color: '#fff3e0', textColor: '#e67e00', label: 'GOTV' },
];

function HomeTab({
  onShowReceipt, onShowPin,
}: { onShowReceipt: (d: ReceiptData) => void; onShowPin: () => void }) {
  const insets = useSafeAreaInsets();
  const [balanceHidden, setBalanceHidden] = useState(false);

  const openService = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShowPin();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 12 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: insets.top + (Platform.OS === 'web' ? 80 : 16), paddingBottom: 16,
      }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.primaryLight, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={24} color={C.primary} />
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext }}>Welcome</Text>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>John Doe</Text>
        </View>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <View>
            <Ionicons name="notifications-outline" size={26} color={C.text} />
            <View style={{
              position: 'absolute', top: -2, right: -2, width: 14, height: 14,
              borderRadius: 7, backgroundColor: C.error, alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontFamily: C.bold, fontSize: 8, color: '#fff' }}>12</Text>
            </View>
          </View>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Balance card */}
        <View style={{ backgroundColor: C.primary, borderRadius: 24, padding: 22, marginBottom: 14 }}>
          <Text style={{ fontFamily: C.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Available Balance</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: C.bold, fontSize: 32, color: '#fff', letterSpacing: -0.5 }}>
              {balanceHidden ? '••••••' : '$30,000.34'}
            </Text>
            <Pressable onPress={() => setBalanceHidden(h => !h)}>
              <Ionicons name={balanceHidden ? 'eye-outline' : 'eye-off-outline'} size={22} color="rgba(255,255,255,0.7)" />
            </Pressable>
          </View>
        </View>

        {/* Deposit + Transfer */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          {[{ label: 'Deposit', icon: 'arrow-down-circle-outline' }, { label: 'Transfer', icon: 'arrow-forward-circle-outline' }].map(a => (
            <Pressable key={a.label} onPress={() => onShowPin()}
              style={({ pressed }) => [{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderRadius: 28, borderWidth: 1.5, borderColor: C.primary,
                paddingVertical: 13, opacity: pressed ? 0.75 : 1,
              }]}>
              <Ionicons name={a.icon as any} size={18} color={C.primary} />
              <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.primary }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Services grid */}
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 16, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
            {SERVICES.map((s, i) => (
              <Pressable key={s.id} onPress={() => openService(s.id)}
                style={({ pressed }) => [{
                  width: '33.33%', alignItems: 'center', paddingVertical: 16,
                  opacity: pressed ? 0.7 : 1,
                }]}>
                <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Ionicons name={s.icon as any} size={24} color={C.primary} />
                </View>
                <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.text }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent transactions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Recent Transactions</Text>
          <Pressable><Text style={{ fontFamily: C.regular, fontSize: 13, color: C.primary }}>See More</Text></Pressable>
        </View>

        <View style={{ gap: 10 }}>
          {TRANSACTIONS.map(tx => (
            <Pressable key={tx.id} onPress={() => onShowReceipt({
              status: 'success',
              type: tx.name,
              amount: tx.amount,
              details: [
                { label: 'Bill Type', value: tx.name },
                { label: 'Phone', value: tx.sub },
                { label: 'Transaction No.', value: '1098469208461910' },
                { label: 'Transaction Date', value: 'Jun 21st, 2026  02:36:34' },
              ],
            })}
              style={({ pressed }) => [{
                flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
                borderRadius: 16, padding: 14, opacity: pressed ? 0.8 : 1,
              }]}>
              <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: tx.color, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontFamily: C.bold, fontSize: 9, color: tx.textColor }}>{tx.label}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text }}>{tx.name}</Text>
                <Text style={{ fontFamily: C.regular, fontSize: 11, color: C.subtext, marginTop: 2 }}>{tx.sub}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text }}>{tx.amount}</Text>
                <Text style={{ fontFamily: C.regular, fontSize: 10, color: C.subtext, marginTop: 2 }}>{tx.date}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── 6. Profile ───────────────────────────────────────────────────────────────
function ProfileTab({ onNavigate }: { onNavigate: (s: DBScreen) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20,
        paddingTop: insets.top + (Platform.OS === 'web' ? 80 : 16) }}>
      <Text style={{ fontFamily: C.bold, fontSize: 22, color: C.text, textAlign: 'center', marginBottom: 24 }}>Profile</Text>
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Ionicons name="person" size={52} color={C.primary} />
        </View>
        <Text style={{ fontFamily: C.bold, fontSize: 20, color: C.text, marginTop: 12 }}>John Doe</Text>
        <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.subtext, marginTop: 2 }}>johndoe239@gmail.com</Text>
      </View>
      {/* Menu */}
      <SettingsRow icon="person-outline"      label="Profile"         onPress={() => onNavigate('profileSettings')} />
      <SettingsRow icon="list-outline"         label="Account Details" onPress={() => onNavigate('accountDetails')} />
      <SettingsRow icon="shield-outline"       label="Security"        onPress={() => onNavigate('security')} />
      <SettingsRow icon="people-outline"       label="Referral"        onPress={() => {}} />
      <SettingsRow icon="notifications-outline" label="Notification"   onPress={() => {}} showBorder={false} />
      <Btn label="Log Out" onPress={() => {}} variant="danger" style={{ marginTop: 14 }} />
    </ScrollView>
  );
}

// ─── 7. Profile Settings ──────────────────────────────────────────────────────
function ProfileSettingsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: 'John', middleName: '-', lastName: 'Doe', email: 'johndoe239@gmail.com', dob: '20/09/2001' });
  const fields: { key: keyof typeof form; label: string }[] = [
    { key: 'firstName', label: 'First Name' },
    { key: 'middleName', label: 'Middle Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'dob', label: 'Date of Birth' },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Profile Settings</Text>
        <Pressable onPress={() => setEditing(e => !e)}>
          <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.primary }}>{editing ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ position: 'relative' }}>
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person" size={48} color={C.primary} />
            </View>
            {editing && (
              <Pressable style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="camera-outline" size={15} color={C.primary} />
              </Pressable>
            )}
          </View>
        </View>
        {fields.map(f => (
          <View key={f.key} style={{ marginBottom: 16 }}>
            <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.text, marginBottom: 8 }}>{f.label}</Text>
            {editing
              ? <InputField placeholder={f.label} value={form[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} />
              : <View style={{ backgroundColor: C.inputBg, borderRadius: 28, minHeight: 52, justifyContent: 'center', paddingHorizontal: 20 }}>
                  <Text style={{ fontFamily: C.regular, fontSize: 15, color: C.subtext }}>{form[f.key]}</Text>
                </View>
            }
          </View>
        ))}
        {editing && <Btn label="Save" onPress={() => setEditing(false)} style={{ marginTop: 8, opacity: 0.65 }} />}
      </ScrollView>
    </View>
  );
}

// ─── 8. Security ─────────────────────────────────────────────────────────────
function SecurityScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [fingerprint, setFingerprint] = useState(true);
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16 }}>
        <Pressable onPress={onBack} style={{ position: 'absolute', left: 20, width: 36, height: 36, justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Settings</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <SettingsRow icon="lock-closed-outline"  label="Change Password"     onPress={() => {}} />
        <SettingsRow icon="finger-print-outline" label="Enable Fingerprint"
          rightElement={<Switch value={fingerprint} onValueChange={setFingerprint} trackColor={{ true: C.primary }} thumbColor="#fff" />}
          onPress={() => setFingerprint(f => !f)} />
        <SettingsRow icon="shield-checkmark-outline" label="2FA Authentication" onPress={() => {}} />
      </View>
    </View>
  );
}

// ─── 9. Account Details ───────────────────────────────────────────────────────
function AccountDetailsScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12), paddingHorizontal: 20, paddingBottom: 16 }}>
        <Pressable onPress={onBack} style={{ position: 'absolute', left: 20, width: 36, height: 36, justifyContent: 'center' }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Account Details</Text>
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <SettingsRow icon="card-outline"         label="BVN"               onPress={() => {}} />
        <SettingsRow icon="id-card-outline"      label="NIN"               onPress={() => {}} />
        <SettingsRow icon="scan-circle-outline"  label="Face Verification" onPress={() => {}} />
      </View>
    </View>
  );
}

// ─── 10. Transaction Receipt ──────────────────────────────────────────────────
function ReceiptScreen({ data, onClose, onRetry }: { data: ReceiptData; onClose: () => void; onRetry: () => void }) {
  const insets = useSafeAreaInsets();
  const ok = data.status === 'success';
  return (
    <View style={{ flex: 1, backgroundColor: C.primaryDark }}>
      <StatusBar barStyle="light-content" backgroundColor={C.primaryDark} />
      {/* Top status area */}
      <View style={{ alignItems: 'center', paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 40), paddingBottom: 32 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: ok ? C.success : C.error, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <Ionicons name={ok ? 'checkmark' : 'close'} size={32} color="#fff" />
        </View>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: '#fff', marginBottom: 8 }}>
          {ok ? 'Transaction Successful' : 'Transaction Failed'}
        </Text>
        <Text style={{ fontFamily: C.bold, fontSize: 32, color: '#fff' }}>{data.amount}</Text>
      </View>

      {/* White receipt card */}
      <View style={{ flex: 1, backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 28 }}>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text, textAlign: 'center', marginBottom: 24 }}>Transaction Details</Text>
        {data.details.map((row, i) => (
          <View key={i}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 }}>
              <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>{row.label}</Text>
              <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.text, maxWidth: '58%', textAlign: 'right' }}>{row.value}</Text>
            </View>
            {i < data.details.length - 1 && <View style={{ height: 1, backgroundColor: C.divider }} />}
          </View>
        ))}

        <View style={{ flex: 1 }} />
        {ok ? (
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <Pressable style={({ pressed }) => [{ flex: 1, flexDirection: 'row', gap: 6, borderWidth: 1.5, borderColor: C.primary, borderRadius: 28, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.75 : 1 }]}>
                <Ionicons name="download-outline" size={16} color={C.primary} />
                <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.primary }}>Download Receipt</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [{ flex: 1, flexDirection: 'row', gap: 6, borderWidth: 1.5, borderColor: C.primary, borderRadius: 28, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.75 : 1 }]}>
                <Ionicons name="share-outline" size={16} color={C.primary} />
                <Text style={{ fontFamily: C.bold, fontSize: 13, color: C.primary }}>Share Receipt</Text>
              </Pressable>
            </View>
            <Btn label="Complete" onPress={onClose} variant="ghost"
              style={{ backgroundColor: C.bg }} />
          </>
        ) : (
          <Btn label="Try Again" onPress={onRetry} />
        )}
        <View style={{ height: Math.max(insets.bottom, 8) + (Platform.OS === 'web' ? 16 : 0) }} />
      </View>
    </View>
  );
}

// ─── 11. Placeholder tabs ─────────────────────────────────────────────────────
function PlaceholderTab({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingTop: insets.top }}>
      <Ionicons name="construct-outline" size={48} color={C.primaryLight} />
      <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.subtext, marginTop: 16 }}>{label}</Text>
      <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.label, marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}

// ─── Main app shell ───────────────────────────────────────────────────────────
function MainApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const [tab, setTab] = useState<HomeTab>('Home');
  const [subScreen, setSubScreen] = useState<DBScreen | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [pinVisible, setPinVisible] = useState(false);

  const handleTabSelect = useCallback((t: HomeTab) => {
    Haptics.selectionAsync();
    setTab(t);
    setSubScreen(null);
  }, []);

  // Sub-screen navigation from profile menu
  if (subScreen === 'profileSettings') return <ProfileSettingsScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'security')        return <SecurityScreen        onBack={() => setSubScreen(null)} />;
  if (subScreen === 'accountDetails')  return <AccountDetailsScreen  onBack={() => setSubScreen(null)} />;

  // Receipt overlay
  if (receipt) return (
    <ReceiptScreen
      data={receipt}
      onClose={() => setReceipt(null)}
      onRetry={() => setReceipt(null)}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Design switcher pill (always visible) */}
      <Pressable
        onPress={onSwitchDesign}
        style={{
          position: 'absolute', top: Platform.OS === 'web' ? 76 : 52, right: 16, zIndex: 99,
          backgroundColor: C.primary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6,
        }}
      >
        <Text style={{ fontFamily: C.bold, fontSize: 11, color: '#fff', letterSpacing: 0.5 }}>A ↔ B</Text>
      </Pressable>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {tab === 'Home'    && <HomeTab onShowReceipt={setReceipt} onShowPin={() => setPinVisible(true)} />}
        {tab === 'Rewards' && <PlaceholderTab label="Rewards" />}
        {tab === 'History' && <PlaceholderTab label="History" />}
        {tab === 'Cards'   && <PlaceholderTab label="Cards" />}
        {tab === 'Profile' && <ProfileTab onNavigate={s => setSubScreen(s)} />}
      </View>

      <BottomNav active={tab} onSelect={handleTabSelect} />

      <PinModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSubmit={() => {
          setPinVisible(false);
          setReceipt({
            status: 'success',
            type: 'Airtime',
            amount: '$10.00',
            details: [
              { label: 'Bill Type', value: 'Airtime' },
              { label: 'Recipient Mobile', value: 'GLO  081 0578 9011' },
              { label: 'Transaction No.', value: '1098469208461910' },
              { label: 'Transaction Date', value: 'Jun 21st, 2026  02:36:34' },
            ],
          });
        }}
      />
    </View>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
type DesignBFlow = 'splash' | 'onboarding' | 'login' | 'signup' | 'app';

export function DesignBApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const [flow, setFlow] = useState<DesignBFlow>('splash');

  return (
    <>
      {flow === 'splash'     && <SplashScreen    onDone={() => setFlow('onboarding')} />}
      {flow === 'onboarding' && <OnboardingScreen onDone={() => setFlow('login')} />}
      {flow === 'login'      && <LoginScreen      onLogin={() => setFlow('app')} onGoSignup={() => setFlow('signup')} />}
      {flow === 'signup'     && <SignUpScreen      onSignup={() => setFlow('app')} onGoLogin={() => setFlow('login')} />}
      {flow === 'app'        && <MainApp           onSwitchDesign={onSwitchDesign} />}
    </>
  );
}
