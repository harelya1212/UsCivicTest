import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

/**
 * InterviewScoringPhase - Display rubric score and feedback
 * Shows grade, feedback, and optional follow-up question trigger
 */
const InterviewScoringPhase = ({
  question,
  grade,
  feedback,
  shouldShowFollowUp,
  onNext,
  onSkipFollowUp,
}) => {
  const getGradeColor = (g) => {
    switch (g) {
      case 'A':
        return '#34D399';
      case 'B':
        return '#2DD4BF';
      case 'C':
        return '#FBBF24';
      case 'D':
        return '#F87171';
      default:
        return '#64748B';
    }
  };

  const getGradeLabel = (g) => {
    switch (g) {
      case 'A':
        return 'Advanced';
      case 'B':
        return 'Proficient';
      case 'C':
        return 'Developing';
      case 'D':
        return 'Emerging';
      default:
        return 'Ungraded';
    }
  };

  const gradeColor = getGradeColor(grade);
  const gradeLabel = getGradeLabel(grade);

  return (
    <View style={styles.container}>
      {/* Score Badge */}
      <View style={styles.scoreBadgeContainer}>
        <View style={[styles.scoreBadge, { borderColor: gradeColor }]}>
          <Text style={[styles.scoreLetter, { color: gradeColor }]}>
            {grade}
          </Text>
        </View>
        <Text style={[styles.scoreLabel, { color: gradeColor }]}>
          {gradeLabel}
        </Text>
      </View>

      {/* Feedback */}
      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackLabel}>Feedback:</Text>
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      </View>

      {/* Follow-Up Prompt (if score is C or D) */}
      {shouldShowFollowUp && (
        <View style={styles.followUpContainer}>
          <Text style={styles.followUpLabel}>📚 Want to strengthen this?</Text>
          <Text style={styles.followUpText}>
            Answer a follow-up question to dive deeper into this topic.
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {shouldShowFollowUp ? (
          <>
            <TouchableOpacity
              onPress={onNext}
              style={styles.followUpButton}
            >
              <Text style={styles.followUpButtonText}>
                📖 Answer Follow-Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onSkipFollowUp}
              style={styles.skipFollowUpButton}
            >
              <Text style={styles.skipFollowUpButtonText}>
                Skip for Now
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onNext}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              Next Question →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsLabel}>💡 Tips for stronger answers:</Text>
        <Text style={styles.tipsText}>
          • Use specific examples{'\n'}
          • Explain your reasoning{'\n'}
          • Take your time to think
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scoreBadgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#0A0A12',
  },
  scoreLetter: {
    fontSize: 48,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  feedbackCard: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24',
  },
  feedbackText: {
    fontSize: 15,
    color: '#FCD34D',
    lineHeight: 22,
  },
  followUpContainer: {
    backgroundColor: 'rgba(52,211,153,0.10)',
    borderRadius: 8,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
    marginBottom: 24,
  },
  followUpLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34D399',
    marginBottom: 4,
  },
  followUpText: {
    fontSize: 13,
    color: '#6EE7B7',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 16,
  },
  nextButton: {
    backgroundColor: '#2DD4BF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  followUpButton: {
    backgroundColor: '#34D399',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  followUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skipFollowUpButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipFollowUpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tipsContainer: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    padding: 12,
  },
  tipsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});

export default InterviewScoringPhase;
