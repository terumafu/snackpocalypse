class Win extends Phaser.Scene {
    constructor() {
        super("winScene");
    }

    create(){
        this.text = this.add.text(50 , 50, 'You Win!', {font: '45px' , color: '#ffffff'});
        this.text2 = this.add.text(50  , 150, 'Press R to Play Again! ', {font: '25px' , color: '#ffffff'});
        this.text3 = this.add.text(50  , 200, 'Game by Jerry Peng', {font: '25px' , color: '#ffffff'}); 
        this.input.keyboard.on('keydown-R', () => {
            this.scene.start('platformerScene');
        }, this);
    }
    update(){

    }
}