// Firebase services for user data, quiz history, and family management
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    runTransaction,
    query,
    where,
    getDocs,
    arrayUnion,
    serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebaseConfig.js';

// ============ AUTHENTICATION ============
export const registerUser = async (email, password, userName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', uid), {
            uid,
            email,
            userName,
            points: 0,
            level: 1,
            streak: 0,
            lastActiveDate: serverTimestamp(),
            isPremium: false,
            premiumExpiryDate: null,
            createdAt: serverTimestamp(),
            avatar: null,
            state: 'CA',
            testTrack: 'standardTrack',
            totalQuestionsAnswered: 0,
            totalAccuracy: 0,
        });

        return userCredential.user;
    } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error(`Logout failed: ${error.message}`);
    }
};

export const watchAuthState = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ============ USER PROFILE ============
export const getUserProfile = async (uid) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

export const updateUserProfile = async (uid, updates) => {
    try {
        await updateDoc(doc(db, 'users', uid), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
    }
};

// ============ QUIZ HISTORY ============
export const saveQuizResult = async (uid, quizResult) => {
    try {
        const quizHistoryRef = collection(db, 'users', uid, 'quizHistory');
        const docRef = doc(quizHistoryRef);

        const result = {
            id: docRef.id,
            type: quizResult.type,
            score: quizResult.score,
            total: quizResult.total,
            accuracy: (quizResult.score / quizResult.total) * 100,
            answeredAt: serverTimestamp(),
            timeTaken: quizResult.timeTaken || 0,
            weakAreas: quizResult.weakAreas || [],
            questionsAnswered: quizResult.questions || [],
        };

        await setDoc(docRef, result);

        // Update user points and streak
        const userProfile = await getUserProfile(uid);
        const pointsEarned = Math.floor((quizResult.score / quizResult.total) * 100);
        const newTotalPoints = (userProfile?.points || 0) + pointsEarned;
        const newLevel = Math.floor(newTotalPoints / 500) + 1;

        await updateUserProfile(uid, {
            points: newTotalPoints,
            level: newLevel,
            lastActiveDate: serverTimestamp(),
        });

        return result;
    } catch (error) {
        console.error('Error saving quiz result:', error);
    }
};

export const getQuizHistory = async (uid) => {
    try {
        const quizHistoryRef = collection(db, 'users', uid, 'quizHistory');
        const querySnapshot = await getDocs(quizHistoryRef);
        const history = [];
        querySnapshot.forEach((doc) => {
            history.push(doc.data());
        });
        return history;
    } catch (error) {
        console.error('Error fetching quiz history:', error);
        return [];
    }
};

// ============ FAMILY MANAGEMENT ============
export const inviteFamilyMember = async (currentUid, invitedEmail, relationship = 'family') => {
    try {
        // Find the invited user
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', invitedEmail));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('User not found with that email');
        }

        const invitedUid = querySnapshot.docs[0].id;

        // Create family connection (bidirectional)
        await updateDoc(doc(db, 'users', currentUid), {
            familyMembers: arrayUnion({
                uid: invitedUid,
                email: invitedEmail,
                relationship,
                connectedAt: serverTimestamp(),
            }),
        });

        await updateDoc(doc(db, 'users', invitedUid), {
            familyMembers: arrayUnion({
                uid: currentUid,
                email: await (await getDoc(doc(db, 'users', currentUid))).get('email'),
                relationship,
                connectedAt: serverTimestamp(),
            }),
        });

        return { success: true, invitedUid };
    } catch (error) {
        console.error('Error inviting family member:', error);
        throw error;
    }
};

export const getFamilyMembers = async (uid) => {
    try {
        const userProfile = await getUserProfile(uid);
        if (!userProfile?.familyMembers) return [];

        const familyData = [];
        for (const member of userProfile.familyMembers) {
            const memberProfile = await getUserProfile(member.uid);
            familyData.push({ ...member, ...memberProfile });
        }

        return familyData;
    } catch (error) {
        console.error('Error fetching family members:', error);
        return [];
    }
};

export const getFamilyLeaderboard = async (uid) => {
    try {
        const familyMembers = await getFamilyMembers(uid);
        return familyMembers.sort((a, b) => b.points - a.points);
    } catch (error) {
        console.error('Error fetching family leaderboard:', error);
        return [];
    }
};

// ============ WEAK AREAS & ADAPTIVE LEARNING ============
export const getWeakAreas = async (uid) => {
    try {
        const history = await getQuizHistory(uid);
        const topicStats = {};

        for (const quiz of history) {
            if (quiz.weakAreas) {
                for (const area of quiz.weakAreas) {
                    if (!topicStats[area.topic]) {
                        topicStats[area.topic] = { totalAttempts: 0, correctAnswers: 0 };
                    }
                    topicStats[area.topic].totalAttempts += 1;
                    topicStats[area.topic].correctAnswers += area.correct ? 1 : 0;
                }
            }
        }

        const weakAreas = Object.entries(topicStats)
            .map(([topic, stats]) => ({
                topic,
                accuracy: (stats.correctAnswers / stats.totalAttempts) * 100,
                attempts: stats.totalAttempts,
            }))
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);

        return weakAreas;
    } catch (error) {
        console.error('Error calculating weak areas:', error);
        return [];
    }
};

// ============ SUBSCRIPTION STATUS (For premium features) ============
export const checkPremiumStatus = async (uid) => {
    try {
        const userProfile = await getUserProfile(uid);
        if (!userProfile?.isPremium) return false;

        // Check if premium expired
        if (userProfile.premiumExpiryDate) {
            const expiryDate = new Date(userProfile.premiumExpiryDate);
            const today = new Date();
            if (today > expiryDate) {
                // Premium expired, update user
                await updateUserProfile(uid, { isPremium: false });
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
    }
};

export const upgradeToPremium = async (uid, durationMonths = 1) => {
    try {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

        await updateUserProfile(uid, {
            isPremium: true,
            premiumExpiryDate: expiryDate,
            premiumUpgradedAt: serverTimestamp(),
        });

        return { success: true, expiryDate };
    } catch (error) {
        console.error('Error upgrading to premium:', error);
        throw error;
    }
};

// ============ SQUAD REAL-TIME SYNC (SPRINT 5) ============
export const fetchSquadSyncSnapshot = async (teamId) => {
    try {
        const safeTeamId = String(teamId || '').trim();
        if (!safeTeamId) return null;

        const snap = await getDoc(doc(db, 'squads', safeTeamId));
        if (!snap.exists()) return null;
        const data = snap.data() || {};
        return data?.payload || null;
    } catch (error) {
        console.error('Error fetching squad sync snapshot:', error);
        return null;
    }
};

export const pushSquadSyncSnapshot = async (teamId, payload, options = {}) => {
    try {
        const safeTeamId = String(teamId || '').trim();
        if (!safeTeamId || !payload || typeof payload !== 'object') return { ok: false };

        await setDoc(doc(db, 'squads', safeTeamId), {
            teamId: safeTeamId,
            payload,
            revision: Number(payload?.syncMeta?.revision || options?.revision || 0),
            writerDeviceId: String(options?.writerDeviceId || payload?.syncMeta?.lastWriterDeviceId || 'local-device'),
            pushedAt: serverTimestamp(),
            updatedAtIso: payload?.updatedAt || new Date().toISOString(),
        }, { merge: true });

        return { ok: true };
    } catch (error) {
        console.error('Error pushing squad sync snapshot:', error);
        return { ok: false, error: error.message };
    }
};

export const appendSquadAuditEntry = async (teamId, entry) => {
    try {
        const safeTeamId = String(teamId || '').trim();
        if (!safeTeamId || !entry || typeof entry !== 'object') return { ok: false };

        const auditRef = doc(collection(db, 'squads', safeTeamId, 'auditTrail'));
        await setDoc(auditRef, {
            ...entry,
            loggedAt: serverTimestamp(),
        });

        return { ok: true, id: auditRef.id };
    } catch (error) {
        console.error('Error appending squad audit entry:', error);
        return { ok: false, error: error.message };
    }
};

const SERVER_MODERATION_ROLE_LIMITS = Object.freeze({
    parent: { nudge_send: 20, invite_refresh: 10, goal_update: 30 },
    admin: { nudge_send: 16, invite_refresh: 8, goal_update: 24 },
    child: { nudge_send: 4, invite_refresh: 2, goal_update: 6 },
});
const SERVER_MODERATION_MUTE_MS = 10 * 60 * 1000;
const SERVER_MODERATION_MUTE_THRESHOLD = 3;
const SERVER_MODERATION_ESCALATION_THRESHOLD = 5;

const createDefaultModeration = () => ({
    rateBuckets: {},
    mutedActors: {},
    violationsByActor: {},
    escalationByActor: {},
    auditTrail: [],
});

const normalizeRole = (value = '') => {
    const role = String(value || '').trim().toLowerCase();
    if (role === 'parent' || role === 'admin' || role === 'child') return role;
    return 'child';
};

const getRoleRateLimit = (role, actionType) => {
    const safeRole = normalizeRole(role);
    const limits = SERVER_MODERATION_ROLE_LIMITS[safeRole] || SERVER_MODERATION_ROLE_LIMITS.child;
    return Number(limits[actionType] || 6);
};

const pruneExpiredMutedActors = (mutedActors = {}, nowMs = Date.now()) => Object.entries(mutedActors || {}).reduce((acc, [actorId, value]) => {
    const untilMs = Number(value?.untilMs || 0);
    if (untilMs > nowMs) {
        acc[actorId] = value;
    }
    return acc;
}, {});

const normalizeModeration = (value = {}) => {
    const defaults = createDefaultModeration();
    return {
        ...defaults,
        ...(value || {}),
        rateBuckets: value?.rateBuckets && typeof value.rateBuckets === 'object' ? value.rateBuckets : {},
        mutedActors: value?.mutedActors && typeof value.mutedActors === 'object' ? value.mutedActors : {},
        violationsByActor: value?.violationsByActor && typeof value.violationsByActor === 'object' ? value.violationsByActor : {},
        escalationByActor: value?.escalationByActor && typeof value.escalationByActor === 'object' ? value.escalationByActor : {},
        auditTrail: Array.isArray(value?.auditTrail) ? value.auditTrail : [],
    };
};

const evaluateServerModerationPolicy = (payload = {}, params = {}, nowMs = Date.now()) => {
    const nowIso = new Date(nowMs).toISOString();
    const actionType = String(params.actionType || 'unknown').trim() || 'unknown';
    const actorId = String(params.actorId || 'self').trim() || 'self';
    const actorRole = normalizeRole(params.actorRole || 'child');
    const targetMemberIds = Array.from(new Set((Array.isArray(params.targetMemberIds) ? params.targetMemberIds : [])
        .map((id) => String(id || '').trim())
        .filter(Boolean)));

    const moderation = normalizeModeration(payload.moderation);
    const hourKey = new Date(nowMs).toISOString().slice(0, 13);
    const bucketKey = `${actorId}:${actionType}:${hourKey}`;
    const limit = getRoleRateLimit(actorRole, actionType);
    const mutedActors = pruneExpiredMutedActors(moderation.mutedActors, nowMs);
    const existingMute = mutedActors[actorId];

    let allowed = true;
    let reason = 'ok';
    let count = Number(moderation.rateBuckets?.[bucketKey] || 0);
    let mutedUntilIso = null;
    let escalationLevel = Number(moderation.escalationByActor?.[actorId]?.level || 0);

    const nextModeration = {
        ...moderation,
        rateBuckets: { ...(moderation.rateBuckets || {}) },
        mutedActors: { ...mutedActors },
        violationsByActor: { ...(moderation.violationsByActor || {}) },
        escalationByActor: { ...(moderation.escalationByActor || {}) },
        auditTrail: Array.isArray(moderation.auditTrail) ? [...moderation.auditTrail] : [],
    };

    if (existingMute && Number(existingMute.untilMs || 0) > nowMs) {
        allowed = false;
        reason = 'temporary_mute';
        mutedUntilIso = existingMute.untilIso || new Date(existingMute.untilMs).toISOString();
    } else if (count >= limit) {
        allowed = false;
        reason = 'rate_limit';
        const nextViolations = Number(nextModeration.violationsByActor[actorId] || 0) + 1;
        nextModeration.violationsByActor[actorId] = nextViolations;

        if (nextViolations >= SERVER_MODERATION_MUTE_THRESHOLD) {
            const untilMs = nowMs + SERVER_MODERATION_MUTE_MS;
            mutedUntilIso = new Date(untilMs).toISOString();
            nextModeration.mutedActors[actorId] = {
                untilMs,
                untilIso: mutedUntilIso,
                reason: 'repeated_rate_limit',
                actionType,
            };
            reason = 'temporary_mute';
        }

        if (nextViolations >= SERVER_MODERATION_ESCALATION_THRESHOLD) {
            escalationLevel = Number(nextModeration.escalationByActor[actorId]?.level || 0) + 1;
            nextModeration.escalationByActor[actorId] = {
                level: escalationLevel,
                reason: 'repeated_rate_limit',
                lastEscalatedAt: nowIso,
                actionType,
            };
        }
    } else {
        nextModeration.rateBuckets[bucketKey] = count + 1;
        count = Number(nextModeration.rateBuckets[bucketKey] || 0);
    }

    const auditEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        at: nowIso,
        actionType,
        actorId,
        actorRole,
        allowed,
        reason: reason || 'ok',
        limit,
        count,
        targetMemberIds,
        mutedUntilIso: mutedUntilIso || null,
        escalationLevel: Number(escalationLevel || 0),
    };

    nextModeration.auditTrail.push(auditEntry);
    if (nextModeration.auditTrail.length > 120) {
        nextModeration.auditTrail = nextModeration.auditTrail.slice(-120);
    }

    return {
        moderation: nextModeration,
        decision: {
            allowed,
            reason,
            limit,
            count,
            mutedUntilIso,
            escalationLevel,
            actorRole,
        },
        auditEntry,
    };
};

export const enforceServerModerationPolicy = async (teamId, params = {}) => {
    try {
        const safeTeamId = String(teamId || '').trim();
        if (!safeTeamId) return { ok: false, decision: { allowed: true } };

        const squadRef = doc(db, 'squads', safeTeamId);
        const auditRef = doc(collection(db, 'squads', safeTeamId, 'auditTrail'));
        const nowMs = Date.now();
        const nowIso = new Date(nowMs).toISOString();
        let output = { ok: false, decision: { allowed: true } };

        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(squadRef);
            const existingPayload = snap.exists() ? (snap.data()?.payload || {}) : {};
            const evaluation = evaluateServerModerationPolicy(existingPayload, params, nowMs);
            const previousRevision = Number(existingPayload?.syncMeta?.revision || 0);
            const nextRevision = previousRevision + 1;
            const fieldClock = {
                ...(existingPayload?.syncMeta?.fieldClock || {}),
                moderation: nowMs,
            };

            const nextPayload = {
                ...existingPayload,
                teamId: existingPayload?.teamId || safeTeamId,
                moderation: evaluation.moderation,
                updatedAt: nowIso,
                syncMeta: {
                    ...(existingPayload?.syncMeta || {}),
                    revision: nextRevision,
                    lastMutationAt: nowIso,
                    lastWriterDeviceId: 'server-moderation',
                    fieldClock,
                },
            };

            transaction.set(squadRef, {
                teamId: safeTeamId,
                payload: nextPayload,
                revision: nextRevision,
                writerDeviceId: 'server-moderation',
                pushedAt: serverTimestamp(),
                updatedAtIso: nowIso,
            }, { merge: true });

            transaction.set(auditRef, {
                ...evaluation.auditEntry,
                source: 'server_authoritative',
                loggedAt: serverTimestamp(),
            });

            output = {
                ok: true,
                decision: evaluation.decision,
                payload: nextPayload,
                auditDocId: auditRef.id,
            };
        });

        return output;
    } catch (error) {
        console.error('Error enforcing server moderation policy:', error);
        return { ok: false, decision: { allowed: true }, error: error.message };
    }
};

export const runServerModerationAdminAction = async (teamId, action, options = {}) => {
    try {
        const safeTeamId = String(teamId || '').trim();
        const safeAction = String(action || '').trim();
        if (!safeTeamId || !safeAction) return { ok: false };

        const squadRef = doc(db, 'squads', safeTeamId);
        const auditRef = doc(collection(db, 'squads', safeTeamId, 'auditTrail'));
        const nowMs = Date.now();
        const nowIso = new Date(nowMs).toISOString();
        let output = { ok: false };

        await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(squadRef);
            const existingPayload = snap.exists() ? (snap.data()?.payload || {}) : {};
            const moderation = normalizeModeration(existingPayload.moderation);
            const actorId = String(options.actorId || 'self').trim() || 'self';

            const nextModeration = {
                ...moderation,
                rateBuckets: { ...(moderation.rateBuckets || {}) },
                mutedActors: { ...(moderation.mutedActors || {}) },
                violationsByActor: { ...(moderation.violationsByActor || {}) },
                escalationByActor: { ...(moderation.escalationByActor || {}) },
                auditTrail: Array.isArray(moderation.auditTrail) ? [...moderation.auditTrail] : [],
            };

            if (safeAction === 'clear_actor_mute') {
                delete nextModeration.mutedActors[actorId];
            } else if (safeAction === 'reset_actor_escalation') {
                delete nextModeration.escalationByActor[actorId];
                delete nextModeration.violationsByActor[actorId];
            } else if (safeAction === 'reset_rate_buckets') {
                if (actorId === '*') {
                    nextModeration.rateBuckets = {};
                } else {
                    const prefix = `${actorId}:`;
                    Object.keys(nextModeration.rateBuckets).forEach((key) => {
                        if (key.startsWith(prefix)) delete nextModeration.rateBuckets[key];
                    });
                }
            } else if (safeAction === 'clear_local_audit_trail') {
                nextModeration.auditTrail = [];
            }

            const previousRevision = Number(existingPayload?.syncMeta?.revision || 0);
            const nextRevision = previousRevision + 1;
            const fieldClock = {
                ...(existingPayload?.syncMeta?.fieldClock || {}),
                moderation: nowMs,
            };

            const nextPayload = {
                ...existingPayload,
                teamId: existingPayload?.teamId || safeTeamId,
                moderation: nextModeration,
                updatedAt: nowIso,
                syncMeta: {
                    ...(existingPayload?.syncMeta || {}),
                    revision: nextRevision,
                    lastMutationAt: nowIso,
                    lastWriterDeviceId: 'server-admin-moderation',
                    fieldClock,
                },
            };

            const auditEntry = {
                id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                at: nowIso,
                actionType: `admin_${safeAction}`,
                actorId: String(options.adminActorId || 'admin').trim() || 'admin',
                actorRole: 'admin',
                allowed: true,
                reason: safeAction,
                targetMemberIds: actorId ? [actorId] : [],
            };

            transaction.set(squadRef, {
                teamId: safeTeamId,
                payload: nextPayload,
                revision: nextRevision,
                writerDeviceId: 'server-admin-moderation',
                pushedAt: serverTimestamp(),
                updatedAtIso: nowIso,
            }, { merge: true });

            transaction.set(auditRef, {
                ...auditEntry,
                source: 'server_admin',
                loggedAt: serverTimestamp(),
            });

            output = {
                ok: true,
                action: safeAction,
                payload: nextPayload,
                auditDocId: auditRef.id,
            };
        });

        return output;
    } catch (error) {
        console.error('Error running server moderation admin action:', error);
        return { ok: false, error: error.message };
    }
};
