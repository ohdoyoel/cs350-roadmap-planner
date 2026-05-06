import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function PersonIcon({ size = 24, color = '#9ca3af', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8} r={3.5} stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M 5 20 Q 5 13.5 12 13.5 Q 19 13.5 19 20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}
