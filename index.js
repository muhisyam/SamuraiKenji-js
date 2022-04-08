const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: 'assets/background.png'
})

const shop = new Sprite({
  position: {
    x: 630,
    y: 128
  },
  imageSrc: 'assets/shop.png',
  scale: 2.75,
  framesMax: 6
})



// player spawning coord, moving, attackBoxOffset, rendering images
const player = new Fighter ({
  position: { 
    x: 100, 
    y: 0 
  },  
  velocity: { 
    x: 0, 
    y: 0
  },
  offset: { 
    x: 0,
    y: 0
  },
  imageSrc: 'assets/samurai-mack/Idle.png',
  scale: 2.5,
  framesMax: 8,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: 'assets/samurai-mack/Idle.png',
      framesMax: 8
    }, 
    run: {
      imageSrc: 'assets/samurai-mack/Run.png',
      framesMax: 8
    }, 
    jump: {
      imageSrc: 'assets/samurai-mack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: 'assets/samurai-mack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: 'assets/samurai-mack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: 'assets/samurai-mack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: 'assets/samurai-mack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 150,
    height: 50
  }
})



// enemy spawning coord, moving, attackBoxOffset, rendering images
const enemy = new Fighter ({
  position: { 
    x: 850, 
    y: 100 
  },
  velocity: { 
    x: 0, 
    y: 0
  },
  offset: { 
    x: -50,
    y: 0
  },
  color: 'pink',
  imageSrc: 'assets/kenji/Idle.png',
  scale: 2.5,
  framesMax: 4,
  offset: {
    x: 215,
    y: 170
  },
  sprites: {
    idle: {
      imageSrc: 'assets/kenji/Idle.png',
      framesMax: 4
    }, 
    run: {
      imageSrc: 'assets/kenji/Run.png',
      framesMax: 8
    }, 
    jump: {
      imageSrc: 'assets/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: 'assets/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: 'assets/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: 'assets/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: 'assets/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -160,
      y: 50
    },
    width: 150,
    height: 50
  }
})

// functional movement keys for both fighter
const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

// timer function
decreaseTime()

function animate() {
  window.requestAnimationFrame(animate)

  c.fillStyle = 'black' //black background
  c.fillRect(0, 0, canvas.width, canvas.height)

  background.update()
  shop.update()
  
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0


  
  // player movement
  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  }else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  }else {
    player.switchSprite('idle')
  }  

  // player jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  }else if (player.velocity.y > 0){
    player.switchSprite('fall')
  }



  // enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  }else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  }else {
    enemy.switchSprite('idle')
  }  

  // enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  }else if (enemy.velocity.y > 0){
    enemy.switchSprite('fall')
  }



  // detect for collision on player and enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking && player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    // animate decreasing enemy health
    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }



  // detect for collision on enemy and player gets hits
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking && player.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    // animate decreasing player health
    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  } 

  // if enemy misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }



  //end game based on health
  if (enemy.health <= 0 || player.health <= 0){
    determineWinner({ player, enemy, timerId })
  }
}

animate()



// moving the character
window.addEventListener('keydown', (event) => {
  if (!player.death) {
    switch (event.key) {
      // player keys movement
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -15
        break
      case ' ':
        player.attack()
        break
    }
  }


  if (!enemy.death) {
    switch (event.key) {
      // enemy keys movement
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -15
        break
      case 'l':
        enemy.attack()
        break
    }
  }
})



// stop moving the character
window.addEventListener('keyup', (event) => {
  switch (event.key) {
    // player keys movement
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break

    // enemy keys movement
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
