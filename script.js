const CARDS = "A 2 3 4 5 6 7 8 9 10 J Q K".split(" ");
const CARD_DESC = {
    A: "+1 or +11",
    4: "+0 (Reverse)",
    9: "+0 (Pass)",
    10: "-10",
    J: "+10",
    Q: "+10",
    K: "=99",
};
const CARD_NAME = {
    1: "n Ace as a 1",
    11: "n Ace as an 11",
    8: "n 8",
    J: " Jack",
    Q: " Queen",
    K: " King",
};

var total = 0;
var prevHistory = [];
var gameHistory = [];

var totalEle;
var cardGrid;
var aceChoiceGrid;
var undoBtn;
var historyList;

function main() {
    totalEle = document.getElementById("total");
    cardGrid = document.getElementById("card-grid");
    aceChoiceGrid = document.getElementById("ace-choice");
    undoBtn = document.getElementById("undo");
    historyList = document.getElementById("history");

    for (let card of CARDS) {
        let cardEle = document.createElement("div");
        cardEle.classList.add("card");
        cardEle.innerText = card;
        cardEle.style.setProperty("--rot", randomRotation() + "deg");

        let desc = CARD_DESC[card];
        if (desc == undefined) desc = "+" + parseInt(card);
        cardEle.setAttribute("data-desc", desc);

        if (card == "A")
            cardEle.addEventListener("click", (_) => {
                aceChoiceGrid.classList.remove("hidden");
                cardGrid.classList.add("hidden");
            });
        else
            cardEle.addEventListener("click", (event) => {
                event.target.style.setProperty("--rot", randomRotation() + "deg");
                playCard(event.target.innerText);
            });

        cardGrid.appendChild(cardEle);
    }

    addEventToHistory([0, "R", 0]);
}

function randomRotation() {
    let rotation = Math.random() * 10;
    if (rotation < 5) rotation -= 10;

    return rotation;
}

function playAce(choice) {
    aceChoiceGrid.classList.add("hidden");
    cardGrid.classList.remove("hidden");
    playCard(choice);
}

function playCard(card) {
    let prevTotal = total;
    switch (card) {
        case "4":
        case "9":
            break;
        case "10":
            total -= 10;
            break;
        case "J":
        case "Q":
            total += 10;
            break;
        case "K":
            total = 99;
            break;
        default:
            total += parseInt(card);
    }

    addEventToHistory([prevTotal, card, total]);
    showTotal();
}

function addEventToHistory(event) {
    gameHistory.push(event);
    disableUndoBtn();

    let b = event[0];
    let a = event[2];

    let msg;
    switch (event[1]) {
        case "R":
            msg = "New game started";
            break;
        case "M":
            msg = `Total manually set to ${a}`;
            break;
        default:
            msg = `Played a${CARD_NAME[event[1]] ?? " " + event[1]}`;
            if (b != a) msg += ` (${b} → ${a})`;
    }

    let newEventEle = document.createElement("p");
    newEventEle.classList.add("history-event");
    newEventEle.innerText = msg;

    historyList.appendChild(newEventEle);
}

function disableUndoBtn() {
    undoBtn.disabled = gameHistory.length < 2 && prevHistory.length == 0;
    undoBtn.classList.toggle("disabled", undoBtn.disabled);
}

function undo() {
    if (undoBtn.disabled) return;

    lastMove = gameHistory.pop();
    total = lastMove[0];

    let lastEventEle = historyList.children[historyList.children.length - 1];
    lastEventEle.classList.remove("history-event");
    void lastEventEle.offsetWidth;
    lastEventEle.classList.add("history-event", "undo");

    setTimeout(() => {
        lastEventEle.remove();
    }, 250);

    if (gameHistory.length == 0) {
        for (let event of prevHistory) addEventToHistory(event);
        prevHistory = [];
    }

    disableUndoBtn();
    showTotal();
}

function reset() {
    prevHistory = gameHistory;
    gameHistory = [];
    Array.from(historyList.children).forEach((ele) => ele.remove());
    addEventToHistory([total, "R", 0]);
    total = 0;
    showTotal();
}

function manual() {
    let response = prompt("Set Total:");
    if (response == null) return;

    let newTotal = parseInt(response);
    if (isNaN(newTotal)) newTotal = 0;

    addEventToHistory([total, "M", newTotal]);

    total = newTotal;
    showTotal();
}

function showTotal() {
    totalEle.classList.remove("pulse-anim");
    void totalEle.offsetWidth;

    totalEle.classList.add("pulse-anim");
    totalEle.classList.toggle("over", total >= 100);
    totalEle.classList.toggle("danger", total == 99);
    totalEle.innerText = total;
}
