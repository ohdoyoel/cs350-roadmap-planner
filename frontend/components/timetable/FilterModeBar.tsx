import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { FilterMode } from '@/lib/mocks/timetableFixture';
import { FILTER_MODES } from '@/lib/mocks/timetableFixture';

type Props = {
  active: FilterMode;
  onSelect: (id: FilterMode) => void;
};

const CHIP_WIDTH = 60;
const GAP = 6;
const DURATION = 220;

export function FilterModeBar({ active, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: DURATION,
      useNativeDriver: false,
    }).start();
  }, [anim, expanded]);

  const toggle = () => setExpanded((v) => !v);
  const select = (id: FilterMode) => {
    onSelect(id);
    setExpanded(false);
  };

  return (
    <View style={styles.bar}>
      <Pressable onPress={toggle} hitSlop={6} style={styles.cog}>
        <Ionicons name="settings-outline" size={16} color="#6b7280" />
      </Pressable>
      {FILTER_MODES.map((mode) => {
        const isActive = mode.id === active;
        const widthVal = isActive
          ? CHIP_WIDTH
          : anim.interpolate({ inputRange: [0, 1], outputRange: [0, CHIP_WIDTH] });
        const mlVal = isActive
          ? GAP
          : anim.interpolate({ inputRange: [0, 1], outputRange: [0, GAP] });
        const opacityVal = isActive
          ? 1
          : anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
        return (
          <Animated.View
            key={mode.id}
            style={{ width: widthVal, marginLeft: mlVal, opacity: opacityVal, overflow: 'hidden' }}
          >
            <Pressable
              onPress={() => (expanded && !isActive ? select(mode.id) : toggle())}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {mode.label_ko}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  cog: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tab: {
    width: CHIP_WIDTH,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#a78bfa',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#6b7280',
  },
  labelActive: {
    color: '#fff',
  },
});
