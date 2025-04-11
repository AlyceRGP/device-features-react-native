import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/Home';
import EntryScreen from '../screens/Entry';

const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
  theme: any;
  toggleTheme: () => void;
  isDarkMode: boolean; 
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ theme, toggleTheme, isDarkMode }) => {
  return (
        <NavigationContainer>
            <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.background,
              },
              headerTintColor: theme.colors.text,
              headerTitleAlign: 'center',
            }}
            >
              <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} theme={theme} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />}
              </Stack.Screen>
              <Stack.Screen name="Travel Entry" component={EntryScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;