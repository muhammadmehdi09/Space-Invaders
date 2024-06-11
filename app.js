//board
let tileSize = 24
let rows = 20
let columns = 20

let board
let scorePara
let context
let healthBar
let wavePara
let waveNum

//ship
let shipWidth = tileSize * 2
let shipHeight = tileSize
let shipX = tileSize * columns / 2 - tileSize
let shipY = tileSize * rows - tileSize * 2
let shipHearts
let heartImg
let deadHeartImg
let outerDiv

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg
let shipVelocityX = tileSize //ship moving speed

//aliens
let alienArray = []
let alienWidth = tileSize * 2
let alienHeight = tileSize
let alienX = tileSize
let alienY = tileSize
let alienImg

let alienRows = 1
let alienColumns = 3
let alienCount = 0 //number of aliens to defeat
let alienVelocityX = 1 //alien moving speed

let kingAlienArray = []
let kingAlienWidth = tileSize * 2
let kingAlienHeight = tileSize * 1.5
let kingAlienX = tileSize
let kingAlienY = tileSize
let kingAlienImg

let kingAlienRows = 1
let kingAlienColumns = 3
let kingAlienCount = 0 //number of aliens to defeat
let kingAlienVelocityX = 1.2 //alien moving speed


//bullets
let bulletArray = []
let bulletVelocityY = -10 //bullet moving speed

//king alien bullets
let alienBulletArray = []
let alienBulletVelocityY = 10 //bullet moving speed

let score = 0
let gameOver = false

window.onload = function () {
    waveNum = 1
    shipHearts = 3
    scorePara = document.getElementById("scorePara")
    healthBar = document.getElementById("healthBar")
    wavePara = document.getElementById("wavePara")
    outerDiv = document.getElementById("outerDiv")

    board = document.getElementById("board")
    board.width = tileSize * columns
    board.height = tileSize * rows
    context = board.getContext("2d") //used for drawing on the board

    heartImg = new Image()
    heartImg.src = "Images/heart.png"

    deadHeartImg = new Image()
    deadHeartImg.src = "Images/deadHeart.png"

    shipImg = new Image()
    shipImg.src = "Images/ship.png"
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)
    }
    createAliens()
    createKingAliens()
    requestAnimationFrame(update)
    document.addEventListener("keydown", moveShip)
    document.addEventListener("keyup", shoot)
}

function reload() {
    location.reload()
}

function update() {
    let hearts = ''
    requestAnimationFrame(update)

    if (gameOver) {
        hearts = `
        <img src="Images/deadHeart.png" id="hearts"/>
        <img src="Images/deadHeart.png" id="hearts"/>
        <img src="Images/deadHeart.png" id="hearts"/>
        `
        healthBar.innerHTML = hearts
        outerDiv.innerHTML = `
        <div id="gameOverDiv"> Game Over</div>`
        return
    }

    context.clearRect(0, 0, board.width, board.height)
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)

    //hearts
    for (let i = 0; i < (3 - shipHearts); i++) {
        hearts += `<img src="Images/deadHeart.png" id="hearts"/>`
    }

    for (let i = 1; i <= shipHearts; i++) {
        hearts += `<img src="Images/heart.png" id="hearts"/>`
    }
    console.log(hearts)
    healthBar.innerHTML = hearts

    wavePara.innerText = `Wave ${waveNum}`

    //alien
    for (let i = 0; i < alienArray.length; i++) {
        let alienImage = alienImgGenerator()
        let alien = alienArray[i]
        if (alien.alive) {
            alien.x += alienVelocityX

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1
                alien.x += alienVelocityX * 2

                //move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight
                }
            }
            context.drawImage(alienImage, alien.x, alien.y, alien.width, alien.height)

            if (alien.y >= ship.y) {
                gameOver = true
            }
        }
    }

    //king alien
    for (let i = 0; i < kingAlienArray.length; i++) {
        let kingAlienImage = kingAlienImgGenerator()
        let kingAlien = kingAlienArray[i]
        if (kingAlien.alive) {
            kingAlien.x += kingAlienVelocityX
            //if alien touches the borders
            if (kingAlien.x + kingAlien.width >= board.width || kingAlien.x <= 0) {
                kingAlienVelocityX *= -1
                kingAlien.x += kingAlienVelocityX * 2

                //move all aliens up by one row
                for (let j = 0; j < kingAlienArray.length; j++) {
                    kingAlienArray[j].y += kingAlienHeight
                }
            }
            context.drawImage(kingAlienImage, kingAlien.x, kingAlien.y, kingAlien.width, kingAlien.height)

            if (kingAlien.y >= ship.y) {
                gameOver = true
            }
        }
    }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i]
        bullet.y += bulletVelocityY
        context.fillStyle = "white"
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j]
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true
                alien.alive = false
                alienCount--
                score += 100
            }
        }

        for (let j = 0; j < kingAlienArray.length; j++) {
            let kingAlien = kingAlienArray[j]
            if (!bullet.used && kingAlien.alive && detectCollision(bullet, kingAlien)) {
                bullet.used = true
                kingAlien.alive = false
                kingAlienCount--
                score += 100
            }
        }
    }

    //alien bullets    
    for (let i = 0; i < alienBulletArray.length; i++) {
        let alienBullet = alienBulletArray[i]
        alienBullet.y += alienBulletVelocityY
        context.fillStyle = "blue"
        context.fillRect(alienBullet.x, alienBullet.y, alienBullet.width, alienBullet.height)

        if (!alienBullet.used && detectCollision(alienBullet, ship)) {
            console.log('collision')
            alienBullet.used = true
            shipHearts--
        }

        if (shipHearts === 0) {
            gameOver = true
        }
    }


    //clear bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift() //removes the first element of the array
    }

    while (alienBulletArray.length > 0 && (alienBulletArray[0].used || alienBulletArray[0].y < 0)) {
        alienBulletArray.shift() //removes the first element of the array
    }

    //next level
    if (alienCount == 0) {
        //increase the number of aliens in columns and rows by 1
        waveNum++
        score += alienColumns * alienRows * 100 //bonus points :)
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2) //cap at 16/2 -2 = 6
        alienRows = Math.min(alienRows + 1, rows - 4)  //cap at 16-4 = 12
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2 //increase the alien movement speed towards the right
        }
        else {
            alienVelocityX -= 0.2 //increase the alien movement speed towards the left
        }
        alienArray = []
        bulletArray = []
        createAliens()
    }

    if (kingAlienCount == 0) {
        //increase the number of aliens in columns and rows by 1\
        waveNum++
        score += kingAlienColumns * kingAlienRows * 100 //bonus points :)
        kingAlienColumns = Math.min(kingAlienColumns + 0.5, columns / 2 - 2) //cap at 16/2 -2 = 6
        kingAlienRows = Math.min(kingAlienRows + 1, rows - 4)  //cap at 16-4 = 12
        if (kingAlienVelocityX > 0) {
            kingAlienVelocityX += 0.2 //increase the alien movement speed towards the right
        }
        else {
            kingAlienVelocityX -= 0.2 //increase the alien movement speed towards the left
        }
        kingAlienArray = []
        bulletArray = []
        createKingAliens()
    }

    //score
    scorePara.innerHTML = `<p>${score}</p>`
}

function moveShip(e) {
    if (gameOver) {
        return
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien)
        }
    }
    alienCount = alienArray.length
}

function createKingAliens() {
    for (let c = 0; c < kingAlienColumns; c++) {
        for (let r = 0; r < kingAlienRows; r++) {
            let kingAlien = {
                img: kingAlienImg,
                x: kingAlienX + c * kingAlienWidth,
                y: kingAlienY + r * kingAlienHeight,
                width: kingAlienWidth,
                height: kingAlienHeight,
                alive: true
            }
            kingAlienArray.push(kingAlien)
        }
    }
    kingAlienCount = kingAlienArray.length
}

function kingAlienImgGenerator() {
    kingAlienImg = new Image()
    kingAlienImg.src = "Images/king-alien.png"
    return kingAlienImg
}

function alienImgGenerator() {
    let colors = ['cyan', 'white', 'magenta', 'yellow']

    alienImg = new Image()
    alienImg.src = `Images/alien-${colors[Math.floor((Math.random() * colors.length))]}.png`
    return alienImg
}

async function shoot(e) {
    if (gameOver) {
        if (e.code == "Space") {
            reload()
        }
        else {
            return
        }
    }

    if (e.code == "Space") {
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        }

        bulletArray.push(bullet)

    // Crazy Shooting mode
        // let bullet2 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet3 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet4 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet5 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet6 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet7 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet8 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet9 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet10 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet11 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet12 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet13 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet14 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet15 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet16 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet17 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet18 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet19 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet20 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet21 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet22 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet23 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet24 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet25 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet26 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet27 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet28 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet29 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }

        // let bullet30 = {
        //     x: ship.x + shipWidth * 15 / 32,
        //     y: ship.y,
        //     width: tileSize / 8,
        //     height: tileSize / 2,
        //     used: false
        // }
        // await sleep(500)
        // bulletArray.push(bullet2)
        // await sleep(500)
        // bulletArray.push(bullet3)
        // await sleep(500)
        // bulletArray.push(bullet4)
        // await sleep(500)
        // bulletArray.push(bullet5)
        // await sleep(500)
        // bulletArray.push(bullet6)
        // await sleep(500)
        // bulletArray.push(bullet7)
        // await sleep(500)
        // bulletArray.push(bullet8)
        // await sleep(500)
        // bulletArray.push(bullet9)
        // await sleep(500)
        // bulletArray.push(bullet10)
        // await sleep(500)
        // bulletArray.push(bullet11)
        // await sleep(500)
        // bulletArray.push(bullet12)
        // await sleep(500)
        // bulletArray.push(bullet13)
        // await sleep(500)
        // bulletArray.push(bullet14)
        // await sleep(500)
        // bulletArray.push(bullet15)
        // await sleep(500)
        // bulletArray.push(bullet16)
        // await sleep(500)
        // bulletArray.push(bullet17)
        // await sleep(500)
        // bulletArray.push(bullet18)
        // await sleep(500)
        // bulletArray.push(bullet19)
        // await sleep(500)
        // bulletArray.push(bullet20)
        // await sleep(500)
        // bulletArray.push(bullet21)
        // await sleep(500)
        // bulletArray.push(bullet22)
        // await sleep(500)
        // bulletArray.push(bullet23)
        // await sleep(500)
        // bulletArray.push(bullet24)
        // await sleep(500)
        // bulletArray.push(bullet25)
        // await sleep(500)
        // bulletArray.push(bullet26)
        // await sleep(500)
        // bulletArray.push(bullet27)
        // await sleep(500)
        // bulletArray.push(bullet28)
        // await sleep(500)
        // bulletArray.push(bullet29)
        // await sleep(500)
        // bulletArray.push(bullet30)
    }
}

function alienShoot() {
    for (let i = 0; i < kingAlienArray.length; i++) {
        let kingAlien = kingAlienArray[i]
        if (kingAlien.alive) {
            let alienBullet = {
                x: kingAlien.x + kingAlienWidth * 15 / 32,
                y: kingAlien.y,
                width: tileSize / 8,
                height: tileSize / 2,
                used: false
            }
            alienBulletArray.push(alienBullet)
        }
    }

}

setInterval(alienShoot, 5000)

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y    //a's bottom left corner passes b's top left corner
}