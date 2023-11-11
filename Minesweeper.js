var difficultyLevels = [{
	name: "beginner",
	rows: 9,
	columns: 9,
	mines: 10
},
{
	name: "intermediate",
	rows: 16,
	columns: 16,
	mines: 40
},
{
	name: "expert",
	rows: 16,
	columns: 30,
	mines: 99
}
];

// Defaults
var rows = difficultyLevels[0].rows;
var columns = difficultyLevels[0].columns;
var minesCount = difficultyLevels[0].mines;
var flagEnabled = false;

const boardElement = document.getElementById("board");
// Get references to the input fields
const rowCountInput = document.getElementById('row-count');
const colCountInput = document.getElementById('col-count');
const mineCountInput = document.getElementById('mine-count');

// Function to update the max attribute of the mineCountInput
function updateMineCountMax() {
const rowCount = parseInt(rowCountInput.value);
const colCount = parseInt(colCountInput.value);
const maxMines = rowCount * colCount - 1;
mineCountInput.max = maxMines;
}

// Add event listeners to rowCountInput and colCountInput
rowCountInput.addEventListener('input', updateMineCountMax);
colCountInput.addEventListener('input', updateMineCountMax);

// for user-friendly input
difficultyLevels.forEach(function(level) {
var radio = document.getElementById(level.name);
radio.addEventListener("change", function() {
	if (radio.checked) {
		rowCountInput.value = level.rows;
		colCountInput.value = level.columns;
		mineCountInput.value = level.mines;
	}
});
});

window.onload = function() {
startGame();
}

function setMines() {
let minesLeft = minesCount;
while (minesLeft > 0) {
	let r = Math.floor(Math.random() * rows);
	let c = Math.floor(Math.random() * columns);
	let id = r.toString() + "-" + c.toString();

	if (!minesLocation.includes(id)) {
		minesLocation.push(id);
		minesLeft -= 1;
	}
}
}

function newGame() {
if (started && !window.confirm("Are you sure you want to start a new game?")) {
	console.log('Confirmation canceled');
	return; // end the function sooner and not execute rest of the code
}

// Get input values
rows = parseInt(document.getElementById('row-count').value);
columns = parseInt(document.getElementById('col-count').value);
minesCount = parseInt(document.getElementById('mine-count').value);

// Set the grid-template-columns property dynamically
boardElement.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;

if (timer && typeof timer.stopTimer === "function") {
	timer.stopTimer();
}

startGame();
}



function startGame() {

document.getElementById("mine-c").innerText = minesCount;
document.getElementById("f-button").addEventListener("click", setFlag);

// Reset values
board = [];
minesLocation = [];
tilesClicked = 0;
GameOver = false;
started = false;

boardElement.innerHTML = "";
console.log('board cleared!');

setMines();

// Create board
for (let r = 0; r < rows; r++) {
	let row = [];
	for (let c = 0; c < columns; c++) {
		let tile = document.createElement("div");
		tile.id = r.toString() + "-" + c.toString();
		tile.addEventListener("click", clickTile)
		boardElement.appendChild(tile);
		row.push(tile);
	}
	board.push(row);
}
}

function setFlag() {
if (flagEnabled) {
	flagEnabled = false;
	document.getElementById("f-button").style.backgroundColor = "cornflowerblue";
} else {
	flagEnabled = true;
	document.getElementById("f-button").style.backgroundColor = "navy";
}
}

function clickTile() {

if (!started) {
	started = true;
	// Start the timer
	const timerElement = document.getElementById("timer");
	timer = new Timer(timerElement);
}

if (GameOver || this.classList.contains("tile.clicked")) {
	return;
}

let tile = this;
if (flagEnabled && !tile.classList.contains("tile-clicked")) { // only add the flag to untouched tiles
	tile.classList.contains("flagged") ? tile.classList.remove("flagged") : tile.classList.add("flagged");
	return;
}


if (!tile.classList.contains("flagged")) {
	if (minesLocation.includes(tile.id)) {
		//alert("Game Over");
		GameOver = true;
		revealMines();
		timer.stopTimer(); // Stop the timer when the player loses
		alert("You lose!");
		return;
	}
	let coords = tile.id.split("-");
	let r = parseInt(coords[0]);
	let c = parseInt(coords[1]);
	checkMine(r, c);
}
}

function revealMines() {
for (let r = 0; r < rows; r++) {
	for (let c = 0; c < columns; c++) {
		let tile = board[r][c];
		if (minesLocation.includes(tile.id)) {
			tile.classList.add("dynamite");
		}
	}
}
}

function checkMine(r, c) {
if (r < 0 || r >= rows || c < 0 || c >= columns) {
	return;
}

if (board[r][c].classList.contains("tile-clicked")) {
	return;
}

board[r][c].classList.add("tile-clicked");
tilesClicked += 1;

let minesFound = 0;

// Top
minesFound += checkTile(r - 1, c - 1); // top left
minesFound += checkTile(r - 1, c); // top
minesFound += checkTile(r - 1, c + 1); // top right

// Left and right
minesFound += checkTile(r, c - 1); // left
minesFound += checkTile(r, c + 1); // right

// Bottom
minesFound += checkTile(r + 1, c - 1); // bot left
minesFound += checkTile(r + 1, c); // bot 
minesFound += checkTile(r + 1, c + 1); // bot right

if (minesFound > 0) {
	board[r][c].innerText = minesFound;
	board[r][c].classList.add("m" + minesFound.toString());
} else {
	// Top
	checkMine(r - 1, c - 1);
	checkMine(r - 1, c);
	checkMine(r - 1, c + 1);

	// Left and right
	checkMine(r, c - 1);
	checkMine(r, c + 1);

	// Bottom
	checkMine(r + 1, c - 1);
	checkMine(r + 1, c);
	checkMine(r + 1, c + 1);
}

if (tilesClicked == rows * columns - minesCount && !GameOver) {
	document.getElementById("mine-c").innerText = "Cleared";
	GameOver = true;
	timer.stopTimer();
	alert("You win!");
}
}

function checkTile(r, c) {
if (r < 0 || r >= rows || c < 0 || c >= columns) {
	return 0;
}
if (minesLocation.includes(r.toString() + "-" + c.toString())) {
	return 1;
}
return 0;
}

class Timer {
constructor(timerElement) {
	this.startTime = Date.now();
	this.timerElement = timerElement;
	this.updateTimer();
	this.timerInterval = setInterval(this.updateTimer.bind(this), 10);
}

updateTimer() {
	let currentTime = ((Date.now() - this.startTime) / 1000).toFixed(2);

	if (currentTime >= 60 && this.timerElement.innerText.includes("second")) {
		let minutes = Math.floor(currentTime / 60);
		let remainingSeconds = currentTime % 60;
		let minutesText = minutes === 1 ? "minute" : "minutes";
		let secondsText = remainingSeconds === 1 ? "second" : "seconds";
		this.timerElement.innerText = minutes + " " + minutesText + " " + remainingSeconds.toFixed(2) + " " + secondsText;
	} else if (currentTime >= 3600 && this.timerElement.innerText.includes("minute")) {
		let hours = Math.floor(currentTime / 3600);
		let remainingMinutes = Math.floor((currentTime % 3600) / 60);
		let remainingSeconds = currentTime % 60;
		let hoursText = hours === 1 ? "hour" : "hours";
		let minutesText = remainingMinutes === 1 ? "minute" : "minutes";
		let secondsText = remainingSeconds === 1 ? "second" : "seconds";
		this.timerElement.innerText = hours + " " + hoursText + " " + remainingMinutes + " " + minutesText + " " + remainingSeconds.toFixed(2) + " " + secondsText;
	} else {
		let secondsText = currentTime === 1 ? "second" : "seconds";
		this.timerElement.innerText = currentTime + " " + secondsText;
	}
}

stopTimer() {
	clearInterval(this.timerInterval);
}

}