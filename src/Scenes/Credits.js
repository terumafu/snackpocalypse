class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
    }

    create(){
        this.text = this.add.text(50 , 50, 'Game Over!', {font: '45px' , color: '#ffffff'});
        this.text2 = this.add.text(50  , 150, 'Press R to Play Again! ', {font: '25px' , color: '#ffffff'});

    }
    update(){

    }
}