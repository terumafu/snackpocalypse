class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
       
        
        this.PARTICLE_VELOCITY = 50;
        
        this.imagevis = 0;
        
        this.speedtimer = 0;
        this.bgvisible = 0;
        this.bgnext = 1;
        this.bgtimer = 0;
        this.currground = this.bgvisible;
        this.groundqueue = new Queue();
        this.SCALE = 4.0;
        this.speed = 0.25 * this.SCALE/2;

        this.treequeue = new Queue();
        this.treetimer = Math.floor(Math.random() * 50) + 25;

        this.foodqueue = new Queue();
        this.foodtimer = Math.floor(Math.random() * 50) + 50;
        this.stamina = 100;
        this.eatingtimer = 0;
        this.regentimer = 0;

        this.distance = 0;
        
    }

    create() {
        this.region = [
            {
                'name':'sand',
                'sprites':{
                    tree:['foliagePack_016.png', 'foliagePack_015.png', 'foliagePack_013.png', 'foliagePack_012.png', 'foliagePack_014.png', 'foliagePack_017.png'],
                    ground: 'sandground',
                    foliage: 'foliagePack_062.png'
                }
            },{
                'name':'forest',
                'sprites':{
                    tree:['foliagePack_007.png', 'foliagePack_008.png', 'foliagePack_009.png', 'foliagePack_010.png', 'foliagePack_011.png', 'foliagePack_006.png'],
                    ground: 'forestground',
                    foliage: 'foliagePack_003.png'
                }
            },
            {
                'name':'snow',
                'sprites':{
                    tree:['foliagePack_030.png', 'foliagePack_032.png', 'foliagePack_025.png', 'foliagePack_026.png', 'foliagePack_027.png', 'foliagePack_029.png'],
                    ground: 'snowground'
                }
            }
        ]
        
        let i = 0;
        this.imagearr = [];
        //console.log(this.region[0].sprites.tree);
        for(let tree of this.region[2].sprites.tree){
            
            this.imagearr[i] = this.add.sprite(30,30,'foliage',tree);
            this.imagearr[i].setScale(0.2);
            this.imagearr[i].visible = false;
            i++;
        }
        
        this.input.keyboard.on('keydown-P', () => {
            this.imagevis++;
            if(this.imagevis == this.imagearr.length){
                this.imagevis = 0;
            }
            if(this.imagevis - 1 == -1){
                this.imagearr[this.imagearr.length - 1].visible = false;
            }
            else{
                this.imagearr[this.imagevis - 1].visible = false;
            }
            this.imagearr[this.imagevis].visible = true;
        }, this);
        this.bgsand = this.add.image(0, 36* this.SCALE, 'sand');
        this.bgsand.setScale(this.SCALE);

        this.bgforest = this.add.image(0, 36* this.SCALE, 'forest');
        this.bgforest.setScale(this.SCALE);
        
        this.bgsnow = this.add.image(0, 36 * this.SCALE, 'snow');
        this.bgsnow.setScale(this.SCALE);

        this.bggroup = [this.bgsand,this.bgforest, this.bgsnow];

        for(let bg of this.bggroup){
            bg.visible = false;
        }
        this.bggroup[this.bgvisible].visible = true;
        
        //debug function
        /*
        this.input.keyboard.on('keydown-O', () => {
            this.changebackground();
            
        }, this);*/
        
        
    
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(50*this.SCALE, 45*this.SCALE, "platformer_characters", "tile_0000.png").setImmovable(true);
        my.sprite.player.body.setAllowGravity(false);
        my.sprite.player.setScale(this.SCALE);
        my.sprite.player.setDepth(10);
        
        //set up zombie
        this.zombie = this.physics.add.sprite(15, 45*this.SCALE, "platformer_characters", "tile_0002.png").setImmovable(true);
        this.zombie.body.setAllowGravity(false);
        this.zombie.setScale(this.SCALE);
        this.zombie.flipX = true;
        this.zombie.anims.play('zomwalk');
        
        //set up rectangles to use as resource bars
        this.staminabar = this.add.rectangle(100,260,150,15,0xffb640,1);
        console.log(this.staminabar);
        this.staminabar.setDepth(10);

        this.eatingbar = this.add.rectangle(150, 115,0,15, 0xffb640,1);
        this.eatingbar.setDepth(10);
        
        this.distbar = this.add.rectangle(96*4/2, 15,96*4 -40,15, 0xff0000,1);
        this.distbar.setDepth(10);

        
        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

       
          // movement vfx

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.01*this.SCALE, end: 0.05 *this.SCALE },
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 20,
            lifespan: 350,
            frequency: 40,
            // TODO: Try: gravityY: -400,
            // gravityX: 500,
            alpha: {start: 1, end: 0.1}, 
        });

        my.vfx.walking.stop();

        //create a temporary floor for when the player loads in
        for(let i = 0; i < 12; i++){
            let tempsprite = this.add.sprite(i*32 + 2, 262, this.region[this.currground].sprites.ground);
            
            tempsprite.setDepth(2);
            this.groundqueue.enqueue(tempsprite);
        }
        this.spawnground();
        this.spawntree();
        
    }

    update() {
        //keep spawning ground to prevent gaps
        if(this.groundqueue.printQueue[this.groundqueue.backIndex - 1].x <= 96*4 - 34){
            this.spawnground();
        }
        //check game end
        if(this.zombie.x >= 125  ){
            this.scene.restart();
            this.scene.start('creditsScene');
        }
        
        //if space is down the player does not move
        if(cursors.space.isDown){
            this.stamina+= 0.1;
            this.staminabar.width = this.stamina/100 * 150;
            this.zombie.x+= this.speed * this.SCALE/1.5; 
            
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            
            my.vfx.walking.stop();
            this.speed = 0.25 *this.SCALE/2;
            this.speedtimer = 0;

            //check for if the player has stopped moving on a plant
            for(let i = this.foodqueue.frontIndex; i < this.foodqueue.backIndex; i++){
                
                if(this.foodqueue.printQueue[i].x > 96*2 - 50 && this.foodqueue.printQueue[i].x < 96*2 + 60){
                    //start eating the plant, change the eating progress bar accordingly
                    this.eatingtimer++;
                    console.log(this.eatingtimer);
                    this.eatingbar.width = this.eatingtimer * 2;
                    if(this.eatingtimer >= 50){
                        //increase stamina once food is eaten
                        this.stamina += 20;
                        if(this.stamina > 100){
                            this.stamina = 100;
                        }
                        this.staminabar.width = this.stamina/100 * 150;
                        this.eatingbar.width = 0;
                        this.foodqueue.printQueue[i].destroy();
                        this.foodqueue.printQueue[i].x = 0;
                    }
                    
                }
            }
            
        }else{
            //this all occurs when the space bar is not held
            this.distance+= 0.15;

            if(this.distbar.width >= 0){
            this.distbar.width = 96*4 - 40 - this.distance;
            }else{
                //if distance bar is 0, the game is over, the player wins
                this.scene.restart();
                this.scene.start('winScene');
            }
            if(this.zombie.x >= 15){
                this.zombie.x-=0.5;
            }
            else if(this.zombie.x <= -100){
                this.zombie.x = -100;
            }
            if(this.stamina >= 0){
            this.stamina -= 0.25 * this.speed;
            
            }else{
                //if the player runs out of stamina they need to catch their breath, they will most likely die
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
            
                my.vfx.walking.stop();
                this.regentimer++;
                this.staminabar.width = 150
                if(this.regentimer % 25 == 0){
                    this.staminabar.alpha = !this.staminabar.alpha;
                }
                if(this.regentimer >= 250){
                    this.stamina = 100;
                    this.regentimer = 0;
                }
                this.zombie.x+= this.speed * this.SCALE/1.5;
                return;
            }
            this.staminabar.width = this.stamina/100 * 150;

            this.eatingbar.width = 0;
            this.eatingtimer = 0;
            //if the region is snowy, no food spawns
            if(this.currground != 2){
                
                this.foodtimer -= this.speed;
                if(this.foodtimer <= 0){
                    this.spawnfood();
                    this.foodtimer = Math.floor(Math.random() * 50) + 50;
                }
            }
            this.treetimer -= this.speed;
            
            if(this.treetimer <= 0){
                this.spawntree();
                this.treetimer = Math.floor(Math.random() * 50) + 25;
            }
            this.bgtimer+= this.speed;
            //checks if its time to change the area, snowy areas are shorter
            if(this.bgtimer >= 500 || this.bgtimer >= 300 && this.currground == 2){
                this.changebackground();
                this.bgtimer = 0;
            }
            this.speedtimer++;
            if(this.speedtimer >= 200){
                this.speed = 0.35 * this.SCALE/2;
                this.zombie.x-=0.5;
            }
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            
            my.vfx.walking.start();
            my.vfx.walking.setX(-15*this.SCALE);
            my.vfx.walking.setParticleGravity(-500*this.SCALE, 0);
            //do background movement
            for(let bg of this.bggroup){
                
                bg.x -= this.speed *this.SCALE;
            }
            if(this.bggroup[0].x <= 0){
                for(let bg of this.bggroup){
                   
                    bg.x += 192/2 * this.SCALE;
                }
            
            }
            for(let i = this.groundqueue.frontIndex; i < this.groundqueue.backIndex; i++){
                
                this.groundqueue.printQueue[i].x -= 4;
            }
            if(this.groundqueue.peek() && this.groundqueue.peek().x <= -34){
                this.groundqueue.peek().destroy();
                this.groundqueue.dequeue();
            
            }

            for(let i = this.treequeue.frontIndex; i < this.treequeue.backIndex; i++){
                
                this.treequeue.printQueue[i].x -= 4;
            }
            
            if(this.treequeue.peek() && this.treequeue.peek().x <= -100){
                this.treequeue.peek().destroy();
                this.treequeue.dequeue();
            
            }

            for(let i = this.foodqueue.frontIndex; i < this.foodqueue.backIndex; i++){
            
                this.foodqueue.printQueue[i].x -= 4;
            }
            if(this.foodqueue.peek() && this.foodqueue.peek().x <= -100){
                this.foodqueue.peek().destroy();
                this.foodqueue.dequeue();
            
            }
        }
        
    }
    
    changebackground(){
        
            var tween = this.tweens.add({
                targets: [ this.bggroup[this.bgvisible]],
                alpha: {
                    from: 1, 
                    to: 0
                },
                
                duration: 750,
                //ease: 'Sine.easeInOut',
                yoyo: false
            })
            //this.bggroup[this.bgvisible].visible = false;
            this.bggroup[this.bgvisible].setDepth(0);
            this.bggroup[this.bgnext].setDepth(-1);
            this.bggroup[this.bgnext].visible = true;
            this.currground = this.bgnext;
            tween.on('complete', ()=>{
                this.bggroup[this.bgvisible].visible = false;
                this.tweens.add({
                    targets: [ this.bggroup[this.bgvisible]],
                    alpha: {
                        from: 0, 
                        to: 1
                    },
                    
                    duration: 1,
                    //ease: 'Sine.easeInOut',
                    yoyo: false
                })
                this.bgvisible = this.bgnext;
                
                this.bgnext = Math.pow(-1,Math.floor(Math.random()*(2)-1)) + this.bgnext;
                if(this.bgnext < 0){
                    this.bgnext = this.bggroup.length-1; 
                }else if(this.bgnext > this.bggroup.length-1){
                    this.bgnext = 0;
                }
                this.bggroup[this.bgvisible].visible = true;
                
            });
            

    }
    spawnground(){
        let tempsprite = this.add.sprite(96*4+ 34, 262, this.region[this.currground].sprites.ground);
        
        tempsprite.setDepth(2);
        this.groundqueue.enqueue(tempsprite);
        
        //console.log("currground " + this.currground);
        //console.log("bg " + this.bgvisible);
    }
    spawntree(){
        let tempnum = Math.floor(Math.random() * 6);
        let tempsprite = this.add.sprite(96*4 + 34, 130,'foliage', this.region[this.currground].sprites.tree[tempnum]);
        
        this.treequeue.enqueue(tempsprite);
        //console.log(this.treequeue.frontIndex)

    }
    spawnfood(){
        let tempsprite = this.add.sprite(96*4+ 34, 262-50, 'foliage',this.region[this.currground].sprites.foliage);
        tempsprite.setDepth(1);
        this.foodqueue.enqueue(tempsprite);
    }
}