/**
 * ProfileScreen (rebuilt) - Clean profile with avatar, real stats,
 * test details, and account actions. New design system.
 */
import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Linking,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import HomeButton from '../components/ui/HomeButton';
import { colors, radius, spacing, typography, shadows } from '../theme';

const TEST_TYPE_LABELS = {
  naturalization128: 'Citizenship Test (128)',
  naturalization100: 'Citizenship Test (100)',
  highschool: 'High School Civics',
};

function ProfileScreen({ navigation }) {
  const [deleteStep, setDeleteStep] = useState(0); // 0=none, 1=confirm, 2=final
  const { testDetails, userProfile, updateUserProfile, masteryMap, resetAllData } =
    useContext(AppDataContext);

  const profileName = userProfile?.name || testDetails?.name || 'Future Citizen';
  const [editableName, setEditableName] = useState(profileName);
  const [avatarUri, setAvatarUri] = useState(userProfile?.avatarUri || '');

  const stats = useMemo(() => {
    const byQ = masteryMap?.byQuestion || {};
    const ids = Object.keys(byQ);
    let correct = 0;
    let answered = 0;
    ids.forEach((id) => {
      const q = byQ[id] || {};
      answered += Number(q.attempts || 0);
      correct += Number(q.correct || 0);
    });
    const totalQuestions = Number(masteryMap?.totalQuestions || 0);
    const totalSessions = Number(masteryMap?.totalSessions || 0);
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
    return { answered: totalQuestions || answered, accuracy, sessions: totalSessions };
  }, [masteryMap]);

  const testLabel = TEST_TYPE_LABELS[testDetails?.testType] || 'Civics Test';
  const email = userProfile?.email || '';

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('HomeTab');
  };

  const commitProfile = (patch) => {
    updateUserProfile({
      name: String(editableName || '').trim() || profileName,
      avatarUri,
      email,
      ...patch,
    });
  };

  const handleCommitDisplayName = () => {
    const trimmed = String(editableName || '').trim();
    if (!trimmed) {
      setEditableName(profileName);
      return;
    }
    if (trimmed !== profileName) {
      commitProfile({ name: trimmed });
    }
  };

  const handleAvatarPicked = (uri) => {
    setAvatarUri(uri);
    updateUserProfile({
      name: String(editableName || '').trim() || profileName,
      avatarUri: uri,
      email,
    });
  };

  const handlePickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow photo library access to set your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    handleAvatarPicked(result.assets[0].uri);
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Please allow camera access to take a profile picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    handleAvatarPicked(result.assets[0].uri);
  };

  const handleRemovePhoto = () => {
    handleAvatarPicked('');
  };

  const handleDeleteAccount = () => setDeleteStep(1);

  const confirmDeleteAccount = () => {
    if (typeof resetAllData === 'function') {
      resetAllData();
    }
    setDeleteStep(0);
    goBack();
  };

  const initial = (String(editableName || profileName || 'F').trim()[0] || 'F').toUpperCase();

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <HomeButton />
      </View>

      {/* Identity card */}
      <Card style={styles.identityCard}>
        <TouchableOpacity onPress={handlePickFromLibrary} activeOpacity={0.8}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.nameInput}
          value={editableName}
          onChangeText={setEditableName}
          placeholder="Display name or nickname"
          placeholderTextColor={colors.textTertiary}
          maxLength={32}
          autoCapitalize="words"
          returnKeyType="done"
          onBlur={handleCommitDisplayName}
          onSubmitEditing={handleCommitDisplayName}
        />
        {email ? <Text style={styles.email}>{email}</Text> : null}
        <View style={styles.testBadge}>
          <MaterialCommunityIcons name="flag" size={12} color={colors.primary} />
          <Text style={styles.testBadgeText}>{testLabel}</Text>
        </View>

        <View style={styles.avatarActions}>
          <TouchableOpacity style={styles.avatarAction} onPress={handleTakePhoto} activeOpacity={0.7}>
            <MaterialCommunityIcons name="camera" size={18} color={colors.primary} />
            <Text style={styles.avatarActionText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarAction} onPress={handlePickFromLibrary} activeOpacity={0.7}>
            <MaterialCommunityIcons name="image" size={18} color={colors.primary} />
            <Text style={styles.avatarActionText}>Library</Text>
          </TouchableOpacity>
          {avatarUri ? (
            <TouchableOpacity style={styles.avatarAction} onPress={handleRemovePhoto} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.danger} />
              <Text style={[styles.avatarActionText, { color: colors.danger }]}>Remove</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Card>

      {/* Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.answered}</Text>
          <Text style={styles.statLabel}>Answered</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.accuracy}%</Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.sessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </Card>
      </View>

      {/* Test details */}
      {testDetails && (
        <>
          <Text style={styles.sectionTitle}>Test details</Text>
          <Card style={styles.detailsCard} padded={false}>
            <DetailRow label="Test type" value={testLabel} />
            <View style={styles.divider} />
            <DetailRow label="Location" value={testDetails.state || testDetails.location || '-'} />
            <View style={styles.divider} />
            <DetailRow label="Test date" value={testDetails.testDate || 'Not set'} />
          </Card>
          <Button
            title="Edit test details"
            variant="secondary"
            onPress={() => navigation.navigate('EditTestDetails')}
            style={styles.editBtn}
          />
        </>
      )}

      {/* Legal & account */}
      <Text style={styles.sectionTitle}>Legal & account</Text>
      <Card style={styles.detailsCard} padded={false}>
        <ActionRow
          icon="file-document-outline"
          iconColor={colors.primary}
          label="Terms of Service & EULA"
          onPress={() => Linking.openURL('https://civiceducation.app/terms')}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="shield-lock-outline"
          iconColor={colors.primary}
          label="Privacy Policy"
          onPress={() => Linking.openURL('https://civiceducation.app/privacy')}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="delete-forever-outline"
          iconColor={colors.danger}
          label="Delete Account & Data"
          labelColor={colors.danger}
          bold
          onPress={handleDeleteAccount}
        />
      </Card>

      {/* Delete confirmation - in-app modal (works on web, visible to testers) */}
      <Modal
        visible={deleteStep > 0}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteStep(0)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>
              {deleteStep === 1 ? 'Delete Account & Data' : 'Are you sure?'}
            </Text>
            <Text style={styles.confirmMsg}>
              {deleteStep === 1
                ? 'This will permanently erase all your progress, Squad history, and profile data. This cannot be undone.'
                : 'This is your last chance. All data will be permanently deleted.'}
            </Text>
            <View style={styles.confirmBtns}>
              <Button title="Cancel" variant="secondary" onPress={() => setDeleteStep(0)} style={styles.halfBtn} />
              {deleteStep === 1 ? (
                <TouchableOpacity onPress={() => setDeleteStep(2)} style={[styles.halfBtn, styles.deleteConfirmBtn]} activeOpacity={0.8}>
                  <Text style={styles.deleteConfirmText}>Delete Everything</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={confirmDeleteAccount} style={[styles.halfBtn, styles.deleteConfirmBtn]} activeOpacity={0.8}>
                  <Text style={styles.deleteConfirmText}>Yes, Delete My Account</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, iconColor, label, labelColor, bold, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name={icon} size={20} color={iconColor} style={styles.rowIcon} />
      <Text
        style={[
          styles.rowLabel,
          { color: labelColor || colors.text },
          bold && { fontWeight: typography.bold },
        ]}
      >
        {label}
      </Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text },

  identityCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  avatarFallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: typography.bold, color: colors.primary },
  nameInput: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
    textAlign: 'center',
    paddingVertical: spacing.xs,
    minWidth: 200,
  },
  email: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: spacing.sm,
  },
  testBadgeText: {
    fontSize: typography.small,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginLeft: 4,
  },
  avatarActions: { flexDirection: 'row', marginTop: spacing.md },
  avatarAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  avatarActionText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
    color: colors.primary,
    marginLeft: 6,
  },

  statsRow: { flexDirection: 'row', marginBottom: spacing.md },
  statCard: { flex: 1, alignItems: 'center', marginHorizontal: 4, paddingVertical: spacing.md },
  statValue: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text },
  statLabel: { fontSize: typography.small, color: colors.textSecondary, marginTop: 2 },

  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  detailsCard: { marginBottom: spacing.sm, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  rowIcon: { marginRight: spacing.sm },
  rowLabel: { flex: 1, fontSize: typography.body, color: colors.text },
  rowValue: { fontSize: typography.caption, color: colors.textSecondary, fontWeight: typography.medium },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.md },
  editBtn: { marginBottom: spacing.md },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confirmMsg: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  confirmBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: { flex: 1, marginHorizontal: 4 },
  deleteConfirmBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  deleteConfirmText: {
    color: '#FFFFFF',
    fontWeight: typography.bold,
    fontSize: typography.body,
  },
});

export default ProfileScreen;
