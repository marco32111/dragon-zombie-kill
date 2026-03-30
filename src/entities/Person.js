import Phaser from 'phaser';

export default class Person extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setBounce(0.1);
        this.setCollideWorldBounds(true);

        // Person appearance (blue rectangle)
        this.setFillStyle(0x0099ff);
        this.displayWidth = 15;
        this.displayHeight = 30;

        scene.people.add(this);
    }
}