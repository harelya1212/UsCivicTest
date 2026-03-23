# ADHD-Friendly Quiz Interface 🧠✨

## Overview
The quiz system has been completely redesigned for users with ADHD, focusing on:
- ✅ **No rush** - Slower, user-controlled pacing
- ✅ **Clear visual feedback** - Large buttons, color-coded answers
- ✅ **Difficulty progression** - Starting easy, adapting to performance
- ✅ **Visual explanations** - Learn by seeing, not just reading
- ✅ **Official answers** - Always prominently displayed

---

## 🎯 Key Features

### 1. **Large 4-Answer Multiple Choice**
- **Button Size**: 70px minimum height with spacious padding
- **Tap Targets**: Large, accessible touch areas (18px padding)
- **Font Size**: 16px for easy readability
- **Visual Indicators**: 
  - Color-coded dots (gray → purple select → green correct/red wrong)
  - Check/X icons appear after selection
  - Clear border highlights (2.5px)

```
┌─────────────────────────────┐
│ ● The Constitution          │  ← Option 1
└─────────────────────────────┘
┌─────────────────────────────┐
│ ● The President             │  ← Option 2
└─────────────────────────────┘
┌─────────────────────────────┐
│ ✓ The Bill of Rights   ✓    │  ← Correct Answer (Green)
└─────────────────────────────┘
┌─────────────────────────────┐
│ ✗ Congress            ✗     │  ← Wrong Answer (Red)
└─────────────────────────────┘
```

### 2. **User-Controlled Pacing (No Auto-Advance!)**
- Answer selection triggers immediate visual feedback
- User reads the feedback and explanation at their own pace
- **Continue button** lets user choose when to move forward
- No time pressure or timed auto-advance
- Perfect for ADHD executive function challenges

### 3. **Adaptive Difficulty Progression**

The system tracks performance and adjusts question difficulty:

**Performance Levels:**
- **80%+ accuracy**: Increase difficulty (easy → medium → hard)
- **50-79% accuracy**: Maintain current difficulty
- **<50% accuracy**: Decrease difficulty (hard → medium → easy)

**Question Generation:**
```javascript
// Each question has wrong answers at 3 difficulty levels
{
  wrongAnswers: {
    easy: ["Simple distractors"],
    medium: ["Plausible but distinct"],
    hard: ["Very close alternatives"]
  }
}
```

**Starting Point:** New users start with "easy" difficulty for wrong answers, ensuring early wins and confidence building.

### 4. **Visual Feedback System**

**Immediate After Answer Selection:**
1. **Emoji + Message** (40px emoji for visibility)
   - ✅ Success: "✅ Correct! Amazing job! 🎉"
   - ❌ Try again: "❌ Good try! Review the correct answer below."

2. **Official Correct Answer Box** (Always visible!)
   - Green background highlight
   - Large text (16px bold)
   - Label: "✅ The Official Correct Answer:"
   - Shows exactly what USCIS accepts

3. **Optional Visual Explanation Button**
   - "💡 Show Visual Explanation" (yellow highlight)
   - User taps to reveal more information
   - Not forced - respects cognitive load

### 5. **Educational Explanations**

When user taps "Show Explanation":

```
📖 Why This Answer is Correct
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏛️ The US is a Republic where 
power is held by representatives 
elected by citizens, not a 
monarch or single ruler.

Also Accepted:
• Constitution-based federal republic
• Representative democracy
```

**Features:**
- Visual emoji for context 🏛️📜⚙️🗳️
- Plain language explanation
- Shows alternate accepted answers
- Builds long-term memory through visual associations

---

## 🔧 Technical Implementation

### Files Modified/Created

**New Files:**
- `quizHelpers.js` - Helper functions for quiz logic
  - `generateQuizQuestion()` - Creates questions with difficulty-appropriate wrong answers
  - `generateWrongAnswers()` - Creates plausible distractors based on category
  - `generateExplanation()` - Provides visual explanations
  - `getAdaptiveDifficulty()` - Adjusts difficulty based on performance
  - `isAnswerCorrect()` - Validates answers (including alternates)
  - `calculatePerformance()` - Tracks recent accuracy

**Modified Files:**
- `App.js`
  - New `QuizScreen` component (ADHD-optimized)
  - Added imports for quizHelpers
  - Added ADHD-friendly styles (260+ new style rules)
  - Replaced old auto-advancing logic with user-controlled pacing

### Quiz Flow

```
User Launches Quiz
  ↓
Load Official USCIS Questions
  ↓
Generate 4 Options (1 correct, 3 wrong)
  ├─ Easy difficulty: "easy" wrong answers
  ├─ Performance ≥80%: Increment to "medium"
  └─ Performance ≤50%: Decrement to "easy"
  ↓
Display Large Question + 4 Buttons
  ↓
User Taps Answer (NO AUTO-ADVANCE)
  ↓
Show Immediate Visual Feedback
  ├─ Green background + checkmark (correct)
  └─ Red background + X mark (incorrect)
  ↓
Show Official Correct Answer (Always!)
  ↓
User Can Tap "Show Explanation" (Optional)
  ├─ Emoji + visual context
  ├─ Plain language explanation
  └─ Additional accepted answers
  ↓
User Taps "Next Question" WHEN READY
  ↓
Repeat Until Quiz Complete
```

### Accessibility Features

✅ **Color Coding**
- Not reliant on color alone (also uses icons: ✓/✗)
- Text color changes with backgrounds

✅ **Typography**
- Large fonts (16-20px for main content)
- High contrast (dark text on light backgrounds)
- Clear hierarchy with font weights

✅ **Touch Targets**
- All buttons: minimum 70px height
- 14-24px padding for easy tapping
- No need for precise clicking

✅ **Cognitive Load**
- One question at a time
- Clear visual grouping
- Distraction-free interface

---

## 🎨 Style Specifications

### Colors Used

| Element | Color | Purpose |
|---------|-------|---------|
| Correct Answer | #10B981 (Green) | Success, right answer |
| Wrong Answer | #EF4444 (Red) | Incorrect |
| Explanation | #7C3AED (Purple) | Info, learning |
| Alternate Box | #FEF3C7 (Yellow) | Call-to-action |
| Question Card | #F3F0FF (Light Purple) | Context |

### Button Sizes

| Component | Height | Padding |
|-----------|--------|---------|
| Option Buttons | 70px min | 18px |
| Continue Button | 54px (16py vert) | 24px horiz |
| Explanation Button | 48px | 14px |

---

## 📊 Performance Tracking

The system tracks:

```javascript
history = [
  {
    id: 'CIVICS_001',
    topic: 'Government Structure',
    correct: true,
    difficulty: 'easy'
  },
  // ... more answers
]

// Recent 10 answers used to calculate performance
performance = (correct_answers / 10) * 100

// Adjusts difficulty if ≥80% or ≤50%
```

---

## 🚀 Usage

### Starting a Quiz
```javascript
// Navigate to Quiz screen with type
navigation.navigate('Quiz', { type: 'naturalization128' })
// OR
navigation.navigate('Quiz', { type: 'highschool' })
// OR
navigation.navigate('Quiz', { type: 'naturalization100' })
```

### Question Bank
Uses official USCIS questions from `civicsQuestionBank.js`:
- **naturalization128**: All 128 official USCIS questions
- **naturalization100**: First 100 questions
- **highschool**: 20 civics curriculum questions

---

## 💡 Design Principles

1. **No Speed Pressure** - ADHD-friendly pacing
2. **Visual First** - Colors, icons, emojis for pattern recognition
3. **Clear Feedback** - Instant, obvious result communication
4. **Progressive Difficulty** - Easy wins first, then challenge
5. **Optional Depth** - Explanations available but not mandatory
6. **Clear Answers** - Official answers always prominently shown
7. **User Control** - User decides when to move forward

---

## 🔄 Future Enhancements

Potential additions:
- [ ] Audio explanations (text-to-speech)
- [ ] Detailed historical timelines
- [ ] Category-specific visual aids/diagrams
- [ ] Spaced repetition reminders
- [ ] Progress tracking dashboard
- [ ] Custom difficulty slider
- [ ] Pause/Resume session
- [ ] Focus mode (less distractions)
- [ ] Stats on weak categories
- [ ] Peer learning/family challenges

---

## ✅ Testing Checklist

- [ ] Questions load from civicsQuestionBank.js
- [ ] 4 options display (1 correct, 3 wrong)
- [ ] Colors change on selection (green/red)
- [ ] Icons display correctly (checkmark/X)
- [ ] Explanation button reveals content
- [ ] Continue button advances to next question
- [ ] Progress bar updates correctly
- [ ] Difficulty adjusts based on performance
- [ ] Final score calculated correctly
- [ ] All styles render properly (iOS + Android)

---

**Built with ❤️ for ADHD learners**
