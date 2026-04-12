# Sprint 2 Phase 2: Rubric & Scoring Engine
**Status:** 🚀 LAUNCHING (Mar 27, 2026)  
**Duration:** Days 6-10  
**Objective:** Replace random scoring with real rubric-based grading

---

## Phase 2 Tasks

### Step 1: Rubric Metadata Created ✅
- [x] Designed 4-level rubric schema (A/B/C/D)
- [x] Created enrichment script: `scripts/enrich-interview-rubrics.js`
- [x] Added rubrics to civics_128.json for questions 1-10
- [x] Rubric format: A (Advanced) → B (Proficient) → C (Developing) → D (Emerging)
- [x] Each rubric has specific criteria for grading

**Example Rubric (Q1: Government Form):**
```json
{
  "A": "Identifies as republic/federal republic AND explains representative nature",
  "B": "Identifies as republic or federal republic",
  "C": "Mentions government type but vague or partially correct",
  "D": "Incorrect or off-topic response"
}
```

---

### Step 2: Build Scoring Engine ❌ NEXT
- [ ] Create `utils/interviewScoringEngine.js`
- [ ] Implement keyword-matching heuristic
- [ ] Extract keywords from student answer
- [ ] Match against rubric criteria
- [ ] Return grade + explanatory feedback
- [ ] Handle edge cases (empty answers, profanity, etc.)

**Acceptance Criteria:**
- [ ] scoring engine matches keywords from rubric
- [ ] Returns grade (A/B/C/D) with confidence score
- [ ] Generates feedback explaining the grade
- [ ] Handles null/empty inputs gracefully
- [ ] No false positives (random keywords)

---

### Step 3: Update InterviewScreen ❌ AFTER STEP 2
- [ ] Load real questions from civics_128.json (not mocks)
- [ ] Load rubric metadata for each question
- [ ] Replace random scoring with engine-based scoring
- [ ] Pass recorded answer transcript to scoring function
- [ ] Display true grade + rubric feedback

---

### Step 4: Test Accuracy ❌ AFTER STEP 3
- [ ] Create test suite with sample answers
- [ ] Test all grades: A/B/C/D scoring
- [ ] Measure accuracy (target: 90%+)
- [ ] Iterate heuristics if needed
- [ ] Document edge cases

---

## Scoring Algorithm (Keyword Matching v1)

```
ALGORITHM: GradeAnswer(studentAnswer, rubricCriteria)
  
  INPUT:
    studentAnswer = transcribed/typed response from student
    rubricCriteria = {A: "", B: "", C: "", D: ""}
  
  OUTPUT:
    {grade: A|B|C|D, feedback: string, confidence: 0-1}
  
  STEPS:
    1. Normalize studentAnswer (lowercase, remove punctuation)
    2. Count keyword matches for each rubric level:
       - Extract keywords from rubric.A, rubric.B, etc.
       - Count matches in studentAnswer
    3. Score grades based on match count:
       - 80%+ matches to A criteria → Grade A
       - 60-80% matches to B criteria → Grade B
       - 40-60% matches to C criteria → Grade C
       - <40% matches → Grade D
    4. Return grade + construct feedback from matched criteria
    5. If no keywords, check answer length/structure as tiebreaker
```

---

## Updated Delivery Plan

| Phase | Status | Dates | Key Deliverable |
|-------|--------|-------|-----------------|
| **Phase 1** | ✅ COMPLETE | Mar 27 | TTS + Recording POC |
| **Phase 2** | 🚀 LAUNCHING | Mar 27-31 | Rubric + Scoring Engine |
| Phase 3 | Next | Apr 1-5 | Follow-up Questions |
| Phase 4 | Future | Apr 6-10 | Home Integration + Analytics |
| Phase 5 | Future | Apr 11+ | Polish + Launch |

---

## Files to Create

### New Files
- `utils/interviewScoringEngine.js` — Keyword-matching scoring algorithm
- `utils/__tests__/interviewScoringEngine.test.js` — Scoring tests (optional but recommended)

### Files to Modify
- `screens/InterviewScreen.js` — Load real questions + use real scoring
- `civics_128.json` — Already enriched with rubrics ✅

---

## Test Data (Sample Answers for Q1)

**Question:** "What is the form of government of the United States?"

| Answer | Expected Grade | Reasoning |
|--------|---|---|
| "A federal republic with representative democracy" | A | Includes republic + representative nature |
| "It's a republic" | B | Correctly identifies republic |
| "A democracy" | C | Vague; misses federal/republic specificity |
| "A monarchy" | D | Incorrect |

---

## Next Action
Proceed to **Step 2: Build Scoring Engine** once ready.

Reference:
- Rubric definition: [civics_128.json](civics_128.json) (questions 1-10)
- Enrichment script: [scripts/enrich-interview-rubrics.js](scripts/enrich-interview-rubrics.js)
- Phase 2 Execution Plan: [SPRINT_2_EXECUTION_PLAN.md](SPRINT_2_EXECUTION_PLAN.md)
