import React, { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
  Animated,
  PanResponder,
} from 'react-native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const questionBank = {
  highschool: [
    {
      id: 'HS1',
      question: 'What is the supreme law of the land?',
      options: ['The Constitution', 'The President', 'The Senate', 'The Bill of Rights'],
      answer: 'The Constitution',
      topic: 'Foundations',
      hint: 'Think about the document that defines government powers.',
      dynamic: false,
    },
    {
      id: 'HS2',
      question: 'What is one right or freedom from the First Amendment?',
      options: ['Free speech', 'Vote-only for women', 'Free health care', 'No taxes'],
      answer: 'Free speech',
      topic: 'Rights',
      hint: 'It begins with F and is how people express opinions.',
      dynamic: false,
    },
  ],
  naturalization100: [
    {
      id: 'N100_1',
      question: 'What is the capital of the United States?',
      options: ['New York', 'Washington, D.C.', 'Los Angeles', 'Chicago'],
      answer: 'Washington, D.C.',
      topic: 'Geography',
      hint: 'It’s not a state; it is a district.',
      dynamic: false,
    },
    {
      id: 'N100_2',
      question: 'Name one branch or part of the government.',
      options: ['Legislative', 'Banking', 'Retail', 'Education'],
      answer: 'Legislative',
      topic: 'Structure',
      hint: 'It writes laws.',
      dynamic: false,
    },
  ],
  naturalization128: [
    {
      id: 'N128_1',
      question: 'What are the two major political parties in the United States?',
      options: ['Democratic and Republican', 'Libertarian and Green', 'Socialist and Communist', 'Federalist and Anti-Federalist'],
      answer: 'Democratic and Republican',
      topic: 'Politics',
      hint: 'One is blue, one is red.',
      dynamic: false,
    },
    {
      id: 'N128_2',
      question: 'What does the judicial branch do?',
      options: ['Reviews laws', 'Makes laws', 'Enforces laws', 'Votes for laws'],
      answer: 'Reviews laws',
      topic: 'Checks and Balances',
      hint: 'Judges and courts.',
      dynamic: true,
    },
  ],
};

const weakAreaEstimator = (history) => {
  const counts = {};
  for (const record of history) {
    if (!counts[record.topic]) counts[record.topic] = { total: 0, wrong: 0 };
    counts[record.topic].total += 1;
    if (!record.correct) counts[record.topic].wrong += 1;
  }
  const weaknesses = Object.entries(counts)
    .map(([topic, { total, wrong }]) => ({ topic, wrong, total, ratio: wrong / total }))
    .sort((a, b) => b.ratio - a.ratio);
  return weaknesses.slice(0, 3);
};

function HomeScreen({ navigation }) {
  const [username, setUsername] = useState('Learner');
  const [family, setFamily] = useState([{ name: 'Mom', completed: 2 }, { name: 'Brother', completed: 1 }]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>US Civic Test Coach</Text>
        <Text style={styles.subtitle}>Hello, {username}. Let’s get ready.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Choose your test path</Text>
          <Button title="Highschool Civic" onPress={() => navigation.navigate('Quiz', { type: 'highschool' })} />
          <Button
            title="Naturalization (100 questions pre-Oct 2025)"
            onPress={() => navigation.navigate('Quiz', { type: 'naturalization100' })}
          />
          <Button
            title="Naturalization (128 questions post-Oct 2025)"
            onPress={() => navigation.navigate('Quiz', { type: 'naturalization128' })}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tools</Text>
          <Button title="Progress Tracker" onPress={() => navigation.navigate('Progress')} />
          <Button title="Family Dashboard" onPress={() => navigation.navigate('Family', { family })} />
          <Button title="Study Plan" onPress={() => navigation.navigate('Plan')} />
        </View>

        <Text style={styles.tip}>💡 Pro tip: Practice with a friend in “versus mode” by sharing the Quiz screen and compare best times.</Text>
        <Text style={styles.tip}>📣 Add revenue plan: Reward access to additional question packs with optional ad-free premium subscription.</Text>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function QuizScreen({ route, navigation }) {
  const { type } = route.params;
  const pool = questionBank[type] || [];
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!pool.length) {
    return (
      <SafeAreaView style={styles.screen}>
        <Text>No questions found for this test type.</Text>
      </SafeAreaView>
    );
  }

  const question = pool[current];

  const addHistory = (correct) => {
    setHistory((prev) => [...prev, { id: question.id, topic: question.topic, correct }]);
  };

  const chooseOption = (option) => {
    const correct = option === question.answer;
    if (correct) setScore((prev) => prev + 1);
    addHistory(correct);
    setShowAnswer(true);
    setTimeout(() => {
      setShowAnswer(false);
      if (current + 1 >= pool.length) {
        const weak = weakAreaEstimator([...history, { id: question.id, topic: question.topic, correct }]);
        navigation.replace('Review', { completed: true, score: correct ? score + 1 : score, pool, history: [...history, { id: question.id, topic: question.topic, correct }], weak });
      } else {
        setCurrent(current + 1);
      }
    }, 900);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.progressRow}>
        <Text style={styles.poolText}>{type.toUpperCase()}</Text>
        <Text>{current + 1}/{pool.length}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.question}>{question.question}</Text>
        <Text style={styles.hint}>Hint: {question.hint}</Text>

        {question.options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => chooseOption(option)}
            style={styles.option}
            disabled={showAnswer}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {showAnswer && <Text style={styles.answer}>Correct: {question.answer}</Text>}

        <Text style={styles.small}>Dynamic question: {question.dynamic ? 'Yes (stays updated)' : 'No'}</Text>
      </View>

      <Text style={styles.score}>Score: {score}</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function ReviewScreen({ route, navigation }) {
  const { score, pool, history, weak } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Quiz Complete!</Text>
        <Text style={styles.subtitle}>You scored {score} of {pool.length}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weak areas</Text>
          {weak.length ? weak.map((item) => (
            <Text key={item.topic}>{item.topic}: {(item.ratio * 100).toFixed(0)}%</Text>
          )) : <Text>Great job, no strong weak area yet!</Text>}
        </View>

        <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    </SafeAreaView>
  );
}

function ProgressScreen() {
  const [history, setHistory] = useState([
    { date: '2026-03-18', correct: 8, total: 10 },
    { date: '2026-03-19', correct: 7, total: 10 },
    { date: '2026-03-20', correct: 9, total: 10 },
  ]);

  const consistency = ((history.filter((item) => item.correct / item.total >= 0.7).length / history.length) * 100).toFixed(0);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Progress Tracker</Text>
        <Text style={styles.subtitle}>Consistency: {consistency}%</Text>
        {history.map((item) => (
          <View key={item.date} style={styles.row}>
            <Text>{item.date}</Text>
            <Text>{item.correct}/{item.total}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function FamilyScreen({ route }) {
  const { family } = route.params;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Family Progress</Text>
        {family.map((member) => (
          <View key={member.name} style={styles.row}>
            <Text>{member.name}</Text>
            <Text>Completed quizzes: {member.completed}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

function PlanScreen() {
  const [targetDate, setTargetDate] = useState('2026-05-01');
  const [currentReady, setCurrentReady] = useState(60);
  const targetDays = Math.max(1, Math.floor((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24)));

  const dailyGoal = Math.ceil(((100 - currentReady) / targetDays) * 10) / 10;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Smart Study Plan</Text>
        <Text style={styles.subtitle}>Target test/interview date: {targetDate}</Text>
        <Text style={styles.cardText}>Current readiness: {currentReady}%</Text>
        <Text style={styles.cardText}>Suggested daily improvement: {dailyGoal}%</Text>
        <Text style={styles.tip}>Focus upcoming days on topics with weakest accuracy in quiz history.</Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#4d90fe' }, headerTintColor: '#fff' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz Mode' }} />
        <Stack.Screen name="Review" component={ReviewScreen} options={{ title: 'Review & Weaknesses' }} />
        <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
        <Stack.Screen name="Family" component={FamilyScreen} options={{ title: 'Family' }} />
        <Stack.Screen name="Plan" component={PlanScreen} options={{ title: 'Study Plan' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f7ff',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#333',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  question: {
    fontSize: 18,
    marginBottom: 8,
  },
  hint: {
    color: '#4d90fe',
    marginBottom: 12,
  },
  option: {
    backgroundColor: '#eef3ff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  answer: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#1a9d3c',
  },
  small: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  score: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    margin: 12,
  },
  tip: {
    color: '#444',
    fontSize: 13,
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  poolText: {
    fontWeight: '700',
    color: '#2c3a62',
  },
  cardText: {
    marginVertical: 4,
  },
});
