import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import '../assets/react-datepicker.min.css';
import { usStates } from '../constants';
import { colors } from '../theme';
import styles from '../styles';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function EditTestDetailsScreen({ navigation, testDetails, onSave }) {
  const [name, setName] = useState(testDetails?.name || '');
  const [testType, setTestType] = useState(testDetails?.testType || '');
  // Support both 'state' (onboarding) and 'location' (legacy) fields
  const [selectedState, setSelectedState] = useState(testDetails?.state || testDetails?.location || '');
  const [testDate, setTestDate] = useState(
    testDetails?.testDate ? new Date(testDetails.testDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', subtitle: 'Arizona graduation test', icon: 'school' },
    { type: 'naturalization100', title: 'Citizenship Test (100)', subtitle: 'Official 2008 test', icon: 'landmark' },
    { type: 'naturalization128', title: 'Citizenship Test (128)', subtitle: 'Official 2025 test', icon: 'flag' },
  ];

  const handleSave = () => {
    if (!name.trim() || !testType || !selectedState) {
      Alert.alert('Missing info', 'Please fill in your name, test type, and state.');
      return;
    }
    onSave({
      name: name.trim(),
      testType,
      state: selectedState,
      location: selectedState,
      testDate: testDate.toLocaleDateString(),
    });
    navigation.goBack();
  };

  return (
    <Screen>
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Edit Test Details</Text>
        <View style={styles.spacer} />
      </View>

      {/* Name */}
      <Card style={{ marginBottom: 12 }}>
        <Text style={styles.inputLabel}>Your Name</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textTertiary}
        />
      </Card>

      {/* Test Type */}
      <Text style={styles.sectionLabel}>Test Type</Text>
      {testOptions.map((option) => (
        <Card
          key={option.type}
          onPress={() => setTestType(option.type)}
          style={{
            marginBottom: 8,
            borderColor: testType === option.type ? colors.primary : colors.border,
            borderWidth: testType === option.type ? 2 : 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name={option.icon} size={24} color={colors.primary} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            {testType === option.type && (
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
            )}
          </View>
        </Card>
      ))}

      {/* State (dropdown like onboarding) */}
      <Text style={[styles.sectionLabel, { marginTop: 12 }]}>State</Text>
      <Card style={{ marginBottom: 12 }}>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={selectedState}
            onValueChange={(itemValue) => setSelectedState(itemValue)}
            style={styles.picker}
            dropdownIconColor={colors.primary}
            prompt="Select your state"
            mode={Platform.OS === 'android' ? 'dropdown' : undefined}
          >
            <Picker.Item label="Select a state" value="" color={colors.textTertiary} />
            {usStates.map((state) => (
              <Picker.Item key={state} label={state} value={state} />
            ))}
          </Picker>
        </View>
        <Text style={styles.hint}>Questions like "who is your governor" depend on this.</Text>
      </Card>

      {/* Test Date (picker like onboarding) */}
      <Text style={styles.sectionLabel}>Expected Test Date</Text>
      <Card onPress={() => setShowDatePicker(true)} style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="calendar-month" size={26} color={colors.primary} />
          <Text style={[styles.dateText, { flex: 1, marginLeft: 12 }]}>
            {testDate.toLocaleDateString()}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textTertiary} />
        </View>
      </Card>

      {Platform.OS === 'web' ? (
        <Modal visible={showDatePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <DatePicker
                selected={testDate}
                onChange={(date) => { setTestDate(date); setShowDatePicker(false); }}
                inline
              />
              <Button title="Done" onPress={() => setShowDatePicker(false)} />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={testDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setTestDate(date);
            }}
          />
        )
      )}

      <Button title="Save Changes" onPress={handleSave} style={{ marginTop: 12 }} />
    </Screen>
  );
}

export default EditTestDetailsScreen;
