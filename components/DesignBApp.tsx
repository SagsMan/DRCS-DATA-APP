/**
 * Design B — Figma-faithful implementation (revised)
 * Fixes: splash logo, onboarding clip, auth proportions, avatar photo,
 *        telecom picker, loading overlay, bottom-nav icons
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

const { width: W, height: H } = Dimensions.get('window');

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  primary:      '#014dd4',
  primaryMid:   '#0245c0',
  primaryDark:  '#012d80',
  primaryLight: '#c9ddff',
  bg:           '#f1f7ff',
  text:         '#17000e',
  subtext:      '#636e88',
  label:        '#9aa5bb',
  card:         '#ffffff',
  border:       '#dde5f5',
  inputBg:      '#eff3fb',
  success:      '#22c55e',
  error:        '#ef4444',
  logoutRed:    '#fe0d0d',
  divider:      '#eef2fb',
  bold:         'DMSans_600SemiBold',
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

// ─── Telecom networks ────────────────────────────────────────────────────────
const TELECOMS = [
  { id: 'mtn',    label: 'MTN',    color: '#ffcc00', textColor: '#000', initial: 'MTN',
    logo: require('../assets/images/design-b/telecoms/mtn-logo.png') },
  { id: 'airtel', label: 'Airtel', color: '#e8001c', textColor: '#fff', initial: 'AIR',
    logo: require('../assets/images/design-b/telecoms/airtel-logo.png') },
  { id: 'glo',    label: 'Glo',    color: '#0a8234', textColor: '#fff', initial: 'glo',
    logo: require('../assets/images/design-b/glo-logo.png') },
  { id: '9mobile',label: '9Mobile',color: '#006b50', textColor: '#fff', initial: '9m',
    logo: require('../assets/images/design-b/telecoms/9mobile-logo.png') },
] as const;

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
        backgroundColor: bg, borderRadius: 28, minHeight: 52,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
        opacity: pressed ? 0.82 : disabled ? 0.5 : 1, ...bdr, ...style,
      }]}
    >
      <Text style={{ fontFamily: C.bold, fontSize: 16, color: tc }}>{label}</Text>
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
          backgroundColor: C.inputBg, borderRadius: 28, minHeight: 52,
          paddingHorizontal: 20, paddingRight: secure ? 50 : 20,
          fontFamily: C.regular, fontSize: 15, color: C.text,
        }}
      />
      {secure && (
        <Pressable onPress={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 18, top: 16 }}>
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
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16,
        marginBottom: 10, opacity: pressed ? 0.8 : 1,
      }]}>
      <View style={{
        width: 36, height: 36, borderRadius: 18, backgroundColor: C.bg,
        alignItems: 'center', justifyContent: 'center', marginRight: 14,
      }}>
        <Ionicons name={icon as any} size={18} color={C.primary} />
      </View>
      <Text style={{ fontFamily: C.bold, fontSize: 15, color: C.text, flex: 1 }}>{label}</Text>
      {right ?? <Ionicons name="chevron-forward" size={18} color={C.label} />}
    </Pressable>
  );
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV_TABS: { id: HomeTab; icon: string; active: string }[] = [
  { id: 'Home',    icon: 'home-outline',        active: 'home'         },
  { id: 'Rewards', icon: 'diamond-outline',     active: 'diamond'      },
  { id: 'History', icon: 'trending-up-outline', active: 'trending-up'  },
  { id: 'Cards',   icon: 'card-outline',        active: 'card'         },
  { id: 'Profile', icon: 'person-outline',      active: 'person'       },
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
              <Ionicons name={(on ? t.active : t.icon) as any} size={20}
                color={on ? '#fff' : C.subtext} />
            </View>
            <Text style={{ fontFamily: C.regular, fontSize: 10, color: on ? C.primary : C.subtext }}>
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
      {/* The splash-logo.png already contains the hexagon + DRCSDATA text */}
      <Image
        source={require('../assets/images/design-b/splash-logo.png')}
        style={{ width: W * 0.55, height: W * 0.65 }}
        resizeMode="contain"
      />
    </View>
  );
}

// ─── 2. Onboarding ────────────────────────────────────────────────────────────
// The Figma exports are full-screen frames (393×852 logical px, saved at 2×).
// We render each image from the TOP, clipping at ~57 % of device height so only
// the illustration+blue area shows — never the white bottom-sheet from the frame.
const SLIDES = [
  { img: require('../assets/images/design-b/onboard1.png'),
    title: 'Pay Bills Without\nStress',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/onboard2.png'),
    title: 'Get More\nValue',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/onboard3.png'),
    title: 'Safe, Instant\nTransaction',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Next' },
  { img: require('../assets/images/design-b/onboard4.png'),
    title: 'Earn While your\nRecharge',
    body:  'Pay your bills fast, reliable, and available whenever you need it',
    cta:   'Get Started' },
] as const;

// Height of the blue illustration zone (must stay above Figma's white sheet boundary)
const ILLUS_H = H * 0.56;
// Figma frame: 393×852 logical px. Scaled to device width:
const FRAME_RENDERED_H = W * (852 / 393);

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

      {/* ── Blue illustration zone (clipped from top of Figma frame) ── */}
      <View style={{ height: ILLUS_H, backgroundColor: C.primary, overflow: 'hidden' }}>
        <Image
          source={slide.img}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: W,
            height: FRAME_RENDERED_H, // natural aspect-ratio height
          }}
          resizeMode="stretch"
        />

        {/* Progress bars — 4 short rectangles at bottom of blue zone */}
        <View style={{
          position: 'absolute', bottom: 20, left: 0, right: 0,
          flexDirection: 'row', justifyContent: 'center', gap: 5,
        }}>
          {SLIDES.map((_, i) => (
            <View key={i} style={{
              width: i === idx ? 24 : 8,
              height: 6,
              borderRadius: 3,
              backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.38)',
            }} />
          ))}
        </View>
      </View>

      {/* ── White bottom sheet ── */}
      <View style={{
        flex: 1, backgroundColor: C.card,
        paddingHorizontal: 26, paddingTop: 28,
        paddingBottom: Math.max(ins.bottom, 16) + (Platform.OS === 'web' ? 20 : 0),
      }}>
        {/* Skip — top-right, only on non-last slides */}
        {!isLast && (
          <Pressable onPress={skip} style={{ position: 'absolute', top: 18, right: 22 }}>
            <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>Skip</Text>
          </Pressable>
        )}

        <Text style={{ fontFamily: C.bold, fontSize: 26, color: C.text, lineHeight: 32, marginBottom: 12 }}>
          {slide.title}
        </Text>
        <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext, lineHeight: 21, marginBottom: 28 }}>
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
        <Text style={{ fontFamily: C.bold, fontSize: 32, color: '#fff', lineHeight: 38 }}>{title}</Text>
      </View>

      {/* White form card */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: C.card, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            paddingHorizontal: 24, paddingTop: 32, flexGrow: 1,
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.label }}>or</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
        {/* Google */}
        <Pressable style={({ pressed }) => [{
          width: 52, height: 52, borderRadius: 26, backgroundColor: C.inputBg,
          alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1,
        }]}>
          <Image source={require('../assets/images/design-b/google-logo.png')}
            style={{ width: 26, height: 26 }} resizeMode="contain" />
        </Pressable>
        {/* Apple */}
        <Pressable style={({ pressed }) => [{
          width: 52, height: 52, borderRadius: 26, backgroundColor: C.inputBg,
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>New here? </Text>
        <Pressable onPress={onGoSignup}>
          <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.primary }}>Create an account</Text>
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18 }}>
        <Text style={{ fontFamily: C.regular, fontSize: 14, color: C.subtext }}>Have an account? </Text>
        <Pressable onPress={onGoLogin}>
          <Text style={{ fontFamily: C.bold, fontSize: 14, color: C.primary }}>Login</Text>
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

// ─── 5. Telecom picker ────────────────────────────────────────────────────────
function TelecomPicker({
  serviceLabel, onBack, onSelect,
}: { serviceLabel: string; onBack: () => void; onSelect: (network: string) => void }) {
  const ins = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingTop: ins.top + (Platform.OS === 'web' ? 67 : 14), paddingHorizontal: 20, paddingBottom: 16,
      }}>
        <Pressable onPress={onBack} style={{ position: 'absolute', left: 20 }}>
          <Ionicons name="chevron-back" size={24} color={C.primary} />
        </Pressable>
        <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Select Network — {serviceLabel}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8 }}>
        {TELECOMS.map(net => (
          <Pressable key={net.id} onPress={() => { Haptics.selectionAsync(); onSelect(net.label); }}
            style={({ pressed }) => [{
              flexDirection: 'row', alignItems: 'center', backgroundColor: C.card,
              borderRadius: 18, padding: 16, marginBottom: 12,
              opacity: pressed ? 0.8 : 1,
            }]}>
            {/* Logo / badge */}
            {'logo' in net ? (
              <Image source={(net as any).logo}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 16 }} resizeMode="cover" />
            ) : (
              <View style={{
                width: 48, height: 48, borderRadius: 24, backgroundColor: net.color,
                alignItems: 'center', justifyContent: 'center', marginRight: 16,
              }}>
                <Text style={{ fontFamily: C.bold, fontSize: 12, color: net.textColor }}>{net.initial}</Text>
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
        ))}

        {/* AEDC for Electricity / extra items */}
        {serviceLabel === 'Electricity' && ['AEDC','IKEDC','EKEDC','KANO'].map(c => (
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
              <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext, marginTop: 2 }}>DisCo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.label} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── 6. Home tab ──────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'electricity', label: 'Electricity', icon: 'flash-outline'          },
  { id: 'airtime',     label: 'Airtime',     icon: 'phone-portrait-outline'  },
  { id: 'data',        label: 'Data',        icon: 'wifi-outline'            },
  { id: 'betting',     label: 'Betting',     icon: 'dice-outline'            },
  { id: 'water',       label: 'Water',       icon: 'water-outline'           },
  { id: 'more',        label: 'More',        icon: 'grid-outline'            },
] as const;

const TXS = [
  { id:'1', name:'Electricity', sub:'905 783 9231',     amt:'$30', date:'Jan. 25 2026  05:34 PM', lbl:'AEDC', bg:'#e8f0ff', fg:'#014dd4' },
  { id:'2', name:'Airtime',     sub:'Glo  905 783 9231',amt:'$10', date:'Jan. 25 2026  05:34 PM', lbl:'glo',  bg:'#d4f5e0', fg:'#0d8f47', logo: require('../assets/images/design-b/glo-logo.png') },
  { id:'3', name:'GOTV Subscription', sub:'905 783 9231', amt:'$30', date:'Jan. 25 2026  05:34 PM', lbl:'GOTV', bg:'#fff3e0', fg:'#e67e00' },
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
  onShowReceipt, onOpenPicker, onShowPin,
}: {
  onShowReceipt: (d: ReceiptData) => void;
  onOpenPicker: (svc: string) => void;
  onShowPin: () => void;
}) {
  const ins = useSafeAreaInsets();
  const [balHidden, setBalHidden] = useState(false);
  const [loading, setLoading] = useState(false);

  const tapService = (id: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (id === 'airtime' || id === 'data' || id === 'electricity') {
      onOpenPicker(label);
    } else {
      onShowPin();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
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
            <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.subtext }}>Welcome</Text>
            <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>John Doe</Text>
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
          <View style={{ backgroundColor: C.primary, borderRadius: 22, padding: 22, marginBottom: 14 }}>
            <Text style={{ fontFamily: C.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
              Available Balance
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: C.bold, fontSize: 30, color: '#fff', letterSpacing: -0.5 }}>
                {balHidden ? '• • • • • •' : '$30,000.34'}
              </Text>
              <Pressable onPress={() => setBalHidden(h => !h)}>
                <Ionicons name={balHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={22} color="rgba(255,255,255,0.65)" />
              </Pressable>
            </View>
          </View>

          {/* Deposit + Transfer */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
            {[
              { lbl: 'Deposit',  icon: 'arrow-down-circle-outline' },
              { lbl: 'Transfer', icon: 'arrow-forward-circle-outline' },
            ].map(a => (
              <Pressable key={a.lbl} onPress={onShowPin}
                style={({ pressed }) => [{
                  flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  gap: 8, borderRadius: 28, borderWidth: 1.5, borderColor: C.primary,
                  paddingVertical: 13, opacity: pressed ? 0.75 : 1,
                }]}>
                <Ionicons name={a.icon as any} size={18} color={C.primary} />
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
                    <Ionicons name={s.icon as any} size={24} color={C.primary} />
                  </View>
                  <Text style={{ fontFamily: C.regular, fontSize: 12, color: C.text }}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Recent transactions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: C.bold, fontSize: 18, color: C.text }}>Recent Transactions</Text>
            <Pressable><Text style={{ fontFamily: C.regular, fontSize: 13, color: C.primary }}>See More</Text></Pressable>
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
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{
        paddingHorizontal: 20, paddingBottom: 24,
        paddingTop: ins.top + (Platform.OS === 'web' ? 80 : 16),
      }}>
      <Text style={{ fontFamily: C.bold, fontSize: 22, color: C.text, textAlign: 'center', marginBottom: 22 }}>
        Profile
      </Text>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image source={require('../assets/images/design-b/avatar.png')}
          style={{ width: 100, height: 100, borderRadius: 50 }} />
        <Text style={{ fontFamily: C.bold, fontSize: 20, color: C.text, marginTop: 12 }}>John Doe</Text>
        <Text style={{ fontFamily: C.regular, fontSize: 13, color: C.subtext, marginTop: 3 }}>
          johndoe239@gmail.com
        </Text>
      </View>
      <MenuRow icon="person-outline"         label="Profile"          onPress={() => onNavigate('profileSettings')} />
      <MenuRow icon="list-outline"           label="Account Details"  onPress={() => onNavigate('accountDetails')} />
      <MenuRow icon="shield-outline"         label="Security"         onPress={() => onNavigate('security')} />
      <MenuRow icon="people-outline"         label="Referral"         onPress={() => {}} />
      <MenuRow icon="notifications-outline"  label="Notification"     onPress={() => {}} />
      <Btn label="Log Out" onPress={() => {}} variant="danger" style={{ marginTop: 14 }} />
    </ScrollView>
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

// ─── Main app shell ───────────────────────────────────────────────────────────
function MainApp({ onSwitchDesign }: { onSwitchDesign: () => void }) {
  const [tab,       setTab]       = useState<HomeTab>('Home');
  const [subScreen, setSubScreen] = useState<DBScreen | null>(null);
  const [receipt,   setReceipt]   = useState<ReceiptData | null>(null);
  const [pinOpen,   setPinOpen]   = useState(false);
  const [picker,    setPicker]    = useState<string | null>(null); // current service label

  const goSub = useCallback((s: DBScreen) => setSubScreen(s), []);

  // Sub-screens (full-screen, no bottom nav)
  if (subScreen === 'profileSettings') return <ProfileSettingsScreen onBack={() => setSubScreen(null)} />;
  if (subScreen === 'security')        return <SecurityScreen        onBack={() => setSubScreen(null)} />;
  if (subScreen === 'accountDetails')  return <AccountDetailsScreen  onBack={() => setSubScreen(null)} />;

  // Telecom picker
  if (picker) return (
    <TelecomPicker
      serviceLabel={picker}
      onBack={() => setPicker(null)}
      onSelect={network => { setPicker(null); setPinOpen(true); }}
    />
  );

  // Receipt
  if (receipt) return (
    <ReceiptScreen data={receipt} onClose={() => setReceipt(null)} onRetry={() => setReceipt(null)} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* A↔B switcher pill */}
      <Pressable onPress={onSwitchDesign} style={{
        position: 'absolute',
        top: Platform.OS === 'web' ? 76 : 52,
        right: 16, zIndex: 99,
        backgroundColor: C.primary, borderRadius: 14,
        paddingHorizontal: 11, paddingVertical: 5,
      }}>
        <Text style={{ fontFamily: C.bold, fontSize: 11, color: '#fff', letterSpacing: 0.5 }}>A ↔ B</Text>
      </Pressable>

      {/* Tab content */}
      <View style={{ flex: 1 }}>
        {tab === 'Home'    && (
          <HomeTab
            onShowReceipt={setReceipt}
            onOpenPicker={svc => setPicker(svc)}
            onShowPin={() => setPinOpen(true)}
          />
        )}
        {tab === 'Rewards' && <PlaceholderTab label="Rewards" />}
        {tab === 'History' && <PlaceholderTab label="History" />}
        {tab === 'Cards'   && <PlaceholderTab label="Cards" />}
        {tab === 'Profile' && <ProfileTab onNavigate={goSub} />}
      </View>

      <BottomNav active={tab} onSelect={t => { Haptics.selectionAsync(); setTab(t); setSubScreen(null); }} />

      <PinModal
        visible={pinOpen}
        onClose={() => setPinOpen(false)}
        onSubmit={() => {
          setPinOpen(false);
          setReceipt({
            status: 'success', type: 'Airtime', amount: '$10.00',
            details: [
              { label: 'Bill Type',        value: 'Airtime' },
              { label: 'Recipient Mobile', value: 'GLO  081 0578 9011' },
              { label: 'Transaction No.',  value: '1098469208461910' },
              { label: 'Transaction Date', value: 'Jun 21st, 2026  02:36:34' },
            ],
          });
        }}
      />
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
