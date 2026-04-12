import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Vibration } from 'react-native';
import { playCorrectFeedback, playWrongFeedback } from '../utils/audioHaptics';

const SENSORY_EVENTS = Object.freeze({
  QUIZ_ANSWER_CORRECT: 'quiz.answer.correct',
  QUIZ_ANSWER_INCORRECT: 'quiz.answer.incorrect',
  QUIZ_PROGRESS_WAVE: 'quiz.progress.wave',
  SQUAD_NUDGE_RECEIVED: 'squad.nudge.received',
  PATH_SNAP_TOCK: 'path.snap.tock',
  PATH_ADAPTIVE_SOFT_THUD: 'path.adaptive.soft_thud',
});

const HapticContext = createContext({
  events: SENSORY_EVENTS,
  triggerSensoryEvent: async () => {},
});

export function HapticProvider({ children }) {
  const triggerSensoryEvent = useCallback(async (eventName) => {
    switch (eventName) {
      case SENSORY_EVENTS.QUIZ_ANSWER_CORRECT:
        await playCorrectFeedback();
        return;
      case SENSORY_EVENTS.QUIZ_ANSWER_INCORRECT:
        await playWrongFeedback();
        return;
      case SENSORY_EVENTS.QUIZ_PROGRESS_WAVE:
        Vibration.vibrate([0, 20, 40, 35, 55]);
        return;
      case SENSORY_EVENTS.SQUAD_NUDGE_RECEIVED:
        Vibration.vibrate([0, 22, 64, 22]);
        return;
      case SENSORY_EVENTS.PATH_SNAP_TOCK:
        await playCorrectFeedback();
        return;
      case SENSORY_EVENTS.PATH_ADAPTIVE_SOFT_THUD:
        await playWrongFeedback();
        return;
      default:
        return;
    }
  }, []);

  const value = useMemo(() => ({
    events: SENSORY_EVENTS,
    triggerSensoryEvent,
  }), [triggerSensoryEvent]);

  return (
    <HapticContext.Provider value={value}>
      {children}
    </HapticContext.Provider>
  );
}

export function useHapticEngine() {
  return useContext(HapticContext);
}
