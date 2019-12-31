const URL = "http://localhost:3000"

window.addEventListener('DOMContentLoaded', e => {

    const gameClock = document.querySelector("#game-clock")
    const loginForm = document.querySelector("#login-form")
    const cards = document.querySelectorAll('.memory-card');
    const logout = document.querySelector("#logout")
    const startButton = document.querySelector("#start")
    const stopButton = document.querySelector("#stop")
    const saveModal = document.querySelector("#save-game-modal")
    const leaderBoardButton = document.querySelector("#leaderboard")
    const leaderBoardModal = document.querySelector("#leaderboard-modal")
    const leaderBoardContent = document.querySelector("#leaderboard-content")
    const myGamesButton = document.querySelector("#my-games")
    const myGamesModal = document.querySelector("#games-modal")
    const myGamesContent = document.querySelector("#games-content")
    const savedGameInfo = document.querySelector("#saved-game-info")
    const saveGameForm = document.querySelector("#save-game-form")
    const closeSaveModalX = document.querySelector("#close-save-game")
    const closeLeaderboardX=document.querySelector("#close-leaderboard")
    const closeGamesX = document.querySelector("#close-games")


    cards.forEach(card => card.addEventListener('click', flipCard));
    shuffle()
    startButton.addEventListener('click', startGame)
    stopButton.addEventListener('click', stopGame)
    logout.addEventListener('click', handleLogout)
    leaderBoardButton.addEventListener('click', handleLeaderBoard)
    myGamesButton.addEventListener('click', handleMyGames)
    closeGamesX.addEventListener('click', (e)=> hideModal(myGamesModal))
    closeLeaderboardX.addEventListener('click', (e) => hideModal(leaderBoardModal))
    closeSaveModalX.addEventListener('click', (e) => hideModal(saveModal)) 
    saveGameForm.addEventListener('submit', (e) => handleSubmission(e))


    let username;
    let pairs = 0;
    let clockCounter = 0;
    let timer;
    let hasFlippedCard = false;
    let officialSeconds = 0;

    let lockBoard = true; //board is locked until login/startgame
    let firstCard, secondCard;


//leaderboard stuff      leaderBoardContent

    function handleLeaderBoard() {
        leaderBoardContent.innerHTML = ""
        fetch(`${URL}/games/`)
        .then(resp => resp.json())
        .then(games => showGames(games))
        .then(showLeaderBoard)
       
    }

    function showGames(games) {
        games.forEach(game=> addGame(game))
        
    }
    function addGame(game) {
    
        const div = document.createElement('div')
        div.id = game.id;
        div.className = "game-card";
        const h6 = document.createElement('h6')
        h6.innerHTML = `<pre>User: ${game.user.username}    ****    Comment: ${game.comment}    ****   Total Time: ${calculateTime(game.totaltime)}</pre>`
        div.appendChild(h6)
        leaderBoardContent.appendChild(div)
    }

    function showLeaderBoard() {
        console.log("I MADE IT")
        displayModal(leaderBoardModal)

    }

   

//user games stuff           myGamesContent
    function handleMyGames() {

    }

    function getMyGames(){

    }

    
    function showMyGames() {
        displayModal(myGamesModal)

    }


//login stuff
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        let entry = e.target.username.value
        let body = {username: entry}
        if (entry){
            handleSignIn(body)
        } else {
            alert("Please enter a username")
        }
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
          .then(data => {
            //remove this later!!
            console.log(data);
            username = data.username
            toggleLogOut();
            toggleDisable(startButton);
            toggleLogin();
            toggleDisable(myGamesButton);
        })
    }

    function toggleLogin() {
        if (loginForm.style.display === "none") {
            loginForm.style.display = "block";
            loginForm.username.value ="";
        } else {
            loginForm.style.display = "none";
        }
    }

// logout stuff
    function handleLogout() {
        toggleLogin();
        resetInfo();
    }

    function toggleLogOut() {
        if (logout.style.display == "none") {
            logout.style.display = "block";
        } else {
            logout.style.display = "none";
        }
    }

    function resetInfo() {
        pairs = 0;
        officialSeconds = 0;
        username = null;
        clockCounter = 0;
        gameClock.innerHTML = "00:00";
        resetBoard();
        shuffle();
        lockBoard = true;
        clearInterval(timer);
        timer = 0;
        toggleLogOut();
        startButton.textContent = "Restart Game";
        toggleDisable(startButton)
        toggleDisable(myGamesButton)
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

    function handleSubmission(e) {
        e.preventDefault()
        let comment = e.target.comment.value 
        const body = {username: username, "totaltime": officialSeconds, "comment": comment}
        saveGame(body)
    }

    function saveGame(body){
        fetch(`${URL}/games`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        .then(resp => resp.json())
        .then(data => showSaved(data))
    }

    function showSaved(data) {
        console.log(data)
        savedGameInfo.innerHTML = "";
        savedGameInfo.innerHTML = `<h4 class="game-saved">GAME <br> SAVED</h4>
            <div class="game-card">
                <div class="ui segments">
                    <div class="ui segment"><h6>User</h6></div>
                    <div class="ui secondary segment"><p>${username}:</p></div>
                </div>
                <div class="ui segments">
                    <div class="ui segment"><h6>Time</h6></div>
                    <div class="ui secondary segment"><p>${gameClock.innerHTML}:</p></div>
                </div>
                <div class="ui segments">
                    <div class="ui segment"><h6>Comment:</h6></div>
                    <div class="ui secondary segment"><p>${data.comment}</p></div>
                </div>
            </div>
        `
    }


//calculate time in seconds
    function calculateSeconds() {
        let timeText = gameClock.innerHTML;
        let timeArray = timeText.split(":");
        let secondsCount = (parseInt(timeArray[0])*60) + parseInt(timeArray[1]);
        return secondsCount;
    }

    function calculateTime(sec) {
        var minutes = Math.floor((sec) / 60); 
        var seconds = sec - (minutes * 60);
  
        if (minutes < 10) {minutes = "0"+ minutes;}
        if (seconds < 10) {seconds = "0"+ seconds;}
        return minutes + ':' + seconds;
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
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        pairs++

        resetBoard();
        if (pairs == 1) {
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
