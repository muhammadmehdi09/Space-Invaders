//board
let tileSize = 24
let rows = (window.innerHeight - 17) / 24
let columns = (window.innerWidth - 17) / 24

let board
let context
let waveNum

//ship
let shipWidth = tileSize * 3
let shipHeight = tileSize * 2.5
let shipX = tileSize * columns / 2 - tileSize
let shipY = tileSize * rows - tileSize * 2
let shipHearts
let heartImg
let deadHeartImg

let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
}

let shipImg
let shipVelocityX = tileSize

let alienArray = []
let alienWidth = tileSize * 2.5
let alienHeight = tileSize * 2
let alienX = tileSize
let alienY = tileSize

let alienRows = 3
let alienColumns = 7
let alienVelocityX = 1.2

let bulletArray = []
let bulletVelocityY = -10

let alienBulletArray = []
let alienBulletVelocityY = 10

let megaAlienArray = []
let megaAlienWidth = tileSize * 2
let megaAlienHeight = tileSize * 3
let megaAlienX = tileSize
let megaAlienY = tileSize

let megaAlienRows = 1
let megaAlienColumns = 3
let megaAlienVelocityX = 1.5

let megaAlienBulletArray = []
let megaAlienBulletVelocityY = 15

let score = 0
let gameOver = false

window.onload = function () {
    waveNum = 1
    shipHearts = 3

    board = document.getElementById("board")
    board.width = window.innerWidth - 17
    board.height = window.innerHeight - 10
    context = board.getContext("2d")

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
    createMegaAliens()
    requestAnimationFrame(update)
    document.addEventListener("keydown", keyPressed)
}

function update() {
    requestAnimationFrame(update)

    if (gameOver) {
        board.width = window.innerWidth - 17
        board.height = window.innerHeight - 10
        rows = (window.innerHeight - 17) / 24
        ship.y = tileSize * rows - tileSize * 2 - 20
        context.clearRect(0, 0, board.width, board.height)
        for (let i = 0; i < (3 - shipHearts); i++) {
            context.drawImage(deadHeartImg, 1750 + (i * 50), 10, 40, 40)
        }
        context.fillStyle = "white";
        context.font = "26px courier";
        context.fillText(`Wave ${waveNum}`, 1, ship.y + 70);

        context.fillStyle = "white";
        context.font = "26px courier";
        context.fillText(score, -3, 30);

        context.fillStyle = "red";
        context.font = `${board.width / 18}px bold courier`;
        context.fillText("GAME OVER", (board.width / 2) - (board.width / 6), board.height / 2);
        return
    }
    board.width = window.innerWidth - 17
    board.height = window.innerHeight - 10
    rows = (window.innerHeight - 17) / 24
    ship.y = tileSize * rows - tileSize * 2 - 20
    context.clearRect(0, 0, board.width, board.height)
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)

    //hearts
    for (let i = 0; i < shipHearts; i++) {
        context.drawImage(heartImg, 1850 - (i * 50), 10, 40, 40)
    }

    for (let i = 0; i < (3 - shipHearts); i++) {
        context.drawImage(deadHeartImg, 1750 + (i * 50), 10, 40, 40)
    }

    //wave
    context.fillStyle = "white";
    context.font = "26px courier";
    context.fillText(`Wave ${waveNum}`, 1, ship.y + 70);

    //alien
    for (let i = 0; i < alienArray.length; i++) {
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
            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height)

            if (alien.y >= ship.y) {
                gameOver = true
            }
        }
    }

    //mega alien
    // for (let i = 0; i < megaAlienArray.length; i++) {
    //     let megaAlien = megaAlienArray[i]
    //     if (megaAlien.alive) {
    //         megaAlien.x += megaAlienVelocityX
    //         //if alien touches the borders
    //         if (megaAlien.x + megaAlien.width >= board.width || megaAlien.x <= 0) {
    //             megaAlienVelocityX *= -1
    //             megaAlien.x += megaAlienVelocityX * 2

    //             //move all aliens up by one row
    //             for (let j = 0; j < megaAlienArray.length; j++) {
    //                 megaAlienArray[j].y += megaAlienHeight
    //             }
    //         }
    //         context.drawImage(megaAlien.img, megaAlien.x, megaAlien.y, megaAlien.width, megaAlien.height)

    //         if (megaAlien.y >= ship.y) {
    //             gameOver = true
    //         }
    //     }
    // }

    //bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i]
        bullet.y += bulletVelocityY
        context.fillStyle = "white"
        if (!bullet.used) {
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
        }

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j]
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bulletArray.splice(j, 1)
                bullet.used = true
                alien.alive = false
                alienArray.splice(j, 1)
                score += 100
            }
        }

        //bullet collision with alien bullet
        for (let j = 0; j < alienBulletArray.length; j++) {
            let alienBullet = alienBulletArray[j]
            if (!bullet.used && !alienBullet.used && detectCollision(bullet, alienBullet)) {
                bulletArray.splice(j, 1)
                bullet.used = true
                alienBullet.used = true
            }
        }
    }

    //alien bullets    
    for (let i = 0; i < alienBulletArray.length; i++) {
        let alienBullet = alienBulletArray[i]
        alienBullet.y += alienBulletVelocityY
        context.fillStyle = "blue"
        if (!alienBullet.used) {
            context.fillRect(alienBullet.x, alienBullet.y, alienBullet.width, alienBullet.height)
        }
        if (!alienBullet.used && detectCollision(alienBullet, ship)) {
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

    if (alienArray.length == 0) {
        //increase the number of aliens in columns and rows by 1\
        waveNum++
        score += alienColumns * alienRows * 100 //bonus points :)
        alienColumns = Math.min(alienColumns + 0.5, columns / 2 - 2) //cap at 16/2 -2 = 6
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

    //score
    context.fillStyle = "white";
    context.font = "26px courier";
    context.fillText(score, -3, 30);

}

function createAliens() {
    let colors = ["grey", "blue", "red"]
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alienImg = new Image
            let color = colors[Math.floor((Math.random() * colors.length))]
            alienImg.src = `./Images/${color}-alien1.png`
            let alien = {
                color: color,
                img: alienImg,
                x: alienX + 1.2 * c * alienWidth,
                y: alienY + 1.2 * r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            }
            alienArray.push(alien)
        }
    }
}

function createMegaAliens() {
    for (let c = 0; c < megaAlienColumns; c++) {
        for (let r = 0; r < megaAlienRows; r++) {
            let megaAlienImg = new Image
            megaAlienImg.src = `./Images/aliens.png`
            let megaAlien = {
                img: megaAlienImg,
                x: megaAlienX + 1.2 * c * megaAlienWidth,
                y: megaAlienY + 1.2 * r * megaAlienHeight,
                width: megaAlienWidth,
                height: megaAlienHeight,
                alive: true
            }
            megaAlienArray.push(megaAlien)
        }
    }
}

async function keyPressed(key) {
    if (gameOver) {
        if (key.code == "Space") {
            location.reload()
        }
        else {
            return
        }
    }

    else if (key.code == "Space") {
        const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: 8,
            height: 20,
            used: false
        };
        // for (let i = 1; i <= 1; i++) {
        //     for (let j = 1; j <= 1; j++) {
        //         let bullet = {
        //             x: ship.x + shipWidth * 15 / 32,
        //             y: ship.y,
        //             width: 8,
        //             height: 20,
        //             used: false
        //         };
        //         for (let k = 1; k <= 1; k++) {
        //             bulletArray.push(bullet);
        //         }
        //     }
        //     await sleep(500);
        // }

        if (bulletArray.length === 0) {
            bulletArray.push(bullet)
        }

        else if (bulletArray[0].y > (board.height / 2)) {
            return;
        }

        else if (bulletArray[0].y < (board.height / 2)) {
            bulletArray[1] = bulletArray[0]
            bulletArray[0] = bullet
        }
    }

    else if (key.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX //move left one tile
    }

    else if (key.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX //move right one tile
    }
}

function alienShoot() {
    for (let i = 0; i < alienArray.length / 3; i++) {
        let alien = alienArray[Math.floor((Math.random() * alienArray.length))]
        let alienBullet = {
            x: alien.x + alienWidth * 15 / 32,
            y: alien.y,
            width: 8,
            height: 20,
            used: false
        }
        alienBulletArray.push(alienBullet)
    }
}

function megaAlienShoot() {
    for (let i = 0; i < alienArray.length / 3; i++) {
        let alien = alienArray[Math.floor((Math.random() * alienArray.length))]
        let alienBullet = {
            x: alien.x + alienWidth * 15 / 32,
            y: alien.y,
            width: 8,
            height: 20,
            used: false
        }
        alienBulletArray.push(alienBullet)
    }
}

function imageChanger() {
    for (let i = 0; i < alienArray.length; i++) {
        let colors = ["grey", "blue", "red"]
        let alien = alienArray[i]
        let numbers = ["1", "2"]
        let color = colors[Math.floor((Math.random() * colors.length))]
        alien.img.src = `./Images/${color}-alien${numbers[Math.floor((Math.random() * numbers.length))]}.png`
    }
}

setInterval(imageChanger, 300)
setInterval(alienShoot, 3000)

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
        a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y    //a's bottom left corner passes b's top left corner
}  