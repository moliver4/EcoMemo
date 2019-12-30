window.addEventListener('DOMContentLoaded', e => {

    const gameContainer = document.querySelector("#game-container")
    const gameClock = document.querySelector("#game-clock")
    const loginForm = document.querySelector("#login-form")
    const cards = document.querySelectorAll('.memory-card');
    const logout = document.querySelector("#logout")
    const startbutton = document.querySelector("#start")
    const stopbutton = document.querySelector("#stop")

    cards.forEach(card => card.addEventListener('click', flipCard));
    shuffle()

    let username;
    let clockCounter=0;
    let signedIn = false;
    let timer = 0;
    let hasFlippedCard = false;
    let lockBoard = false; //board is locked until login
    let firstCard, secondCard;

//login stuff
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        toggleLogOut()
        toggleDisable(startbutton)
        signedIn = true;
        username = e.target.username.value

    })

    function toggleLogOut() {
        if (logout.style.display === "none") {
            logout.style.display = "block";
        } else {
            logout.style.display = "none";
        }
    }


//game
    function toggleDisable(button) {
        if (button.disabled) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "true");
        }
    }

    startbutton.addEventListener('click', (e) => {
        e.preventDefault()
        toggleDisable(stopbutton)
        startGame()
    })

    function startGame() {
        
        gameClock.innerText = "00:00";
        let timer = setInterval(gameClockFunction, 1000)
    }


//clock stuff

    function gameClockFunction(){
        ++clockCounter
        gameClock.innerText = clockCounter.toString().toMMSS()
    }

    String.prototype.toMMSS = function () {
        var sec_num = parseInt(this, 10); // don't forget the second param
        var minutes = Math.floor((sec_num) / 60);
        var seconds = sec_num - (minutes * 60);
  
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        return minutes + ':' + seconds;
    }


//card functionality
    
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
