import Svg, { Line } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function MenuIcon({ size = 24, color = '#111', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line
        x1={4}
        y1={7}
        x2={20}
        y2={7}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={4}
        y1={12}
        x2={20}
        y2={12}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={4}
        y1={17}
        x2={14}
        y2={17}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
