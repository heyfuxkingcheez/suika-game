import {
    Engine,
    Render,
    Runner,
    Bodies,
    World,
    Body,
    Events,
    collision,
} from 'matter-js';
import { FRUITS } from './fruits';

const engine = Engine.create();
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: '#F7F4C8',
        width: 620,
        height: 850,
    },
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E7B143' },
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E7B143' },
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: { fillStyle: '#E7B143' },
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    name: 'topLine',
    isStatic: true,
    isSensor: true,
    render: { fillStyle: '#E6B143' },
});

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_suika = 0;

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

function addFruit() {
    const index = Math.floor(Math.random() * 5);
    const fruit = FRUITS[index];

    const body = Bodies.circle(300, 50, fruit.radius, {
        index: index,
        isSleeping: true,
        render: {
            sprite: { texture: `${fruit.name}.png` },
        },
        restitution: 0.4,
    });

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body);
}

window.onkeydown = (event) => {
    if (disableAction) {
        return;
    }
    switch (event.code) {
        case 'ArrowLeft':
            if (interval) return;

            interval = setInterval(() => {
                if (currentBody.position.x - currentFruit.radius > 30)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x - 2,
                        y: currentBody.position.y,
                    });
            }, 5);
            break;

        case 'ArrowRight':
            if (interval) return;

            interval = setInterval(() => {
                if (currentBody.position.x + currentFruit.radius < 590)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x + 2,
                        y: currentBody.position.y,
                    });
            }, 5);

            break;

        case 'Space':
            currentBody.isSleeping = false;
            disableAction = true;

            setTimeout(() => {
                addFruit();
                disableAction = false;
            }, 500);
            break;
    }
};

window.onkeyup = (event) => {
    switch (event.code) {
        case 'ArrowLeft':
            clearInterval(interval);
            interval = null;
        case 'ArrowRight':
            clearInterval(interval);
            interval = null;
    }
};

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
            const index = collision.bodyA.index;

            if (index === FRUITS.length - 1) {
                return;
            }

            World.remove(world, [collision.bodyA, collision.bodyB]);

            const newFruit = FRUITS[index + 1];

            const newBody = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y,
                newFruit.radius,
                {
                    render: { sprite: { texture: `${newFruit.name}.png` } },
                    index: index + 1,
                }
            );

            World.add(world, newBody);

            if (newFruit === FRUITS[9]) {
                num_suika += 1;
            }
        }

        if (
            !disableAction &&
            (collision.bodyA.name === 'topLine' ||
                collision.bodyB.name === 'topLine')
        ) {
            alert('game over');
            window.location.reload();
        }
        if (num_suika === 2) {
            alert('VICTORY!');
            window.location.reload();
        }
    });
});

window.addEventListener('keydown', (e) => console.log(e));

addFruit();
