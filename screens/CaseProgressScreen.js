import React, { useState, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Share,
  Alert,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';
import {
  buildCaseProgressStorageKey,
  buildCaseReminderStorageKey,
  escapeHtml,
  buildDefaultCaseProgress,
} from '../utils/helpers';
import {
  CASE_PROGRESS_STAGES,
  WEEKDAY_OPTIONS,
  CASE_STAGE_CHECKLISTS,
} from '../constants';

function CaseProgressScreen({ navigation }) {
  const { testDetails } = useContext(AppDataContext);
  const storageKey = buildCaseProgressStorageKey(testDetails);
  const reminderStorageKey = buildCaseReminderStorageKey(testDetails);
  const [loading, setLoading] = useState(true);
  const [savedCase, setSavedCase] = useState(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [caseType, setCaseType] = useState('N-400');
  const [currentStage, setCurrentStage] = useState(0);
  const [latestStatus, setLatestStatus] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleDateString());
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderWeekday, setReminderWeekday] = useState(2);
  const [reminderNotificationId, setReminderNotificationId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadCaseProgress = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!mounted) return;

        if (raw) {
          const parsed = JSON.parse(raw);
          setSavedCase(parsed);
          setReceiptNumber(parsed.receiptNumber || '');
          setCaseType(parsed.caseType || 'N-400');
          setCurrentStage(Math.max(0, Math.min(CASE_PROGRESS_STAGES.length - 1, Number(parsed.currentStage) || 0)));
          setLatestStatus(parsed.latestStatus || '');
          setLastUpdated(parsed.lastUpdated || new Date().toLocaleDateString());
          setNotes(parsed.notes || '');
        } else {
          const fallback = buildDefaultCaseProgress(testDetails);
          setSavedCase(fallback);
          setReceiptNumber(fallback.receiptNumber);
          setCaseType(fallback.caseType);
          setCurrentStage(fallback.currentStage);
          setLatestStatus(fallback.latestStatus);
          setLastUpdated(fallback.lastUpdated);
          setNotes(fallback.notes);
        }

        const reminderRaw = await AsyncStorage.getItem(reminderStorageKey);
        if (reminderRaw) {
          const reminder = JSON.parse(reminderRaw);
          setReminderEnabled(Boolean(reminder.enabled));
          setReminderWeekday(Number(reminder.weekday) || 2);
          setReminderNotificationId(reminder.notificationId || null);
        }
      } catch (error) {
        console.log('Failed to load case progress:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCaseProgress();
    return () => {
      mounted = false;
    };
  }, [storageKey, reminderStorageKey, testDetails]);

  const progressPct = Math.round(((currentStage + 1) / CASE_PROGRESS_STAGES.length) * 100);
  const currentStageLabel = CASE_PROGRESS_STAGES[currentStage] || CASE_PROGRESS_STAGES[0];
  const stageChecklist = CASE_STAGE_CHECKLISTS[currentStageLabel] || [];

  const persistReminderSettings = async (nextReminder) => {
    try {
      await AsyncStorage.setItem(reminderStorageKey, JSON.stringify(nextReminder));
    } catch (error) {
      console.log('Failed to persist reminder settings:', error);
    }
  };

  const saveCaseProgress = async () => {
    if (!receiptNumber.trim()) {
      Alert.alert('Missing Receipt Number', 'Please enter your USCIS receipt number before saving.');
      return;
    }

    const nowStamp = new Date().toLocaleDateString();
    const normalizedDate = lastUpdated.trim() || nowStamp;
    const stageLabel = currentStageLabel;
    const statusLabel = latestStatus.trim() || stageLabel;
    const previousTimeline = Array.isArray(savedCase?.timeline) ? savedCase.timeline : [];
    const changed = !savedCase
      || savedCase.currentStage !== currentStage
      || String(savedCase.latestStatus || '') !== statusLabel
      || String(savedCase.lastUpdated || '') !== normalizedDate;

    const timeline = changed
      ? [
          {
            id: `${Date.now()}`,
            date: normalizedDate,
            stage: stageLabel,
            status: statusLabel,
          },
          ...previousTimeline,
        ].slice(0, 30)
      : previousTimeline;

    const payload = {
      applicantName: testDetails?.name || 'Applicant',
      receiptNumber: receiptNumber.trim(),
      caseType: caseType.trim() || 'N-400',
      currentStage,
      latestStatus: statusLabel,
      lastUpdated: normalizedDate,
      notes,
      timeline,
    };

    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
      setSavedCase(payload);
      Alert.alert('Saved', 'Case progress was saved for this user profile.');
    } catch (error) {
      console.log('Failed to save case progress:', error);
      Alert.alert('Save Failed', 'Please try again.');
    }
  };

  const clearCaseProgress = async () => {
    Alert.alert('Reset Case Progress', 'This will remove saved case progress for this profile.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const fallback = buildDefaultCaseProgress(testDetails);
          try {
            await AsyncStorage.removeItem(storageKey);
            setSavedCase(fallback);
            setReceiptNumber(fallback.receiptNumber);
            setCaseType(fallback.caseType);
            setCurrentStage(fallback.currentStage);
            setLatestStatus(fallback.latestStatus);
            setLastUpdated(fallback.lastUpdated);
            setNotes(fallback.notes);
          } catch (error) {
            console.log('Failed to clear case progress:', error);
          }
        },
      },
    ]);
  };

  const enableWeeklyReminder = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported on Web', 'Push reminders are available on iOS/Android builds.');
      return;
    }

    try {
      const existingPermission = await Notifications.getPermissionsAsync();
      let finalStatus = existingPermission.status;
      if (finalStatus !== 'granted') {
        const requestPermission = await Notifications.requestPermissionsAsync();
        finalStatus = requestPermission.status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Needed', 'Enable notifications to receive weekly USCIS check reminders.');
        return;
      }

      if (reminderNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'USCIS Weekly Check-In',
          body: 'Open your USCIS account and update your case tracker.',
          data: { screen: 'CaseProgress' },
        },
        trigger: {
          weekday: reminderWeekday,
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });

      setReminderEnabled(true);
      setReminderNotificationId(identifier);
      await persistReminderSettings({
        enabled: true,
        weekday: reminderWeekday,
        notificationId: identifier,
      });

      const label = WEEKDAY_OPTIONS.find((d) => d.value === reminderWeekday)?.label || 'selected day';
      Alert.alert('Reminder Enabled', `Weekly reminder set for ${label} at 9:00 AM.`);
    } catch (error) {
      console.log('Failed to enable weekly reminder:', error);
      Alert.alert('Reminder Error', 'Could not schedule weekly reminder.');
    }
  };

  const disableWeeklyReminder = async () => {
    try {
      if (reminderNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminderNotificationId);
      }
      setReminderEnabled(false);
      setReminderNotificationId(null);
      await persistReminderSettings({
        enabled: false,
        weekday: reminderWeekday,
        notificationId: null,
      });
      Alert.alert('Reminder Disabled', 'Weekly USCIS reminder has been turned off.');
    } catch (error) {
      console.log('Failed to disable weekly reminder:', error);
      Alert.alert('Reminder Error', 'Could not disable reminder.');
    }
  };

  const addChecklistToNotes = () => {
    if (!stageChecklist.length) return;
    const checklistText = [`${currentStageLabel} checklist:`]
      .concat(stageChecklist.map((item) => `- ${item}`))
      .join('\n');
    const nextNotes = notes?.trim()
      ? `${notes.trim()}\n\n${checklistText}`
      : checklistText;
    setNotes(nextNotes);
  };

  const buildTimelineTextSnapshot = () => {
    const timeline = savedCase?.timeline || [];
    const header = [
      `USCIS Case Progress Snapshot`,
      `Applicant: ${testDetails?.name || 'Applicant'}`,
      `Receipt Number: ${receiptNumber || 'N/A'}`,
      `Case Type: ${caseType || 'N/A'}`,
      `Current Stage: ${currentStageLabel}`,
      `Latest Status: ${latestStatus || 'N/A'}`,
      `Last Updated: ${lastUpdated || 'N/A'}`,
      '',
      'Timeline',
    ];

    const timelineLines = timeline.length
      ? timeline.map((event, idx) => `${idx + 1}. ${event.date} | ${event.stage} | ${event.status}`)
      : ['No timeline updates saved yet.'];

    const checklistLines = [
      '',
      `${currentStageLabel} Document Checklist`,
      ...(stageChecklist.length ? stageChecklist.map((item, idx) => `${idx + 1}. ${item}`) : ['No checklist template available.']),
    ];

    return header.concat(timelineLines).concat(checklistLines).join('\n');
  };

  const shareTextSnapshot = async () => {
    try {
      await Share.share({
        title: 'USCIS Case Snapshot',
        message: buildTimelineTextSnapshot(),
      });
    } catch (error) {
      console.log('Failed to share timeline text snapshot:', error);
      Alert.alert('Share Error', 'Could not share text snapshot.');
    }
  };

  const sharePdfSnapshot = async () => {
    try {
      const timeline = savedCase?.timeline || [];
      const timelineRows = timeline.length
        ? timeline.map((event) => `
          <tr>
            <td>${escapeHtml(event.date)}</td>
            <td>${escapeHtml(event.stage)}</td>
            <td>${escapeHtml(event.status)}</td>
          </tr>
        `).join('')
        : '<tr><td colspan="3">No timeline updates saved yet.</td></tr>';
      const checklistRows = stageChecklist.length
        ? stageChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
        : '<li>No checklist template available.</li>';

      const html = `
        <html>
          <body style="font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 20px; color: #111827;">
            <h1>USCIS Case Progress Snapshot</h1>
            <p><strong>Applicant:</strong> ${escapeHtml(testDetails?.name || 'Applicant')}</p>
            <p><strong>Receipt Number:</strong> ${escapeHtml(receiptNumber || 'N/A')}</p>
            <p><strong>Case Type:</strong> ${escapeHtml(caseType || 'N/A')}</p>
            <p><strong>Current Stage:</strong> ${escapeHtml(currentStageLabel)}</p>
            <p><strong>Latest Status:</strong> ${escapeHtml(latestStatus || 'N/A')}</p>
            <p><strong>Last Updated:</strong> ${escapeHtml(lastUpdated || 'N/A')}</p>
            <h2>Timeline</h2>
            <table style="width:100%; border-collapse: collapse;" border="1" cellspacing="0" cellpadding="8">
              <thead>
                <tr>
                  <th align="left">Date</th>
                  <th align="left">Stage</th>
                  <th align="left">Status</th>
                </tr>
              </thead>
              <tbody>
                ${timelineRows}
              </tbody>
            </table>
            <h2 style="margin-top: 18px;">${escapeHtml(currentStageLabel)} Checklist</h2>
            <ul>${checklistRows}</ul>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const shareAvailable = await Sharing.isAvailableAsync();
      if (!shareAvailable) {
        await Share.share({ message: `PDF created at: ${uri}` });
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share USCIS Case Snapshot PDF',
      });
    } catch (error) {
      console.log('Failed to share PDF snapshot:', error);
      Alert.alert('Export Error', 'Could not export PDF snapshot.');
    }
  };

  const openUSCISPortal = async () => {
    const url = 'https://myaccount.uscis.gov/sign-in';
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unable to Open Link', 'Please open USCIS manually in your browser.');
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.log('Unable to open USCIS link:', error);
      Alert.alert('Unable to Open Link', 'Please open USCIS manually in your browser.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Case Progress</Text>
          <Text style={styles.pageSubtitle}>Loading your case tracker...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#A78BFA" />
          <Text style={{ color: '#A78BFA', fontWeight: '600', marginLeft: 4 }}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Case Progress Tracker</Text>
        <Text style={styles.pageSubtitle}>Track your USCIS timeline and sync updates after checking your official account.</Text>

        <View style={styles.caseCard}>
          <View style={styles.caseHeaderRow}>
            <Text style={styles.caseTitle}>{testDetails?.name || 'Applicant'}</Text>
            <Text style={styles.casePct}>{progressPct}%</Text>
          </View>

          <View style={styles.caseProgressTrack}>
            <View style={[styles.caseProgressFill, { width: `${progressPct}%` }]} />
          </View>

          <Text style={styles.caseSubtext}>Stage: {currentStageLabel}</Text>

          <TouchableOpacity style={styles.casePortalButton} onPress={openUSCISPortal}>
            <MaterialCommunityIcons name="open-in-new" size={18} color="#fff" />
            <Text style={styles.casePortalButtonText}>Open USCIS Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.caseCard}>
          <Text style={styles.caseTitle}>Weekly Reminder</Text>
          <Text style={styles.caseSubtext}>Set a weekly push reminder to check USCIS status and update this tracker.</Text>

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Reminder Day</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={reminderWeekday} onValueChange={(value) => setReminderWeekday(Number(value) || 2)} style={styles.picker}>
              {WEEKDAY_OPTIONS.map((day) => (
                <Picker.Item key={day.value} label={day.label} value={day.value} />
              ))}
            </Picker>
          </View>

          <View style={styles.caseActionRow}>
            <TouchableOpacity style={styles.caseSaveButton} onPress={enableWeeklyReminder}>
              <MaterialCommunityIcons name="bell-ring-outline" size={18} color="#fff" />
              <Text style={styles.caseSaveButtonText}>Enable Weekly Reminder</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.caseResetButton} onPress={disableWeeklyReminder}>
              <MaterialCommunityIcons name="bell-off-outline" size={18} color="#A78BFA" />
              <Text style={styles.caseResetButtonText}>Disable</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.caseSubtext}>
            Reminder status: {reminderEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        <View style={styles.caseCard}>
          <Text style={styles.caseLabel}>Receipt Number</Text>
          <TextInput
            style={styles.textInput}
            value={receiptNumber}
            onChangeText={setReceiptNumber}
            placeholder="Example: IOE1234567890"
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Case Type</Text>
          <TextInput
            style={styles.textInput}
            value={caseType}
            onChangeText={setCaseType}
            placeholder="N-400"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Current Stage</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={currentStage} onValueChange={(value) => setCurrentStage(Number(value) || 0)} style={styles.picker}>
              {CASE_PROGRESS_STAGES.map((stage, idx) => (
                <Picker.Item key={stage} label={`${idx + 1}. ${stage}`} value={idx} />
              ))}
            </Picker>
          </View>

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Latest USCIS Status</Text>
          <TextInput
            style={styles.textInput}
            value={latestStatus}
            onChangeText={setLatestStatus}
            placeholder="Ex: Interview was scheduled"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Last Updated (MM/DD/YYYY)</Text>
          <TextInput
            style={styles.textInput}
            value={lastUpdated}
            onChangeText={setLastUpdated}
            placeholder="MM/DD/YYYY"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={[styles.caseLabel, { marginTop: 12 }]}>Notes</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 90, textAlignVertical: 'top' }]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Interview prep notes, document checklist, reminders..."
            placeholderTextColor="#9CA3AF"
          />

          <View style={styles.caseActionRow}>
            <TouchableOpacity style={styles.caseSaveButton} onPress={saveCaseProgress}>
              <MaterialCommunityIcons name="content-save" size={18} color="#fff" />
              <Text style={styles.caseSaveButtonText}>Save Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.caseResetButton} onPress={clearCaseProgress}>
              <MaterialCommunityIcons name="trash-can-outline" size={18} color="#A78BFA" />
              <Text style={styles.caseResetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.caseCard}>
          <Text style={styles.caseTitle}>Document Checklist Template</Text>
          <Text style={styles.caseSubtext}>Recommended docs/tasks for stage: {currentStageLabel}</Text>
          {stageChecklist.map((item, idx) => (
            <View key={`${currentStageLabel}-${idx}`} style={styles.caseChecklistItem}>
              <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={16} color="#2563EB" />
              <Text style={styles.caseChecklistText}>{item}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.caseSecondaryButton} onPress={addChecklistToNotes}>
            <MaterialCommunityIcons name="note-plus-outline" size={18} color="#F1F5F9" />
            <Text style={styles.caseSecondaryButtonText}>Add Checklist To Notes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.caseCard}>
          <Text style={styles.caseTitle}>Timeline</Text>
          {(savedCase?.timeline || []).length === 0 ? (
            <Text style={styles.caseSubtext}>No updates yet. Save your first status update to start timeline tracking.</Text>
          ) : (
            (savedCase?.timeline || []).map((event) => (
              <View key={event.id} style={styles.caseTimelineItem}>
                <View style={styles.caseTimelineDot} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.caseTimelineStage}>{event.stage}</Text>
                  <Text style={styles.caseTimelineStatus}>{event.status}</Text>
                  <Text style={styles.caseTimelineDate}>{event.date}</Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.caseActionRow}>
            <TouchableOpacity style={styles.caseSaveButton} onPress={shareTextSnapshot}>
              <MaterialCommunityIcons name="share-variant-outline" size={18} color="#fff" />
              <Text style={styles.caseSaveButtonText}>Share Text Snapshot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.caseResetButton} onPress={sharePdfSnapshot}>
              <MaterialCommunityIcons name="file-pdf-box" size={18} color="#A78BFA" />
              <Text style={styles.caseResetButtonText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default CaseProgressScreen;
