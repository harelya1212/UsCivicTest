/**
 * FamilyScreen (rebuilt) - Squad challenges, Duolingo-style.
 *
 * One clear flow:
 * - Not in squad: Big "Create Squad" + "Join with Code"
 * - In squad: Leaderboard, test type picker, big "Challenge" button
 * Scoring explained in one line. No clutter.
 */
import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Share, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDataContext } from '../context/AppDataContext';
import Screen from '../components/ui/Screen';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import HomeButton from '../components/ui/HomeButton';
import { colors, gradients, spacing, typography, radius } from '../theme';

const TEST_TYPES = [
  { type: 'naturalization128', label: '128Q', icon: 'flag' },
  { type: 'naturalization100', label: '100Q', icon: 'bank' },
  { type: 'highschool', label: 'High School', icon: 'school' },
];

function FamilyScreen({ navigation }) {
  const {
    squadSync,
    squadList,
    createSquad,
    createNewSquad,
    switchSquad,
    leaveSquad,
    joinSquad,
    refreshSquadInviteCode,
    refreshSquadFromRemote,
    testDetails,
    userProfile,
  } = useContext(AppDataContext);

  const [joinCode, setJoinCode] = useState('');
  const [squadName, setSquadName] = useState('');
  const [selectedTestType, setSelectedTestType] = useState(testDetails?.testType || 'naturalization128');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [leaveTarget, setLeaveTarget] = useState(null);
  const [joinError, setJoinError] = useState('');
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

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Enter a code - ask your friend for their squad invite code.');
      return;
    }
    setJoinError('');
    try {
      const result = await joinSquad?.(code);
      if (result) {
        setJoinCode('');
      } else {
        setJoinError('Code not found. Check the code and try again.');
      }
    } catch (e) {
      setJoinError('Could not join. Please try again.');
    }
  };

  // Share template: the join link uses the app's deep-link scheme (works on
  // devices with the app installed). No web join page or store listing exists
  // yet, so the download URL is a placeholder to fill once listings go live.
  const APP_JOIN_SCHEME = 'civiceducation';
  const APP_DOWNLOAD_URL = ''; // TODO: real App Store / Google Play URL once live

  const handleShare = async () => {
    const firstName = (userProfile?.name || '').trim().split(/\s+/)[0] || 'Your friend';
    const joinLink = `${APP_JOIN_SCHEME}://join?code=${inviteCode}`;
    const lines = [
      `You've been challenged! ${firstName} has invited you to join the "${teamName}" civics squad in US Civic Test!`,
      `Your invite code is: ${inviteCode}`,
      `Join here: ${joinLink}`,
    ];
    if (APP_DOWNLOAD_URL) {
      lines.push(`Don't have US Civic Test yet? Download now: ${APP_DOWNLOAD_URL}`);
    } else {
      lines.push(`Don't have US Civic Test yet? Download it from the App Store or Google Play.`);
    }
    const message = lines.join('\n');
    try {
      // Pass url too: Safari drops text-only shares when handing off to Messages.
      await Share.share({ message, url: joinLink });
    } catch {
      try {
        await Share.share({ message });
      } catch {}
    }
  };

  const handleCreateNew = () => {
    if (!newSquadName.trim()) {
      Alert.alert('Name your squad', 'Give your squad a fun name to get started.');
      return;
    }
    createNewSquad?.(newSquadName.trim());
    setShowCreateNew(false);
    setNewSquadName('');
  };

  // In-app confirmation: Alert.alert is a silent no-op on web and native
  // dialogs are invisible to automation - this modal always renders.
  const handleLeave = (teamId, name) => {
    setLeaveTarget({ teamId, name });
  };
  const confirmLeave = () => {
    const target = leaveTarget;
    setLeaveTarget(null);
    if (target?.teamId) leaveSquad?.(target.teamId);
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
              {joinError ? (
                <Text style={styles.joinErrorText}>{joinError}</Text>
              ) : null}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <HomeButton />
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Invite - gradient card for TikTok energy */}
      <TouchableOpacity onPress={handleShare} activeOpacity={0.85}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inviteGradient}
        >
          <View style={styles.inviteRow}>
            <View>
              <Text style={styles.inviteLabelWhite}>Invite Code</Text>
              <Text style={styles.inviteCodeWhite}>{inviteCode}</Text>
            </View>
            <MaterialCommunityIcons name="share-variant" size={28} color="#fff" />
          </View>
          <Text style={styles.inviteHintWhite}>Tap to share with friends 🚀</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Leaderboard */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
        <TouchableOpacity
          onPress={() => {
            // Manual refresh: pull the latest squad state from Firestore.
            refreshSquadFromRemote?.().catch(() => {});
          }}
          style={{ padding: 8 }}
        >
          <MaterialCommunityIcons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {leaderboard.length === 0 ? (
        <Card style={styles.emptyBoard}>
          <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
        </Card>
      ) : (
        leaderboard.slice(0, 5).map((entry, idx) => {
          // Privacy: show only name initial avatar + name + score (no email, no phone)
          const initial = (entry.name || 'P').trim().charAt(0).toUpperCase();
          return (
            <Card
              key={entry.id || idx}
              style={[
                styles.boardRow,
                idx === 0 && styles.boardRowGold,
              ]}
            >
              <Text style={styles.rank}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </Text>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <Text style={styles.boardName} numberOfLines={1}>{entry.name || 'Player'}</Text>
              <Text style={styles.boardScore}>{entry.score || 0} pts</Text>
            </Card>
          );
        })
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
        icon={<MaterialCommunityIcons name="trophy" size={22} color="#fff" />}
      />
      <Text style={styles.scoringNote}>
        10 questions. Each correct answer = 1 point for your squad.
      </Text>

      {/* My squads: switch between family, friends, ... */}
      <Text style={styles.sectionTitle}>My squads</Text>
      {(Array.isArray(squadList) ? squadList : []).map((s) => {
        const isActive = String(s?.teamId || '') === String(squadSync?.teamId || '');
        const count = Array.isArray(s?.members) ? s.members.length : 0;
        return (
          <Card key={s.teamId} style={[styles.squadRow, isActive && styles.squadRowActive]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() => { if (!isActive) switchSquad?.(s.teamId); }}
              accessibilityLabel={isActive ? `${s.teamName} (active squad)` : `Switch to ${s.teamName}`}
              accessibilityRole="button"
            >
              <Text style={styles.squadRowName}>{s.teamName || 'Squad'}</Text>
              <Text style={styles.squadRowMeta}>
                {count} member{count === 1 ? '' : 's'}{isActive ? ' - Active' : ''}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLeave(s.teamId, s.teamName)}
              style={{ paddingVertical: 12, paddingHorizontal: 16 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.leaveText}>Leave</Text>
            </TouchableOpacity>
          </Card>
        );
      })}
      {!showCreateNew ? (
        <Button
          title="Create another squad"
          variant="secondary"
          onPress={() => setShowCreateNew(true)}
          style={styles.createAnotherBtn}
          icon={<MaterialCommunityIcons name="account-group" size={20} color={colors.primary} />}
        />
      ) : (
        <Card style={styles.createCard}>
          <Text style={styles.createTitle}>Name your new squad</Text>
          <TextInput
            style={styles.nameInput}
            value={newSquadName}
            onChangeText={setNewSquadName}
            placeholder="e.g. Friends League"
            placeholderTextColor={colors.textTertiary}
          />
          <View style={styles.createRow}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowCreateNew(false)} style={styles.halfBtn} />
            <Button title="Create" onPress={handleCreateNew} style={styles.halfBtn} />
          </View>
        </Card>
      )}

      {/* Leave confirmation - in-app modal (works on web, visible to testers) */}
      <Modal
        visible={!!leaveTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setLeaveTarget(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Leave squad?</Text>
            <Text style={styles.confirmMsg}>
              Leave &quot;{leaveTarget?.name || 'this squad'}&quot;? You can rejoin anytime with its invite code.
            </Text>
            <View style={styles.confirmBtns}>
              <Button title="Cancel" variant="secondary" onPress={() => setLeaveTarget(null)} style={styles.halfBtn} />
              <TouchableOpacity onPress={confirmLeave} style={[styles.halfBtn, styles.leaveConfirmBtn]} activeOpacity={0.8}>
                <Text style={styles.leaveConfirmText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  joinErrorText: { color: colors.danger, fontSize: typography.caption, marginTop: spacing.sm, fontWeight: typography.semibold },
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

  inviteGradient: {
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteLabelWhite: { fontSize: typography.caption, color: 'rgba(255,255,255,0.8)' },
  inviteCodeWhite: { fontSize: 28, fontWeight: typography.bold, color: '#fff', letterSpacing: 3, marginTop: 2 },
  inviteHintWhite: { fontSize: typography.small, color: 'rgba(255,255,255,0.9)', marginTop: spacing.sm },
  inviteCard: { marginBottom: spacing.md, backgroundColor: colors.primaryLight },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inviteLabel: { fontSize: typography.caption, color: colors.textSecondary },
  inviteCode: { fontSize: 24, fontWeight: typography.bold, color: colors.primary, letterSpacing: 3, marginTop: 2 },
  inviteHint: { fontSize: typography.small, color: colors.textSecondary, marginTop: spacing.sm },

  sectionTitle: { fontSize: typography.subtitle, fontWeight: typography.bold, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.md },
  emptyBoard: { alignItems: 'center', paddingVertical: spacing.lg },
  emptyText: { fontSize: typography.body, color: colors.textSecondary },
  boardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
  squadRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingVertical: spacing.md },
  squadRowActive: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primaryLight },
  squadRowName: { fontSize: typography.body, fontWeight: typography.bold, color: colors.text },
  squadRowMeta: { fontSize: typography.caption, color: colors.textSecondary, marginTop: 2 },
  leaveText: { fontSize: typography.caption, fontWeight: typography.bold, color: colors.danger },
  createAnotherBtn: { marginTop: spacing.sm },
  boardRowGold: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rank: { fontSize: 20, minWidth: 36 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: { fontSize: 16, fontWeight: typography.bold, color: colors.primary },
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
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  confirmMsg: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  confirmBtns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  leaveConfirmBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  leaveConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default FamilyScreen;
