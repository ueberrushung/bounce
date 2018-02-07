// Initial Setup
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// Variables
const mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

const colors = ['#2185C5', '#7ECEFD', '#FFF6E5', '#FF7F66']

// Event Listeners
addEventListener('mousemove', event => {
    mouse.x = event.clientX
    mouse.y = event.clientY
})

addEventListener('resize', () => {
    canvas.width = innerWidth
    canvas.height = innerHeight

    init()
})

// Utility Functions
function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}
function distance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}
// Objects
function Particle(x, y, radius, color) {
    this.x = x
    this.y = y
    this.velocity = {
        x: (Math.random() - .5) * 5,
        y: (Math.random() - .5) * 5
    }
    this.radius = radius
    this.color = color
    this.opacity = 0;
    this.mass = 1;
} 

Particle.prototype.update = function(particles) {
   this.draw()

    for (let i = 0; i < particles.length; i++) {
      
        if(this === particles[i]) continue;
        
        if( distance(this.x,this.y, particles[i].x, particles[i].y) - this.radius * 2 < 0 ){
            resolveCollision(this, particles[i]);
        }
    }
    //x-Boundries
    if(this.x - this.radius <= 0 || this.x + this.radius >= innerWidth){
        this.velocity.x = -this.velocity.x;
    }
    //y-Boundries
    if(this.y - this.radius <= 0 || this.y + this.radius >= innerHeight){
        this.velocity.y = -this.velocity.y;
    }
    //mouse collision detection
    if (distance(mouse.x, mouse.y, this.x, this.y) < 120 && this.opacity < .2){
        this.opacity += .02;
    }
    else if(this.opacity > 0 ){
        this.opacity -= .02;
        this.opacity = Math.max(0, this.opacity);
    }
    //Move particles
    this.x += this.velocity.x;
    this.y += this.velocity.y;
} 

Particle.prototype.draw = function() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.save()
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill()
    c.restore()
    c.strokeStyle = this.color;
    c.stroke()
    c.closePath()
}

// Implementation
var particles
function init() {
    particles = []
 
    for (let i = 0; i < 400; i++) {
        let x = randomIntFromRange(radius, canvas.width - radius);
        let y = randomIntFromRange(radius, canvas.height - radius);
        const radius = 15;
        const color = randomColor(colors);
        //Spawn particles NOT on top of each other, start after initial particle 0
        if(i != 0){
            for(let j = 0; j < particles.length; j++){
                if( distance(x,y, particles[j].x, particles[j].y) - radius * 2 < 0 ){
                    x = randomIntFromRange(radius, canvas.width - radius);
                    y = randomIntFromRange(radius, canvas.height - radius);
                    //restart loop
                    j= -1;
                }
            }
        }

        particles.push(new Particle(x,y,radius,color));
    }
    console.log(particles.length)
}

// Animation Loop

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(function(particle) {
        particle.update(particles);
    })
 


 
}

init()
animate()
