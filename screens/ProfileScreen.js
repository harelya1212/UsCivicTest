import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from '../styles';
import { AppDataContext } from '../context/AppDataContext';

function ProfileScreen({ navigation }) {
  const { testDetails, userProfile, updateUserProfile, resetAllData } = useContext(AppDataContext);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'This will permanently erase all your progress, Squad history, and profile data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This is your last chance. All data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete My Account',
                  style: 'destructive',
                  onPress: () => {
                    if (typeof resetAllData === 'function') {
                      resetAllData();
                    }
                    Alert.alert('Account Deleted', 'All your data has been removed.');
                    if (navigation.canGoBack()) navigation.goBack();
                    else navigation.navigate('HomeTab');
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const [user, setUser] = useState({
    name: userProfile?.name || testDetails?.name || 'Future Citizen',
    email: userProfile?.email || 'user@example.com',
    points: 260,
    level: 3,
    avatar: userProfile?.avatarUri || '',
  });
  const [editableName, setEditableName] = useState(userProfile?.name || testDetails?.name || '');

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
    const avatarUri = result.assets[0].uri;
    setUser((prev) => ({ ...prev, avatar: avatarUri }));
    updateUserProfile({ avatarUri, name: user.name, email: user.email });
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
    const avatarUri = result.assets[0].uri;
    setUser((prev) => ({ ...prev, avatar: avatarUri }));
    updateUserProfile({ avatarUri, name: user.name, email: user.email });
  };

  const handleRemovePhoto = () => {
    setUser((prev) => ({ ...prev, avatar: '' }));
    updateUserProfile({ avatarUri: '', name: user.name, email: user.email });
  };

  const handleCommitDisplayName = () => {
    const trimmed = String(editableName || '').trim();
    if (!trimmed) {
      setEditableName(user.name);
      return;
    }

    if (trimmed === user.name) return;

    setUser((prev) => ({ ...prev, name: trimmed }));
    updateUserProfile({ name: trimmed, avatarUri: user.avatar, email: user.email });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <TouchableOpacity
            style={[styles.editButton, { paddingVertical: 10, paddingHorizontal: 14 }]}
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('HomeTab');
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Exit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, { paddingVertical: 10, paddingHorizontal: 14 }]}
            onPress={() => navigation.navigate('HomeTab')}
          >
            <MaterialCommunityIcons name="home" size={18} color="#fff" />
            <Text style={styles.editButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pageTitle}>Your Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.profileAvatarImage} />
            ) : (
              <Text style={styles.profileAvatarText}>👤</Text>
            )}
          </View>
          <View style={styles.profileAvatarActions}>
            <TouchableOpacity style={styles.profileAvatarActionBtn} onPress={handleTakePhoto}>
              <MaterialCommunityIcons name="camera" size={16} color="#C4B5FD" />
              <Text style={styles.profileAvatarActionText}>Take</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileAvatarActionBtn} onPress={handlePickFromLibrary}>
              <MaterialCommunityIcons name="image-multiple" size={16} color="#C4B5FD" />
              <Text style={styles.profileAvatarActionText}>Library</Text>
            </TouchableOpacity>
            {user.avatar ? (
              <TouchableOpacity style={styles.profileAvatarActionBtn} onPress={handleRemovePhoto}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#FCA5A5" />
                <Text style={styles.profileAvatarActionText}>Remove</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.profileNameEditorWrap}>
            <TextInput
              style={styles.profileNameInput}
              value={editableName}
              onChangeText={setEditableName}
              placeholder="Display name or nickname"
              placeholderTextColor="#64748B"
              maxLength={32}
              autoCapitalize="words"
              returnKeyType="done"
              onBlur={handleCommitDisplayName}
              onSubmitEditing={handleCommitDisplayName}
            />
          </View>

          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{user.points}</Text>
              <Text style={styles.profileStatLabel}>Points</Text>
            </View>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{user.level}</Text>
              <Text style={styles.profileStatLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Test Details Section */}
        {testDetails && (
          <>
            <Text style={[styles.pageTitle, { marginTop: 20, fontSize: 18 }]}>Test Details</Text>
            <View style={styles.profileCard}>
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Type</Text>
                <Text style={styles.testDetailValue}>
                  {testDetails.testType === 'highschool' ? '🏫 High School Civics' : testDetails.testType === 'naturalization100' ? '🏛️ Naturalization (100Q)' : '🇺🇸 Naturalization (128Q)'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Location</Text>
                <Text style={styles.testDetailValue}>📍 {testDetails.state}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.testDetailRow}>
                <Text style={styles.testDetailLabel}>Test Date</Text>
                <Text style={styles.testDetailValue}>📅 {testDetails.testDate}</Text>
              </View>

              <TouchableOpacity
                style={[styles.editButton, { marginTop: 16 }]}
                onPress={() => navigation.navigate('EditTestDetails')}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit Test Details</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Legal & Account */}
        <Text style={[styles.pageTitle, { marginTop: 24, fontSize: 16, color: '#94A3B8' }]}>Legal & Account</Text>
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.profileLegalRow}
            onPress={() => Linking.openURL('https://civiceducation.app/terms')}
          >
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#7C3AED" />
            <Text style={styles.profileLegalLabel}>Terms of Service & EULA</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.profileLegalRow}
            onPress={() => Linking.openURL('https://civiceducation.app/privacy')}
          >
            <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#7C3AED" />
            <Text style={styles.profileLegalLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.profileLegalRow, { paddingVertical: 14 }]}
            onPress={handleDeleteAccount}
          >
            <MaterialCommunityIcons name="delete-forever-outline" size={20} color="#EF4444" />
            <Text style={[styles.profileLegalLabel, { color: '#EF4444', fontWeight: '700' }]}>Delete Account & Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileScreen;
