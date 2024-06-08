class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    create(){
        this.text = this.add.text(25 , 50, 'Welcome to \nSnackpocalypse!', {font: '35px' , color: '#ffffff'});
        this.text2 = this.add.text(25  , 150, 'run away from the zombie \nfor long enough to win! ', {font: '25px' , color: '#ffffff'});
        this.text3 = this.add.text(25  , 200, 'press space on plants to \nregain stamina', {font: '25px' , color: '#ffffff'}); 
        this.text4 = this.add.text(25  , 250, 'press space to start!', {font: '25px' , color: '#ffffff'}); 
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('platformerScene');
        }, this);
    }
    update(){

    }
}