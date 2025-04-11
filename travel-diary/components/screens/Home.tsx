import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Switch, Image, FlatList } from 'react-native';
import { Props } from '../navigation/props';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TravelEntry = {
  id: string;
  imageUri: string;
  address: string;
};

const HomeScreen: React.FC<Props> = ({ navigation, toggleTheme, isDarkMode }) => {
  const { colors } = useTheme();
  const [entries, setEntries] = useState<TravelEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('entries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.log('Failed to load saved entries.', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation]);

  const handleRemoveEntry = async (id: string) => {
    try {
      const updated = entries.filter((entry) => entry.id !== id);
      setEntries(updated);
      await AsyncStorage.setItem('entries', JSON.stringify(updated));
    } catch (error) {
      console.log('Failed to remove entry.', error);
    }
  };

  const renderItem = ({ item }: { item: TravelEntry }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
      <View style={styles.infoSection}>
        <Text style={[styles.cardText, { color: colors.text }]}>
          Address: {item.address}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveEntry(item.id)}>
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Travel Entry')}>
        <Text style={styles.buttonText}>Add travel entry</Text>
      </TouchableOpacity>

      {entries.length > 0 ? (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      ) : (
        <Text style={[styles.noEntryText, { color: colors.text }]}>
          No entries yet
        </Text>
      )}

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Icon
          name="moon"
          size={24}
          color={colors.text}
          style={{ marginRight: 8 }}
        />
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: '#ddd', true: '#2e6f40' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#2e6f40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  card: {
    marginBottom: 20,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoSection: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 16,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: '#2e6f40',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    marginTop: 12,
    width: 90,
    alignItems: 'center',
  },
  noEntryText: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;