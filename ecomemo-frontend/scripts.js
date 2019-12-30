window.addEventListener('DOMContentLoaded', e => {

    const gameContainer = document.querySelector("#game-container")
    const gameClock = document.querySelector("#game-clock")
    const playButton = document.querySelector("#play-button")
    const loginForm = document.querySelector("#login-form")
    const cards = document.querySelectorAll('.memory-card');

    cards.forEach(card => card.addEventListener('click', flipCard));
    
    let username;
    let signedIn = false;
    let timer = 0;
    let hasFlippedCard = false;
    let lockBoard = false; //board is locked until login
    let firstCard, secondCard;


    function gameClockFunction(){
        ++clockCounter
        gameClock.innerText = timer.toString(10).toMMSS()
    }


//card functionality
    
    shuffle()
    function shuffle() {
        cards.forEach(card => {
            let randomPos = Math.floor(Math.random() * 12);
            card.style.order = randomPos;
        });
    };

    function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;

        return;
    }

    secondCard = this;
    checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;

        isMatch ? disableCards() : unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }
    function shuffle() {
        cards.forEach(card => {
            let randomPos = Math.floor(Math.random() * 12);
            card.style.order = randomPos;
        });
    };

})
