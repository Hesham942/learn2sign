import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

import RecognizeScreen from './src/screens/RecognizeScreen';
import LearnHomeScreen from './src/screens/LearnHomeScreen';
import LetterSelectScreen from './src/screens/LetterSelectScreen';
import LearnLetterScreen from './src/screens/LearnLetterScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import ChallengeScreen from './src/screens/ChallengeScreen';

const Tab = createBottomTabNavigator();
const LearnStack = createStackNavigator();

function LearnNavigator() {
  return (
    <LearnStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <LearnStack.Screen 
        name="LearnHome" 
        component={LearnHomeScreen}
        options={{ headerShown: false }}
      />
      <LearnStack.Screen 
        name="LetterSelect" 
        component={LetterSelectScreen}
        options={{ title: 'Select Letter', headerShown: false }}
      />
      <LearnStack.Screen 
        name="LearnLetter" 
        component={LearnLetterScreen}
        options={({ route }) => ({ 
          title: `Learn: ${route.params?.letter}`,
          headerShown: false
        })}
      />
      <LearnStack.Screen 
        name="Practice" 
        component={PracticeScreen}
        options={({ route }) => ({ 
          title: `Practice: ${route.params?.letter}`,
          headerShown: false
        })}
      />
      <LearnStack.Screen 
        name="Challenge" 
        component={ChallengeScreen}
        options={{ title: 'Challenge Mode', headerShown: false }}
      />
    </LearnStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#1E1E1E',
            borderTopColor: '#333333',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#888888',
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Recognize" 
          component={RecognizeScreen}
          options={{
            tabBarLabel: 'Recognize',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>🤟</Text>
            ),
          }}
        />
        <Tab.Screen 
          name="Learn" 
          component={LearnNavigator}
          options={{
            tabBarLabel: 'Learn',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size, color }}>📚</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
