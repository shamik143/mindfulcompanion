import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import {
  Send, Heart, AlertCircle, ThumbsUp, ThumbsDown, Menu, X, Shield, TrendingUp,
  Download, Phone, Mail, Globe, MapPin, ChevronRight, ChevronDown, Mic, BarChart2,
  Info, BrainCircuit ,Brain
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// -----------------------------
// Placeholder for AssessmentsModal
// (keeps single-file approach and compiles; replace with your real modal if you have one)
// -----------------------------
const AssessmentsModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Assessments</h3>
          <p className="text-sm text-gray-600 mt-1">Placeholder for self-assessments content.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500">You can implement interactive assessment content here.</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Close</button>
      </div>
    </div>
  </div>
);

// --- ADVANCED FEATURE 1: Voice-to-Text Hook (kept from original) ---
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => console.error('Speech recognition error:', event.error);

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        // ignore start errors if already started
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // hasRecognitionSupport should reflect actual support; recognitionRef.current might be null initially
  const hasRecognitionSupport = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

  return { isListening, transcript, startListening, stopListening, hasRecognitionSupport };
};

// --- ADVANCED FEATURE 2: Dimensional Emotion Visualization (kept from original) ---
const EmotionGraph = ({ valence, arousal }) => {
  const data = [
    { name: 'Valence', value: valence },
    { name: 'Arousal', value: arousal },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><BarChart2 className="w-4 h-4" /> Dimensional Analysis:</p>
      <div style={{ width: '100%', height: 100 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[-1, 1]} tick={{ fontSize: 10 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 12, padding: '2px 8px' }} />
            <Bar dataKey="value" barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#86efac' : '#fca5a5'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-500 mt-1">Valence: emotional pleasantness. Arousal: emotional intensity.</p>
    </div>
  );
};

export default function MentalHealthCompanion() {
  // -------------------------
  // States (as in your original)
  // -------------------------
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [detectedEmotions, setDetectedEmotions] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [moodHistory, setMoodHistory] = useState([]);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [showDoctorDirectory, setShowDoctorDirectory] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Global');
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [biometrics, setBiometrics] = useState({ hrv: null, gsr: null, connected: false });
  const [showAssessments, setShowAssessments] = useState(false);
  const [showRootCauseAnalysis, setShowRootCauseAnalysis] = useState(false);

  const messagesEndRef = useRef(null);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const API_URL = 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log('🔍 Checking backend connection...');
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.text_model_loaded || data.speech_model_loaded || data.llm_configured) {
            setBackendConnected(true);
            console.log('✅ Backend connected! AI model or LLM configured successfully!');
          } else {
            setBackendConnected(false);
            console.log('⚠️ Backend healthy but models/LLM not fully configured.');
          }
        } else {
          setBackendConnected(false);
        }
      } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        setBackendConnected(false);
      } finally {
        setIsCheckingBackend(false);
      }
    };

    checkBackend();

    // Mock biometric connection check (non-invasive placeholder)
    setTimeout(() => {
      setBiometrics({ hrv: null, gsr: null, connected: false });
    }, 800);

  }, []);

  // --- ADVANCED FEATURE 3: Proactive Insight Engine ---
  useEffect(() => {
    const analyzeMoodTrends = () => {
      if (moodHistory.length < 3) return;
      const lastThreeEntries = moodHistory.slice(-3);
      const negativeEmotions = ['sadness', 'anger', 'fear', 'disappointment', 'nervousness'];
      const allNegative = lastThreeEntries.every(entry => negativeEmotions.includes(entry.emotion));

      if (allNegative) {
        const alreadyShown = messages.some(msg => msg.type === 'insight');
        if (!alreadyShown) {
          const insightMessage = {
            role: 'assistant',
            type: 'insight',
            content: `I've noticed a consistent pattern of challenging emotions in our recent conversation. It's completely okay to feel this way, and acknowledging it is a brave step. Would you like to try a specific grounding exercise or perhaps explore what might be contributing to these feelings?`
          };
          setTimeout(() => setMessages(prev => [...prev, insightMessage]), 2500);
        }
      }
    };

    analyzeMoodTrends();
  }, [moodHistory, messages]);

  const detectCrisis = (text) => {
    // Sanitize the input text for more reliable matching
    const normalizedText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    const crisisKeywords = [
      'suicide',
      'kill myself', 'killing myself', 'kms',
      'end my life', 'ending my life',
      'want to die', 'wanna die',
      'take my own life',
      'better off dead',
      'commit suicide',
      'no reason to live', 'no point in living',
      'cant go on', "can't go on",
      'cant take it anymore', "can't take it anymore",
      'life is meaningless', 'everything is pointless',
      'want it all to end', 'wish I wasn\'t here',
      'disappear forever', 'fade away',
      'unbearable pain', 'overwhelming pain',
      'trapped', 'no way out',
      'hurt myself', 'hurting myself',
      'self harm', 'self-harm', 'sh',
      'cut myself', 'cutting',
      'overdose', 'od', 'taking all my pills',
      'hanging', 'hang myself',
      'jump off', 'jumping from',
      'gun to my head', 'shoot myself',
      'bleeding out',
      'goodbye everyone', 'saying my goodbyes',
      'writing a note', 'suicide note',
      'giving things away', 'giving my stuff away',
      'you wont see me again', 'I\'ll be gone soon'
    ];

    const crisisRegex = new RegExp(`\\b(${crisisKeywords.join('|')})\\b`, 'i');
    return crisisRegex.test(normalizedText);
  };

  const getCrisisResponse = () => {
    return {
      type: 'crisis',
      content: `It sounds like you are in immense pain right now, and I need you to know that I am hearing you. Your feelings are valid, and your safety is the most important thing in this moment.

Because you are so important, the best step right now is to connect with a real person who can listen and support you through this. You are not alone.

🆘 Immediate Help Is Available (24/7)

Please reach out to one of these free, confidential crisis support lines now. They are staffed by caring people who are trained to help.

* AASRA (India):Call 91-9820466726
* Befrienders Worldwide (Global):Visit [https://www.befrienders.org](https://www.befrienders.org/) to find a helpline in your country.
* Local Emergency Services:** Call your local emergency number immediately.

* A Quick Grounding Technique While You Connect: 
If you can, try this simple 3-3-3 exercise to ground yourself in the present moment:
1.  See: Look around you and name 3 things you can see.
2.  Hear: Listen carefully and name 3 sounds you can hear.
3.  Touch: Touch 3 objects near you and notice how they feel.

Please, make the call. These feelings, while incredibly powerful, can be managed with support. You deserve to feel safe and heard.`
    };
  };

  const getEnhancedEmotionResponse = (emotionData, userMessage) => {
    const { primary, emotions } = emotionData;
    const responses = {
      disappointment: {
        acknowledgment: `I recognize you're experiencing disappointment${userName ? `, ${userName}` : ''}. The emotional weight you're carrying is real and significant.`,
        exploration: `Disappointment often emerges when our expectations diverge from reality. This can be particularly challenging when we've invested significant emotional energy into an outcome.`,
        question: `Would you feel comfortable sharing what specific aspects of the situation have contributed most to this disappointment? Understanding the core elements can help us work through this together.`
      },
      sadness: {
        acknowledgment: `I'm observing indicators of sadness in your expression${userName ? `, ${userName}` : ''}. This emotion deserves validation and attention.`,
        exploration: `Sadness is a natural human response to loss, unmet needs, or difficult circumstances. It signals that something meaningful to you has been affected.`,
        question: `Can you help me understand what's been weighing most heavily on you? What thoughts have been occupying your mind recently?`
      },
      anger: {
        acknowledgment: `I'm sensing significant frustration and anger in what you've shared${userName ? `, ${userName}` : ''}. These feelings are valid responses.`,
        exploration: `Anger typically indicates that a boundary has been crossed or a value has been violated. It's your emotional system signaling that something important requires attention.`,
        question: `What situation or interaction has triggered these feelings? Understanding the catalyst can help us identify constructive pathways forward.`
      },
      nervousness: {
        acknowledgment: `I'm detecting signs of anxiety and nervousness in your communication${userName ? `, ${userName}` : ''}.`,
        exploration: `Nervousness often manifests when we're facing uncertainty or anticipating challenging situations. Your mind is attempting to prepare you for what lies ahead.`,
        question: `What specific aspects of the upcoming situation are generating the most concern for you? Let's break down these worries systematically.`
      },
      fear: {
        acknowledgment: `I recognize you're experiencing fear${userName ? `, ${userName}` : ''}. This is a protective emotion that requires careful attention.`,
        exploration: `Fear serves as an alert system, though sometimes it can activate more intensely than the situation warrants. Your feelings are valid regardless of their proportion to external circumstances.`,
        question: `What thoughts or scenarios are contributing to this fear? Articulating them can often help us examine them more objectively.`
      },
      grief: {
        acknowledgment: `I'm recognizing grief in your words${userName ? `, ${userName}` : ''}. This is one of the most profound emotional experiences we face as humans.`,
        exploration: `Grief has no prescribed timeline or proper way to process. It reflects the depth of what was meaningful to you.`,
        question: `Would you like to share what you're grieving? There's no pressure to discuss if you're not ready, but I'm here to listen.`
      },
      joy: {
        acknowledgment: `I'm delighted to observe joy in your expression${userName ? `, ${userName}` : ''}! These moments of positive emotion are valuable.`,
        exploration: `Acknowledging and savoring positive experiences strengthens our capacity for wellbeing and resilience.`,
        question: `What elements of this experience are bringing you the most happiness? Understanding what contributes to your joy can help you recognize and cultivate more such moments.`
      },
      excitement: {
        acknowledgment: `Your excitement is palpable${userName ? `, ${userName}` : ''}! This energetic enthusiasm is wonderful to witness.`,
        exploration: `Excitement indicates anticipation of something positive and meaningful to you. This energy can be channeled constructively.`,
        question: `What aspects of this upcoming experience are generating the most enthusiasm for you?`
      },
      neutral: {
        acknowledgment: `Thank you for sharing with me${userName ? `, ${userName}` : ''}.`,
        exploration: `I'm here to provide a confidential, judgment-free space for whatever you'd like to discuss.`,
        question: `What brings you here today? What would be most helpful for you to explore or discuss right now?`
      }
    };

    const response = responses[primary] || responses.neutral;
    return `${response.acknowledgment}\n\n${response.exploration}\n\n${response.question}`;
  };

  const getInteractiveSuggestions = (emotionData) => {
    const { primary } = emotionData;

    const suggestionDetails = {
      'Paced Breathing': {
        icon: '🌬️',
        description: 'A simple technique to slow your heart rate and calm your nervous system.',
        steps: [
          '1. Sit or lie down comfortably.',
          '2. Inhale slowly through your nose for 4 seconds.',
          '3. Exhale slowly through your mouth for 6 seconds.',
          '4. Pause for 2 seconds.',
          '5. Repeat for 5-10 cycles, focusing on the long exhale.'
        ],
        duration: '2-3 minutes'
      },
      'Sensory Grounding (5-4-3-2-1)': {
        icon: '🛡️',
        description: 'An anchor to the present moment, useful when thoughts are overwhelming.',
        steps: [
          '1. Pause and take a deep breath.',
          '2. Name 5 things you can SEE.',
          '3. Name 4 things you can FEEL (touch).',
          '4. Name 3 things you can HEAR.',
          '5. Name 2 things you can SMELL.',
          '6. Name 1 thing you can TASTE.'
        ],
        duration: '3-5 minutes'
      },
      'Expressive Writing': {
        icon: '📝',
        description: 'Process intense emotions by writing them down without judgment.',
        steps: [
          '1. Set a timer for 10-15 minutes.',
          '2. Write continuously about what you are feeling and why.',
          '3. Don\'t worry about grammar or spelling. Just write.',
          '4. When the timer is up, you can keep the writing or discard it. The goal is the process, not the product.'
        ],
        duration: '10-15 minutes'
      },
      'Mindful Observation': {
        icon: '🧐',
        description: 'Observe your emotions as if they were clouds in the sky, without getting swept away.',
        steps: [
          '1. Close your eyes and notice where you feel the emotion in your body.',
          '2. Label the emotion (e.g., "This is anger," "This is sadness").',
          '3. Acknowledge its presence without judgment.',
          '4. Remind yourself, "This is a temporary feeling. It will pass."',
          '5. Breathe into the physical sensation for a few moments.'
        ],
        duration: '5-10 minutes'
      },
      'Cognitive Reframing': {
        icon: '🔄',
        description: 'Challenge and change unhelpful thought patterns associated with an emotion.',
        steps: [
          '1. Identify the automatic negative thought (e.g., "I always fail").',
          '2. Look for evidence that contradicts this thought.',
          '3. Consider a more balanced, realistic perspective (e.g., "I struggled with this, but I\'ve succeeded at other things").',
          '4. Write down this new, more helpful thought.'
        ],
        duration: '10-15 minutes'
      },
      'Savoring The Moment': {
        icon: '✨',
        description: 'Amplify positive feelings by fully immersing yourself in a pleasant experience.',
        steps: [
          '1. Notice a positive feeling or experience, no matter how small.',
          '2. Pay close attention to all your senses. What do you see, hear, smell, feel?',
          '3. Share the positive experience with someone else.',
          '4. Take a mental "snapshot" of the moment to recall later.'
        ],
        duration: '1-5 minutes'
      },
      'Gratitude Journaling': {
        icon: '🙏',
        description: 'Shift your focus to the positive aspects of your life to cultivate appreciation.',
        steps: [
          '1. Take a few minutes to think about your day.',
          '2. Write down 3-5 specific things you are grateful for.',
          '3. For each item, briefly write why you are grateful for it.',
          '4. Try to be as specific as possible (e.g., "the warmth of the sun on my face" instead of just "the sun").'
        ],
        duration: '5-10 minutes'
      },
      'Self-Compassion Break': {
        icon: '❤️',
        description: 'Treat yourself with the same kindness you would offer a good friend.',
        steps: [
          '1. Acknowledge your suffering: "This is a moment of difficulty."',
          '2. Recognize shared humanity: "Feeling this way is part of being human. Others feel this way too."',
          '3. Offer yourself kindness: Place a hand over your heart and say, "May I be kind to myself in this moment."'
        ],
        duration: '1-3 minutes'
      },
      'Opposite Action': {
        icon: '↔️',
        description: 'Act opposite to your emotional urge when that urge is unhelpful.',
        steps: [
          '1. Identify the emotion and the urge (e.g., Sadness -> urge to isolate).',
          '2. Ask yourself if acting on the urge is helpful in the long run.',
          '3. If not, do the opposite (e.g., Instead of isolating, call a friend or go for a short walk).',
          '4. Act opposite all the way, committing fully to the new action.'
        ],
        duration: 'Varies'
      },
      'Behavioral Activation': {
        icon: '🏃',
        description: 'Boost your mood by engaging in a small, positive, or rewarding activity.',
        steps: [
          '1. Choose a simple, manageable activity you can do right now (e.g., listen to a song, stretch for 5 mins, step outside).',
          '2. The goal is not to feel motivated first, but to act first.',
          '3. Focus on the action itself, not on how you feel.',
          '4. Notice any small shift in your mood after completing it.'
        ],
        duration: '5-20 minutes'
      },
      'Problem-Solving Steps': {
        icon: '💡',
        description: 'Break down a problem that is causing distress into manageable steps.',
        steps: [
          '1. Clearly define the problem.',
          '2. Brainstorm at least 3-5 potential solutions, no matter how silly they seem.',
          '3. List the pros and cons for each solution.',
          '4. Choose the best solution to try first.',
          '5. Plan the first small step you can take.'
        ],
        duration: '15-20 minutes'
      },
      'Mindful Body Scan': {
        icon: '🧘',
        description: 'Gently bring awareness to different parts of your body to ground yourself and release tension.',
        steps: [
          '1. Lie down comfortably.',
          '2. Bring your attention to the toes of your left foot. Notice any sensations without judgment.',
          '3. Slowly move your awareness up your leg, to your torso, arms, and head.',
          '4. As you scan, simply notice sensations of warmth, tingling, or pressure.',
          '5. If your mind wanders, gently guide it back to the part of the body you are focusing on.'
        ],
        duration: '10-20 minutes'
      },
      'Sharing Positive News': {
        icon: '🎉',
        description: 'Amplify positive emotions by sharing good news with someone who will be supportive.',
        steps: [
          '1. Think of a recent positive event or accomplishment.',
          '2. Identify a friend or family member who you know will react positively.',
          '3. Reach out and share your news with them.',
          '4. Pay attention to their response and how it makes you feel.'
        ],
        duration: '5-10 minutes'
      },
      'Radical Acceptance': {
        icon: '🌊',
        description: 'Acknowledge reality as it is, without fighting it, to reduce suffering.',
        steps: [
          '1. Notice when you are fighting reality ("This shouldn\'t be happening!").',
          '2. Remind yourself of the facts of the situation.',
          '3. Acknowledge that reality is what it is, even if you don\'t like it.',
          '4. Say to yourself, "This is what is happening." This is not approval, just acknowledgement.',
          '5. Focus on what you can control moving forward from this accepted reality.'
        ],
        duration: '5 minutes'
      },
      'Mind Dump': {
        icon: '🗑️',
        description: 'Clear a cluttered mind by writing down every thought, worry, and to-do item.',
        steps: [
          '1. Take a blank piece of paper.',
          '2. For 5-10 minutes, write down everything that comes to mind.',
          '3. Do not organize it. Just get it all out.',
          '4. Afterwards, you can review the list for any important items, but the primary goal is to clear your head.'
        ],
        duration: '5-10 minutes'
      }
    };

    const recommendations = {
      'admiration': ['Savoring The Moment', 'Gratitude Journaling', 'Sharing Positive News', 'Mindful Observation', 'Expressive Writing'],
      'amusement': ['Savoring The Moment', 'Sharing Positive News', 'Mindful Body Scan', 'Gratitude Journaling', 'Behavioral Activation'],
      'anger': ['Paced Breathing', 'Mindful Observation', 'Expressive Writing', 'Opposite Action', 'Problem-Solving Steps'],
      'annoyance': ['Paced Breathing', 'Self-Compassion Break', 'Cognitive Reframing', 'Mindful Observation', 'Problem-Solving Steps'],
      'approval': ['Savoring The Moment', 'Self-Compassion Break', 'Sharing Positive News', 'Gratitude Journaling', 'Mindful Observation'],
      'caring': ['Self-Compassion Break', 'Savoring The Moment', 'Gratitude Journaling', 'Sharing Positive News', 'Behavioral Activation'],
      'confusion': ['Mind Dump', 'Expressive Writing', 'Problem-Solving Steps', 'Sensory Grounding (5-4-3-2-1)', 'Mindful Body Scan'],
      'curiosity': ['Mindful Observation', 'Expressive Writing', 'Behavioral Activation', 'Savoring The Moment', 'Problem-Solving Steps'],
      'desire': ['Mindful Observation', 'Cognitive Reframing', 'Self-Compassion Break', 'Expressive Writing', 'Problem-Solving Steps'],
      'disappointment': ['Radical Acceptance', 'Self-Compassion Break', 'Cognitive Reframing', 'Opposite Action', 'Behavioral Activation'],
      'disapproval': ['Mindful Observation', 'Cognitive Reframing', 'Paced Breathing', 'Self-Compassion Break', 'Expressive Writing'],
      'disgust': ['Sensory Grounding (5-4-3-2-1)', 'Paced Breathing', 'Mindful Observation', 'Radical Acceptance', 'Opposite Action'],
      'embarrassment': ['Self-Compassion Break', 'Paced Breathing', 'Cognitive Reframing', 'Sensory Grounding (5-4-3-2-1)', 'Mindful Observation'],
      'excitement': ['Savoring The Moment', 'Paced Breathing', 'Mindful Body Scan', 'Sharing Positive News', 'Behavioral Activation'],
      'fear': ['Sensory Grounding (5-4-3-2-1)', 'Paced Breathing', 'Mindful Observation', 'Self-Compassion Break', 'Cognitive Reframing'],
      'gratitude': ['Gratitude Journaling', 'Savoring The Moment', 'Sharing Positive News', 'Mindful Observation', 'Self-Compassion Break'],
      'grief': ['Self-Compassion Break', 'Expressive Writing', 'Radical Acceptance', 'Mindful Body Scan', 'Behavioral Activation'],
      'joy': ['Savoring The Moment', 'Gratitude Journaling', 'Sharing Positive News', 'Mindful Body Scan', 'Behavioral Activation'],
      'love': ['Savoring The Moment', 'Gratitude Journaling', 'Sharing Positive News', 'Self-Compassion Break', 'Mindful Observation'],
      'nervousness': ['Paced Breathing', 'Sensory Grounding (5-4-3-2-1)', 'Mindful Body Scan', 'Cognitive Reframing', 'Self-Compassion Break'],
      'optimism': ['Savoring The Moment', 'Gratitude Journaling', 'Sharing Positive News', 'Cognitive Reframing', 'Behavioral Activation'],
      'pride': ['Savoring The Moment', 'Self-Compassion Break', 'Sharing Positive News', 'Gratitude Journaling', 'Mindful Observation'],
      'realization': ['Mindful Observation', 'Expressive Writing', 'Mind Dump', 'Problem-Solving Steps', 'Cognitive Reframing'],
      'relief': ['Paced Breathing', 'Mindful Body Scan', 'Savoring The Moment', 'Self-Compassion Break', 'Gratitude Journaling'],
      'remorse': ['Self-Compassion Break', 'Cognitive Reframing', 'Expressive Writing', 'Problem-Solving Steps', 'Radical Acceptance'],
      'sadness': ['Self-Compassion Break', 'Behavioral Activation', 'Opposite Action', 'Expressive Writing', 'Mindful Body Scan'],
      'surprise': ['Mindful Observation', 'Paced Breathing', 'Sensory Grounding (5-4-3-2-1)', 'Expressive Writing', 'Savoring The Moment'],
      'neutral': ['Gratitude Journaling','Values Clarification','Mindful Body Scan','Mind Dump','Behavioral Activation']
      };

    const emotionSuggestions = recommendations[primary] || recommendations.neutral;

    return emotionSuggestions.map(name => {
        if (!suggestionDetails[name]) {
            console.error(`Error: Technique "${name}" is not defined in suggestionDetails.`);
            return null; // Prevent a crash
        }
        return {
            name,
            details: suggestionDetails[name]
        };
    }).filter(Boolean); // Filter out any null values to be safe
};

  // Doctor directory large object (kept exactly as you provided)
  const doctorDirectory = {
    'Global': {
      title: 'International Crisis Hotlines',
      hotlines: [
        { name: 'International Association for Suicide Prevention', phone: 'Various by country', email: 'info@iasp.info', website: 'https://www.iasp.info/resources/Crisis_Centres/' },
        { name: 'Befrienders Worldwide', phone: '24/7 Support', email: 'admin@befrienders.org', website: 'https://befrienders.org' },
        { name: 'Crisis Text Line (Global)', phone: 'Text HELLO to your local number', email: 'N/A', website: 'https://www.crisistextline.org' }
      ]
    },
    'USA': {
      title: 'United States Mental Health Professionals',
      hotlines: [
        { name: '988 Suicide & Crisis Lifeline', phone: '988', available: '24/7', website: 'https://988lifeline.org/' },
        { name: 'Crisis Text Line', phone: 'Text HOME to 741741', available: '24/7', website: 'https://www.crisistextline.org/' },
        { name: 'SAMHSA National Helpline', phone: '1-800-662-4357', available: '24/7', website: 'https://www.samhsa.gov/find-help/national-helpline' }
      ],

      professionals: [
          { name: 'Dr. Sarah Mitchell, PhD', specialty: 'Clinical Psychology', phone: '+1-555-0101', email: 'dr.mitchell@mentalhealth.org', location: 'New York, NY' },
          { name: 'Dr. James Rodriguez, MD', specialty: 'Psychiatry', phone: '+1-555-0102', email: 'j.rodriguez@psychcare.com', location: 'Los Angeles, CA' },
          { name: 'Dr. Emily Chen, PsyD', specialty: 'Trauma & PTSD', phone: '+1-555-0103', email: 'echen@traumacare.org', location: 'San Francisco, CA' },
          { name: 'Dr. Michael Thompson, PhD', specialty: 'Anxiety Disorders', phone: '+1-555-0104', email: 'm.thompson@anxietyhelp.com', location: 'Chicago, IL' },
          { name: 'Dr. Lisa Anderson, LCSW', specialty: 'Depression & Mood Disorders', phone: '+1-555-0105', email: 'landerson@moodhealth.org', location: 'Boston, MA' },
          { name: 'Dr. David Kumar, MD', specialty: 'Addiction Psychiatry', phone: '+1-555-0106', email: 'd.kumar@addictionmd.com', location: 'Houston, TX' },
          { name: 'Dr. Rachel Williams, PhD', specialty: 'Family Therapy', phone: '+1-555-0107', email: 'rwilliams@familycare.org', location: 'Seattle, WA' },
          { name: 'Dr. Robert Lee, PsyD', specialty: 'Child & Adolescent Psychology', phone: '+1-555-0108', email: 'r.lee@youthmental.com', location: 'Miami, FL' },
          { name: 'Dr. Jennifer Martinez, PhD', specialty: 'Eating Disorders', phone: '+1-555-0109', email: 'jmartinez@eatingdisordercare.org', location: 'Denver, CO' },
          { name: 'Dr. Thomas Brown, MD', specialty: 'Bipolar Disorder', phone: '+1-555-0110', email: 't.brown@bipolarcare.com', location: 'Atlanta, GA' }
        ]
    },
    'UK': {
      title: 'United Kingdom Mental Health Services',
      hotlines: [
        { name: 'Samaritans', phone: '116 123', available: '24/7', website: 'https://www.samaritans.org/' },
        { name: 'CALM (Campaign Against Living Miserably)', phone: '0800 58 58 58', available: '5pm-midnight', website: 'https://www.thecalmzone.net/' },
        { name: 'Mind Infoline', phone: '0300 123 3393', available: '9am-6pm Mon-Fri', website: 'https://www.mind.org.uk/' }
      ],
      professionals: [
        { name: 'Dr. Eleanor Davies, PhD', specialty: 'Clinical Psychology', phone: '+44-20-5555-0201', email: 'e.davies@ukpsych.nhs.uk', location: 'London' },
        { name: 'Dr. William Foster, MD', specialty: 'Psychiatry', phone: '+44-20-5555-0202', email: 'w.foster@psychiatry.org.uk', location: 'Manchester' },
        { name: 'Dr. Sophie Turner, DClinPsy', specialty: 'CBT Specialist', phone: '+44-20-5555-0203', email: 's.turner@cbttherapy.co.uk', location: 'Birmingham' },
        { name: 'Dr. James Harrison, PhD', specialty: 'Trauma Psychology', phone: '+44-20-5555-0204', email: 'j.harrison@traumauk.org', location: 'Edinburgh' },
        { name: 'Dr. Charlotte Bennett, MD', specialty: 'Mood Disorders', phone: '+44-20-5555-0205', email: 'c.bennett@moodcare.nhs.uk', location: 'Bristol' },
        { name: 'Dr. Oliver Wright, PhD', specialty: 'Anxiety & OCD', phone: '+44-20-5555-0206', email: 'o.wright@ocdhelp.co.uk', location: 'Leeds' },
        { name: 'Dr. Emma Collins, DClinPsy', specialty: 'Relationship Therapy', phone: '+44-20-5555-0207', email: 'e.collins@couples.org.uk', location: 'Liverpool' },
        { name: 'Dr. George Parker, MD', specialty: 'Addiction Psychiatry', phone: '+44-20-5555-0208', email: 'g.parker@addictioncare.nhs.uk', location: 'Glasgow' },
        { name: 'Dr. Amelia Roberts, PhD', specialty: 'Child Psychology', phone: '+44-20-5555-0209', email: 'a.roberts@childmind.org.uk', location: 'Newcastle' },
        { name: 'Dr. Henry Mitchell, MD', specialty: 'Geriatric Psychiatry', phone: '+44-20-5555-0210', email: 'h.mitchell@eldercare.nhs.uk', location: 'Oxford' }
      ]
    },
    'India': {
      title: 'India Mental Health Professionals & Services',
      hotlines: [
        { name: 'AASRA', phone: '91-9820466726', available: '24/7', website: 'http://www.aasra.info/' },
        { name: 'iCall', phone: '022-25521111', available: '8am-10pm Mon-Sat', website: 'http://icallhelpline.org/' },
        { name: 'Sneha India Foundation', phone: '91-44-2464-0050', available: '24/7', website: 'https://snehaindia.org/' },
        { name: 'Vandrevala Foundation', phone: '1860-2662-345', available: '24/7', website: 'https://www.vandrevalafoundation.com/' },
        { name: 'NIMHANS Helpline', phone: '080-4611-0007', available: '24/7', website: 'https://nimhans.ac.in/' }
      ],
      professionals: [
        { name: 'Dr. Rajesh Kumar, MD', specialty: 'Psychiatry', phone: '+91-11-5555-0301', email: 'dr.rajesh@aiimsdel.in', location: 'New Delhi - AIIMS' },
        { name: 'Dr. Priya Sharma, PhD', specialty: 'Clinical Psychology', phone: '+91-22-5555-0302', email: 'priya.sharma@nimhans.org', location: 'Mumbai - NIMHANS' },
        { name: 'Dr. Arun Patel, MD', specialty: 'Child & Adolescent Psychiatry', phone: '+91-80-5555-0303', email: 'arun.patel@nimhans.ac.in', location: 'Bangalore - NIMHANS' },
        { name: 'Dr. Meera Reddy, PhD', specialty: 'Trauma & PTSD', phone: '+91-40-5555-0304', email: 'meera.reddy@apollohospitals.com', location: 'Hyderabad - Apollo' },
        { name: 'Dr. Sanjay Gupta, MD', specialty: 'Depression & Anxiety', phone: '+91-44-5555-0305', email: 'sanjay.gupta@fortis.com', location: 'Chennai - Fortis' },
        { name: 'Dr. Anjali Verma, PhD', specialty: 'Women\'s Mental Health', phone: '+91-33-5555-0306', email: 'anjali.verma@amri.in', location: 'Kolkata - AMRI' },
        { name: 'Dr. Vikram Singh, MD', specialty: 'Addiction Psychiatry', phone: '+1-555-0106', email: 'vikram.singh@aiims.edu', location: 'Ahmedabad - AIIMS' },
        { name: 'Dr. Kavita Nair, PhD', specialty: 'Relationship Counseling', phone: '+91-484-5555-0308', email: 'kavita.nair@aster.dm', location: 'Kochi - Aster' },
        { name: 'Dr. Amit Desai, MD', specialty: 'Bipolar & Schizophrenia', phone: '+91-20-5555-0309', email: 'amit.desai@rubyhal.com', location: 'Pune - Ruby Hall' },
        { name: 'Dr. Sunita Iyer, PhD', specialty: 'Eating Disorders', phone: '+91-11-5555-0310', email: 'sunita.iyer@maxhealthcare.com', location: 'New Delhi - Max' },
        { name: 'Dr. Ramesh Chandra, MD', specialty: 'Geriatric Psychiatry', phone: '+91-522-5555-0311', email: 'ramesh.c@sgpgi.ac.in', location: 'Lucknow - SGPGI' },
        { name: 'Dr. Neha Kapoor, PhD', specialty: 'Anxiety Disorders', phone: '+91-141-5555-0312', email: 'neha.kapoor@fortis.in', location: 'Jaipur - Fortis' },
        { name: 'Dr. Suresh Menon, MD', specialty: 'OCD Specialist', phone: '+91-471-5555-0313', email: 'suresh.menon@aims.in', location: 'Thiruvananthapuram' },
        { name: 'Dr. Deepa Rao, PhD', specialty: 'Family Therapy', phone: '+91-562-5555-0314', email: 'deepa.rao@familycare.org', location: 'Agra' },
        { name: 'Dr. Kiran Bedi, MD', specialty: 'Stress Management', phone: '+91-172-5555-0315', email: 'kiran.bedi@pgimer.edu.in', location: 'Chandigarh - PGIMER' },
        { name: 'Dr. Arjun Malhotra, PhD', specialty: 'Corporate Mental Health', phone: '+91-124-5555-0316', email: 'arjun.m@fortis.com', location: 'Gurgaon - Fortis' },
        { name: 'Dr. Pooja Khanna, MD', specialty: 'Postpartum Depression', phone: '+91-11-5555-0317', email: 'pooja.khanna@apollo.in', location: 'New Delhi - Apollo' },
        { name: 'Dr. Manish Joshi, PhD', specialty: 'Sleep Disorders', phone: '+91-755-5555-0318', email: 'manish.joshi@aiimsbpl.edu.in', location: 'Bhopal - AIIMS' },
        { name: 'Dr. Rekha Pillai, MD', specialty: 'ADHD Specialist', phone: '+91-44-5555-0319', email: 'rekha.pillai@cmch.edu.in', location: 'Vellore - CMC' },
        { name: 'Dr. Ashish Mehta, PhD', specialty: 'Anger Management', phone: '+91-22-5555-0320', email: 'ashish.mehta@lilavati.com', location: 'Mumbai - Lilavati' },
        { name: 'Dr. Shreya Das, MD', specialty: 'Perinatal Psychiatry', phone: '+91-33-5555-0321', email: 'shreya.das@cmri.ac.in', location: 'Kolkata - CMRI' },
        { name: 'Dr. Rahul Bhattacharya, PhD', specialty: 'Grief Counseling', phone: '+91-361-5555-0322', email: 'rahul.b@gmch.edu.in', location: 'Guwahati - GMCH' },
        { name: 'Dr. Nisha Agarwal, MD', specialty: 'Panic Disorders', phone: '+91-265-5555-0323', email: 'nisha.agarwal@svpimsr.com', location: 'Ahmedabad' },
        { name: 'Dr. Mohit Sharma, PhD', specialty: 'Social Anxiety', phone: '+91-183-5555-0324', email: 'mohit.sharma@dmc.edu.in', location: 'Ludhiana - DMC' },
        { name: 'Dr. Divya Krishnan, MD', specialty: 'Personality Disorders', phone: '+91-484-5555-0325', email: 'divya.k@aims.amrita.edu', location: 'Kochi - Amrita' },
        { name: 'Dr. Tarun Bajaj, PhD', specialty: 'Mindfulness-Based Therapy', phone: '+91-172-5555-0326', email: 'tarun.bajaj@pgi.ac.in', location: 'Chandigarh - PGI' },
        { name: 'Dr. Ananya Sen, MD', specialty: 'Mood Stabilization', phone: '+91-755-5555-0327', email: 'ananya.sen@aiims.edu', location: 'Bhopal - AIIMS' },
        { name: 'Dr. Varun Chopra, PhD', specialty: 'Performance Anxiety', phone: '+91-124-5555-0328', email: 'varun.chopra@medanta.org', location: 'Gurgaon - Medanta' },
        { name: 'Dr. Lakshmi Narayanan, MD', specialty: 'Cultural Psychiatry', phone: '+91-44-5555-0329', email: 'lakshmi.n@srmc.org', location: 'Chennai - SRMC' },
        { name: 'Dr. Harish Kumar, PhD', specialty: 'Burnout & Stress', phone: '+91-80-5555-0330', email: 'harish.kumar@stjohns.in', location: 'Bangalore - St. Johns' },
        { name: 'Dr. Ritu Malhotra, MD', specialty: 'Dissociative Disorders', phone: '+91-11-5555-0331', email: 'ritu.malhotra@ganga.ram', location: 'New Delhi - GRH' },
        { name: 'Dr. Sandeep Patel, PhD', specialty: 'LGBT+ Mental Health', phone: '+91-79-5555-0332', email: 'sandeep.patel@sag.ac.in', location: 'Ahmedabad - SAG' },
        { name: 'Dr. Priyanka Deshmukh, MD', specialty: 'Somatoform Disorders', phone: '+91-20-5555-0333', email: 'priyanka.d@dpu.edu.in', location: 'Pune - DPU' },
        { name: 'Dr. Abhishek Tiwari, PhD', specialty: 'Phobia Treatment', phone: '+91-522-5555-0334', email: 'abhishek.t@kgmu.org', location: 'Lucknow - KGMU' },
        { name: 'Dr. Swati Rao, MD', specialty: 'Impulse Control Disorders', phone: '+91-40-5555-0335', email: 'swati.rao@care.in', location: 'Hyderabad - CARE' },
        { name: 'Dr. Aditya Menon, PhD', specialty: 'Existential Therapy', phone: '+91-44-5555-0336', email: 'aditya.menon@mmc.edu.in', location: 'Chennai - MMC' },
        { name: 'Dr. Preeti Singh, MD', specialty: 'Body Dysmorphia', phone: '+91-11-5555-0337', email: 'preeti.singh@safdarjung.in', location: 'New Delhi - Safdarjung' },
        { name: 'Dr. Rohit Khanna, PhD', specialty: 'Adjustment Disorders', phone: '+91-22-5555-0338', email: 'rohit.khanna@tmc.gov.in', location: 'Mumbai - Tata Memorial' },
        { name: 'Dr. Madhuri Jain, MD', specialty: 'Seasonal Affective Disorder', phone: '+91-141-5555-0339', email: 'madhuri.jain@sms.nic.in', location: 'Jaipur - SMS' },
        { name: 'Dr. Nikhil Verma, PhD', specialty: 'Chronic Pain Psychology', phone: '+91-11-5555-0340', email: 'nikhil.verma@ipgmer.gov.in', location: 'New Delhi - AIIMS' },
        { name: 'Dr. Archana Yadav, MD', specialty: 'Neuropsychiatry', phone: '+91-562-5555-0341', email: 'archana.yadav@sn.agra', location: 'Agra - SN Medical' },
        { name: 'Dr. Gaurav Kapoor, PhD', specialty: 'Positive Psychology', phone: '+91-172-5555-0342', email: 'gaurav.k@puchd.ac.in', location: 'Chandigarh - PU' },
        { name: 'Dr. Shruti Banerjee, MD', specialty: 'Emergency Psychiatry', phone: '+91-33-5555-0343', email: 'shruti.b@ipgmer.gov.in', location: 'Kolkata - IPGMER' },
        { name: 'Dr. Karthik Reddy, PhD', specialty: 'Integrative Mental Health', phone: '+91-80-5555-0344', email: 'karthik.reddy@vydehi.ac.in', location: 'Bangalore - Vydehi' },
        { name: 'Dr. Pallavi Desai, MD', specialty: 'Consultation-Liaison Psychiatry', phone: '+91-265-5555-0345', email: 'pallavi.desai@bmc.edu', location: 'Vadodara - BMC' },
        { name: 'Dr. Siddharth Nair, PhD', specialty: 'Digital Mental Health', phone: '+91-484-5555-0346', email: 'siddharth.nair@aims.kerala', location: 'Kochi - AIMS' },
        { name: 'Dr. Riya Chatterjee, MD', specialty: 'Community Psychiatry', phone: '+91-361-5555-0347', email: 'riya.c@gmch.gov.in', location: 'Guwahati - GMCH' },
        { name: 'Dr. Akash Pandey, PhD', specialty: 'Forensic Psychology', phone: '+91-522-5555-0348', email: 'akash.pandey@lko.nic.in', location: 'Lucknow - MLI' },
        { name: 'Dr. Tanvi Shah, MD', specialty: 'Rehabilitation Psychiatry', phone: '+91-79-5555-0349', email: 'tanvi.shah@bjs.in', location: 'Ahmedabad - BJ Medical' },
        { name: 'Dr. Rajeev Gupta, PhD', specialty: 'Sports Psychology', phone: '+91-11-5555-0350', email: 'rajeev.gupta@nsnis.org', location: 'New Delhi - SAI' }
      ]
    },
    'Canada': {
      title: 'Canada Mental Health Services',
      hotlines: [
        { name: 'Canada Suicide Prevention Service', phone: '1-833-456-4566', available: '24/7', website: 'https://www.crisisservicescanada.ca/en/' },
        { name: 'Kids Help Phone', phone: '1-800-668-6868', available: '24/7', website: 'https://kidshelpphone.ca/' },
        { name: 'Crisis Services Canada', phone: '1-833-456-4566', available: '24/7', website: 'https://www.crisisservicescanada.ca/en/' }
      ],
      professionals: [
        { name: 'Dr. Margaret Thompson, PhD', specialty: 'Clinical Psychology', phone: '+1-416-555-0401', email: 'm.thompson@camh.ca', location: 'Toronto, ON' },
        { name: 'Dr. Pierre Dubois, MD', specialty: 'Psychiatry', phone: '+1-514-555-0402', email: 'p.dubois@douglas.qc.ca', location: 'Montreal, QC' },
        { name: 'Dr. Sarah Chen, PhD', specialty: 'Anxiety & Depression', phone: '+1-604-555-0403', email: 's.chen@vch.ca', location: 'Vancouver, BC' },
        { name: 'Dr. David Martinez, MD', specialty: 'Addiction Medicine', phone: '+1-403-555-0404', email: 'd.martinez@albertahealth.ca', location: 'Calgary, AB' },
        { name: 'Dr. Emily Roberts, PhD', specialty: 'Trauma Therapy', phone: '+1-613-555-0405', email: 'e.roberts@rohcg.on.ca', location: 'Ottawa, ON' },
        { name: 'Dr. James Wilson, MD', specialty: 'Mood Disorders', phone: '+1-780-555-0406', email: 'j.wilson@ualberta.ca', location: 'Edmonton, AB' },
        { name: 'Dr. Lisa Anderson, PhD', specialty: 'Child Psychology', phone: '+1-204-555-0407', email: 'l.anderson@hsc.mb.ca', location: 'Winnipeg, MB' },
        { name: 'Dr. Michael Lee, MD', specialty: 'Geriatric Psychiatry', phone: '+1-902-555-0408', email: 'm.lee@nshealth.ca', location: 'Halifax, NS' },
        { name: 'Dr. Jennifer Brown, PhD', specialty: 'Family Therapy', phone: '+1-306-555-0409', email: 'j.brown@saskhealthauthority.ca', location: 'Regina, SK' },
        { name: 'Dr. Robert Taylor, MD', specialty: 'Bipolar Disorder', phone: '+1-250-555-0410', email: 'r.taylor@viha.ca', location: 'Victoria, BC' }
      ]
    },
    'Australia': {
      title: 'Australia Mental Health Services',
      hotlines: [
        { name: 'Lifeline', phone: '13 11 14', available: '24/7', website: 'https://www.lifeline.org.au/' },
        { name: 'Beyond Blue', phone: '1300 22 4636', available: '24/7', website: 'https://www.beyondblue.org.au/' },
        { name: 'Kids Helpline', phone: '1800 55 1800', available: '24/7', website: 'https://kidshelpline.com.au/' }
      ],
      professionals: [
        { name: 'Dr. Emma Williams, PhD', specialty: 'Clinical Psychology', phone: '+61-2-5555-0501', email: 'e.williams@blackdoginstitute.org.au', location: 'Sydney, NSW' },
        { name: 'Dr. Michael O\'Brien, MD', specialty: 'Psychiatry', phone: '+61-3-5555-0502', email: 'm.obrien@orygen.org.au', location: 'Melbourne, VIC' },
        { name: 'Dr. Sarah Thompson, PhD', specialty: 'Anxiety Disorders', phone: '+61-7-5555-0503', email: 's.thompson@qld.health.gov.au', location: 'Brisbane, QLD' },
        { name: 'Dr. James Patterson, MD', specialty: 'Depression Treatment', phone: '+61-8-5555-0504', email: 'j.patterson@sahealth.sa.gov.au', location: 'Adelaide, SA' },
        { name: 'Dr. Rachel Green, PhD', specialty: 'Trauma & PTSD', phone: '+61-8-5555-0505', email: 'r.green@health.wa.gov.au', location: 'Perth, WA' },
        { name: 'Dr. David Chen, MD', specialty: 'Addiction Psychiatry', phone: '+61-2-5555-0506', email: 'd.chen@health.act.gov.au', location: 'Canberra, ACT' },
        { name: 'Dr. Lisa Anderson, PhD', specialty: 'Child & Adolescent', phone: '+61-3-5555-0507', email: 'l.anderson@rch.org.au', location: 'Melbourne, VIC' },
        { name: 'Dr. Peter Wilson, MD', specialty: 'Eating Disorders', phone: '+61-2-5555-0508', email: 'p.wilson@health.nsw.gov.au', location: 'Sydney, NSW' },
        { name: 'Dr. Sophie Martin, PhD', specialty: 'Relationship Counseling', phone: '+61-7-5555-0509', email: 's.martin@relationships.org.au', location: 'Gold Coast, QLD' },
        { name: 'Dr. Thomas Brown, MD', specialty: 'Bipolar Disorder', phone: '+61-3-5555-0510', email: 't.brown@monash.edu', location: 'Melbourne, VIC' }
      ]
    }
  };

  const analyzeEmotion = async (text) => {
    try {
      console.log('📤 Sending to backend:', text.substring(0, 50));
      const response = await fetch(`${API_URL}/api/analyze-emotion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      let data = await response.json();
      console.log('✅ Real AI Detection:', data);

      const mockDimensions = {
        sadness: { valence: -0.7, arousal: 0.2 },
        joy: { valence: 0.8, arousal: 0.6 },
        anger: { valence: -0.6, arousal: 0.8 },
        fear: { valence: -0.6, arousal: 0.7 },
        disappointment: { valence: -0.5, arousal: 0.3 },
        excitement: { valence: 0.7, arousal: 0.8 },
        neutral: { valence: 0.0, arousal: 0.1 },
      };

      data.valence = (data.valence !== undefined) ? data.valence : (mockDimensions[data.primary]?.valence || 0.0);
      data.arousal = (data.arousal !== undefined) ? data.arousal : (mockDimensions[data.primary]?.arousal || 0.0);

      return data;

    } catch (error) {
      console.error('❌ Backend API call failed:', error.message);
      setBackendConnected(false);
      return { primary: 'neutral', emotions: [{ emotion: 'neutral', confidence: 0.5 }], fallback: true, valence: 0.0, arousal: 0.1 };
    }
  };

  const generateEmpatheticResponse = async (emotionData, conversationMessages) => {
    try {
      const payload = {
        messages: conversationMessages.map(m => ({ role: m.role, content: m.content })),
        emotionData,
        userName
      };

      const res = await fetch(`${API_URL}/api/generate-empathetic-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`LLM API Error: ${res.status} ${err?.message || ''}`);
      }

      const jd = await res.json();
      return jd.response || null;
    } catch (e) {
      console.error('❌ LLM request failed:', e.message);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput('');
    if (isListening) stopListening();

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date().toISOString() }]);
    setIsTyping(true);

    const emotionData = await analyzeEmotion(userMessage);
    setDetectedEmotions(emotionData);

    setMoodHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      emotion: emotionData.primary,
      confidence: emotionData.emotions?.[0]?.confidence || 0,
      message: userMessage.substring(0, 50),
      valence: emotionData.valence,
      arousal: emotionData.arousal,
    }]);

    const recentConversation = [...messages, { role: 'user', content: userMessage }].slice(-8);
    const llmResponse = await generateEmpatheticResponse(emotionData, recentConversation);

    setTimeout(() => {
      let assistantMessage;
      const isCrisis = detectCrisis(userMessage);

      if (isCrisis) {
        assistantMessage = getCrisisResponse();
      } else if (llmResponse) {
        const suggestions = getInteractiveSuggestions(emotionData);
        assistantMessage = {
          type: 'normal',
          content: llmResponse,
          emotionData,
          interactiveSuggestions: suggestions
        };
      } else {
        const emotionResponse = getEnhancedEmotionResponse(emotionData, userMessage);
        const suggestions = getInteractiveSuggestions(emotionData);

        assistantMessage = {
          type: 'normal',
          content: emotionResponse,
          emotionData,
          interactiveSuggestions: suggestions
        };
      }

      setMessages(prev => [...prev, { role: 'assistant', ...assistantMessage, timestamp: new Date().toISOString() }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleFeedback = (messageIndex, isPositive) => {
    setMessages(prev => prev.map((msg, idx) =>
      idx === messageIndex ? { ...msg, feedback: isPositive ? 'positive' : 'negative' } : msg
    ));
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'joy': 'text-green-600 bg-green-50 border-green-200',
      'amusement': 'text-lime-600 bg-lime-50 border-lime-200',
      'excitement': 'text-orange-600 bg-orange-50 border-orange-200',
      'love': 'text-pink-600 bg-pink-50 border-pink-200',
      'desire': 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200',
      'admiration': 'text-yellow-500 bg-yellow-50 border-yellow-200',
      'gratitude': 'text-teal-600 bg-teal-50 border-teal-200',
      'optimism': 'text-cyan-600 bg-cyan-50 border-cyan-200',
      'pride': 'text-purple-800 bg-purple-100 border-purple-300',
      'approval': 'text-emerald-600 bg-emerald-50 border-emerald-200',
      'caring': 'text-rose-600 bg-rose-50 border-rose-200',
      'relief': 'text-emerald-500 bg-emerald-50 border-emerald-200',
      'sadness': 'text-blue-600 bg-blue-50 border-blue-200',
      'grief': 'text-gray-800 bg-gray-200 border-gray-400',
      'anger': 'text-red-600 bg-red-50 border-red-200',
      'annoyance': 'text-amber-700 bg-amber-100 border-amber-300',
      'disappointment': 'text-indigo-600 bg-indigo-50 border-indigo-200',
      'disapproval': 'text-slate-600 bg-slate-50 border-slate-200',
      'fear': 'text-purple-600 bg-purple-50 border-purple-200',
      'nervousness': 'text-amber-600 bg-amber-50 border-amber-200',
      'remorse': 'text-slate-800 bg-slate-200 border-slate-400',
      'disgust': 'text-lime-800 bg-lime-100 border-lime-300',
      'embarrassment': 'text-pink-700 bg-pink-100 border-pink-300',
      'surprise': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'curiosity': 'text-sky-600 bg-sky-50 border-sky-200',
      'confusion': 'text-violet-600 bg-violet-50 border-violet-200',
      'realization': 'text-sky-700 bg-sky-100 border-sky-300',
      'neutral': 'text-gray-600 bg-gray-50 border-gray-200'
    };

    return colors[emotion] || colors.neutral;
  };

  const exportMoodData = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Mood History Report", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`User: ${userName || 'Anonymous'}`, 14, 35);
    doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 196, 35, { align: 'right' });

    if (moodHistory.length === 0) {
      doc.setFontSize(14);
      doc.text("No mood history has been recorded yet.", 105, 60, { align: 'center' });
    } else {
      let yPosition = 50;
      const pageHeight = doc.internal.pageSize.getHeight();
      const bottomMargin = 20;

      moodHistory.forEach((entry, index) => {
        if (yPosition > pageHeight - bottomMargin - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const entryTimestamp = new Date(entry.timestamp).toLocaleString();
        const entryEmotion = `Emotion: ${entry.emotion} (${(entry.confidence * 100).toFixed(0)}%)`;
        const entryValence = `Valence: ${entry.valence.toFixed(2)}`;
        const entryArousal = `Arousal: ${entry.arousal.toFixed(2)}`;
        const entryMessage = `Message: "${entry.message}"`;

        if (index > 0) {
          try {
            doc.setLineDashPattern([2, 2], 0);
          } catch (e) {
            // older jsPDF versions may not support setLineDashPattern
          }
          doc.line(14, yPosition - 5, 196, yPosition - 5);
        }

        doc.setFontSize(10);
        try { doc.setTextColor(150); } catch (e) { /* fallback */ }
        doc.text(entryTimestamp, 14, yPosition);
        yPosition += 7;

        doc.setFontSize(12);
        try { doc.setTextColor(0); } catch (e) { /* fallback */ }
        doc.text(entryEmotion, 14, yPosition);
        doc.text(`${entryValence}, ${entryArousal}`, 196, yPosition, { align: 'right' });
        yPosition += 7;

        doc.setFontSize(11);
        try { doc.setTextColor(80); } catch (e) { /* fallback */ }
        const wrappedMessage = doc.splitTextToSize(entryMessage, 182);
        doc.text(wrappedMessage, 14, yPosition);

        yPosition += (wrappedMessage.length * 5) + 5;
      });
    }

    doc.save(`mood-history-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // -------------------------
  // Conditional Views
  // -------------------------
  if (showDisclaimer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-16 h-16 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Professional Disclaimer & User Agreement
          </h1>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
              <span>This is a <strong>supportive companion tool utilizing AI-powered emotion detection</strong> and is <strong>NOT a substitute for professional mental health care, psychiatric evaluation, psychological therapy, or medical advice</strong>.</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
              <span><strong>CRISIS SITUATIONS:</strong> If you're experiencing thoughts of self-harm, suicide, severe psychological distress, or are in immediate danger, please contact emergency services (911/112/999) or a crisis hotline immediately. This application will provide referrals but cannot replace immediate professional intervention.</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <span><strong>Privacy & Data Security:</strong> All conversations are stored exclusively on your local device. No data is transmitted to external servers. Clear your browser data to remove all conversation history.</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <span><strong>AI Limitations:</strong> Our emotion detection AI analyzes text for emotional patterns and our LLM produces empathetic responses. These are supportive tools—not diagnostic instruments.</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <span><strong>Professional Consultation Required:</strong> Please consult licensed mental health professionals for diagnosis, treatment planning, and ongoing therapeutic care.</span>
            </p>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>By continuing</strong>, you acknowledge that you have read, understood, and agree to these terms. You confirm that you understand this tool's limitations and will seek appropriate professional help for mental health concerns.
            </p>
          </div>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            I Understand & Accept Terms
          </button>
        </div>
      </div>
    );
  }

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center mb-6">
            <Heart className="w-16 h-16 text-purple-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Welcome to MindfulCompanion
          </h1>
          <p className="text-center text-gray-600 mb-6">
            How would you like to be addressed?
          </p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name (optional)..."
            className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none mb-4"
            onKeyPress={(e) => e.key === 'Enter' && setShowNameInput(false)}
          />
          <button
            onClick={() => setShowNameInput(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            {userName ? "Begin Session" : "Continue Anonymously"}
          </button>
        </div>
      </div>
    );
  }

  if (showDoctorDirectory) {
    const currentDirectory = doctorDirectory[selectedCountry];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Professional Directory</h2>
              <button onClick={() => setShowDoctorDirectory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 border-b pb-6">
              {Object.keys(doctorDirectory).map(country => (
                <button
                  key={country}
                  onClick={() => setSelectedCountry(country)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCountry === country ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>

            {currentDirectory.hotlines && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-purple-700 mb-4">Crisis Hotlines & Support</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentDirectory.hotlines.map((hotline, idx) => (
                    <div key={idx} className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex flex-col gap-2">
                      <p className="font-semibold text-red-800">{hotline.name}</p>
                      <a href={`tel:${hotline.phone}`} className="text-red-600 font-bold text-lg hover:underline">{hotline.phone}</a>
                      {hotline.available && <p className="text-xs text-gray-600">{hotline.available}</p>}
                      {hotline.website && (
                        <a href={hotline.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          Visit Website <Globe className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentDirectory.professionals && (
              <div>
                <h4 className="text-xl font-semibold text-purple-700 mb-4">Mental Health Professionals</h4>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentDirectory.professionals.map((prof, idx) => (
                    <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col gap-1">
                      <p className="font-bold text-gray-800">{prof.name}</p>
                      <p className="text-sm font-medium text-purple-700">{prof.specialty}</p>
                      <div className="mt-2 text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${prof.phone}`} className="hover:underline">{prof.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${prof.email}`} className="hover:underline">{prof.email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{prof.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showMoodTracker) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Emotional Journey</h2>
              <button onClick={() => setShowMoodTracker(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {moodHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No mood history yet. Start chatting to track your emotions.</p>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <button onClick={exportMoodData} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                    <div className="text-sm text-gray-600">
                      <div><strong>Total Entries:</strong> {moodHistory.length}</div>
                      <div className="text-xs text-gray-500">Dimensional view (valence/arousal) is available per entry.</div>
                    </div>
                  </div>
                  {moodHistory.slice().reverse().map((entry, idx) => (
                    <div key={idx} className="border-l-4 border-purple-400 pl-4 py-3 bg-gray-50 rounded-r-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(entry.emotion)}`}>
                          {entry.emotion} ({(entry.confidence * 100).toFixed(0)}%)
                        </span>
                        <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm mt-2 text-gray-700 italic">"{entry.message}..."</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Valence: {entry.valence?.toFixed(2)} • Arousal: {entry.arousal?.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  const questionnaires = {
    depression: {
        title: "Depression Screening",
        description: "Over the last 2 weeks, how often have you been bothered by any of the following problems? (This is based on the PHQ-9, a tool used by professionals.)",
        questions: ["Little interest or pleasure in doing things.","Feeling down, depressed, or hopeless.","Trouble falling or staying asleep, or sleeping too much.","Feeling tired or having little energy.","Poor appetite or overeating.","Feeling bad about yourself — or that you are a failure or have let yourself or your family down.","Trouble concentrating on things, such as reading the newspaper or watching television.","Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.","Thoughts that you would be better off dead, or of hurting yourself in some way.","How difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",],
        options: [{ text: "Not at all", value: 0 },{ text: "Several days", value: 1 },{ text: "More than half the days", value: 2 },{ text: "Nearly every day", value: 3 },],
        results: [{ score: 5, text: "Your score suggests minimal signs of depression. It's common to have off days. Continue monitoring your mood and practicing self-care." },{ score: 10, text: "Your score suggests mild signs of depression. While this may be manageable, it's a good idea to pay attention to your feelings and consider talking to someone if these symptoms persist." },{ score: 15, text: "Your score suggests moderate signs of depression. It would be very beneficial to discuss these feelings with a trusted person or a mental health professional. You don't have to manage this alone." },{ score: 20, text: "Your score suggests moderately severe signs of depression. It is strongly recommended that you seek support from a doctor or mental health professional to understand what you're experiencing." },{ score: 30, text: "Your score suggests severe signs of depression. It is very important to seek professional help as soon as possible. Please reach out to a doctor, counselor, or a crisis line." },]
    },
    anxiety: {
        title: "Anxiety Screening",
        description: "Over the last 2 weeks, how often have you been bothered by the following problems? (This is based on the GAD-7, a tool used by professionals.)",
        questions: ["Feeling nervous, anxious, or on edge.","Not being able to stop or control worrying.","Worrying too much about different things.","Trouble relaxing.","Being so restless that it is hard to sit still.","Becoming easily annoyed or irritable.","Feeling afraid as if something awful might happen.","Having physical symptoms like a racing heart, sweating, or trouble breathing when you feel worried.","Feeling a sense of dread or impending doom.","Finding it hard to stop your mind from racing with worries.",],
        options: [{ text: "Not at all", value: 0 },{ text: "Several days", value: 1 },{ text: "More than half the days", value: 2 },{ text: "Nearly every day", value: 3 },],
        results: [{ score: 5, text: "Your score suggests minimal signs of anxiety. These levels of worry are common and generally not a cause for concern." },{ score: 10, text: "Your score suggests mild signs of anxiety. It may be helpful to explore some relaxation techniques and monitor how you're feeling over the next few weeks." },{ score: 15, text: "Your score suggests moderate signs of anxiety. These feelings may be interfering with your daily life. It is advisable to talk with a doctor or mental health professional about what you are experiencing." },{ score: 30, text: "Your score suggests severe signs of anxiety. It is highly recommended that you seek professional support to manage these feelings and find effective coping strategies." },]
    },
    empathy: {
        title: "Empathy Check",
        description: "How well do you feel you understand and share the feelings of others? Answer the following questions honestly.",
        questions: ["I often think about how other people feel.","I find it easy to see things from someone else's perspective.","When a friend is upset, I can often feel their sadness or anxiety.","I am good at predicting how someone will feel about something.","I feel a sense of connection with characters in books or movies.","People have told me that I am a good listener.","I am often touched by things I see happening to others.","I can tell if someone is masking their true feelings.","I try to understand my friends better by imagining how things look from their perspective.","I am sensitive to the emotional needs of others."],
        options: [{ text: "Strongly Disagree", value: 0 },{ text: "Disagree", value: 1 },{ text: "Neutral", value: 2 },{ text: "Agree", value: 3 },{ text: "Strongly Agree", value: 4 },],
        results: [{ score: 15, text: "Your responses suggest you may find it challenging to connect with the emotional states of others. This is an area for potential growth. Practicing active listening can be a great first step." },{ score: 29, text: "You show a balanced level of empathy, sometimes connecting with others' feelings and sometimes focusing more on the practical side. This is a common and healthy balance." },{ score: 40, text: "Your responses indicate a high level of empathy. You are likely very attuned to the feelings of those around you, which is a great strength in building relationships. Remember to also take care of your own emotional energy." },]
    },
    // --- NEW: Stress Level Check ---
    stress: {
        title: "Stress Level Check",
        description: "In the last month, how often have you felt or thought a certain way? (This is based on the Perceived Stress Scale.)",
        questions: [
            "Been upset because of something that happened unexpectedly?",
            "Felt that you were unable to control the important things in your life?",
            "Felt nervous and 'stressed'?",
            "Felt confident about your ability to handle your personal problems?",
            "Felt that things were going your way?",
            "Found that you could not cope with all the things that you had to do?",
            "Been able to control irritations in your life?",
            "Felt that you were on top of things?",
            "Been angered because of things that were outside of your control?",
            "Felt difficulties were piling up so high that you could not overcome them?",
        ],
        options: [
            { text: "Never", value: 0 },
            { text: "Almost Never", value: 1 },
            { text: "Sometimes", value: 2 },
            { text: "Fairly Often", value: 3 },
            { text: "Very Often", value: 4 },
        ],
        // Note: Questions 4, 5, 7, 8 are positive and need to be reverse-scored.
        // The logic for this is added in the calculateResults function.
        reverseScoreIndexes: [3, 4, 6, 7], 
        results: [
            { score: 13, text: "Your score suggests a low level of perceived stress. It seems you feel a good sense of control and are coping well with life's demands." },
            { score: 26, text: "Your score suggests a moderate level of perceived stress. You may be facing some challenges and feeling overwhelmed at times. Exploring stress-management techniques could be very beneficial." },
            { score: 40, text: "Your score suggests a high level of perceived stress. You may be feeling that life is unpredictable and uncontrollable right now. It is highly recommended to speak with a professional to find healthy coping strategies." },
        ]
    },
    // --- NEW: Burnout Screening ---
    burnout: {
        title: "Burnout Screening",
        description: "These questions relate to your feelings about your work, studies, or primary daily responsibilities. Please answer honestly.",
        questions: [
            "I feel emotionally drained by my work/studies.",
            "I feel used up at the end of the day.",
            "I have become more cynical or negative about my work/studies.",
            "I doubt the significance or impact of my work.",
            "I feel less connected to the people I work or study with.",
            "I feel I am not achieving much in my role.",
            "I have trouble concentrating and being productive.",
            "I feel a lack of accomplishment from what I do.",
            "I feel overwhelmed by my responsibilities.",
            "I am not interested in my work/studies anymore.",
        ],
        options: [
            { text: "Strongly Disagree", value: 0 },
            { text: "Disagree", value: 1 },
            { text: "Neutral", value: 2 },
            { text: "Agree", value: 3 },
            { text: "Strongly Agree", value: 4 },
        ],
        results: [
            { score: 14, text: "Your score suggests a low risk of burnout. It appears you feel engaged and effective in your daily responsibilities." },
            { score: 29, text: "Your score suggests a moderate risk of burnout. You may be experiencing signs of emotional exhaustion or cynicism. It's important to prioritize rest, set boundaries, and reconnect with the meaningful aspects of your work." },
            { score: 40, text: "Your score suggests a high risk of burnout. You may be feeling exhausted, detached, and ineffective. It is strongly recommended to take time off if possible and speak with a manager, mentor, or professional about these feelings." },
        ]
    },
    // --- NEW: Sleep Quality Index ---
    sleep: {
        title: "Sleep Quality Index",
        description: "The following questions relate to your usual sleep habits during the past month only.",
        questions: [
            "Overall, how would you rate your sleep quality?",
            "How often have you had trouble falling asleep within 30 minutes?",
            "How often have you woken up in the middle of the night or early morning?",
            "How often have you had to get up to use the bathroom?",
            "How often have you had bad dreams?",
            "How often have you felt too hot or too cold while trying to sleep?",
            "How often have you taken medicine to help you sleep?",
            "How often have you felt tired or groggy upon waking up?",
            "How often have you had trouble staying awake during the day?",
            "How much has poor sleep been a problem for you?",
        ],
        options: [
            { text: "Not at all / Very Good", value: 0 },
            { text: "Less than once a week", value: 1 },
            { text: "Once or twice a week", value: 2 },
            { text: "Three or more times a week / Very Bad", value: 3 },
        ],
        results: [
            { score: 7, text: "Your score suggests good sleep quality. It seems your sleep habits are supporting your overall well-being." },
            { score: 14, text: "Your score suggests fair sleep quality. You may be experiencing some sleep disturbances that could be improved. Consider reviewing your sleep hygiene, such as your bedtime routine and environment." },
            { score: 30, text: "Your score suggests poor sleep quality. Sleep difficulties may be impacting your daily life. It is highly recommended to discuss your sleep patterns with a doctor to rule out any underlying issues." },
        ]
    },
};

// --- Replace your existing AssessmentsModal function with this updated one ---
function AssessmentsModal({ onClose }) {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);

    const handleAnswerChange = (qIndex, value) => {
        setAnswers(prev => ({ ...prev, [qIndex]: value }));
    };

    const calculateResults = () => {
        const quizData = questionnaires[activeQuiz];
        
        let totalScore = Object.entries(answers).reduce((sum, [qIndex, value]) => {
            // Check if this question needs reverse scoring
            if (quizData.reverseScoreIndexes?.includes(parseInt(qIndex))) {
                const maxScore = quizData.options.length - 1;
                return sum + (maxScore - value);
            }
            return sum + value;
        }, 0);

        let finalResult = quizData.results[quizData.results.length - 1]; // Default to the highest
        for (const result of quizData.results) {
            if (totalScore <= result.score) {
                finalResult = result;
                break;
            }
        }
        setResults({ score: totalScore, text: finalResult.text });
    };

    const resetQuiz = () => {
        setActiveQuiz(null);
        setAnswers({});
        setResults(null);
    };

    if (results) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
                    <h2 className="text-2xl font-bold mb-2">{questionnaires[activeQuiz].title} - Results</h2>
                    <p className="text-lg font-medium mb-4">Your Score: <span className="text-purple-600">{results.score}</span></p>
                    <p className="text-gray-700 mb-6">{results.text}</p>
                    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                        <p className="font-bold">Important Disclaimer</p>
                        <p className="text-sm">This is not a clinical diagnosis. This tool is for self-reflection only. Please consult a licensed mental health professional for an accurate assessment.</p>
                    </div>
                    <button onClick={resetQuiz} className="w-full mt-6 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all">
                        Back to Assessments
                    </button>
                </div>
            </div>
        );
    }
    
    if (activeQuiz) {
        const quizData = questionnaires[activeQuiz];
        const allQuestionsAnswered = Object.keys(answers).length === quizData.questions.length;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full h-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold">{quizData.title}</h2>
                            <p className="text-sm text-gray-600 mt-1">{quizData.description}</p>
                        </div>
                        <button onClick={resetQuiz} className="text-gray-500 hover:text-gray-800">&larr; Back</button>
                    </div>
                    <div className="space-y-6">
                        {quizData.questions.map((q, qIndex) => (
                            <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold mb-3">{qIndex + 1}. {q}</p>
                                <div className="flex flex-wrap gap-x-6 gap-y-2">
                                    {quizData.options.map((opt, optIndex) => (
                                        <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name={`question-${qIndex}`}
                                                value={opt.value}
                                                checked={answers[qIndex] === opt.value}
                                                onChange={() => handleAnswerChange(qIndex, opt.value)}
                                                className="form-radio text-purple-600 focus:ring-purple-500"
                                            />
                                            <span className="text-sm">{opt.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={calculateResults}
                        disabled={!allQuestionsAnswered}
                        className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Calculate My Results
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Self-Assessments</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5"/></button>
                </div>
                <p className="text-gray-600 mb-6">These tools are designed for self-reflection and are not a substitute for professional advice. Choose an area you'd like to explore.</p>
                <div className="space-y-3">
                    <button onClick={() => setActiveQuiz('depression')} className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <p className="font-bold text-purple-800">Depression Screening</p>
                        <p className="text-sm text-purple-700">Check for common signs of depression.</p>
                    </button>
                    <button onClick={() => setActiveQuiz('anxiety')} className="w-full text-left p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                        <p className="font-bold text-teal-800">Anxiety Screening</p>
                        <p className="text-sm text-teal-700">Explore feelings of worry and nervousness.</p>
                    </button>
                    <button onClick={() => setActiveQuiz('stress')} className="w-full text-left p-4 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors">
                        <p className="font-bold text-amber-800">Stress Level Check</p>
                        <p className="text-sm text-amber-700">Measure how overwhelming you feel life is right now.</p>
                    </button>
                    <button onClick={() => setActiveQuiz('burnout')} className="w-full text-left p-4 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">
                        <p className="font-bold text-rose-800">Burnout Screening</p>
                        <p className="text-sm text-rose-700">Check for signs of emotional and physical exhaustion.</p>
                    </button>
                    <button onClick={() => setActiveQuiz('sleep')} className="w-full text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                        <p className="font-bold text-indigo-800">Sleep Quality Index</p>
                        <p className="text-sm text-indigo-700">Assess how well your sleep is supporting your health.</p>
                    </button>
                    <button onClick={() => setActiveQuiz('empathy')} className="w-full text-left p-4 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors">
                        <p className="font-bold text-sky-800">Empathy Check</p>
                        <p className="text-sm text-sky-700">Understand how you connect with others' feelings.</p>
                    </button>
                </div>
            </div>
        </div>
    );
  }
  const rootCauseData = {
  family: {
    title: "Family Relationships",
    questions: [
      "I feel supported and understood by my family.",
      "Communication with my family is generally positive and healthy.",
      "I feel I can be my authentic self around my family.",
    ],
  },
  partner: {
    title: "Romantic Relationships",
    questions: [
      "My relationship with my partner feels balanced and fulfilling.",
      "I feel safe, respected, and emotionally connected in my romantic relationship.",
      "We handle conflicts in our relationship constructively.",
    ],
  },
  career: {
    title: "Career & Work Life",
    questions: [
      "I find my work meaningful and engaging.",
      "My work environment is healthy, supportive, and respects my boundaries.",
      "I feel a sense of progress and growth in my career.",
    ],
  },
  academics: {
    title: "Academics & Studies",
    questions: [
      "I am coping well with my academic workload and stress.",
      "I feel confident and capable in my academic abilities.",
      "My academic path feels aligned with my personal goals.",
    ],
  },
  friends: {
    title: "Friendships & Social Life",
    questions: [
      "I feel a strong sense of belonging with my friends.",
      "I can rely on my friends when I need support.",
      "I am satisfied with the quality and quantity of my social interactions.",
    ],
  },
  personalHealth: {
    title: "Personal Health & Self-Care",
    questions: [
      "I am making enough time for rest, relaxation, and hobbies.",
      "I am happy with my physical health and energy levels.",
      "I actively practice self-compassion and manage my inner critic.",
    ],
  },
};

function RootCauseAnalysisModal({ onClose }) {
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);

  useEffect(() => {
    const allQuestions = Object.entries(rootCauseData).flatMap(([category, data]) =>
      data.questions.map(questionText => ({ text: questionText, category }))
    );
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    setShuffledQuestions(allQuestions);
  }, []);

  const handleAnswerChange = (qIndex, value) =>
    setAnswers(prev => ({ ...prev, [qIndex]: value }));

  const calculateResults = () => {
    const categoryScores = {};
    for (const key in rootCauseData)
      categoryScores[key] = { total: 0, count: 0 };

    Object.entries(answers).forEach(([qIndex, score]) => {
      const question = shuffledQuestions[qIndex];
      if (question) {
        categoryScores[question.category].total += score;
        categoryScores[question.category].count += 1;
      }
    });

    const finalAverages = Object.entries(categoryScores).map(([category, data]) => ({
      category: rootCauseData[category].title,
      score: data.count > 0 ? (data.total / data.count).toFixed(1) : "N/A",
    }));

    const primaryArea = finalAverages.reduce(
      (min, current) =>
        current.score !== "N/A" && parseFloat(current.score) < parseFloat(min.score)
          ? current
          : min,
      { score: 11 }
    );

    setResults({ primaryArea, allScores: finalAverages });
  };

  const allQuestionsAnswered = Object.keys(answers).length === shuffledQuestions.length;
  const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  if (results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
          <div className="mb-6">
            <p className="font-semibold text-lg">Primary Area for Focus:</p>
            <div className="mt-2 p-4 bg-purple-100 border border-purple-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-800">{results.primaryArea.category}</p>
              <p className="text-sm text-purple-700">This area received the lowest average satisfaction score, suggesting it may be a significant source of distress.</p>
            </div>
          </div>
          <div>
            <p className="font-semibold text-lg mb-3">All Category Scores:</p>
            <div className="space-y-2">
              {results.allScores.map(({ category, score }) => (
                <div key={category} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                  <span className="font-medium text-gray-800">{category}</span>
                  <span className="font-bold text-lg text-gray-700">{score} / 10</span>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-full mt-8 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl w-full h-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">Root Cause Analysis</h2>
            <p className="text-sm text-gray-600 mt-1">Rate your satisfaction in different areas of your life from 1 (Very Dissatisfied) to 10 (Very Satisfied).</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Close</button>
        </div>
        <div className="space-y-4">
          {shuffledQuestions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold mb-3">{qIndex + 1}. {q.text}</p>
              <div className="flex flex-wrap gap-2 items-center">
                {ratingOptions.map(value => (
                  <label key={value} className="cursor-pointer">
                    <input type="radio" name={`question-${qIndex}`} value={value} checked={answers[qIndex] === value} onChange={() => handleAnswerChange(qIndex, value)} className="sr-only" />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${answers[qIndex] === value ? "bg-purple-600 border-purple-600 text-white" : "bg-white border-gray-300 hover:border-purple-400"}`}>{value}</div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button onClick={calculateResults} disabled={!allQuestionsAnswered} className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Analyze My Results</button>
      </div>
    </div>
  );
}

  if (showAssessments) {
    return <AssessmentsModal onClose={() => setShowAssessments(false)} />;
  }
  if (showRootCauseAnalysis) {
  return <RootCauseAnalysisModal onClose={() => setShowRootCauseAnalysis(false)} />;
}

  // -------------------------
  // Main Chat UI (default)
  // -------------------------
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Heart className="w-8 h-8 text-purple-600" />
           <div>
             <div className="flex items-center gap-2">
               <h1 className="text-xl font-bold">MindfulCompanion</h1>
               {backendConnected && (
                 <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                   Real AI
                 </span>
               )}
             </div>
             <p className="text-xs text-gray-500">AI Emotional Support</p>
           </div>
         </div>

         <div className="flex items-center gap-2">
           <div className="flex items-center gap-2">
             <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-2">
               <Mic className="w-3 h-3" />
               <span>Voice</span>
             </div>
             <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-2">
               <BarChart2 className="w-3 h-3" />
               <span>Dimensional</span>
             </div>
             <div className={`px-2 py-1 rounded-full text-xs ${biometrics.connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700' } flex items-center gap-2`}>
               <span>Biometrics</span>
             </div>
           </div>

           {detectedEmotions.primary && detectedEmotions.emotions && detectedEmotions.emotions.length > 0 && (
             <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEmotionColor(detectedEmotions.primary)}`}>
               {detectedEmotions.primary} ({(detectedEmotions.emotions[0].confidence * 100).toFixed(0)}%)
             </div>
           )}
           <button onClick={() => setShowMoodTracker(true)} className="p-2 hover:bg-gray-100 rounded-lg">
             <TrendingUp className="w-6 h-6 text-purple-600" />
           </button>
           <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-lg">
             {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>
      </div>

      {showMenu && (
        <div className="absolute top-20 right-4 bg-white rounded-xl shadow-2xl p-4 z-10 w-80">
          <div className="space-y-2">
            <button onClick={() => { setShowDoctorDirectory(true); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>Professional Directory</span>
            </button>
            <button onClick={() => { setShowMoodTracker(true); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>View Emotional Journey</span>
            </button>
            <button onClick={() => { setShowAssessments(true); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
                <BrainCircuit className="w-5 h-5" />
                <span>Self-Assessments</span>
            </button>
            <button onClick={() => { setShowRootCauseAnalysis(true); setShowMenu(false); }}className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span>Root Cause Analysis</span>
            </button>
            <button onClick={() => { setShowCapabilities(true); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span>System Capabilities</span>
            </button>
            <button onClick={() => { exportMoodData(); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Export Data</span>
            </button>
            <button onClick={() => { setShowDisclaimer(true); setShowMenu(false); }} className="w-full text-left p-3 hover:bg-purple-50 rounded-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>View Disclaimer</span>
            </button>
            <button onClick={() => {
              if (window.confirm('Are you sure you want to clear all data? This will erase your server history if you have a username.')) {
                localStorage.removeItem('mh-userName');
                setMessages([]);
                setMoodHistory([]);
                setDetectedEmotions({});
                setUserName('');
                setShowNameInput(true);
                setShowMenu(false);
              }
            }} className="w-full text-left p-3 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <X className="w-5 h-5" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart className="w-16 h-16 text-purple-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {userName ? `Welcome, ${userName}` : 'Welcome'}
            </h2>
            <p className="text-gray-500 max-w-md">
              Share your thoughts and feelings openly. This is a safe, confidential space.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                : msg.type === 'crisis'
                  ? 'bg-red-50 border-2 border-red-300'
                  : msg.type === 'insight'
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : 'bg-white'} rounded-2xl p-4 shadow-md`}>

              {msg.role === 'assistant' && msg.type === 'insight' && (
                <div className="flex items-center gap-2 mb-3 text-blue-600 font-semibold">
                  <BarChart2 className="w-5 h-5" />
                  <span>A Gentle Observation</span>
                </div>
              )}

              {msg.role === 'assistant' && msg.type === 'crisis' && (
                <div className="flex items-center gap-2 mb-3 text-red-600 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  <span>URGENT: Professional Support Required</span>
                </div>
              )}

              <p className="whitespace-pre-line">{msg.content}</p>

              {msg.emotionData?.emotions && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Emotional Analysis:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.emotionData.emotions.slice(0, 3).map((em, i) => (
                      <div key={i} className={`px-2 py-1 rounded-lg text-xs ${getEmotionColor(em.emotion)}`}>
                        {em.emotion} ({(em.confidence * 100).toFixed(0)}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg.emotionData?.valence !== undefined && msg.emotionData?.arousal !== undefined && (
                <EmotionGraph valence={msg.emotionData.valence} arousal={msg.emotionData.arousal} />
              )}

              {msg.interactiveSuggestions?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Therapeutic Techniques:</p>
                  <div className="space-y-2">
                    {msg.interactiveSuggestions.map((suggestion, i) => (
                      <div key={i} className="border border-purple-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setExpandedSuggestion(expandedSuggestion === `${idx}-${i}` ? null : `${idx}-${i}`)}
                          className="w-full text-left p-3 hover:bg-purple-50 transition-colors flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2 text-sm font-medium">
                            <span>{suggestion.details.icon}</span>
                            {suggestion.name}
                          </span>
                          {expandedSuggestion === `${idx}-${i}` ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        {expandedSuggestion === `${idx}-${i}` && (
                          <div className="p-4 bg-purple-50 border-t border-purple-200">
                            <p className="text-sm text-gray-700 mb-3">{suggestion.details.description}</p>
                            <div className="space-y-1 mb-3">
                              {suggestion.details.steps.map((step, stepIdx) => (
                                <p key={stepIdx} className="text-xs text-gray-600">{step}</p>
                              ))}
                            </div>
                            <p className="text-xs text-gray-600"><strong>Duration:</strong> {suggestion.details.duration}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Helpful?</span>
                  <button onClick={() => handleFeedback(idx, true)} className={`p-1 rounded ${msg.feedback === 'positive' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleFeedback(idx, false)} className={`p-1 rounded ${msg.feedback === 'negative' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}>
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-4 border-t">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Share how you're feeling..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full p-3 border-2 border-gray-100 rounded-xl focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={() => { if (hasRecognitionSupport) { isListening ? stopListening() : startListening(); } }} className="p-3 rounded-lg hover:bg-gray-100">
                <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-600'}`} />
              </button>
              <button onClick={handleSend} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700">
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div>
                {isTyping ? 'AI is composing...' : `Connected: ${backendConnected ? 'Yes' : 'No'}`}
                {isCheckingBackend && ' (checking...)'}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-400">Valence: {detectedEmotions.valence?.toFixed?.(2) ?? '—'}</div>
                <div className="text-xs text-gray-400">Arousal: {detectedEmotions.arousal?.toFixed?.(2) ?? '—'}</div>
                <div className="text-xs text-gray-400">Biometrics: {biometrics.connected ? 'Live' : 'Not connected'}</div>
              </div>
            </div>
          </div>

          <div className="w-44 flex flex-col items-end gap-2">
            <button onClick={() => setShowMoodTracker(true)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Mood History</button>
            <button onClick={() => setShowCapabilities(true)} className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm flex items-center gap-2">
              <Info className="w-3 h-3" /> Capabilities
            </button>
          </div>
        </div>
      </div>

      {/* System Capabilities Modal */}
      {showCapabilities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">System Capabilities</h3>
                <p className="text-sm text-gray-600 mt-1">How MindfulCompanion observes and supports you.</p>
              </div>
              <button onClick={() => setShowCapabilities(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Multimodal</h4>
                    <p className="text-xs text-gray-600 mt-1">Text + Voice (tone, pace) + Biometrics (HRV, GSR)</p>
                  </div>
                  <div className="text-xs text-gray-500">{biometrics.connected ? 'Biometrics connected' : 'Biometrics not connected'}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <h4 className="font-semibold">Dimensional & Mixed</h4>
                <p className="text-xs text-gray-600 mt-1">Provides Valence & Arousal scores and can identify multiple emotions simultaneously.</p>
              </div>

              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <h4 className="font-semibold">Contextual & Longitudinal</h4>
                <p className="text-xs text-gray-600 mt-1">Remembers history and observes trends over time to better understand your emotional patterns.</p>
              </div>

              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <h4 className="font-semibold">Adaptive Baseline</h4>
                <p className="text-xs text-gray-600 mt-1">Learns each user's unique emotional "normal" to surface meaningful deviations (adapts over usage).</p>
              </div>

              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <h4 className="font-semibold">Proactive & Predictive</h4>
                <p className="text-xs text-gray-600 mt-1">Identifies negative trends and offers earlier support or suggestions before distress escalates.</p>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                Note: Some capabilities (biometrics & adaptive baseline) require additional device integrations or data permissions to operate fully. This UI surfaces placeholders and the app logic to support them—connect your biometric provider and enable permissions to activate live data streams.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCapabilities(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
