import { useState, useMemo } from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import AppNavigator from './components/navigation/AppNavigator';
import { Provider as PaperProvider, DarkTheme, DefaultTheme } from 'react-native-paper';

export default function App() {

  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = useMemo(
    () => (isDarkMode ? DarkTheme : DefaultTheme),
    [isDarkMode]
  );

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.container}>
        <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={isDarkMode ? '#000000' : '#FFFFFF'}
        />
        <AppNavigator theme={theme} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    marginTop: StatusBar.currentHeight,
  },
});