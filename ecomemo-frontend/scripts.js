const URL = "http://localhost:3000"

window.addEventListener('DOMContentLoaded', e => {

    const gameClock = document.querySelector("#game-clock")
    const loginForm = document.querySelector("#login-form")
    const cards = document.querySelectorAll('.memory-card');
    const logout = document.querySelector("#logout")
    const startButton = document.querySelector("#start")
    const stopButton = document.querySelector("#stop")
    const saveModal = document.querySelector("#save-game-modal")
    const saveGameForm = document.querySelector("#save-game-form")
    
    // saveGameForm.addEventListener('submit', (e) => handleSubmission(e))
    cards.forEach(card => card.addEventListener('click', flipCard));
    shuffle()


    let username;
    let pairs = 0;
    let clockCounter = 0;
    let signedIn = false;
    let timer;
    let hasFlippedCard = false;
    let officialSeconds = 0;

    let lockBoard = true; //board is locked until login
    let firstCard, secondCard;

//login stuff
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        username = e.target.username.value
        let body = {username: username}
        if (username){
            handleSignIn(body)
        } else {
            alert("Please enter a username")
        }
        toggleLogOut()
        toggleDisable(startButton)
        signedIn = true;
        

    })

    function handleSignIn(body) {
        fetch(`${URL}/users/`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json", 
                "Accept": "application/json"},
            body: JSON.stringify(body)
          })
          .then(res => res.json())
          .then(data => console.log(data))
    }
    

    function toggleLogOut() {
        if (logout.style.display === "none") {
            logout.style.display = "block";
        } else {
            logout.style.display = "none";
        }
    }
//button control
    function toggleDisable(button) {
        if (button.disabled) {
            button.removeAttribute("disabled");
        } else {
            button.setAttribute("disabled", "true");
        }
    }

    function restartText(){
        if (startButton.textContent === "Start Game") {
            startButton.textContent = "Restart Game";
        } 
    }


//game

    startButton.addEventListener('click', (e) => startGame())
    stopButton.addEventListener('click', (e) => stopGame())

    function startGame() {
        if (!stopButton.disabled) {
            toggleDisable(stopButton)
        }
        officialSeconds = 0;
        restartText();
        lockBoard = false;
        pairs = 0;
        shuffle()
        clockCounter = 0;
        gameClock.innerText = "00:00";
        clearInterval(timer)
        timer = setInterval(gameClockFunction, 1000)
        
    }

    function stopGame() {
        clearInterval(timer)
        let timerText = gameClock.innerHTML;
        officialSeconds = calculateSeconds() //working, gives total seconds
        const div = document.querySelector(".final-time")
        const h5 = document.createElement('h5');
        h5.textContent = `Your Final Time: ${timerText}`
        div.appendChild(h5)
        displayModal(saveModal)

    }

    // function handleSubmission(e) {
    //     e.preventDefault()
    //     let comment = e.target.comment.value 
    //     const body = {username: username, "totaltime": officialSeconds, "comment": comment}
    //     saveGame(body)
    // }

    // function saveGame(body){
    //     fetch(`${URL}/games`, {
    //         method: 'POST',
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(body)
    //     })
    // }


//calculate score
    function calculateSeconds() {
        let timeText = gameClock.innerHTML;
        let timeArray = timeText.split(":");
        let secondsCount = (parseInt(timeArray[0])*60) + parseInt(timeArray[1]);
        return secondsCount;
    }

//clock stuff

    function gameClockFunction(){
        ++clockCounter
        gameClock.innerText = clockCounter.toString(10).toMMSS()
    }

    String.prototype.toMMSS = function () {
        var totalSeconds = parseInt(this, 10);
        var minutes = Math.floor((totalSeconds) / 60); 
        var seconds = totalSeconds - (minutes * 60);
  
        if (minutes < 10) {minutes = "0"+ minutes;}
        if (seconds < 10) {seconds = "0"+ seconds;}
        return minutes + ':' + seconds;
    }

//modal functionality
    function displayModal(modal) {
        modal.style.display = "block";
        const closeSaveModal = document.querySelector("#close-save-game")
        closeSaveModal.addEventListener('click', (e) => hideModal(saveModal))
    }

    function hideModal(modal) {
        modal.style.display = "none";
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
        pairs++
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        resetBoard();
        if (pairs >= 0) {
            toggleDisable(stopButton); //allow stop when all cards are flipped
        }
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
            card.classList.remove('flip')
            let randomPos = Math.floor(Math.random() * 12);
            card.style.order = randomPos;
        });
    };

})
