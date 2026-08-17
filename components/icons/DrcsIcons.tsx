/**
 * DRCS custom SVG icons — vector-faithful replacements for the Ionicons
 * placeholders used in the home screen services grid, quick-action buttons,
 * and bottom navigation bar.
 *
 * All icons use a 24×24 viewBox, 1.5pt stroke, rounded caps/joins, no fill —
 * matching the stroke-icon visual language seen in the Figma file
 * (DH0zgCNw5OK8qWo4VlnWIC).
 */

import React from 'react';
import Svg, {
  Circle,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const D = {
  size: 24,
  sw: 1.6,
  cap: 'round' as const,
  join: 'round' as const,
  fill: 'none' as const,
};

// ─── Service-grid icons ───────────────────────────────────────────────────────

/** Lightning bolt — Electricity */
export function ElectricityIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M13 2L4 13.5h7L10 22l10-12.5h-7L13 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Phone handset — Airtime */
export function AirtimeIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Rect
        x="7"
        y="2"
        width="10"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Line
        x1="10"
        y1="5"
        x2="14"
        y2="5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
      <Circle cx="12" cy="18" r="1" fill={color} />
    </Svg>
  );
}

/** Wifi signal — Data */
export function DataIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M1.5 8.5C4 6 7.8 4.5 12 4.5s8 1.5 10.5 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M5 12.5C7 10.5 9.4 9.5 12 9.5s5 1 7 3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M8.5 16.5C9.6 15.4 10.7 15 12 15s2.4.4 3.5 1.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Circle cx="12" cy="20" r="1" fill={color} />
    </Svg>
  );
}

/** Television — Cable TV */
export function CableTVIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Rect
        x="2"
        y="7"
        width="20"
        height="13"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M8 7L12 3l4 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Line
        x1="9"
        y1="20"
        x2="9"
        y2="22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
      <Line
        x1="15"
        y1="20"
        x2="15"
        y2="22"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
      <Rect
        x="6"
        y="11"
        width="8"
        height="5"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={D.fill}
      />
      <Line
        x1="18"
        y1="12"
        x2="18"
        y2="12"
        stroke={color}
        strokeWidth={strokeWidth + 1}
        strokeLinecap="round"
      />
      <Line
        x1="18"
        y1="15"
        x2="18"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth + 1}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Trophy — Betting */
export function BettingIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M8 3h8v6a4 4 0 0 1-8 0V3z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M5 3H8M16 3h3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M5 3c0 3.5 1.5 5.5 3 6M19 3c0 3.5-1.5 5.5-3 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Line
        x1="12"
        y1="13"
        x2="12"
        y2="17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
      <Path
        d="M8 17h8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M6 20h12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Graduation cap — Education */
export function EducationIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M12 3L2 8l10 5 10-5-10-5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M6 10.5v5c0 2.2 2.7 3.5 6 3.5s6-1.3 6-3.5v-5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Line
        x1="22"
        y1="8"
        x2="22"
        y2="13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
    </Svg>
  );
}

// ─── Quick-action icons ───────────────────────────────────────────────────────

/** Arrow down into tray — Deposit */
export function DepositIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M12 3v13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M8 12l4 4 4-4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Arrow right — Transfer */
export function TransferIcon({ size = D.size, color = '#014dd4', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M5 12h14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
      <Path
        d="M14 7l5 5-5 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M5 7l-1 2v6l1 2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

// ─── Bottom-nav icons ─────────────────────────────────────────────────────────

/** House — Home tab */
export function HomeNavIcon({ size = D.size, color = '#636e88', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.5z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M9 21V13h6v8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Diamond — Rewards tab */
export function RewardsNavIcon({ size = D.size, color = '#636e88', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Path
        d="M12 2L2 9l10 13 10-13L12 2z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Path
        d="M2 9h20M7.5 9L12 2l4.5 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Trending-up line — History tab */
export function HistoryNavIcon({ size = D.size, color = '#636e88', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Polyline
        points="23 6 13.5 15.5 8.5 10.5 1 18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
      <Polyline
        points="17 6 23 6 23 12"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        strokeLinejoin={D.join}
        fill={D.fill}
      />
    </Svg>
  );
}

/** Credit card — Cards tab */
export function CardsNavIcon({ size = D.size, color = '#636e88', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={D.fill}
      />
      <Line
        x1="2"
        y1="10"
        x2="22"
        y2="10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
      <Line
        x1="6"
        y1="15"
        x2="10"
        y2="15"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
      />
    </Svg>
  );
}

/** Person silhouette — Profile tab */
export function ProfileNavIcon({ size = D.size, color = '#636e88', strokeWidth = D.sw }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={D.fill}>
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={D.fill}
      />
      <Path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap={D.cap}
        fill={D.fill}
      />
    </Svg>
  );
}
