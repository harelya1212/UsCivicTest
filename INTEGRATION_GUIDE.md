# 🔌 INTEGRATION GUIDE - Adding Premium & Settings to Navigation

## To Add Premium and Settings Screens to Your App:

### Option 1: Add to Bottom Tab Navigation (Recommended)

Edit the `TabNavigator` function in `App.js` and add these two new Tab.Screen entries:

```javascript
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#7C3AED',
        tabBarInactiveTintColor: '#999',
      }}
    >
      {/* Existing tabs */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      {/* ... other tabs ... */}

      {/* NEW: Settings Tab */}
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cog" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
```

### Option 2: Add as a Side Menu (Alternative)

Import `PremiumScreen` and add to Stack Navigator:

```javascript
// In your App.js imports at top:
import { PremiumScreen, SettingsScreen } from './PremiumScreens';

// Then add to Stack.Navigator:
<Stack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Premium' }} />
<Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
```

---

## Integrate Premium Screen Access

### Add Button to Home Screen

In the `HomeScreen` component, add this button to Quick Actions:

```javascript
<TouchableOpacity 
  style={styles.actionButton} 
  onPress={() => navigation.navigate('Premium')}
>
  <MaterialCommunityIcons name="crown" size={20} color="#FFB84D" />
  <Text style={styles.actionButtonText}>Upgrade to Premium</Text>
  <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
</TouchableOpacity>
```

### Add to Profile/Settings Screen

Link users to Premium from the settings:

```javascript
<TouchableOpacity 
  style={[styles.button, styles.buttonPrimary]}
  onPress={() => navigation.navigate('Premium')}
>
  <MaterialCommunityIcons name="crown" size={20} color="#fff" />
  <Text style={[styles.buttonText, { color: '#fff', marginLeft: 8 }]}>
    Upgrade to Premium
  </Text>
</TouchableOpacity>
```

---

## Enable Firebase Integration

### 1. Uncomment Firebase Imports in App.js

```javascript
// At the top of App.js, uncomment:
import { watchAuthState, getUserProfile, saveQuizResult, loginUser } from './firebaseServices';
import { showInterstitialAd, showRewardedAd, AdScheduler } from './adMobService';
import { PremiumManager, PREMIUM_TIERS, logMonetizationEvent } from './monetizationService';
```

### 2. Add useEffect Hook for Auth State

```javascript
useEffect(() => {
  const unsubscribe = watchAuthState((user) => {
    if (user) {
      // User logged in
      console.log('User logged in:', user.email);
      // Load user profile from Firebase
    } else {
      // User logged out
      console.log('User logged out');
    }
  });
  
  return unsubscribe;
}, []);
```

### 3. Add User Context (Optional but Recommended)

Create a `UserContext.js`:

```javascript
import React, { createContext } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  return (
    <UserContext.Provider value={{ user, setUser, isPremium, setIsPremium }}>
      {children}
    </UserContext.Provider>
  );
};
```

Then wrap your app:

```javascript
<UserProvider>
  <NavigationContainer>
    {/* Your navigation */}
  </NavigationContainer>
</UserProvider>
```

---

## Add Ad Placement

### Banner Ads on Home Screen

```javascript
import { HomeBannerAd, AdScheduler } from './adMobService';

// In HomeScreen component, add at bottom:
<View style={styles.bannerAdContainer}>
  <HomeBannerAd />
</View>

// Style it:
bannerAdContainer: {
  marginTop: 16,
  alignItems: 'center',
}
```

### Interstitial Ads After Quiz

```javascript
import { showInterstitialAd, AdScheduler } from './adMobService';

// In ReviewScreen, after showing results:
useEffect(() => {
  const showAdIfNeeded = async () => {
    // Show interstitial after every 3 quizzes
    const quizCount = await getQuizCount(); // Firebase call
    if (quizCount % 3 === 0) {
      await showInterstitialAd();
    }
  };
  showAdIfNeeded();
}, []);
```

---

## Test Everything

```bash
# Run with web for quick testing
npm start
# Press 'w' for web

# Test these flows:
1. ✅ Home screen loads
2. ✅ Click "Upgrade to Premium"
3. ✅ Premium screen shows with pricing options
4. ✅ Click Settings tab
5. ✅ Settings screen shows
6. ✅ Complete a quiz
7. ✅ See results screen
8. ✅ (Ads would show if configured properly)
```

---

## Next Steps

1. **Setup Firebase credentials** (see QUICK_START.md)
2. **Setup AdMob** (see QUICK_START.md)
3. **Integrate user context** for state management
4. **Test auth flow** (register/login)
5. **Test data persistence** (quiz results save to Firestore)
6. **Test ads** (AdMob test ads appear)
7. **Build for iOS/Android** when ready

---

## File Structure After Integration

```
civic-citizenship/
├── App.js                              (main app)
├── PremiumScreens.js                  (new - premium UI)
├── firebaseConfig.js                  (new - firebase setup)
├── firebaseServices.js                (new - backend API)
├── adMobService.js                    (new - ads)
├── monetizationService.js             (new - revenue logic)
├── UserContext.js                     (new - optional state)
├── QUICK_START.md                     (new - setup guide)
├── BACKEND_MONETIZATION_SETUP.md      (new - detailed guide)
├── FEATURES_SUMMARY.md                (new - feature list)
├── INTEGRATION_GUIDE.md               (this file)
└── package.json
```

---

## Troubleshooting Integration

**Issue: Premium screen doesn't appear**
- Check: PremiumScreens.js is imported correctly
- Check: Screen is registered in Stack.Navigator
- Check: Navigation.navigate('Premium') is called

**Issue: Firebase errors**
- Check: firebaseConfig.js has real credentials
- Check: Firebase project is created
- Check: imports are uncommented

**Issue: Ads not showing**
- Check: Using TEST Ad Unit IDs (correct for dev)
- Check: AdMob plugin in app.json
- Check: app is built for iOS/Android (web may not show ads)

---

**Ready to ship? See FEATURES_SUMMARY.md for app store launch checklist!**
