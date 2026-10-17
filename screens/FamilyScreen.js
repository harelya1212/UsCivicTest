/**
 * FamilyScreen (rebuilt) - Squad challenges, Duolingo-style.
 *
 * One clear flow:
 * - Not in squad: Big "Create Squad" + "Join with Code"
 * - In squad: Leaderboard, test type picker, big "Challenge" button
 * Scoring explained in one line. No clutter.
 */
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { colors, spacing, typography, radius } from '../theme';

const TEST_TYPES = [
  { type: 'naturalization128', label: '128Q', icon: 'flag' },
  { type: 'naturalization100', label: '100Q', icon: 'landmark' },
  { type: 'highschool', label: 'High School', icon: 'school' },
];

function FamilyScreen({ navigation }) {
  const {
    squadSync,
    createSquad,
    joinSquad,
    refreshSquadInviteCode,
    testDetails,
  } = useContext(AppDataContext);

  const [joinCode, setJoinCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [selectedTestType, setSelectedTestType] = useState(testDetails?.testType || 'naturalization128');
  const [showCreate, setShowCreate] = useState(false);

  const inSquad = Boolean(squadSync?.teamId);
  const teamName = squadSync?.teamName || 'My Squad';
  const inviteCode = squadSync?.inviteCode || '';
  const members = Array.isArray(squadSync?.members) ? squadSync.members : [];
  const leaderboard = Array.isArray(squadSync?.season?.leaderboard)
    ? [...squadSync.season.leaderboard].sort((a, b) => (b.score || 0) - (a.score || 0))
    : [];

  const handleCreate = () => {
    if (!squadName.trim()) {
      Alert.alert('Name your squad', 'Give your squad a fun name to get started.');
      return;
    }
    createSquad?.(squadName.trim());
    setShowCreate(false);
    setSquadName('');
  };

  const handleJoin = () => {
    if (!joinCode.trim()) {
      Alert.alert('Enter code', 'Ask your friend for their squad invite code.');
      return;
    }
    joinSquad?.(joinCode.trim().toUpperCase());
    setJoinCode('');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my "${teamName}" civics squad! Use code: ${inviteCode}`,
      });
    } catch {}
  };

  const handleChallenge = () => {
    // Start a quiz for the squad competition
    navigation.navigate('Quiz', {
      type: selectedTestType,
      forceQuestionCount: 10,
      squadChallenge: true,
    });
  };

  // NOT IN SQUAD
  if (!inSquad) {
    return (
      <Screen>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏆</Text>
          <Text style={styles.heroTitle}>Squad Up!</Text>
          <Text style={styles.heroSub}>
            Challenge family and friends. Winner gets bragging rights.
          </Text>
        </View>

        {!showCreate ? (
          <>
            <Button
              title="Create a Squad"
              onPress={() => setShowCreate(true)}
              style={styles.bigButton}
              icon={<MaterialCommunityIcons name="account-group" size={22} color="#fff" />}
            />
            <Card style={styles.joinCard}>
              <Text style={styles.joinTitle}>Have a code?</Text>
              <View style={styles.joinRow}>
                <TextInput
                  style={styles.codeInput}
                  value={joinCode}
                  onChangeText={setJoinCode}
                  placeholder="ENTER CODE"
                  autoCapitalize="characters"
                  placeholderTextColor={colors.textTertiary}
                />
                <Button title="Join" onPress={handleJoin} style={styles.joinButton} />
              </View>
            </Card>
          </>
        ) : (
          <Card style={styles.createCard}>
            <Text style={styles.createTitle}>Name your squad</Text>
            <TextInput
              style={styles.nameInput}
              value={squadName}
              onChangeText={setSquadName}
              placeholder="e.g. The Harel Family"
              placeholderTextColor={colors.textTertiary}
            />
            <View style={styles.createRow}>
              <Button title="Cancel" variant="secondary" onPress={() => setShowCreate(false)} style={styles.halfBtn} />
              <Button title="Create" onPress={handleCreate} style={styles.halfBtn} />
            </View>
          </Card>
        )}

        <Card style={styles.howCard}>
          <Text style={styles.howTitle}>How it works</Text>
          <Text style={styles.howText}>
            Each correct answer = 1 point. Most points at the end of the week wins. 🎉
          </Text>
        </Card>
      </Screen>
    );
  }

  // IN SQUAD
  return (
    <Screen>
      {/* Header */}
      <View style={styles.squadHeader}>
        <View>
          <Text style={styles.squadName}>{teamName}</Text>
          <Text style={styles.squadMeta}>{members.length} member{members.length === 1 ? '' : 's'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Invite */}
      <Card style={styles.inviteCard} onPress={handleShare}>
        <View style={styles.inviteRow}>
          <View>
            <Text style={styles.inviteLabel}>Invite Code</Text>
            <Text style={styles.inviteCode}>{inviteCode}</Text>
          </View>
          <MaterialCommunityIcons name="share-variant" size={24} color={colors.primary} />
        </View>
        <Text style={styles.inviteHint}>Tap to share with friends</Text>
      </Card>

      {/* Leaderboard */}
      <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
      {leaderboard.length === 0 ? (
        <Card style={styles.emptyBoard}>
          <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
        </Card>
      ) : (
        leaderboard.slice(0, 5).map((entry, idx) => (
          <Card key={entry.id || idx} style={styles.boardRow}>
            <Text style={styles.rank}>
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
            </Text>
            <Text style={styles.boardName} numberOfLines={1}>{entry.name || 'Player'}</Text>
            <Text style={styles.boardScore}>{entry.score || 0} pts</Text>
          </Card>
        ))
      )}

      {/* Test type picker */}
      <Text style={styles.sectionTitle}>Test Type</Text>
      <View style={styles.testRow}>
        {TEST_TYPES.map((t) => (
          <TouchableOpacity
            key={t.type}
            style={[
              styles.testChip,
              selectedTestType === t.type && styles.testChipActive,
            ]}
            onPress={() => setSelectedTestType(t.type)}
          >
            <MaterialCommunityIcons
              name={t.icon}
              size={18}
              color={selectedTestType === t.type ? '#fff' : colors.primary}
            />
            <Text style={[
              styles.testChipText,
              selectedTestType === t.type && styles.testChipTextActive,
            ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Challenge button */}
      <Button
        title="Start Challenge"
        onPress={handleChallenge}
        style={styles.challengeBtn}
        icon={<MaterialCommunityIcons name="sword-cross" size={22} color="#fff" />}
      />
      <Text style={styles.scoringNote}>
        10 questions. Each correct answer = 1 point for your squad.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: spacing.xl },
  heroEmoji: { fontSize: 64, marginBottom: spacing.md },
  heroTitle: { fontSize: 32, fontWeight: typography.bold, color: colors.text },
  heroSub: { fontSize: typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.lg },
  bigButton: { marginBottom: spacing.md },
  joinCard: { marginBottom: spacing.md },
  joinTitle: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginBottom: spacing.sm },
  joinRow: { flexDirection: 'row', gap: spacing.sm },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    fontWeight: typography.bold,
    textAlign: 'center',
    letterSpacing: 2,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  joinButton: { minWidth: 80 },
  createCard: { marginBottom: spacing.md },
  createTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.md },
  nameInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  createRow: { flexDirection: 'row', gap: spacing.sm },
  halfBtn: { flex: 1 },
  howCard: { backgroundColor: colors.infoLight },
  howTitle: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text, marginBottom: 4 },
  howText: { fontSize: typography.caption, color: colors.textSecondary, lineHeight: 20 },

  squadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  squadName: { fontSize: typography.title, fontWeight: typography.bold, color: colors.text },
  squadMeta: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  backBtn: { padding: spacing.sm },

  inviteCard: { marginBottom: spacing.md, backgroundColor: colors.primaryLight },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inviteLabel: { fontSize: typography.caption, color: colors.textSecondary },
  inviteCode: { fontSize: 24, fontWeight: typography.bold, color: colors.primary, letterSpacing: 3, marginTop: 2 },
  inviteHint: { fontSize: typography.small, color: colors.textSecondary, marginTop: spacing.sm },

  sectionTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  emptyBoard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: typography.body, color: colors.textSecondary },
  boardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
  rank: { fontSize: 20, minWidth: 36 },
  boardName: { flex: 1, fontSize: typography.body, fontWeight: typography.semibold, color: colors.text, marginLeft: spacing.sm },
  boardScore: { fontSize: typography.body, fontWeight: typography.bold, color: colors.primary },

  testRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  testChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  testChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  testChipText: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.text },
  testChipTextActive: { color: '#fff' },

  challengeBtn: { marginTop: spacing.md },
  scoringNote: { fontSize: typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});

export default FamilyScreen;
