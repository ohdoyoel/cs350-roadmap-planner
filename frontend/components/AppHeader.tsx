import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuIcon } from '@/components/icons/MenuIcon';
import { useSession } from '@/lib/session/SessionContext';

type Props = {
  title?: string;
  children?: ReactNode;
  onLeftPress?: () => void;
};

export function AppHeader({ title, children, onLeftPress }: Props) {
  const { user, signOut } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const initial = (user?.name?.trim()?.[0] ?? user?.kaistEmail?.[0] ?? '?').toUpperCase();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onLeftPress}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.leftSlot}
        disabled={!onLeftPress}
      >
        <MenuIcon size={24} />
      </Pressable>
      <View style={styles.titleSlot}>
        {children ?? (title ? <Text style={styles.title}>{title}</Text> : null)}
      </View>
      <Pressable
        onPress={() => setMenuOpen((v) => !v)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="User menu"
        style={styles.profile}
      >
        <Text style={styles.initial}>{initial}</Text>
      </Pressable>
      {menuOpen ? (
        <>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
            accessibilityLabel="Close user menu"
          />
          <View style={styles.menu}>
            <Text style={styles.menuEmail} numberOfLines={1}>
              {user?.kaistEmail ?? ''}
            </Text>
            <Pressable
              style={styles.menuRow}
              onPress={() => {
                setMenuOpen(false);
                void signOut();
              }}
            >
              <Text style={styles.menuRowLabel}>Logout</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  leftSlot: {
    width: 32,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#111',
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#374151',
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: 16,
    minWidth: 200,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  menuEmail: {
    fontFamily: 'Georgia',
    fontSize: 12,
    color: '#6b7280',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  menuRow: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  menuRowLabel: {
    fontFamily: 'Georgia',
    fontSize: 14,
    color: '#111',
  },
});
