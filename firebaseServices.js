// Firebase services for user data, quiz history, and family management
import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    arrayUnion,
    serverTimestamp,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebaseConfig';

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
