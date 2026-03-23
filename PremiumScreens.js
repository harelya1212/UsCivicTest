// Premium & Monetization UI Screens
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PREMIUM_TIERS } from './monetizationService';

export function PremiumScreen({ navigation }) {
    const [selectedTier, setSelectedTier] = useState(null);

    const handleUpgrade = (tier) => {
        Alert.alert(
            `Upgrade to ${PREMIUM_TIERS[tier].name}`,
            `$${PREMIUM_TIERS[tier].price}/${PREMIUM_TIERS[tier].billingPeriod || 'one-time'}`,
            [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                    text: 'Continue',
                    onPress: () => {
                        // Integrate with Stripe, RevenueCat, or Apple/Google IAP here
                        Alert.alert('Coming Soon', 'In-app purchase integration coming soon!');
                    },
                },
            ]
        );
    };

    const handleRewardedAd = async () => {
        Alert.alert(
            'Watch Ad for Free Bonus',
            'Watch a 30-second ad to unlock 10 premium questions',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Watch Ad',
                    onPress: () => {
                        // Show rewarded ad
                        // await showRewardedAd();
                        Alert.alert('Success!', 'You unlocked 10 bonus questions! 🎉');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerSection}>
                    <MaterialCommunityIcons name="crown" size={48} color="#FFB84D" />
                    <Text style={styles.title}>Go Premium</Text>
                    <Text style={styles.subtitle}>Unlock the full power of Civics Coach</Text>
                </View>

                {/* FREE REWARD OPTION */}
                <View style={[styles.tierCard, styles.rewardCard]}>
                    <View style={styles.tierBadge}>
                        <MaterialCommunityIcons name="gift" size={24} color="#EC4899" />
                        <Text style={styles.rewardLabel}>Free Bonus</Text>
                    </View>
                    <Text style={styles.tierPrice}>Free</Text>
                    <Text style={styles.rewardDesc}>Watch 30-sec ad to unlock 10 premium questions</Text>
                    <TouchableOpacity
                        style={[styles.button, styles.rewardButton]}
                        onPress={handleRewardedAd}
                    >
                        <MaterialCommunityIcons name="play-circle" size={20} color="#fff" />
                        <Text style={styles.buttonText}>Watch Now</Text>
                    </TouchableOpacity>
                </View>

                {/* PREMIUM TIERS */}
                {Object.entries(PREMIUM_TIERS).map(([key, tier]) => {
                    if (key === 'free') return null;

                    return (
                        <View
                            key={key}
                            style={[
                                styles.tierCard,
                                selectedTier === key && styles.tierCardSelected,
                                key === 'annual' && styles.bestValueCard,
                            ]}
                        >
                            {key === 'annual' && (
                                <View style={styles.bestValueBadge}>
                                    <Text style={styles.bestValueText}>BEST VALUE</Text>
                                </View>
                            )}

                            <Text style={styles.tierName}>{tier.name}</Text>
                            <View style={styles.priceContainer}>
                                <Text style={styles.tierPrice}>${tier.price}</Text>
                                <Text style={styles.billingPeriod}>/{tier.billingPeriod}</Text>
                            </View>

                            {tier.savings && <Text style={styles.savingsText}>Save {tier.savings}</Text>}

                            <View style={styles.featuresList}>
                                {tier.features.map((feature, idx) => (
                                    <View key={idx} style={styles.featureItem}>
                                        <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    selectedTier === key ? styles.buttonActive : styles.buttonSecondary,
                                ]}
                                onPress={() => handleUpgrade(key)}
                            >
                                <Text
                                    style={[
                                        styles.buttonText,
                                        selectedTier === key && { color: '#fff' },
                                    ]}
                                >
                                    {key === 'monthly' ? 'Start Free Trial' : 'Get Premium'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQ}>Can I cancel anytime?</Text>
                        <Text style={styles.faqA}>Yes! Cancel anytime from your account settings. No questions asked.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQ}>Free trial commitment?</Text>
                        <Text style={styles.faqA}>Free trial is 3 days. We'll remind you before charging.</Text>
                    </View>

                    <View style={styles.faqItem}>
                        <Text style={styles.faqQ}>What payment methods?</Text>
                        <Text style={styles.faqA}>Apple Pay, Google Pay, credit card, and more.</Text>
                    </View>
                </View>

                <Text style={styles.disclaimer}>
                    By subscribing, you agree to our Terms of Service and Privacy Policy. Auto-renewal applies.
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

export function SettingsScreen({ navigation }) {
    const [premiumStatus, setPremiumStatus] = useState(false);

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.pageTitle}>Settings</Text>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="account" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>Edit Profile</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="shield" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>Privacy & Security</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Premium Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Premium</Text>
                    <View style={[styles.settingItem, styles.premiumCard]}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="crown" size={24} color="#FFB84D" />
                            <View>
                                <Text style={styles.settingLabel}>Subscription Status</Text>
                                <Text style={styles.settingDesc}>
                                    {premiumStatus ? 'Premium Active • Renews in 25 days' : 'Free • Upgrade now'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {!premiumStatus && (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={() => navigation.navigate('Premium')}
                        >
                            <MaterialCommunityIcons name="crown" size={20} color="#fff" />
                            <Text style={[styles.buttonText, { color: '#fff', marginLeft: 8 }]}>
                                Upgrade to Premium
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* App Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App</Text>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="bell" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>Notifications</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="palette" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="information" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>About & Version</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="email" size={24} color="#7C3AED" />
                            <Text style={styles.settingLabel}>Contact Support</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingItem}>
                        <View style={styles.settingContent}>
                            <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
                            <Text style={[styles.settingLabel, { color: '#EF4444' }]}>Sign Out</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    container: {
        padding: 16,
        paddingBottom: 30,
    },

    // PREMIUM SCREEN
    headerSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingVertical: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    tierCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    tierCardSelected: {
        borderColor: '#7C3AED',
        backgroundColor: '#F3F0FF',
    },
    bestValueCard: {
        borderColor: '#FFB84D',
        backgroundColor: '#FFFBEB',
    },
    bestValueBadge: {
        backgroundColor: '#FFB84D',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    bestValueText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    rewardCard: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EC4899',
    },
    tierBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    rewardLabel: {
        marginLeft: 8,
        fontWeight: '600',
        color: '#EC4899',
    },
    tierName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    tierPrice: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#7C3AED',
    },
    billingPeriod: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
    },
    savingsText: {
        color: '#10B981',
        fontWeight: '600',
        marginBottom: 12,
    },
    rewardDesc: {
        color: '#EC4899',
        marginBottom: 16,
        fontWeight: '500',
    },
    featuresList: {
        marginBottom: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureText: {
        marginLeft: 12,
        color: '#333',
        fontSize: 14,
    },
    button: {
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonPrimary: {
        backgroundColor: '#7C3AED',
        marginTop: 16,
    },
    buttonActive: {
        backgroundColor: '#7C3AED',
    },
    buttonSecondary: {
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    rewardButton: {
        backgroundColor: '#EC4899',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    faqSection: {
        marginTop: 32,
    },
    faqTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    faqItem: {
        marginBottom: 16,
    },
    faqQ: {
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    faqA: {
        color: '#666',
        fontSize: 13,
        lineHeight: 18,
    },
    disclaimer: {
        fontSize: 11,
        color: '#999',
        marginTop: 24,
        fontStyle: 'italic',
        textAlign: 'center',
    },

    // SETTINGS SCREEN
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    settingItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
    },
    premiumCard: {
        backgroundColor: '#FFFBEB',
        borderLeftWidth: 4,
        borderLeftColor: '#FFB84D',
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    settingDesc: {
        marginLeft: 12,
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
});
