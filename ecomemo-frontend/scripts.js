const GAMESURL = "http://localhost:3000/games"
const USERSURL = "http://localhost:3000/users"

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
    const deleteAccountModal = document.querySelector("#delete-modal")
    const deleteAccountButton = document.querySelector("#delete-account")
    const deleteAccountContent = document.querySelector("#delete-account-content")

    const closeDeleteModalX = document.querySelector("#close-delete-account")
    const closeSaveModalX = document.querySelector("#close-save-game")
    const closeLeaderboardX=document.querySelector("#close-leaderboard")
    const closeGamesX = document.querySelector("#close-games")


    cards.forEach(card => card.addEventListener('click', flipCard));
    startButton.addEventListener('click', startGame)
    stopButton.addEventListener('click', stopGame)
    logout.addEventListener('click', handleLogout)

    leaderBoardButton.addEventListener('click', handleLeaderBoard)
    myGamesButton.addEventListener('click', handleMyGames)
    closeGamesX.addEventListener('click', ()=> hideModal(myGamesModal))
    closeLeaderboardX.addEventListener('click', () => hideModal(leaderBoardModal))
    closeSaveModalX.addEventListener('click', () => hideModal(saveModal)) 
    closeDeleteModalX.addEventListener('click', () => hideModal(deleteAccountModal))
    deleteAccountButton.addEventListener('click', confirmDelete)


    let usernameName;
    let userID;
    let pairs = 0;
    let clockCounter = 0;
    let timer;
    let hasFlippedCard = false;
    let officialSeconds = 0;
    let lockBoard = true; //board is locked until login/startgame
    let firstCard, secondCard;




//login stuff
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault()
        let entry = e.target.username.value
        e.target.reset()
        let body = {username: entry}
        if (entry){
            handleSignIn(body)
        } else {
            alert("Please enter a username")
        }
    })

    function handleSignIn(body) {
        fetch(`${USERSURL}`, {
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
            toggleVisibility(loginForm)
            usernameName = data.username;
            userID = data.id;
            toggleVisibility(logout);
            toggleVisibility(deleteAccountButton)
           
            toggleDisable(startButton);
            toggleDisable(myGamesButton);
        })
    }


    function toggleVisibility(node){
        if (node.style.display == "none") {
            node.style.display = "block"
        } else {
            node.style.display = "none"
        }
    }

// logout stuff
    function handleLogout() {
        toggleVisibility(loginForm)
        toggleVisibility(logout)
        toggleVisibility(deleteAccountButton)
        resetInfo();
    }


    function resetInfo() {
        pairs = 0;
        officialSeconds = 0;
        usernameName = null;
        userID = null;
        clockCounter = 0;
        gameClock.innerHTML = "00:00";
        resetBoard();
        shuffle();
        lockBoard = true;
        clearInterval(timer);
        timer = 0;
        startButton.textContent = "Start Game";
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
        pairs = 0;
        resetBoard();
        shuffle();
        clockCounter = 0;
        gameClock.innerText = "00:00";
        clearInterval(timer)
        timer = setInterval(gameClockFunction, 1000)
    }

    function stopGame() {
        clearInterval(timer)
        let timerText = gameClock.innerHTML;
        officialSeconds = calculateSeconds() //working, gives total seconds
        savedGameInfo.innerHTML = "";
        savedGameInfo.innerHTML = 
        `<div class="final-time"> 
            <h4>Yay! You Did It!</h4> 
        </div>
        <div class="ui input" id="save-game-form-div" >
            <form autocomplete="off" id="save-game-form" method="post">
                <h3>Enter a Comment Before Saving:</h3>
                <input id="comment-field" type="text" name="comment" placeholder="Comment">
                <br><br>
                <input type="submit" value="Save My Game!">
                <br><br>
            </form>
        </div>`
        const saveGameForm = document.querySelector("#save-game-form")
        saveGameForm.addEventListener('submit', (e) => handleSubmission(e))
        displayModal(saveModal)

    }

    function handleSubmission(e) {
        e.preventDefault()
        let comment = e.target.comment.value 
        const body = {username: usernameName, "totaltime": officialSeconds, "comment": comment}
        saveGame(body)
    }

    function saveGame(body){
        fetch(`${GAMESURL}`, {
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
                    <div class="ui segment"><h6>User:</h6></div>
                    <div class="ui secondary segment"><p>${usernameName}</p></div>
                </div>
                <div class="ui segments">
                    <div class="ui segment"><h6>Time:</h6></div>
                    <div class="ui secondary segment"><p>${gameClock.innerHTML}</p></div>
                </div>
                <div class="ui segments">
                    <div class="ui segment"><h6>Comment:</h6></div>
                    <div class="ui secondary segment"><p>${data.comment}</p></div>
                </div>
            </div>
        `
    }


//calculate time to seconds
    function calculateSeconds() {
        let timeText = gameClock.innerHTML;
        let timeArray = timeText.split(":");
        let secondsCount = (parseInt(timeArray[0])*60) + parseInt(timeArray[1]);
        return secondsCount;
    }
//calculate seconds to time
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
        gameClock.innerText = clockCounter.toString(10).toMinSec()
    }

    String.prototype.toMinSec = function () {
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
// account deletion
    function confirmDelete() {
        deleteAccountContent.innerHTML = ""
        
        const h3 = document.createElement("h3");
        h3.textContent = `Are you sure you want to delete your Account, ${usernameName}?`
        const h4 = document.createElement("h4");
        h4.textContent = "All your games will be deleted and you will be logged out."
        const btn = document.createElement("button")
        btn.textContent = "Yes, I want to be Deleted Forever"
        btn.addEventListener('click', deleteUser)
        deleteAccountContent.appendChild(h3)
        deleteAccountContent.appendChild(h4)
        deleteAccountContent.appendChild(btn)
        displayModal(deleteAccountModal)
    }


    function deleteUser() {
        fetch(`${USERSURL}/${userID}`, {
            method: 'DELETE',
            headers: { 
                "Access-Control-Allow-Origin": `*`,
                "Content-Type": "application/json", 
                "Accept": "application/json"}
        })
        .then(confirmDeletion)
        .then(setTimeout(function(){deleteAccountModal.style.display = "none"}, 3000))
        .then(setTimeout(handleLogout, 3000))
        
    }


    function confirmDeletion(){
        deleteAccountContent.innerHTML = ""
        const h3 = document.createElement("h3");
        h3.textContent = `Fine, ${usernameName}. Your Account has been deleted and you will be logged out now...`
        deleteAccountContent.appendChild(h3)
        displayModal(deleteAccountModal)
   
    }

//leaderboard stuff      leaderBoardContent

    function handleLeaderBoard() {
        leaderBoardContent.innerHTML = ""
        
        fetch(`${GAMESURL}`)
        .then(resp => resp.json())
        .then(games => showGames(games))
        .then(showLeaderBoard())
       
    }

    function showGames(games) {
        
        if (games.length == 0) {
            emptyMessage(leaderBoardContent)
        }
        games.forEach(game => addGame(game, leaderBoardContent))
        
    }
    
    function addGame(game, node) {

        const div = document.createElement('div')
        div.id = `game${game.id}`;
        div.className = "game-card";
        const h51 = document.createElement('h5')
        h51.innerHTML = `User: ${game.user.username}`
        const h52 = document.createElement('h5')
        h52.innerHTML =`Total Time: ${calculateTime(game.totaltime)}` 
        const h6 = document.createElement('h5')
        h6.innerHTML =`Comment: ${game.comment}`
        
        div.appendChild(h51)
        div.appendChild(h52)
        div.appendChild(h6)
        if (game.user.username === usernameName) {
            const btn = document.createElement('button')
            btn.className = "delete-game"
            btn.textContent = "Delete My Game"
            btn.addEventListener('click', () => deleteGame(game.id))
            div.appendChild(btn)
        }
    
        node.appendChild(div)

    }

    function showLeaderBoard() {
        displayModal(leaderBoardModal)
    }

    function deleteGame(id) {
        fetch(`${GAMESURL}/${id}`, {
            method: 'DELETE',
            headers: { 
                "Access-Control-Allow-Origin": `*`,
                "Content-Type": "application/json", 
                "Accept": "application/json"}
        })
        .then(() => {
            const deleted = document.querySelector(`#game${id}`)
            const parent = deleted.parentNode
            deleted.parentNode.removeChild(deleted)
            if (!parent.hasChildNodes()){
                emptyMessage(parent)
            }
        })
    }

    function emptyMessage(node) {
        const div = document.createElement("div");
        div.className = "empty-card";
        const h5 = document.createElement("h5")
        h5.textContent = "Oh No!! No Games to Display...Maybe You Should Play Some... "
        div.appendChild(h5)

        node.appendChild(div)
    }


//user games stuff           myGamesContent
    function handleMyGames() {
        myGamesContent.innerHTML = ""
        fetch(`${USERSURL}/${userID}`)
        .then(resp => resp.json())
        .then(games => addMyGames(games))
        .then(showMyGames)
    }

    function addMyGames(games) {
        if (games.length == 0) {
            console.log(" sdhere")
            emptyMessage(myGamesContent)
        }
        games.forEach(game=> addGame(game, myGamesContent))
    }
    
    function showMyGames() {
        displayModal(myGamesModal)
    }


//card functionality
    
    function flipCard() {
        if (lockBoard) { 
            console.log ("locked?" ) 
            return;
        }
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
            let random = Math.floor(Math.random() * 12);
            card.style.order = random;
            card.addEventListener('click', flipCard);
        });
    };

})
