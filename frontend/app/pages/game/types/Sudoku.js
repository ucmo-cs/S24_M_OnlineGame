import { useEffect, useMemo, useRef, useState } from 'react'
const style = {
  container: { 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    outline: "none",
    width: "fit-content",
    margin: "auto"
  },
  boardContainer: { width: "fit-content", userSelect: "none", position: "relative" },
  gameFooter: { display: "flex", width: "100%", marginTop: 24, justifyContent: "center", alignItems: "center" },
  completionInfoContainer: { lineHeight: 1.15, flex: 1 },
  completedInText: {  color: "#090", fontWeight: "bold" },
  infoText1: { fontWeight: "bold", fontSize: 14, color: "#0007" },
  timerText: { fontSize: 18, fontWeight: "bold" }
}

export default function Sudoku({socket, gameState}) {
  const [board, setBoard] = useState(new Array(9).fill(new Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState([-1, -1]);
  const [sudokuPuzzle, setSudokuPuzzle] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [timerEnded, setTimerEnded] = useState(false);

  const animationId = useRef();

  const users = gameState.users;
  //const done = connectedPlayers.every(player => player.done) || connectedPlayers.length < 2;

  const errorCells = useMemo(() => {
    const rows = [];
    const cols = [];
    const subgrids = [];

    if (board) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) { // for each cell...       
          const subRow = Math.floor(i / 3) * 3;
          const subCol = Math.floor(j / 3) * 3;

          for (let k = 0; k < 9; k++) {
            if (k !== j && board[i][k] === board[i][j])
              // detect rows that contain duplicate numbers
              if (board[i][k] !== 0 && !rows.includes(i)) 
                rows.push(i); 

            if (k !== i && board[k][j] === board[i][j])
              // detect columns that contain duplicate numbers
              if (board[k][j] !== 0 && !cols.includes(j)) 
                cols.push(j);

            const row = subRow + Math.floor(k / 3);
            const col = subCol + k % 3;

            if ((row !== i || col !== j) && board[row][col] === board[i][j]) {
              // subgrid of 0 = top left to subgrid of 8 = bottom right
              const subgrid = Math.floor(j / 3) + 3 * Math.floor(i / 3);
              
              // detect subgrids that contain duplicate numbers
              if (board[row][col] !== 0 && !subgrids.includes(subgrid)) 
                subgrids.push(subgrid);
            }
          }
        }
      }
    }

    return {rows, cols, subgrids};
  }, [board])

  const isSolved = useMemo(() =>{
    return sudokuPuzzle && sudokuPuzzle.solved;
  }, [board, sudokuPuzzle]);

  const completionTime = useMemo(() => {
    return isSolved ? Math.floor(sudokuPuzzle.solvedAt/1000) : null; // Get the elapsed time when the board is solved
  }, [isSolved])
  const hasSetup = useRef(false);
  if(hasSetup.current == false) {
    hasSetup.current = true;
  }
  const hasLoaded = useRef(false);
  if(hasLoaded.current == false) {
        socket.clearSubscriptions();
        socket.subscribeToSudokuGame((message)=> {
            console.log(message);
            const newSudokuPuzzle = message;
            setSudokuPuzzle(newSudokuPuzzle);
            setTimeRemaining(Math.floor(newSudokuPuzzle.timeRemaining /1000))
            setBoard(newSudokuPuzzle.grid.map(row => row.slice()));
       });
      hasLoaded.current = true;
  }

  function clearCell(row, col) {
    setCellValue(row, col, 0); // cell value of zero means empty cell
  }

  function fillCell(row, col, value) {
    setCellValue(row, col, value);
  }

  function onCellClick(row, col) {
    if (board[row][col] !== sudokuPuzzle.complete[row][col])
      setSelectedCell([row, col]);
  }

  function onKeyDown(e) {
    if (!isSolved) {
      const [row, col] = selectedCell;

      let newRow = row;
      let newCol = col;

      // shift cell selection up/down/right/left based the arrow key pressed
      if (e.code === "ArrowUp" && row > 0)
        newRow -= 1;
      if (e.code === "ArrowDown" && row < 8)
        newRow += 1;
      if (e.code === "ArrowLeft" && col > 0)
        newCol -= 1;
      if (e.code === "ArrowRight" && col < 8)
        newCol += 1;

      if (newRow !== row || newCol !== col) { // if cell selection changed via arrow keys...
        setSelectedCell(row === -1 || col === -1 ? [0, 0] : [newRow, newCol])
      } else if (row > -1 && col > -1) {
        if (board[row][col] !== sudokuPuzzle.complete[row][col]) {
          const num = parseInt(e.key);
          
          // allows cell to be filled with the number key that was pressed
          if (!isNaN(num) && num !== 0) 
            fillCell(row, col, num);
          // clear cell upon pressing backspace or delete
          else if (e.code === "Backspace" || e.code === "Delete")
            clearCell(row, col);
        }
      }
    }
  }

  const setCellValue = (row, col, value) => {
    const newBoard = board.map(row => row.slice());
    newBoard[row][col] = value;
    socket.sudokuGameDataSet(row,col, value);
    setBoard(newBoard);
  }

  return (
    <div onKeyDown={onKeyDown} style={style.container} tabIndex={0}>
      <p style={{ marginBottom: 24 }}>Solve this Soduku puzzle as quickly as possible!</p>
      <div style={style.boardContainer}>
        <div style={{ pointerEvents: isSolved ? "none" : "auto" }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ display: "flex", marginBottom: i === 2 || i === 5 ? 8 : 0 }}> {/* subgrid spacing */}
              {Array.from({ length: 9 }, (_, j) => (
                <SudokuCell
                  board={board}
                  boardSolved={isSolved}
                  correctValue={sudokuPuzzle ? sudokuPuzzle.complete[i][j] : -1}
                  error={
                    errorCells.rows.includes(i) || 
                    errorCells.cols.includes(j) ||
                    errorCells.subgrids.includes(Math.floor(j / 3) + 3 * Math.floor(i / 3))
                  }
                  key={j}
                  hidden={!sudokuPuzzle || sudokuPuzzle.grid[i][j] !== sudokuPuzzle.complete[i][j]}
                  onClick={onCellClick}
                  position={[i, j]}
                  selected={i === selectedCell[0] && j === selectedCell[1]}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={style.gameFooter}>
        {(isSolved || timerEnded) && (
          <div style={style.completionInfoContainer}>
            {isSolved ? (
              <p style={style.completedInText}>
                Completed in {Math.floor(completionTime / 60)}:{(completionTime % 60).toString().padStart(2, "0")}
              </p>
            ) : <p style={{ ...style.completedInText, color: "orangered" }}>Out of Time!</p>}
            {isSolved && (
              <p style={style.infoText1}>
                Waiting for other players to finish...
              </p>
            )}
          </div>
        )}
        <div>
          <span style={style.timerText}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  )
}

function SudokuCell({ board, boardSolved, correctValue, error, hidden, position, onClick, selected }) {
  const [row, col] = position;

  const value = board[row][col];
  const correct = value !== 0 && hidden && value === correctValue;
  const incorrect = value !== 0 && hidden && value !== correctValue;

  const style = {
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative",
    width: 40, 
    height: 40, 
    border: "1px solid #0003",
    cursor: value !== correctValue ? "pointer" : "default",
    marginRight: col === 2 || col === 5 ? 8 : 0,
    borderBottomWidth: (row + 1) % 3 !== 0 ? 0 : 1,
    borderRightWidth: (col + 1) % 3 !== 0 ? 0 : 1,
    color: boardSolved ? "#0b0" : correct ? "#0b0" : incorrect ? "#fff" : "",
    backgroundColor: selected ? correct ? "#0b03" : incorrect ? "#f00" : "#eee": "#0000",
    borderColor: boardSolved ? "#0b0" : "#0003"
  };
  
  return (
    <div onClick={e => {e.stopPropagation(); onClick(row, col)}} style={style}>
      <>
        {value !== 0 && (
          <span style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
            {value}
          </span>
        )}
        <div 
          style={{
            position: "absolute", 
            inset: 0,
            pointerEvents: "none",
            backgroundColor: error ? "#f001" : ""  
          }}
        />
      </>
    </div>
  )
}