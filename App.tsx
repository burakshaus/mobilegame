import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import TicTacToeScreen from './src/screens/TicTacToeScreen';
import MemoryGameScreen from './src/screens/MemoryGameScreen';
import Game2048Screen from './src/screens/Game2048Screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1E1E2C',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ title: 'Mini Games Koleksiyonu' }} 
            />
            <Stack.Screen 
              name="TicTacToe" 
              component={TicTacToeScreen} 
              options={{ title: 'Tic Tac Toe' }} 
            />
            <Stack.Screen 
              name="MemoryGame" 
              component={MemoryGameScreen} 
              options={{ title: 'Hafıza Oyunu' }} 
            />
            <Stack.Screen 
              name="Game2048" 
              component={Game2048Screen} 
              options={{ title: '2048' }} 
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
