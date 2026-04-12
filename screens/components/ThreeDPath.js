import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useHapticEngine } from '../../context/HapticProvider';
import styles from '../../styles';

const CARD_HEIGHT = 148;
const FAST_SCROLL_THRESHOLD_PX_PER_MS = 0.9;
const NO_STEP_ENTRY_WINDOW_MS = 2200;
const NUDGE_COOLDOWN_MS = 1600;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getGhostColor = (intensity) => {
  if (intensity >= 0.75) return '#FF00FF';
  if (intensity >= 0.55) return '#EC4899';
  if (intensity >= 0.35) return '#22D3EE';
  return '#00E5FF';
};

const DEFAULT_ROUTE = [
  { id: 'step-1', title: 'Weak-Area Drill', subtitle: 'Highest urgency topic first', urgency: 0.92 },
  { id: 'step-2', title: 'Trend Stabilizer', subtitle: 'Recover 7-day trend dip', urgency: 0.71 },
  { id: 'step-3', title: 'Interview Rehearsal', subtitle: 'Confidence pass rehearsal', urgency: 0.54 },
];

function ThreeDPath({
  studyRoute = DEFAULT_ROUTE,
  onStepFocus,
  onStepEnter,
  onAdaptivePacingNudge,
  onRuntimeFailure,
  focusVelocity = 0,
  friendGhostIntensity = 0,
}) {
  const { triggerSensoryEvent, events: sensoryEvents } = useHapticEngine();
  const scrollY = useRef(new Animated.Value(0)).current;
  const introOpacity = useRef(new Animated.Value(0)).current;
  const introTranslateY = useRef(new Animated.Value(28)).current;
  const introScale = useRef(new Animated.Value(0.95)).current;
  const lastScrollRef = useRef({ y: 0, ts: Date.now() });
  const lastFocusedIndexRef = useRef(-1);
  const lastStepEntryAtRef = useRef(0);
  const lastNudgeAtRef = useRef(0);

  const route = useMemo(
    () => (Array.isArray(studyRoute) && studyRoute.length ? studyRoute : DEFAULT_ROUTE),
    [studyRoute],
  );
  const ghostIntensity = clamp(Number(focusVelocity || 0) / 10, 0, 1);
  const squadGhostIntensity = clamp(Number(friendGhostIntensity || 0), 0, 1);
  const ghostColor = getGhostColor(ghostIntensity);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 340,
        useNativeDriver: true,
      }),
      Animated.timing(introTranslateY, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.spring(introScale, {
        toValue: 1,
        friction: 7,
        tension: 85,
        useNativeDriver: true,
      }),
    ]).start();
  }, [introOpacity, introScale, introTranslateY]);

  const handleStepEnter = (step, index) => {
    try {
      lastStepEntryAtRef.current = Date.now();
      onStepEnter?.(step, index);
    } catch (error) {
      onRuntimeFailure?.('step-enter-failed');
    }
  };

  const handleFocusChange = (index) => {
    try {
      if (index < 0 || index >= route.length) return;
      if (lastFocusedIndexRef.current === index) return;

      lastFocusedIndexRef.current = index;
      triggerSensoryEvent(sensoryEvents.PATH_SNAP_TOCK);
      onStepFocus?.(route[index], index);
    } catch (error) {
      onRuntimeFailure?.('focus-change-failed');
    }
  };

  const maybeTriggerAdaptiveNudge = (velocityPxPerMs) => {
    try {
      const now = Date.now();
      const noRecentEntry = now - lastStepEntryAtRef.current > NO_STEP_ENTRY_WINDOW_MS;
      const cooldownPassed = now - lastNudgeAtRef.current > NUDGE_COOLDOWN_MS;
      if (!noRecentEntry || !cooldownPassed) return;

      if (velocityPxPerMs >= FAST_SCROLL_THRESHOLD_PX_PER_MS) {
        lastNudgeAtRef.current = now;
        triggerSensoryEvent(sensoryEvents.PATH_ADAPTIVE_SOFT_THUD);
        onAdaptivePacingNudge?.({
          reason: 'fast-scroll-no-step-entry',
          velocityPxPerMs,
        });
      }
    } catch (error) {
      onRuntimeFailure?.('adaptive-nudge-failed');
    }
  };

  const handleScroll = (event) => {
    const y = Number(event?.nativeEvent?.contentOffset?.y || 0);
    const now = Date.now();
    const previous = lastScrollRef.current;
    const dy = Math.abs(y - previous.y);
    const dt = Math.max(1, now - previous.ts);
    const velocityPxPerMs = dy / dt;

    lastScrollRef.current = { y, ts: now };
    maybeTriggerAdaptiveNudge(velocityPxPerMs);
  };

  const handleMomentumEnd = (event) => {
    const y = Number(event?.nativeEvent?.contentOffset?.y || 0);
    const nextIndex = Math.round(y / CARD_HEIGHT);
    handleFocusChange(nextIndex);
  };

  return (
    <View style={styles.threeDPathContainer}>
      <Animated.View
        style={[
          styles.threeDPathIntroWrap,
          {
            opacity: introOpacity,
            transform: [{ translateY: introTranslateY }, { scale: introScale }],
          },
        ]}
      >
        <Animated.ScrollView
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true, listener: handleScroll },
          )}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          snapToInterval={CARD_HEIGHT}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.threeDPathContent}
        >
          {route.map((step, index) => {
            const inputRange = [
              (index - 1) * CARD_HEIGHT,
              index * CARD_HEIGHT,
              (index + 1) * CARD_HEIGHT,
            ];
            const direction = index % 2 === 0 ? -1 : 1;
            const translateX = scrollY.interpolate({
              inputRange,
              outputRange: [direction * 14, 0, direction * -14],
              extrapolate: 'clamp',
            });
            const translateY = scrollY.interpolate({
              inputRange,
              outputRange: [10, 0, 10],
              extrapolate: 'clamp',
            });
            const scale = scrollY.interpolate({
              inputRange,
              outputRange: [0.93, 1, 0.93],
              extrapolate: 'clamp',
            });
            const opacity = scrollY.interpolate({
              inputRange,
              outputRange: [0.72, 1, 0.72],
              extrapolate: 'clamp',
            });
            const rotateY = scrollY.interpolate({
              inputRange,
              outputRange: [`${direction * 11}deg`, '0deg', `${direction * -11}deg`],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={String(step?.id || `route-${index}`)}
                style={[
                  styles.threeDIslandShell,
                  {
                    opacity,
                    transform: [{ perspective: 900 }, { translateX }, { translateY }, { rotateY }, { scale }],
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.86}
                  style={styles.threeDIsland}
                  onPress={() => handleStepEnter(step, index)}
                >
                  <Text style={styles.threeDIslandTitle}>{String(step?.title || `Step ${index + 1}`)}</Text>
                  <Text style={styles.threeDIslandSubtitle}>{String(step?.subtitle || 'Continue your route')}</Text>
                  {Number(step?.urgency || 0) >= 0.8 ? (
                    <Text style={styles.threeDIslandUrgency}>Urgency Glow Active</Text>
                  ) : null}

                  <View style={styles.threeDGhostCluster}>
                    <Animated.View
                      style={[
                        styles.threeDGhostRunner,
                        {
                          backgroundColor: ghostColor,
                          opacity: 0.26 + (ghostIntensity * 0.56),
                          transform: [{ scale: 0.82 + (ghostIntensity * 0.56) }],
                        },
                      ]}
                    />
                    <View style={styles.threeDGhostTrailTrack}>
                      <View
                        style={[
                          styles.threeDGhostTrailFill,
                          {
                            width: `${Math.round(20 + (ghostIntensity * 80))}%`,
                            backgroundColor: ghostColor,
                          },
                        ]}
                      />
                    </View>
                    {squadGhostIntensity > 0 ? (
                      <View style={styles.threeDSquadGhostBadge}>
                        <Text style={styles.threeDSquadGhostBadgeText}>Squad Ghost x{(1 + squadGhostIntensity).toFixed(1)}</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.ScrollView>
      </Animated.View>
    </View>
  );
}

export default ThreeDPath;
