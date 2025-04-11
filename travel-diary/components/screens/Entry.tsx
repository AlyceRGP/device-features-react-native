import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Props } from "../navigation/props";
import { useTheme } from "react-native-paper";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const EntryScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied.");
    }
  };

  const getCurrentLocation = async () => {
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await getAddress(
        locationData.coords.latitude,
        locationData.coords.longitude
      );
    } catch (error) {
      setErrorMsg("Error fetching location.");
      console.error(error);
    }
  };

  const getAddress = async (latitude: number, longitude: number) => {
    try {
      const addressData = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      setAddress(
        formatAddress(
          addressData[0]?.name ?? "",
          addressData[0]?.city ?? "",
          addressData[0]?.region ?? "",
        )
      );
    } catch (error) {
      setErrorMsg("Error fetching address.");
      console.error(error);
    }
  };

  const formatAddress = (
    name: string,
    city: string,
    region: string,
  ): string => {
    return `${name}, ${city}, ${region}`;
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera permission is required to take pictures.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAddress("");
      getCurrentLocation();
    }
  };

  const saveEntry = async () => {
    try {
      if (imageUri && address) {
        const newEntry = {
          id: Date.now().toString(),
          imageUri,
          address,
        };

        const existingEntries = await AsyncStorage.getItem("entries");
        const entries = existingEntries ? JSON.parse(existingEntries) : [];
        const updatedEntries = [newEntry, ...entries];

        await AsyncStorage.setItem("entries", JSON.stringify(updatedEntries));

        await registerForPushNotificationsAsync();
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Travel Diary",
            body: "New travel entry added successfully!",
            sound: "default",
          },
          trigger: null,
        });

        navigation.goBack();
      }
    } catch (error) {
      console.log("Error saving entry to storage", error);
    }
  };

  const handleRemoveEntry = async () => {
    try {
      await AsyncStorage.removeItem("imageUri");
      await AsyncStorage.removeItem("address");
      setImageUri(null);
      setAddress("");
    } catch (error) {
      console.log("Error removing entry", error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (!Device.isDevice) {
      alert("Must use a physical device for push notifications");
      return;
    }

    const { granted: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (!existingStatus) {
      const { granted: newStatus } =
        await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }

    if (!finalStatus) {
      alert("Failed to get push token!");
      return;
    }

    if (!Constants.expoConfig?.extra?.eas?.projectId) {
      alert("Project ID not found in Expo config.");
      return;
    }

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      })
    ).data;

    console.log("Expo Push Token:", token);

    return token;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take a Picture</Text>
      </TouchableOpacity>

      {imageUri && (
        <View>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Image source={{ uri: imageUri }} style={styles.cardImage} />
            <View style={styles.infoSection}>
              <Text style={[styles.cardText, { color: colors.text }]}>
                {address !== "" ? `Address: ${address}` : "Getting address..."}
              </Text>
            </View>
          </View>

          {address !== "" && (
            <View>
              <TouchableOpacity
                style={[styles.saveButton, { marginVertical: 20 }]}
                onPress={saveEntry}
              >
                <Text style={styles.buttonText}>Save Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleRemoveEntry}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {errorMsg && (
        <Text style={[styles.error, { color: colors.error || "red" }]}>
          {errorMsg}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: "#2e6f40",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
    marginBottom: 130,
  },
  saveButton: {
    backgroundColor: "#2e6f40",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 1,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  infoSection: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    marginTop: 10,
    textAlign: "center",
  },
});

export default EntryScreen;