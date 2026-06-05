import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  seed: string;
  size: number;
};

// 결정적 32-bit FNV-1a 해시 — 같은 이메일이면 항상 같은 그라디언트.
function hash32(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h >>> 0;
}

function hslToHex(h: number, s: number, l: number): string {
  const ss = s / 100;
  const ll = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const v = ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(v * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function gradientFromSeed(seed: string): { from: string; to: string } {
  const h = hash32((seed || 'anon').toLowerCase());
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + ((h >> 9) % 60)) % 360;
  const from = hslToHex(hue1, 78, 58);
  const to = hslToHex(hue2, 72, 42);
  return { from, to };
}

export function GradientAvatar({ seed, size }: Props) {
  const { from, to } = gradientFromSeed(seed);
  const radius = size / 2;
  // useId 로 인스턴스마다 unique id 부여 — 같은 seed 로 여러 아바타가 동시에 mount 돼도
  // SVG `<linearGradient id>` 충돌이 안 생긴다 (Chrome 이 cross-svg url() 참조를 거부해서
  // 아바타가 가끔씩 투명하게 보이던 문제 회피).
  const reactId = useId();
  const gradientId = `avatarGrad-${reactId.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* 45도 = 좌하단 → 우상단. SVG y 축은 아래로 증가하므로 x1=0,y1=1 → x2=1,y2=0. */}
          <LinearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} rx={radius} ry={radius} fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
