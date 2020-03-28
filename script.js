let divStart = document.createElement('div');
divStart.style.display = 'flex';
divStart.style.justifyContent = 'center';

let inputWidth = document.createElement('input');
inputWidth.type = 'number';
inputWidth.placeholder = 'Width';
inputWidth.min = '2';
inputWidth.value = '10';

let inputHeight = document.createElement('input');
inputHeight.type = 'number';
inputHeight.placeholder = 'Height';
inputHeight.min = '2';
inputHeight.value = '10';

let inputNumberOfMines = document.createElement('input');
inputNumberOfMines.type = 'number';
inputNumberOfMines.placeholder = 'Number of mines';
inputNumberOfMines.min = '2';
inputNumberOfMines.value = '12';

let button = document.createElement('input');
button.type = 'submit';
button.value = 'GENERATE';

let gameField = document.createElement('table');

divStart.append(inputWidth, inputHeight, inputNumberOfMines, button);
document.body.appendChild(divStart);
document.body.appendChild(gameField);

loadData();

let gameParams = {
    width: 0,
    height: 0,
    mines: 0,

    toString() {
        return `${this.width} ${this.height} ${this.mines}`;
    }
};

gameField.style.border = '1px solid white';
gameField.style.marginLeft = 'auto';
gameField.style.marginRight = 'auto';
gameField.style.marginTop = '20px';

let openCellsListener, flagMinesListener;
let firstClick;
let minesCount;

button.addEventListener('click', generateGameField);
gameField.oncontextmenu = function(){
    return false;
};

function generateGameField() {
    let row, cell;
    firstClick = true;
    minesCount = gameParams.mines;
    button.value = 'TRY AGAIN';
    gameParams = setGameParams();
    gameField.innerHTML = '';

    if (gameParams.mines > gameParams.width * gameParams.height){
        gameParams.mines = Math.round(gameParams.width * gameParams.height / 8);
        inputNumberOfMines.value = gameParams.mines.toString();
    }

    document.onselectstart = function () {
        return false;
    };

    for (let i = 0; i < gameParams.height; i++) {
        row = gameField.insertRow(i);
        for (let j = 0; j < gameParams.width; j++) {
            cell = row.insertCell(j);
            cell.style.backgroundColor = '#fff359';
            cell.style.border = '1px solid red';
            cell.style.width = '30px';
            cell.style.height = '30px';
            cell.style.textAlign = 'center';
            cell.innerHTML = '';
        }
    }

    gameField.addEventListener('mouseover', function(event) {
        let target = event.target;
        if (target.tagName == 'TD') {
            target.style.cursor = 'pointer';
        }
    });

    gameField.addEventListener('mouseout', function(event) {
        let target = event.target;
        if (target.tagName == 'TD') {
            target.style.cursor = '';
        }
    });

    gameField.addEventListener('click', openCellsListener = function (event) {
        let target = event.target;
        if(target.tagName == 'TD') {
            if(firstClick == true) {
                target.dataset.first = 'clicked';
                addMines(gameParams.mines);
                openCell(target);
                firstClick = false;
            }
            else{
                openCell(target);
            }
        }
    });

    gameField.addEventListener('contextmenu', flagMinesListener = function (event) {
        let target = event.target;
        if (target.tagName == 'TD') {
            target.classList.toggle('isClicked');
            flagMines(target);
        }
    });

    saveData();
}

function setGameParams() {
    return {
        width: +inputWidth.value,
        height: +inputHeight.value,
        mines: +inputNumberOfMines.value,
    };
}

function addMines(timesLeft) {
    if (timesLeft == 0){
        return;
    }
    let row = Math.floor(Math.random() * gameParams.height);
    let col = Math.floor(Math.random() * gameParams.width);
    let cells = gameField.rows[row].cells[col];
    //console.log(row + ' ' + col);

    if (cells.dataset.mine != 'true' && cells.dataset.first != 'clicked'){
        cells.dataset.mine = 'true';
        return addMines(timesLeft-1);
    }
    else {
        return addMines(timesLeft);
    }
}

function openMines() {
    for (let i = 0; i < gameParams.height; i++){
        for (let j = 0; j < gameParams.width; j++){
            let cell = gameField.rows[i].cells[j];
            if (cell.dataset.mine == 'true'){
                cell.style.backgroundColor = '#4a1b00';
            }
        }
    }
    gameField.removeEventListener('click', openCellsListener);
    gameField.removeEventListener('contextmenu', flagMinesListener);
}

function checkCompletion() {
    let isCompleted = true;
    for (let i = 0; i < gameParams.height; i++) {
        for (let j = 0; j < gameParams.width; j++) {
            if ((gameField.rows[i].cells[j].dataset.mine != 'true') && (gameField.rows[i].cells[j].innerHTML == "")) {
                isCompleted = false;
            }
        }
    }
    if (isCompleted) {
        openMines();
        alert("You Win!");
    }
}

function flagMines(cell) {
    if(cell.className == 'isClicked'){
        cell.style.backgroundColor = '#31ff3c';
        cell.innerHTML = "!";
    }
    else{
        cell.style.backgroundColor = '#fff359';
        cell.innerHTML = "";

    }

    checkCompletion();
}

function openCell(cell) {
    if (cell.dataset.mine == 'true') {
        openMines();
        alert('Game Over!');
    }
    else {
        cell.style.backgroundColor = '#ff3226';
        cell.style.transition = '0.5s ease all';
        let mineCount = 0;
        let cellRow = cell.parentNode.rowIndex;
        let cellCol = cell.cellIndex;

        for (let  i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, 9); i++) {
            for (let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, 9); j++) {
                if (gameField.rows[i].cells[j].dataset.mine == 'true') {
                    mineCount++;
                }
            }
        }

        cell.innerHTML = mineCount;

        // Ищем все незаминированные соседние клетки
        if (mineCount == 0) {
            for (let i = Math.max(cellRow - 1, 0); i <= Math.min(cellRow + 1, 9); i++) {
                for(let j = Math.max(cellCol - 1, 0); j <= Math.min(cellCol + 1, 9); j++) {
                    if (gameField.rows[i].cells[j].innerHTML == "") {
                        openCell(gameField.rows[i].cells[j]);
                    }
                }
            }
        }
        checkCompletion();
    }
}

function saveData() {
    localStorage.setItem('width', gameParams.width);
    localStorage.setItem('height', gameParams.height);
    localStorage.setItem('mines', gameParams.mines);
}

function loadData() {
    inputWidth.value = localStorage.getItem('width');
    inputHeight.value = localStorage.getItem('height');
    inputNumberOfMines.value = localStorage.getItem('mines');
}