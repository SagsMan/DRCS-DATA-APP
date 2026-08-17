import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  Poppins_700Bold,
  useFonts as usePoppinsFonts,
} from '@expo-google-fonts/poppins';
import {
  IBMPlexSans_600SemiBold,
  useFonts as useIBMFonts,
} from '@expo-google-fonts/ibm-plex-sans';
import {
  Roboto_400Regular,
  Roboto_600SemiBold,
  useFonts as useRobotoFonts,
} from '@expo-google-fonts/roboto';
import {
  DMSans_400Regular,
  DMSans_600SemiBold,
  useFonts as useDMSansFonts,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [startupReady, setStartupReady] = useState(Platform.OS === 'web');
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [poppinsLoaded, poppinsError] = usePoppinsFonts({ Poppins_700Bold });
  const [ibmLoaded, ibmError] = useIBMFonts({ IBMPlexSans_600SemiBold });
  const [robotoLoaded, robotoError] = useRobotoFonts({
    Roboto_400Regular,
    Roboto_600SemiBold,
  });
  const [dmSansLoaded, dmSansError] = useDMSansFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
  });

  const fontsLoaded =
    interLoaded && poppinsLoaded && ibmLoaded && robotoLoaded && dmSansLoaded;
  const fontError =
    interError || poppinsError || ibmError || robotoError || dmSansError;

  useEffect(() => {
    if (Platform.OS === 'web') {
      SplashScreen.hideAsync();
      setStartupReady(true);
      return;
    }

    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
      setStartupReady(true);
      return;
    }

    // Do not leave the app on a blank screen if a non-critical font
    // download hangs on a device or in the web preview.
    const fallbackTimer = setTimeout(() => {
      SplashScreen.hideAsync();
      setStartupReady(true);
    }, 2000);

    return () => clearTimeout(fallbackTimer);
  }, [fontsLoaded, fontError]);

  if (!startupReady) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
