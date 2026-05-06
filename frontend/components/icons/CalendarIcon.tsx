import Svg, { Line, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function CalendarIcon({ size = 24, color = '#9ca3af', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3.5}
        y={5}
        width={17}
        height={15.5}
        rx={2.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1={3.5}
        y1={9.5}
        x2={20.5}
        y2={9.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Line
        x1={8}
        y1={3.5}
        x2={8}
        y2={6.5}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={16}
        y1={3.5}
        x2={16}
        y2={6.5}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
