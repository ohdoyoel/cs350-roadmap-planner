import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

const ICON_INACTIVE = '#9ca3af';
const ICON_ACTIVE = '#6366f1';
const UNDERBAR_COLOR = '#6366f1';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const icon = options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? ICON_ACTIVE : ICON_INACTIVE,
            size: 24,
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              {icon}
              {isFocused ? <View style={styles.underbar} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#fff',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 16px 48px rgba(0,0,0,0.32)',
      } as object,
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.32,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 14 },
      },
      android: {
        elevation: 20,
      },
    }),
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  underbar: {
    position: 'absolute',
    bottom: 0,
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: UNDERBAR_COLOR,
    ...Platform.select({
      web: {
        boxShadow: '0 0 8px rgba(99, 102, 241, 0.9)',
      } as object,
      ios: {
        shadowColor: UNDERBAR_COLOR,
        shadowOpacity: 0.9,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
