import Svg, { Polygon } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
  /** direction the arrow tip points */
  pointing?: 'down' | 'up';
};

export function SpinnerArrow({ width = 36, height = 30, color = '#E53935', pointing = 'down' }: Props) {
  const points = pointing === 'down'
    ? `${width / 2},${height} 0,0 ${width},0`
    : `${width / 2},0 0,${height} ${width},${height}`;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Polygon points={points} fill={color} />
    </Svg>
  );
}
