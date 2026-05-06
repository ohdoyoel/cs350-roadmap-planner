import Svg, { Circle, Line } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function SearchIcon({ size = 24, color = '#9ca3af', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.5} cy={10.5} r={6.5} stroke={color} strokeWidth={strokeWidth} />
      <Line
        x1={15.2}
        y1={15.2}
        x2={20}
        y2={20}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
