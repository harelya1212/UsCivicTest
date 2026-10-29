/**
 * OnboardingScreen (rebuilt) - Duolingo-style onboarding.
 *
 * One focused card per step, friendly copy, gradient CTA.
 * Same data collection + navigation contract as before:
 * onComplete({ name, testType, state, testDate }) on the final step.
 */
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  Modal,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-datepicker';
import '../assets/react-datepicker.min.css';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { usStates } from '../constants';
import { getStateCodeAndFlag } from '../utils/stateFlags';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { AppDataContext } from '../context/AppDataContext';

const TOTAL_STEPS = 5;

const STEP_META = {
  1: { icon: '👋', bg: colors.primaryLight, title: 'What should we call you?', subtitle: "This is how we'll cheer you on." },
  2: { icon: '🎯', bg: colors.goldLight, title: 'Which test are you taking?', subtitle: "We'll build your practice around it." },
  3: { icon: '📍', bg: colors.infoLight, title: 'Which state are you in?', subtitle: 'Some answers depend on your state.' },
  4: { icon: '📅', bg: colors.successLight, title: "When's test day?", subtitle: "We'll count down with you." },
  5: { icon: '👥', bg: colors.primaryLight, title: 'Learn together, win together', subtitle: 'Study squads beat solo study - challenge friends daily.' },
};

function OnboardingScreen({ navigation, route }) {
  const onComplete = route?.params?.onComplete;
  const [step, setStep] = useState(1); // 1=name, 2=testType, 3=state, 4=date, 5=squad
  const { createNewSquad, joinSquad } = useContext(AppDataContext) || {};
  const [squadMode, setSquadMode] = useState(null); // 'create' | 'join' | null
  const [squadName, setSquadName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [squadBusy, setSquadBusy] = useState(false);
  const [squadDone, setSquadDone] = useState(false);
  const [name, setName] = useState('');
  const [testType, setTestType] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [testDate, setTestDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const selectedStateMeta = getStateCodeAndFlag(selectedState, 64);

  const testOptions = [
    { type: 'highschool', title: 'High School Civics', icon: '🏫', description: 'Ace your school civics test' },
    { type: 'naturalization100', title: 'Citizenship (100)', icon: '🏛️', description: 'The classic 100-question test' },
    { type: 'naturalization128', title: 'Citizenship (128)', icon: '🇺🇸', description: 'The new 2025 test format' },
  ];

  const handleContinue = () => {
    if (step === 1 && !name.trim()) {
      Alert.alert('Almost there', 'Tell us your name so we can personalize your practice.');
      return;
    }
    if (step === 2 && !testType) {
      Alert.alert('Pick a test', 'Choose the test you are preparing for.');
      return;
    }
    if (step === 3 && !selectedState.trim()) {
      Alert.alert('Pick a state', 'Select the state where you will take the test.');
      return;
    }
    if (step === 4 && !testDate) {
      Alert.alert('Pick a date', 'Select your expected test date.');
      return;
    }

    if (step === 5) {
      // Squad is optional - complete onboarding either way
      onComplete({ name, testType, state: selectedState, testDate: testDate.toLocaleDateString() });
    } else {
      setStep(step + 1);
    }
  };

  const handleCreateSquad = async () => {
    const trimmed = squadName.trim();
    if (!trimmed) {
      Alert.alert('Name your squad', 'Give your squad a name first.');
      return;
    }
    setSquadBusy(true);
    try {
      await createNewSquad?.(trimmed);
      setSquadDone(true);
    } catch (e) {
      Alert.alert('Could not create squad', 'Please try again.');
    } finally {
      setSquadBusy(false);
    }
  };

  const handleJoinSquad = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Enter a code', 'Ask your friend for their squad invite code.');
      return;
    }
    setSquadBusy(true);
    try {
      const result = await joinSquad?.(code);
      if (result) {
        setSquadDone(true);
      } else {
        Alert.alert('Code not found', 'Check the code and try again.');
      }
    } catch (e) {
      Alert.alert('Could not join', 'Please try again.');
    } finally {
      setSquadBusy(false);
    }
  };

  const meta = STEP_META[step];
  const daysToPrepare = Math.max(1, Math.floor((testDate - new Date()) / 86400000));

  return (
    <Screen contentStyle={styles.screenContent}>
      {/* Progress */}
      <View style={styles.progressWrap}>
        <Text style={styles.progressText}>Step {step} of {TOTAL_STEPS}</Text>
        <ProgressBar progress={step / TOTAL_STEPS} height={8} />
      </View>

      {/* Step header */}
      <View style={styles.stepHeader}>
        <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
          <Text style={styles.iconText}>{meta.icon}</Text>
        </View>
        <Text style={styles.title}>{meta.title}</Text>
        <Text style={styles.subtitle}>{meta.subtitle}</Text>
      </View>

      {/* STEP 1: NAME */}
      {step === 1 && (
        <Card>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Alex"
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textTertiary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </Card>
      )}

      {/* STEP 2: TEST TYPE */}
      {step === 2 && (
        <View>
          {testOptions.map((option) => {
            const selected = testType === option.type;
            return (
              <Card
                key={option.type}
                onPress={() => setTestType(option.type)}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </View>
                {selected ? (
                  <MaterialCommunityIcons name="check-circle" size={26} color={colors.primary} />
                ) : (
                  <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={26} color={colors.border} />
                )}
              </Card>
            );
          })}
        </View>
      )}

      {/* STEP 3: STATE */}
      {step === 3 && (
        <Card>
          <Text style={styles.label}>State</Text>
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
          {selectedState ? (
            <View style={styles.statePill}>
              {selectedStateMeta.flagUri ? (
                <Image
                  source={{ uri: selectedStateMeta.flagUri }}
                  style={styles.stateFlag}
                  resizeMode="cover"
                />
              ) : null}
              <Text style={styles.statePillText}>
                {selectedStateMeta.code ? `${selectedStateMeta.code} - ` : ''}{selectedState}
              </Text>
              <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
            </View>
          ) : null}
          <Text style={styles.hint}>Questions like "who is your governor" depend on this.</Text>
        </Card>
      )}

      {/* STEP 4: TEST DATE */}
      {step === 4 && (
        <View>
          <Card onPress={() => setShowDatePicker(true)} style={styles.dateCard}>
            <MaterialCommunityIcons name="calendar-month" size={26} color={colors.primary} />
            <Text style={styles.dateText}>{testDate.toLocaleDateString()}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color={colors.textTertiary} />
          </Card>

          <Card style={styles.planCard}>
            <Text style={styles.planTitle}>🔥 {daysToPrepare} day{daysToPrepare === 1 ? '' : 's'} to prepare</Text>
            <Text style={styles.planSubtitle}>We'll build daily goals that fit your timeline.</Text>
          </Card>

          {Platform.OS === 'web' ? (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="fade"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select test date</Text>
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
                  <Button
                    title="Close"
                    variant="secondary"
                    onPress={() => setShowDatePicker(false)}
                    style={styles.modalClose}
                  />
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
        </View>
      )}

      {/* STEP 5: SQUAD */}
      {step === 5 && (
        <View>
          {squadDone ? (
            <Card style={styles.squadDoneCard}>
              <Text style={styles.squadDoneEmoji}>🎉</Text>
              <Text style={styles.squadDoneTitle}>You're in a squad!</Text>
              <Text style={styles.squadDoneSub}>Daily challenges and leaderboards await.</Text>
            </Card>
          ) : squadMode === null ? (
            <View>
              <Card onPress={() => setSquadMode('create')} style={styles.option}>
                <Text style={styles.optionIcon}>🚀</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Create a squad</Text>
                  <Text style={styles.optionDesc}>Invite friends, compete daily</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={26} color={colors.border} />
              </Card>
              <Card onPress={() => setSquadMode('join')} style={styles.option}>
                <Text style={styles.optionIcon}>🔑</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Join with a code</Text>
                  <Text style={styles.optionDesc}>Got an invite from a friend?</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={26} color={colors.border} />
              </Card>
            </View>
          ) : squadMode === 'create' ? (
            <Card>
              <Text style={styles.label}>Squad name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Future Citizens"
                value={squadName}
                onChangeText={setSquadName}
                placeholderTextColor={colors.textTertiary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreateSquad}
              />
              <Button
                title={squadBusy ? 'Creating...' : 'Create squad'}
                onPress={handleCreateSquad}
                disabled={squadBusy}
                style={styles.squadAction}
              />
              <Button title="Back" variant="ghost" onPress={() => setSquadMode(null)} />
            </Card>
          ) : (
            <Card>
              <Text style={styles.label}>Invite code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="e.g. A30-P6AP"
                value={joinCode}
                onChangeText={(t) => setJoinCode(t.toUpperCase())}
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleJoinSquad}
              />
              <Button
                title={squadBusy ? 'Joining...' : 'Join squad'}
                onPress={handleJoinSquad}
                disabled={squadBusy}
                style={styles.squadAction}
              />
              <Button title="Back" variant="ghost" onPress={() => setSquadMode(null)} />
            </Card>
          )}
        </View>
      )}

      <View style={styles.spacer} />

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title={step === 1 ? 'Skip' : 'Back'}
          variant="ghost"
          onPress={() => step > 1 && setStep(step - 1)}
          disabled={step === 1}
          style={styles.backButton}
        />
        <Button
          title={step === 5 ? (squadDone ? "Let's do this" : 'Skip for now') : step === 4 ? 'Continue' : 'Continue'}
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { flexGrow: 1 },
  progressWrap: { marginBottom: spacing.lg },
  progressText: {
    fontSize: typography.small,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  stepHeader: { alignItems: 'center', marginBottom: spacing.lg },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  iconText: { fontSize: 34 },
  title: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  label: {
    fontSize: typography.small,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    fontSize: typography.subtitle,
    fontWeight: typography.medium,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: { fontSize: typography.small, color: colors.textTertiary, marginTop: spacing.sm },

  option: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  optionSelected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: colors.primaryLight },
  optionIcon: { fontSize: 30, marginRight: spacing.md },
  optionText: { flex: 1 },
  optionTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text },
  optionDesc: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },

  pickerWrap: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: { color: colors.text },
  statePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  stateFlag: { width: 28, height: 20, borderRadius: 4, marginRight: spacing.sm },
  statePillText: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.text, marginRight: 6 },

  dateCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  dateText: { flex: 1, fontSize: typography.subtitle, fontWeight: typography.semibold, color: colors.text, marginLeft: spacing.md },
  planCard: { backgroundColor: colors.goldLight, borderColor: colors.gold, alignItems: 'center' },
  planTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text },
  planSubtitle: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.raised,
  },
  modalTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.md },
  modalClose: { marginTop: spacing.md, minWidth: 140 },

  spacer: { flex: 1, minHeight: spacing.lg },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  backButton: { flex: 1, marginRight: spacing.sm },
  continueButton: { flex: 2 },

  squadDoneCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  squadDoneEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  squadDoneTitle: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  squadDoneSub: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  squadAction: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  codeInput: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
