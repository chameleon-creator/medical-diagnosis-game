import React, { useState, useEffect } from 'react';
import { Heart, Star, Zap, Trophy, AlertTriangle, Clock } from 'lucide-react';

const MedicalDiagnosisGame = () => {
  const [gameState, setGameState] = useState('menu');
  const [currentCase, setCurrentCase] = useState(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [unlockedMinigames, setUnlockedMinigames] = useState([]);
  const [minigameState, setMinigameState] = useState(null);
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [emergencyTimer, setEmergencyTimer] = useState(15);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = (frequency, duration, type = 'sine') => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const playCorrectSound = () => {
    playSound(523.25, 0.1);
    setTimeout(() => playSound(659.25, 0.1), 100);
    setTimeout(() => playSound(783.99, 0.2), 200);
  };

  const playWrongSound = () => {
    playSound(200, 0.3, 'sawtooth');
  };

  const playClickSound = () => {
    playSound(400, 0.05);
  };

  const playEmergencySound = () => {
    playSound(800, 0.2, 'square');
    setTimeout(() => playSound(800, 0.2, 'square'), 300);
  };

  const playVictorySound = () => {
    const notes = [523.25, 587.33, 659.25, 783.99];
    notes.forEach((note, i) => {
      setTimeout(() => playSound(note, 0.2), i * 150);
    });
  };

  const storyCases = [
    {
      id: 1,
      character: "👧",
      name: "Mia, Age 8",
      story: "Mia was playing at the park when she started feeling sick",
      background: "bg-gradient-to-br from-pink-300 to-rose-300",
      symptoms: ["Fever 🌡️", "Sore throat 😣", "White spots", "Swollen glands"],
      correctDiagnosis: "Strep Throat",
      options: ["Common Cold", "Strep Throat", "Allergies", "Flu"],
      unlocks: "memory",
      explanation: "Great job! Strep throat needs antibiotics!",
      coins: 50
    },
    {
      id: 2,
      character: "👦",
      name: "Jake, Age 12",
      story: "Jake was skateboarding when he felt dizzy",
      background: "bg-gradient-to-br from-blue-300 to-cyan-300",
      symptoms: ["Dizzy 😵", "Hungry", "Shaky 🤝", "Weak"],
      correctDiagnosis: "Low Blood Sugar",
      options: ["Concussion", "Low Blood Sugar", "Dehydration", "Heat Stroke"],
      unlocks: "emergency",
      explanation: "Perfect! He needs juice fast! 🚨 EMERGENCY MODE UNLOCKED!",
      coins: 50
    },
    {
      id: 3,
      character: "👩",
      name: "Maria, Age 28",
      story: "Maria woke up with terrible stomach pain",
      background: "bg-gradient-to-br from-orange-300 to-amber-300",
      symptoms: ["Right belly pain 🤕", "Nausea 🤢", "Fever", "Pain when moving"],
      correctDiagnosis: "Appendicitis",
      options: ["Food Poisoning", "Appendicitis", "Stomach Flu", "Gas"],
      unlocks: null,
      explanation: "Correct! Appendicitis needs surgery quickly!",
      coins: 75
    },
    {
      id: 4,
      character: "🧑",
      name: "Alex, Age 16",
      story: "Alex was studying when their head started pounding",
      background: "bg-gradient-to-br from-purple-300 to-pink-300",
      symptoms: ["Bad headache 🤕", "Light hurts 💡", "Nausea 🤢", "Throbbing"],
      correctDiagnosis: "Migraine",
      options: ["Migraine", "Tired", "Eye Strain", "Stress"],
      unlocks: null,
      explanation: "Excellent! Migraines need rest in dark room!",
      coins: 50
    },
    {
      id: 5,
      character: "👴",
      name: "Mr. Johnson, Age 65",
      story: "Mr. Johnson felt crushing chest pain while gardening",
      background: "bg-gradient-to-br from-red-300 to-orange-300",
      symptoms: ["Chest pain 💔", "Arm numb", "Can't breathe 😰", "Sweating 💦"],
      correctDiagnosis: "Heart Attack",
      options: ["Panic Attack", "Heart Attack", "Heartburn", "Muscle Pain"],
      unlocks: null,
      explanation: "CRITICAL! You saved his life by recognizing it!",
      coins: 100
    },
    {
      id: 6,
      character: "👶",
      name: "Baby Emma, 18 months",
      story: "Emma's parents are worried - she has a high fever and rash",
      background: "bg-gradient-to-br from-pink-400 to-purple-400",
      symptoms: ["Very high fever 🌡️", "Purple rash 🔴", "Stiff neck", "Won't stop crying 😭"],
      correctDiagnosis: "Meningitis",
      options: ["Teething", "Meningitis", "Diaper Rash", "Common Cold"],
      unlocks: null,
      explanation: "URGENT! Meningitis is serious - needs immediate treatment!",
      coins: 120
    },
    {
      id: 7,
      character: "🧔",
      name: "David, Age 35",
      story: "David twisted his ankle playing basketball",
      background: "bg-gradient-to-br from-blue-400 to-indigo-400",
      symptoms: ["Ankle swollen 🦶", "Can't walk", "Bruising 💙", "Very painful"],
      correctDiagnosis: "Sprained Ankle",
      options: ["Broken Bone", "Sprained Ankle", "Muscle Cramp", "Nothing Serious"],
      unlocks: null,
      explanation: "Right! RICE treatment: Rest, Ice, Compression, Elevation!",
      coins: 40
    },
    {
      id: 8,
      character: "👵",
      name: "Mrs. Chen, Age 70",
      story: "Mrs. Chen suddenly can't speak properly and her face looks droopy",
      background: "bg-gradient-to-br from-red-400 to-pink-400",
      symptoms: ["Face drooping 😔", "Slurred speech", "Arm weakness", "Confused 😵"],
      correctDiagnosis: "Stroke - Call 911",
      options: ["Tired", "Stroke - Call 911", "Migraine", "Dizzy Spell"],
      unlocks: null,
      explanation: "EXCELLENT! Fast action = Fast treatment = Brain saved!",
      coins: 150
    },
    {
      id: 9,
      character: "🐱",
      name: "Whiskers (Pet Cat)",
      story: "Whiskers ate something and now seems really sick",
      background: "bg-gradient-to-br from-yellow-300 to-lime-300",
      symptoms: ["Vomiting 🤮", "Won't eat 🍽️", "Hiding 🙈", "Weak and tired"],
      correctDiagnosis: "Poisoning",
      options: ["Hairball", "Poisoning", "Just Sleepy", "Needs Food"],
      unlocks: null,
      explanation: "Correct! Pets can eat toxic things - needs vet NOW!",
      coins: 65
    },
    {
      id: 10,
      character: "🐶",
      name: "Max (Service Dog)",
      story: "Max the service dog isn't acting like himself",
      background: "bg-gradient-to-br from-green-300 to-emerald-300",
      symptoms: ["Won't eat 🍖", "Limping 🦴", "Whining 😢", "Licking paw"],
      correctDiagnosis: "Injured Paw",
      options: ["Tired", "Injured Paw", "Needs Walk", "Hungry"],
      unlocks: null,
      explanation: "Great work! Even furry friends need care!",
      coins: 60
    },
    {
      id: 11,
      character: "👧",
      name: "Sophie, Age 5",
      story: "Sophie has been coughing non-stop and wheezing",
      background: "bg-gradient-to-br from-cyan-300 to-blue-400",
      symptoms: ["Wheezing 😮‍💨", "Can't breathe well", "Chest tight", "Coughing fits"],
      correctDiagnosis: "Asthma Attack",
      options: ["Common Cold", "Asthma Attack", "Allergies", "Bronchitis"],
      unlocks: null,
      explanation: "Perfect! She needs her inhaler right away!",
      coins: 80
    },
    {
      id: 12,
      character: "🧑‍🦱",
      name: "Jordan, Age 22",
      story: "Jordan got stung by a bee and feels weird",
      background: "bg-gradient-to-br from-yellow-400 to-orange-400",
      symptoms: ["Throat swelling 😰", "Hives everywhere", "Hard to breathe", "Dizzy"],
      correctDiagnosis: "Allergic Reaction",
      options: ["Normal Bee Sting", "Allergic Reaction", "Panic Attack", "Infection"],
      unlocks: null,
      explanation: "YES! Severe allergies need EpiPen and 911!",
      coins: 90
    }
  ];

  const emergencyCases = [
    {
      id: 'e1',
      character: "🚨",
      name: "EMERGENCY ALERT!",
      story: "A patient just arrived in critical condition!",
      background: "bg-gradient-to-br from-red-500 to-orange-500 animate-pulse",
      symptoms: ["Choking 😱", "Can't breathe", "Turning blue 💙", "Pointing at throat"],
      correctDiagnosis: "Choking - Heimlich",
      options: ["Give Water", "Choking - Heimlich", "CPR", "Wait"],
      explanation: "YES! Quick action saved their life!",
      coins: 150
    },
    {
      id: 'e2',
      character: "🚨",
      name: "EMERGENCY ALERT!",
      story: "Someone collapsed suddenly!",
      background: "bg-gradient-to-br from-red-500 to-pink-500 animate-pulse",
      symptoms: ["Not breathing 💨", "No pulse", "Unconscious 😵", "Fell down"],
      correctDiagnosis: "CPR Needed",
      options: ["Shake them", "CPR Needed", "Give water", "Let them rest"],
      explanation: "PERFECT! You know how to save lives!",
      coins: 150
    },
    {
      id: 'e3',
      character: "🚨",
      name: "EMERGENCY ALERT!",
      story: "Child has severe allergic reaction!",
      background: "bg-gradient-to-br from-red-500 to-yellow-500 animate-pulse",
      symptoms: ["Throat swelling 😰", "Hives everywhere", "Can't breathe", "Ate peanuts"],
      correctDiagnosis: "EpiPen + 911",
      options: ["Benadryl only", "EpiPen + 911", "Ice pack", "Wait it out"],
      explanation: "EXCELLENT! Fast action prevents tragedy!",
      coins: 150
    }
  ];

  const memoryPairs = [
    { id: 1, symbol: "🩺" },
    { id: 2, symbol: "💊" },
    { id: 3, symbol: "🌡️" },
    { id: 4, symbol: "💉" },
    { id: 5, symbol: "🏥" },
    { id: 6, symbol: "❤️" }
  ];

  useEffect(() => {
    if (emergencyActive && emergencyTimer > 0) {
      const timer = setInterval(() => {
        setEmergencyTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (emergencyTimer === 0 && emergencyActive) {
      handleEmergencyTimeout();
    }
  }, [emergencyActive, emergencyTimer]);

  useEffect(() => {
    if (gameState === 'playing' && !emergencyActive && Math.random() < 0.3 && level > 1) {
      const timer = setTimeout(() => {
        triggerEmergency();
      }, Math.random() * 15000 + 10000);
      return () => clearTimeout(timer);
    }
  }, [level, gameState, emergencyActive]);

  const triggerEmergency = () => {
    if (emergencyActive || !unlockedMinigames.includes('emergency')) return;
    
    playEmergencySound();
    const randomEmergency = emergencyCases[Math.floor(Math.random() * emergencyCases.length)];
    setCurrentCase(randomEmergency);
    setEmergencyActive(true);
    setEmergencyTimer(15);
    setSelectedAnswer(null);
    setFeedback('');
  };

  const handleEmergencyTimeout = () => {
    setHearts(hearts - 2);
    setEmergencyActive(false);
    setFeedback('timeout');
    playWrongSound();
    
    if (hearts - 2 <= 0) {
      setTimeout(() => setGameState('gameover'), 2000);
    } else {
      setTimeout(() => {
        loadNextCase();
      }, 2000);
    }
  };

  const startGame = () => {
    playClickSound();
    setScore(0);
    setHearts(5);
    setStreak(0);
    setLevel(1);
    setFeedback('');
    setSelectedAnswer(null);
    setEmergencyActive(false);
    loadNextCase();
    setGameState('playing');
  };

  const loadNextCase = () => {
    const caseIndex = level - 1;
    if (caseIndex < storyCases.length) {
      setCurrentCase(storyCases[caseIndex]);
      setSelectedAnswer(null);
      setFeedback('');
      setEmergencyActive(false);
    } else {
      playVictorySound();
      setGameState('victory');
    }
  };

  const handleDiagnosis = (diagnosis) => {
    playClickSound();
    setSelectedAnswer(diagnosis);
    
    if (diagnosis === currentCase.correctDiagnosis) {
      playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const basePoints = emergencyActive ? 200 : 100;
      const points = basePoints * newStreak;
      setScore(score + points);
      setCoins(coins + currentCase.coins);
      setFeedback('correct');
      
      if (currentCase.unlocks && !unlockedMinigames.includes(currentCase.unlocks)) {
        setUnlockedMinigames([...unlockedMinigames, currentCase.unlocks]);
      }
      
      if (emergencyActive) {
        setEmergencyActive(false);
      }
    } else {
      playWrongSound();
      const lostHearts = emergencyActive ? 2 : 1;
      setHearts(hearts - lostHearts);
      setStreak(0);
      setFeedback('incorrect');
      
      if (hearts - lostHearts <= 0) {
        setTimeout(() => setGameState('gameover'), 2000);
      }
      
      if (emergencyActive) {
        setEmergencyActive(false);
      }
    }
  };

  const nextCase = () => {
    playClickSound();
    if (hearts > 0 && feedback === 'correct' && !emergencyActive) {
      setLevel(level + 1);
      loadNextCase();
    } else if (hearts > 0 && emergencyActive) {
      setEmergencyActive(false);
      loadNextCase();
    }
  };

  const startMemoryGame = () => {
    playClickSound();
    const shuffled = [...memoryPairs, ...memoryPairs]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, uniqueId: index }));
    setMemoryCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMinigameState('memory');
  };

  const flipCard = (uniqueId) => {
    if (flippedCards.length === 2 || flippedCards.includes(uniqueId) || matchedPairs.includes(uniqueId)) return;
    
    playClickSound();
    const newFlipped = [...flippedCards, uniqueId];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      const first = newFlipped[0];
      const second = newFlipped[1];
      const firstCard = memoryCards.find(c => c.uniqueId === first);
      const secondCard = memoryCards.find(c => c.uniqueId === second);
      
      if (firstCard.id === secondCard.id) {
        playCorrectSound();
        setMatchedPairs([...matchedPairs, first, second]);
        setFlippedCards([]);
        setCoins(coins + 10);
        
        if (matchedPairs.length + 2 === memoryCards.length) {
          playVictorySound();
          setTimeout(() => {
            setCoins(coins + 50);
            setMinigameState(null);
            setGameState('menu');
          }, 1000);
        }
      } else {
        playWrongSound();
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-8 border-blue-400">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4 animate-bounce">🏥</div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Doctor Adventure
            </h1>
            <p className="text-blue-600 text-2xl font-bold">Save lives with sound effects! 🔊</p>
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`px-6 py-3 rounded-full font-bold text-lg ${
                soundEnabled 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-400 text-white'
              }`}
            >
              {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={startGame}
              className="bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white p-8 rounded-2xl transform hover:scale-105 transition-all shadow-xl"
            >
              <div className="text-6xl mb-3">📖</div>
              <h3 className="text-3xl font-bold mb-2">Story Mode</h3>
              <p className="text-lg">Help patients!</p>
              <p className="text-sm mt-2">⚡ Random emergencies!</p>
            </button>

            <button
              onClick={() => {
                playClickSound();
                setGameState('minigames');
              }}
              className="bg-gradient-to-br from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white p-8 rounded-2xl transform hover:scale-105 transition-all shadow-xl"
            >
              <div className="text-6xl mb-3">🎮</div>
              <h3 className="text-3xl font-bold mb-2">Mini-Games</h3>
              <p className="text-lg">Play side quests!</p>
              <div className="text-sm mt-2">Unlocked: {unlockedMinigames.length}</div>
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-4 border-yellow-400">
            <div className="flex items-center justify-center gap-4 text-2xl font-bold text-orange-700">
              <span>💰 {coins}</span>
              <span>🏆 Level {level}</span>
            </div>
          </div>

          {unlockedMinigames.includes('emergency') && (
            <div className="mt-6 bg-red-100 border-4 border-red-400 p-4 rounded-2xl text-center">
              <p className="text-red-700 font-bold text-lg">🚨 EMERGENCY MODE ACTIVE! 🚨</p>
              <p className="text-red-600 text-sm">Random emergencies can happen during gameplay!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'minigames') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full border-8 border-purple-400">
          <h1 className="text-5xl font-bold text-center mb-8 text-purple-700">🎮 Mini-Games Zone</h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <button
              onClick={startMemoryGame}
              disabled={!unlockedMinigames.includes('memory')}
              className={`p-6 rounded-2xl transform hover:scale-105 transition-all ${
                unlockedMinigames.includes('memory')
                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <div className="text-6xl mb-3">🧠</div>
              <h3 className="text-2xl font-bold">Memory Match</h3>
              <p>Match medical tools!</p>
              <p className="text-sm mt-2">💰 Earn coins!</p>
              {!unlockedMinigames.includes('memory') && <p className="text-sm mt-2">🔒 Beat Level 1</p>}
            </button>

            <div className={`p-6 rounded-2xl ${
              unlockedMinigames.includes('emergency')
                ? 'bg-gradient-to-br from-red-400 to-orange-500 text-white'
                : 'bg-gray-300 text-gray-500'
            }`}>
              <div className="text-6xl mb-3">🚨</div>
              <h3 className="text-2xl font-bold">Emergency Mode</h3>
              <p>Random emergencies in story!</p>
              <p className="text-sm mt-2">⏱️ 15 seconds to decide!</p>
              {!unlockedMinigames.includes('emergency') && <p className="text-sm mt-2">🔒 Beat Level 3</p>}
              {unlockedMinigames.includes('emergency') && <p className="text-sm mt-2">✅ ACTIVE!</p>}
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setGameState('menu');
            }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-xl"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (minigameState === 'memory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-300 to-emerald-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
          <h2 className="text-4xl font-bold text-center mb-6 text-green-700">🧠 Memory Match</h2>
          <p className="text-center mb-6 text-lg">Match pairs to win! 💰 +10 coins per match</p>
          
          <div className="grid grid-cols-4 gap-4 mb-6">
            {memoryCards.map(card => (
              <button
                key={card.uniqueId}
                onClick={() => flipCard(card.uniqueId)}
                className={`aspect-square rounded-xl text-6xl flex items-center justify-center transition-all ${
                  flippedCards.includes(card.uniqueId) || matchedPairs.includes(card.uniqueId)
                    ? 'bg-green-400 scale-105'
                    : 'bg-green-200 hover:bg-green-300'
                } border-4 border-green-500`}
              >
                {flippedCards.includes(card.uniqueId) || matchedPairs.includes(card.uniqueId) ? card.symbol : '❓'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              playClickSound();
              setMinigameState(null);
              setGameState('menu');
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl"
          >
            Exit Game
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && currentCase) {
    return (
      <div className={`min-h-screen ${currentCase.background} p-4 py-8 relative`}>
        {emergencyActive && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-red-600 text-white px-8 py-4 rounded-full border-4 border-yellow-400 shadow-2xl">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 animate-pulse" />
                <div>
                  <p className="font-bold text-2xl">🚨 EMERGENCY! 🚨</p>
                  <p className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {emergencyTimer} seconds left!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className={`bg-white rounded-3xl shadow-2xl p-8 ${emergencyActive ? 'border-8 border-red-500 animate-pulse' : ''}`}>
            
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full">
                {[...Array(5)].map((_, i) => (
                  <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
                ))}
              </div>
              
              <div className="flex gap-3">
                <div className="bg-yellow-100 px-4 py-2 rounded-full">
                  <span className="font-bold text-yellow-700">💰 {coins}</span>
                </div>
                <div className="bg-purple-100 px-4 py-2 rounded-full">
                  <span className="font-bold text-purple-700">Level {level}</span>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-full">
                  <span className="font-bold text-blue-700">Score: {score}</span>
                </div>
              </div>
            </div>

            {streak > 0 && (
              <div className="mb-4 text-center">
                <div className="inline-block bg-orange-500 text-white px-6 py-2 rounded-full font-bold animate-pulse">
                  🔥 {streak} Streak! x{streak} Points!
                </div>
              </div>
            )}

            <div className={`p-6 rounded-2xl mb-6 ${emergencyActive ? 'bg-red-50 border-4 border-red-400' : 'bg-blue-50'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-7xl">{currentCase.character}</div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{currentCase.name}</h2>
                  <p className="text-gray-600 font-semibold">{currentCase.story}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl">
                <p className="font-bold text-blue-900 mb-2">Symptoms:</p>
                <div className="grid grid-cols-2 gap-2">
                  {currentCase.symptoms.map((symptom, i) => (
                    <div key={i} className={`p-2 rounded text-sm font-semibold ${
                      emergencyActive ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {symptom}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold text-center mb-4">
                {emergencyActive ? '⚡ QUICK! What do you do? ⚡' : '🩺 Your Diagnosis?'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {currentCase.options.map(option => (
                  <button
                    key={option}
                    onClick={() => !selectedAnswer && handleDiagnosis(option)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                      selectedAnswer === option
                        ? option === currentCase.correctDiagnosis
                          ? 'bg-green-500 text-white border-4 border-green-700'
                          : 'bg-red-500 text-white border-4 border-red-700'
                        : selectedAnswer && option === currentCase.correctDiagnosis
                        ? 'bg-green-300 border-4 border-green-600'
                        : emergencyActive
                        ? 'bg-red-100 hover:bg-red-200 border-4 border-red-400'
                        : 'bg-gray-100 hover:bg-blue-100 border-4 border-gray-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {feedback === 'timeout' && (
              <div className="p-6 rounded-xl mb-6 bg-red-100 border-4 border-red-400">
                <p className="text-2xl font-bold mb-2 text-red-800">⏰ Too Slow!</p>
                <p className="text-lg text-red-700">The patient needed faster care! -2 hearts</p>
              </div>
            )}

            {feedback === 'correct' && (
              <div className={`p-6 rounded-xl mb-6 ${
                emergencyActive ? 'bg-yellow-100 border-4 border-yellow-400' : 'bg-green-100 border-4 border-green-400'
              }`}>
                <p className="text-2xl font-bold mb-2 text-green-800">
                  {emergencyActive ? '🎉 LIFE SAVED! 🎉' : '✨ Correct! ✨'}
                </p>
                <p className="text-lg text-green-700">{currentCase.explanation}</p>
                <p className="text-md mt-2 font-bold text-green-600">
                  +{emergencyActive ? 200 * streak : 100 * streak} points! +{currentCase.coins} coins!
                </p>
                {currentCase.unlocks && (
                  <p className="text-sm mt-2 font-bold text-purple-600">
                    🎮 Unlocked: {currentCase.unlocks === 'memory' ? 'Memory Match!' : currentCase.unlocks === 'emergency' ? 'Emergency Mode!' : 'New Mini-game!'}
                  </p>
                )}
              </div>
            )}

            {feedback === 'incorrect' && (
              <div className="p-6 rounded-xl mb-6 bg-red-100 border-4 border-red-400">
                <p className="text-2xl font-bold mb-2 text-red-800">
                  {emergencyActive ? '💔 Wrong Choice!' : '❌ Not quite!'}
                </p>
                <p className="text-lg text-red-700">
                  {emergencyActive ? `You lost 2 hearts! The correct answer was: ${currentCase.correctDiagnosis}` : `Try again next time! The answer was: ${currentCase.correctDiagnosis}`}
                </p>
              </div>
            )}

            {selectedAnswer && hearts > 0 && (
              <button
                onClick={nextCase}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-xl transform hover:scale-105 transition-all"
              >
                {emergencyActive ? '🚑 Continue' : feedback === 'correct' ? '➡️ Next Patient' : '➡️ Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center border-8 border-red-400">
          <div className="text-8xl mb-4">💔</div>
          <h1 className="text-5xl font-bold mb-4 text-red-600">Game Over</h1>
          <div className="bg-red-100 p-6 rounded-2xl mb-6 border-4 border-red-300">
            <p className="text-3xl mb-2 font-bold text-red-800">Final Score: {score}</p>
            <p className="text-2xl mb-2 text-red-700">💰 Coins: {coins}</p>
            <p className="text-xl text-red-600">Level Reached: {level}</p>
          </div>
          <p className="text-lg mb-6 text-gray-700">
            {level >= 4 ? '🏆 Great effort! You almost made it!' : level >= 2 ? '👍 Good try! Practice makes perfect!' : '💪 Keep trying! You can do this!'}
          </p>
          <button
            onClick={() => {
              playClickSound();
              setGameState('menu');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transform hover:scale-105 transition-all"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center border-8 border-yellow-400">
          <div className="text-8xl mb-4 animate-bounce">🏆</div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            You Win!
          </h1>
          <p className="text-2xl mb-6 font-bold text-purple-600">Master Doctor! 🩺</p>
          
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl mb-6 border-4 border-yellow-400">
            <p className="text-4xl mb-3 font-bold text-orange-700">⭐ {score} ⭐</p>
            <p className="text-2xl mb-2 text-orange-600">💰 {coins} Coins Collected!</p>
            <p className="text-xl text-orange-500">All {storyCases.length} Patients Saved!</p>
          </div>

          <div className="bg-green-100 p-4 rounded-xl mb-6 border-4 border-green-400">
            <p className="text-lg font-bold text-green-700">🎉 Achievements Unlocked:</p>
            <div className="mt-2 space-y-1">
              <p className="text-green-600">✅ Story Mode Complete</p>
              <p className="text-green-600">✅ All Mini-Games Unlocked</p>
              {streak >= 3 && <p className="text-green-600">✅ 3+ Streak Master</p>}
              {coins >= 300 && <p className="text-green-600">✅ Coin Collector (300+)</p>}
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setGameState('menu');
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transform hover:scale-105 transition-all"
          >
            🎮 Play Again or Try Mini-Games!
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default MedicalDiagnosisGame;
