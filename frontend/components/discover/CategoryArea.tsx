import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  bgColor: string;
  labelBgColor?: string;
  labelTextColor?: string;
  children: ReactNode;
};

export function CategoryArea({
  label,
  bgColor,
  labelBgColor = 'rgba(255,255,255,0.85)',
  labelTextColor = '#1f2937',
  children,
}: Props) {
  return (
    <View style={[styles.area, { backgroundColor: bgColor }]}>
      <View style={[styles.labelChip, { backgroundColor: labelBgColor }]}>
        <Text style={[styles.label, { color: labelTextColor }]}>{label}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  area: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12,
    alignItems: 'center',
  },
  labelChip: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: "Georgia, 'Pretendard Variable', Pretendard, sans-serif",
    fontWeight: '600',
  },
  body: {
    width: '100%',
    alignItems: 'center',
  },
});
