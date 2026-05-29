import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity } from 'react-native';

const SIZE = 4;
const WIN_VALUE = 2048;

type Board = number[][];

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / SIZE;

export default function Game2048Screen() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  function createEmptyBoard(): Board {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  }

  function addRandomTile(b: Board): Board {
    let emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length > 0) {
      const idx = Math.floor(Math.random() * emptyCells.length);
      const cell = emptyCells[idx];
      const newBoard = b.map(row => [...row]);
      newBoard[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
      return newBoard;
    }
    return b;
  }

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const slideAndMergeRow = (row: number[]): { newRow: number[], addedScore: number } => {
    let addedScore = 0;
    // 1. Remove zeros
    let filtered = row.filter(val => val !== 0);
    // 2. Merge adjacent
    for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i + 1]) {
            filtered[i] *= 2;
            addedScore += filtered[i];
            filtered[i + 1] = 0;
        }
    }
    // 3. Remove zeros again
    filtered = filtered.filter(val => val !== 0);
    // 4. Pad with zeros
    while (filtered.length < SIZE) {
        filtered.push(0);
    }
    return { newRow: filtered, addedScore };
  };

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver || gameWon) return;

    let newBoard = board.map(row => [...row]);
    let addedScore = 0;
    let moved = false;

    if (direction === 'LEFT' || direction === 'RIGHT') {
        for (let r = 0; r < SIZE; r++) {
            let row = newBoard[r];
            if (direction === 'RIGHT') row = row.reverse();
            const { newRow, addedScore: sc } = slideAndMergeRow(row);
            if (direction === 'RIGHT') newRow.reverse();
            
            if (newBoard[r].join(',') !== newRow.join(',')) moved = true;
            newBoard[r] = newRow;
            addedScore += sc;
        }
    } else if (direction === 'UP' || direction === 'DOWN') {
        for (let c = 0; c < SIZE; c++) {
            let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
            if (direction === 'DOWN') col = col.reverse();
            const { newRow, addedScore: sc } = slideAndMergeRow(col);
            if (direction === 'DOWN') newRow.reverse();

            if (col.join(',') !== (direction === 'DOWN' ? [...newRow].reverse() : newRow).join(',')) moved = true;
            
            for (let r = 0; r < SIZE; r++) {
                newBoard[r][c] = newRow[r];
            }
            addedScore += sc;
        }
    }

    if (moved) {
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        
        const newScore = score + addedScore;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);

        checkStatus(newBoard);
    }
  };

  const checkStatus = (b: Board) => {
    let hasZero = false;
    let canMerge = false;
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (b[r][c] === WIN_VALUE) {
                setGameWon(true);
            }
            if (b[r][c] === 0) hasZero = true;
            if (r < SIZE - 1 && b[r][c] === b[r+1][c]) canMerge = true;
            if (c < SIZE - 1 && b[r][c] === b[r][c+1]) canMerge = true;
        }
    }
    if (!hasZero && !canMerge) {
        setGameOver(true);
    }
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        const { dx, dy } = gestureState;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 30) {
            move(dx > 0 ? 'RIGHT' : 'LEFT');
          }
        } else {
          if (Math.abs(dy) > 30) {
            move(dy > 0 ? 'DOWN' : 'UP');
          }
        }
      },
    })
  ).current;

  const getColor = (value: number) => {
    const colors: { [key: number]: string } = {
      0: '#2A2A3C',
      2: '#eee4da',
      4: '#ede0c8',
      8: '#f2b179',
      16: '#f59563',
      32: '#f67c5f',
      64: '#f65e3b',
      128: '#edcf72',
      256: '#edcc61',
      512: '#edc850',
      1024: '#edc53f',
      2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.header}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SKOR</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>EN YÜKSEK</Text>
          <Text style={styles.scoreValue}>{highScore}</Text>
        </View>
      </View>

      <View style={styles.board}>
        {board.map((row, rIdx) => (
          <View key={`row-${rIdx}`} style={styles.row}>
            {row.map((cell, cIdx) => (
              <View 
                key={`cell-${rIdx}-${cIdx}`} 
                style={[styles.cell, { backgroundColor: getColor(cell) }]}
              >
                <Text style={[styles.cellText, { color: cell <= 4 ? '#776E65' : '#F9F6F2', fontSize: cell >= 100 ? 24 : 32 }]}>
                  {cell > 0 ? cell : ''}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {gameOver && <Text style={styles.statusText}>Oyun Bitti!</Text>}
      {gameWon && <Text style={styles.statusText}>Tebrikler, 2048'e Ulaştınız!</Text>}

      <TouchableOpacity style={styles.resetButton} onPress={startNewGame}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width - 40,
    marginBottom: 40,
  },
  scoreBox: {
    backgroundColor: '#2A2A3C',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scoreValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  board: {
    backgroundColor: '#101018',
    padding: 5,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 5,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontWeight: 'bold',
  },
  statusText: {
    color: '#4ECDC4',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
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
