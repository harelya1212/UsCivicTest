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
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import '../assets/react-datepicker.min.css';
import styles from '../styles';
import {
  usStates,
} from '../constants';
import { getStateCodeAndFlag } from '../utils/stateFlags';

function OnboardingScreen({ navigation, route }) {
  const onComplete = route?.params?.onComplete;
  const [step, setStep] = useState(1); // 1=name, 2=testType, 3=state, 4=date
  const [name, setName] = useState('');
  const [testType, setTestType] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedStateMeta = getStateCodeAndFlag(selectedState, 64);

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫', description: 'U.S. Civics high school curriculum' },
    { type: 'naturalization100', title: 'Naturalization (100 Questions)', icon: '🏛️', description: 'U.S. Citizenship Test - 100 questions' },
    { type: 'naturalization128', title: 'Naturalization (128 Questions)', icon: '🇺🇸', description: 'U.S. Citizenship Test - 128 questions' },
  ];

  const handleContinue = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (step === 2 && !testType) {
      Alert.alert('Error', 'Please select a test type');
      return;
    }
    if (step === 3 && !selectedState.trim()) {
      Alert.alert('Error', 'Please select your state');
      return;
    }
    if (step === 4 && !testDate) {
      Alert.alert('Error', 'Please select your test date');
      return;
    }

    if (step === 4) {
      // Complete onboarding
      onComplete({ name, testType, state: selectedState, testDate: testDate.toLocaleDateString() });
    } else {
      setStep(step + 1);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.onboardingProgress}>
          <Text style={styles.onboardingProgressText}>Step {step} of 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, { width: `${(step / 4) * 100}%` }]} />
          </View>
        </View>

        {/* STEP 1: NAME */}
        {step === 1 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>👋</Text>
            <Text style={styles.onboardingTitle}>Welcome! What's your name?</Text>
            <Text style={styles.onboardingSubtitle}>We'll personalize your learning experience</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#ccc"
              />
            </View>
          </View>
        )}

        {/* STEP 2: TEST TYPE */}
        {step === 2 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📚</Text>
            <Text style={styles.onboardingTitle}>Which test are you preparing for?</Text>
            <Text style={styles.onboardingSubtitle}>We'll customize questions based on your test</Text>

            {testOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.onboardingOption,
                  testType === option.type && styles.onboardingOptionSelected,
                ]}
                onPress={() => setTestType(option.type)}
              >
                <View style={styles.optionIcon}>
                  <Text style={styles.optionIconText}>{option.icon}</Text>
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </View>
                {testType === option.type && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#A78BFA" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 3: STATE */}
        {step === 3 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📍</Text>
            <Text style={styles.onboardingTitle}>Which state will you take the test in?</Text>
            <Text style={styles.onboardingSubtitle}>We'll tailor questions to your state</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>State</Text>
              <View style={[
                styles.pickerContainer,
                selectedState ? styles.pickerContainerActive : null,
              ]}>
                <Picker
                  selectedValue={selectedState}
                  onValueChange={(itemValue) => setSelectedState(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#A78BFA"
                  prompt="Select your state"
                  mode={Platform.OS === 'android' ? 'dropdown' : undefined}
                >
                  <Picker.Item label="Select a state" value="" color="#64748B" />
                  {usStates.map(state => <Picker.Item key={state} label={state} value={state} />)}
                </Picker>
              </View>
              {selectedState ? (
                <View style={styles.selectedStatePill}>
                  <Image
                    source={{ uri: selectedStateMeta.flagUri }}
                    style={styles.selectedStateFlag}
                    resizeMode="cover"
                  />
                  <MaterialCommunityIcons name="check-circle" size={14} color="#67E8F9" />
                  <Text style={styles.selectedStatePillText}>
                    Selected: {selectedStateMeta.code ? `${selectedStateMeta.code} • ` : ''}{selectedState}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.inputHint}>This helps us tailor questions to your state</Text>
            </View>
          </View>
        )}

        {/* STEP 4: TEST DATE */}
        {step === 4 && (
          <View style={styles.onboardingStep}>
            <Text style={styles.onboardingIcon}>📅</Text>
            <Text style={styles.onboardingTitle}>When's your test scheduled?</Text>
            <Text style={styles.onboardingSubtitle}>We'll create a personalized study plan</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Expected Test Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                <Text style={styles.dateText}>{testDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <Text style={styles.inputHint}>Tap to select date</Text>
            </View>

            {Platform.OS === 'web' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Test Date</Text>
                    <DatePicker
                      selected={testDate}
                      onChange={(date) => {
                        setTestDate(date);
                        setShowDatePicker(false);
                      }}
                      inline
                      minDate={new Date()}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      scrollableYearDropdown
                      yearDropdownItemNumber={3}
                      todayButton="Today"
                      dateFormat="MM/dd/yyyy"
                    />
                    <TouchableOpacity
                      style={styles.modalCloseButton}
                      onPress={() => setShowDatePicker(false)}
                    >
                      <Text style={styles.modalCloseText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={testDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setTestDate(selectedDate);
                  }}
                />
              )
            )}

            <View style={styles.studyPlanPreview}>
              <Text style={styles.studyPlanTitle}>📊 Your Study Plan</Text>
              {testDate && (
                <Text style={styles.studyPlanText}>
                  {`You have ~${Math.max(1, Math.floor((testDate - new Date()) / (1000 * 60 * 60 * 24)))} days to prepare`}
                </Text>
              )}
              <Text style={styles.studyPlanSmall}>We'll adjust daily goals based on available time</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.onboardingActions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
          >
            <Text style={styles.buttonText}>{step === 1 ? 'Skip' : 'Back'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleContinue}
          >
            <Text style={[styles.buttonText, { color: '#fff' }]}>
              {step === 4 ? 'Complete Setup' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default OnboardingScreen;
