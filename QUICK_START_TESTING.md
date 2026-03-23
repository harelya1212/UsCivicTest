# Quick Start Guide - Test the ADHD-Friendly Quiz 🚀

## 5-Minute Setup

### 1. **Install Dependencies** (if needed)
```bash
cd "/Users/ah/Desktop/my repastory/civic test/civic-citizenship"
npm install
```

### 2. **Start the App**
```bash
npm start
```
Then:
- Press `w` for web (if testing in browser)
- Or scan QR code with Expo Go app (for mobile)

### 3. **Navigate to Quiz**
In the app:
1. Complete onboarding (enter name, select test type, date)
2. From Home screen → Select "Naturalization (128Q)"
3. **START QUIZ** button → See the new ADHD-friendly interface!

---

## What You'll See

### Quiz Screen Features (After Launch)

#### 📊 Progress Bar
```
Top: [████░░░░░░░] Question 1 of 128
```

#### 🎯 Question
```
What is the form of government of the United States?
```

#### 🔘 4 Large Answer Buttons
```
[  ●  The Constitution              ]
[  ●  The President                 ]
[  ●  Congress                       ]
[  ●  The Bill of Rights            ]
```

#### After Selection
```
✅ or ❌ (Visual feedback with color change)

✅ The Official Correct Answer:
   Republic

💡 Show Visual Explanation (Optional)
   [If tapped, shows explanation]

➡️ Next Question (User controls pace!)
```

---

## Test Cases

### ✅ Test 1: Select Correct Answer
1. Tap the correct answer button
2. **Expected**: Button turns GREEN with checkmark ✓
3. Message: "✅ Correct! Amazing job! 🎉"
4. Tap "Next Question" → Move to next

### ❌ Test 2: Select Wrong Answer
1. Tap an incorrect answer button
2. **Expected**: Button turns RED with X ✗
3. Message: "❌ Good try! Review the correct answer below."
4. Green box shows official answer
5. Tap "Show Explanation" for more info
6. Tap "Next Question" → Move to next

### 👁️ Test 3: Visual Explanations
1. Answer (correctly or incorrectly)
2. Tap "💡 Show Visual Explanation"
3. **Expected**: Purple box reveals
   - Emoji context (🏛️ 📜 ⚙️ etc.)
   - Plain language explanation
   - Additional accepted answers
4. Box contains alternate answers

### 📈 Test 4: Difficulty Progression
1. Answer first 5 questions correctly (80%+)
2. **Expected**: Questions 6+ should have harder "medium" distractors
3. On weak performance, difficulty drops back to "easy"

---

## Color Reference

| Element | Expected Color | Meaning |
|---------|----------------|---------|
| Correct button | 🟢 Green (#10B981) | Right answer |
| Wrong button | 🔴 Red (#EF4444) | Incorrect |
| Selected button | 🟣 Purple (#7C3AED) | Before answering |
| Explanation box | 🟣 Light Purple (#F3F0FF) | Learning content |
| Answer box | 🟢 Light Green (#ECFDF5) | Official answer |

---

## Keyboard Navigation (Web Only)

Press these keys:
- `1` - Select Option 1
- `2` - Select Option 2
- `3` - Select Option 3
- `4` - Select Option 4
- `e` - Show Explanation
- `n` - Next Question

*(Only if keyboard handler is implemented)*

---

## Known Behavior

✅ **Expected to Work**:
- Large buttons (70px min height)
- Color feedback immediate
- Explanation button (show/hide)
- Continue button moves to next
- Progress bar updates
- No auto-advance (user controls pacing)

⚠️ **May Need Adjustment**:
- [ ] Font sizes on small phones (test on various devices)
- [ ] Android vs iOS appearance differences
- [ ] Landscape orientation layout
- [ ] Text-to-speech integration

---

## Troubleshooting

### ❌ Questions not loading?
1. Verify `civicsQuestionBank.js` exists
2. Check App.js imports at top: `import { CIVICS_QUESTION_BANK }`
3. Check console for errors: `node -c App.js`

### ❌ Buttons not responding?
1. Check `showFeedback` state (buttons disabled after answer)
2. Clear app cache and reload
3. Try restarting Expo: `Press r`

### ❌ Colors not showing?
1. Clear browser cache
2. Check StyleSheet syntax in App.js
3. Verify styles are defined (search: `adhd_optionButton`)

### ❌ Explanation not showing?
1. Tap "Show Explanation" button explicitly
2. Check if `showExplanation` state is updating
3. Verify explanation text is not empty

---

## Performance Notes

### Expected Performance
- Quiz load: < 1s (128 questions in memory)
- Answer selection feedback: Instant (< 100ms)
- Continue/next: Instant
- Memory usage: ~2-3 MB (all questions loaded)

### Optimization Tips
- Questions loaded once at quiz start
- No network calls (all local)
- Minimal animations (smooth experience)

---

## Testing on Different Devices

### 📱 iPhone/iPad
- Test on latest iOS version
- Verify button tap accuracy
- Check landscape/portrait orientation

### 🔷 Android
- Test on multiple Android versions
- Verify Material Design compliance
- Check touch feedback

### 💻 Web Browser
- Chrome, Safari, Firefox, Edge
- Test responsive design
- Keyboard navigation

---

## Feedback Form

After testing, document:
- Device type & OS version
- What worked well
- What needs improvement
- Visual/design suggestions
- Accessibility issues

---

## Next Steps (After Testing)

1. ✅ Verify all 128 questions load correctly
2. ✅ Test on physical device (iOS or Android)
3. ✅ Verify performance with 30+ answers
4. ✅ Adjust button sizes if needed
5. ✅ Test explanations for clarity
6. ✅ Gather ADHD user feedback
7. ✅ Fine-tune colors/contrast
8. ✅ Deploy to production

---

## Questions?

Check these files for details:
- **[ADHD_FRIENDLY_QUIZ.md](ADHD_FRIENDLY_QUIZ.md)** - Full documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical details
- **App.js** - Line 666: `QuizScreen` component
- **quizHelpers.js** - Helper functions

---

**Happy testing! 🎉**

The ADHD-friendly quiz interface is ready to help your learners succeed! 🇺🇸📚
