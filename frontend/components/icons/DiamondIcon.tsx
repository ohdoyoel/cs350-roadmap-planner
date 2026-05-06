import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function DiamondIcon({ size = 10, color = '#9ca3af' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Path
        d="M 5 1 L 9 5 L 5 9 L 1 5 Z"
        fill={color}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
