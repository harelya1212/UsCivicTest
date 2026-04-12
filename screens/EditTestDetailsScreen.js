import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import styles from '../styles';

function EditTestDetailsScreen({ navigation, testDetails, onSave }) {
  const [name, setName] = useState(testDetails?.name || '');
  const [testType, setTestType] = useState(testDetails?.testType || '');
  const [location, setLocation] = useState(testDetails?.location || '');
  const [testDate, setTestDate] = useState(testDetails?.testDate || '');

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫' },
    { type: 'naturalization100', title: 'Naturalization (100Q)', icon: '🏛️' },
    { type: 'naturalization128', title: 'Naturalization (128Q)', icon: '🇺🇸' },
  ];

  const handleSave = () => {
    if (!name.trim() || !testType || !location.trim() || !testDate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onSave({ name, testType, location, testDate });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#A78BFA" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Edit Test Details</Text>
          <View style={styles.spacer} />
        </View>

        {/* Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Test Type */}
        <Text style={styles.sectionLabel}>Test Type</Text>
        {testOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.onboardingOption,
              testType === option.type && styles.onboardingOptionSelected,
            ]}
            onPress={() => setTestType(option.type)}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
            <Text style={styles.optionTitle}>{option.title}</Text>
            {testType === option.type && (
              <MaterialCommunityIcons name="check-circle" size={20} color="#A78BFA" />
            )}
          </TouchableOpacity>
        ))}

        {/* Location */}
        <View style={[styles.inputContainer, { marginTop: 16 }]}>
          <Text style={styles.inputLabel}>Test Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="City, State"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Test Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expected Test Date</Text>
          <TextInput
            style={styles.textInput}
            value={testDate}
            onChangeText={setTestDate}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#ccc"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, { marginTop: 20 }]}
          onPress={handleSave}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default EditTestDetailsScreen;
