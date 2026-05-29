import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity } from 'react-native';

const SIZE = 4;
const WIN_VALUE = 2048;

type Board = number[][];

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / SIZE;

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandomTile(b: Board): Board {
  const newBoard = b.map(row => [...row]);
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (newBoard[r][c] === 0) emptyCells.push({ r, c });
    }
  }
  if (emptyCells.length > 0) {
    const idx = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[idx];
    newBoard[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
  }
  return newBoard;
}

function slideAndMergeRow(row: number[]): { newRow: number[]; addedScore: number } {
  let addedScore = 0;
  let filtered = row.filter(val => val !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      addedScore += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  filtered = filtered.filter(val => val !== 0);
  while (filtered.length < SIZE) {
    filtered.push(0);
  }
  return { newRow: filtered, addedScore };
}

function boardsEqual(a: Board, b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function checkGameOver(b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === 0) return false;
      if (r < SIZE - 1 && b[r][c] === b[r + 1][c]) return false;
      if (c < SIZE - 1 && b[r][c] === b[r][c + 1]) return false;
    }
  }
  return true;
}

function checkHasWon(b: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c] === WIN_VALUE) return true;
    }
  }
  return false;
}

function performMove(currentBoard: Board, direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): { newBoard: Board; addedScore: number; moved: boolean } {
  let newBoard = currentBoard.map(row => [...row]);
  let addedScore = 0;

  if (direction === 'LEFT' || direction === 'RIGHT') {
    for (let r = 0; r < SIZE; r++) {
      let row = [...newBoard[r]];
      if (direction === 'RIGHT') row.reverse();
      const { newRow, addedScore: sc } = slideAndMergeRow(row);
      if (direction === 'RIGHT') newRow.reverse();
      newBoard[r] = newRow;
      addedScore += sc;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
      if (direction === 'DOWN') col.reverse();
      const { newRow, addedScore: sc } = slideAndMergeRow(col);
      if (direction === 'DOWN') newRow.reverse();
      for (let r = 0; r < SIZE; r++) {
        newBoard[r][c] = newRow[r];
      }
      addedScore += sc;
    }
  }

  const moved = !boardsEqual(currentBoard, newBoard);
  return { newBoard, addedScore, moved };
}

export default function Game2048Screen() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Use refs so that PanResponder always accesses latest state
  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const highScoreRef = useRef(highScore);
  const gameOverRef = useRef(gameOver);
  const gameWonRef = useRef(gameWon);

  boardRef.current = board;
  scoreRef.current = score;
  highScoreRef.current = highScore;
  gameOverRef.current = gameOver;
  gameWonRef.current = gameWon;

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

  const handleMove = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOverRef.current || gameWonRef.current) return;

    const { newBoard: movedBoard, addedScore, moved } = performMove(boardRef.current, direction);

    if (moved) {
      const finalBoard = addRandomTile(movedBoard);
      const newScore = scoreRef.current + addedScore;

      setBoard(finalBoard);
      setScore(newScore);

      if (newScore > highScoreRef.current) {
        setHighScore(newScore);
      }

      if (checkHasWon(finalBoard)) {
        setGameWon(true);
      } else if (checkGameOver(finalBoard)) {
        setGameOver(true);
      }
    }
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_e, gestureState) => {
        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < 20 && absDy < 20) return; // ignore taps

        if (absDx > absDy) {
          handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          handleMove(dy > 0 ? 'DOWN' : 'UP');
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
    <View style={styles.container}>
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

      <View style={styles.boardWrapper} {...panResponder.panHandlers}>
        <View style={styles.board}>
          {board.map((row, rIdx) => (
            <View key={`row-${rIdx}`} style={styles.row}>
              {row.map((cell, cIdx) => (
                <View
                  key={`cell-${rIdx}-${cIdx}`}
                  style={[styles.cell, { backgroundColor: getColor(cell) }]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: cell <= 4 ? '#776E65' : '#F9F6F2',
                        fontSize: cell >= 1024 ? 18 : cell >= 100 ? 24 : 32,
                      },
                    ]}
                  >
                    {cell > 0 ? cell : ''}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {gameOver && <Text style={styles.statusText}>Oyun Bitti!</Text>}
      {gameWon && <Text style={styles.statusText}>Tebrikler, 2048'e Ulaştınız! 🎉</Text>}

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
  boardWrapper: {
    padding: 5,
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
