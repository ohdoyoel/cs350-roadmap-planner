import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { CustomTabBar } from '@/components/CustomTabBar';
import { SidebarToggleButton } from '@/components/SidebarToggleButton';
import { CalendarIcon } from '@/components/icons/CalendarIcon';
import { PersonIcon } from '@/components/icons/PersonIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tabs.Screen
          name="timetable"
          options={{
            tabBarIcon: ({ color }) => <CalendarIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => <SearchIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="status"
          options={{
            tabBarIcon: ({ color }) => <PersonIcon color={color} />,
          }}
        />
      </Tabs>
      <SidebarToggleButton />
    </View>
  );
}
