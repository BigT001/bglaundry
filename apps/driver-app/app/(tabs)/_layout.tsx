import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#002B7F',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          borderTopColor: '#E6F0FA',
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Assignments',
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings Log',
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
