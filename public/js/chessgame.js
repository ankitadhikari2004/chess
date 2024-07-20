const socket = io();
const chess = new Chess();

const boardElement = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add("square", (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add("piece", square.color === 'w' ? "white" : "black");

                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        console.log("Drag start:", pieceElement.innerText);
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                        pieceElement.classList.add("dragging");
                    }
                });

                pieceElement.addEventListener("dragend", (e) => {
                    console.log("Drag end:", pieceElement.innerText);
                    draggedPiece = null;
                    sourceSquare = null;
                    pieceElement.classList.remove("dragging");
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    console.log("Drop on:", squareElement.dataset.row, squareElement.dataset.col);
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSource);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });
    if(playerRole =='b'){
        boardElement.classList.add("flipped");

    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };

    console.log("Move:", move);
    socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: '♙',
        r: '♖',
        n: '♘',
        b: '♗',
        q: '♕',
        k: '♔',
        P: '♟︎',
        R: '♜',
        N: '♞',
        B: '♝',
        Q: '♛',
        K: '♚'
    };

    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function(role) {
    console.log("Player role:", role);
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function() {
    console.log("Spectator role");
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen) {
    console.log("Board state:", fen);
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(move) {
    console.log("Opponent move:", move);
    chess.move(move);
    renderBoard();
});

renderBoard();