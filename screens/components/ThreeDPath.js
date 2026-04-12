import React, { useMemo, useRef } from 'react';
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
}) {
  const { triggerSensoryEvent, events: sensoryEvents } = useHapticEngine();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollRef = useRef({ y: 0, ts: Date.now() });
  const lastFocusedIndexRef = useRef(-1);
  const lastStepEntryAtRef = useRef(0);
  const lastNudgeAtRef = useRef(0);

  const route = useMemo(
    () => (Array.isArray(studyRoute) && studyRoute.length ? studyRoute : DEFAULT_ROUTE),
    [studyRoute],
  );

  const handleStepEnter = (step, index) => {
    lastStepEntryAtRef.current = Date.now();
    onStepEnter?.(step, index);
  };

  const handleFocusChange = (index) => {
    if (index < 0 || index >= route.length) return;
    if (lastFocusedIndexRef.current === index) return;

    lastFocusedIndexRef.current = index;
    triggerSensoryEvent(sensoryEvents.PATH_SNAP_TOCK);
    onStepFocus?.(route[index], index);
  };

  const maybeTriggerAdaptiveNudge = (velocityPxPerMs) => {
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
        {route.map((step, index) => (
          <TouchableOpacity
            key={String(step?.id || `route-${index}`)}
            activeOpacity={0.86}
            style={styles.threeDIsland}
            onPress={() => handleStepEnter(step, index)}
          >
            <Text style={styles.threeDIslandTitle}>{String(step?.title || `Step ${index + 1}`)}</Text>
            <Text style={styles.threeDIslandSubtitle}>{String(step?.subtitle || 'Continue your route')}</Text>
            {Number(step?.urgency || 0) >= 0.8 ? (
              <Text style={styles.threeDIslandUrgency}>Urgency Glow Active</Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

export default ThreeDPath;
