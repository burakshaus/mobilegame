import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const EMOJIS = ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🍍', '🥝'];
const CARD_PAIRS = [...EMOJIS, ...EMOJIS];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4;

export default function MemoryGameScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...CARD_PAIRS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setIsLocked(false);
  };

  const handleCardPress = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setMoves(moves + 1);
      setIsLocked(true);
      
      const [firstIndex, secondIndex] = newFlippedIndices;
      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setIsLocked(false);
      } else {
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isWin = cards.length > 0 && cards.every(card => card.isMatched);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hamle: {moves}</Text>
      {isWin && <Text style={styles.winText}>Tebrikler! Kazandınız 🎉</Text>}

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              (card.isFlipped || card.isMatched) ? styles.cardFlipped : styles.cardHidden
            ]}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardEmoji}>
              {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={initializeGame}>
        <Text style={styles.resetButtonText}>Yeniden Başlat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  winText: {
    fontSize: 22,
    color: '#4ECDC4',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: width - 20,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  cardHidden: {
    backgroundColor: '#2A2A3C',
  },
  cardFlipped: {
    backgroundColor: '#FF6B6B',
  },
  cardEmoji: {
    fontSize: 40,
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#1E1E2C',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
