class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        
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
            //console.log(this.imagevis);
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
        
        
        this.input.keyboard.on('keydown-O', () => {
            this.changebackground();
            
        }, this);
        
        
        
        
        //this.map = this.add.tilemap("backgrounds", 24, 24, 4, 3);

        //this.tileset = this.map.addTilesetImage("tilemap-backgrounds", "backgroundsimage");
        /*
        this.snowLayer = this.map.createLayer("snow", this.tileset, 0, 0);
        this.snowLayer.visible = false;
        this.sandLayer = this.map.createLayer("sand", this.tileset, 0, 0);
        this.sandLayer.visible = false;
        this.forestLayer = this.map.createLayer("forest", this.tileset, 0, 0);
        //this.forestLayer.visible = false;
        */


        

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(50*this.SCALE, 45*this.SCALE, "platformer_characters", "tile_0000.png").setImmovable(true);
        my.sprite.player.body.setAllowGravity(false);
        my.sprite.player.setScale(this.SCALE);
        my.sprite.player.setDepth(10);
        // Enable collision handling

        this.zombie = this.physics.add.sprite(15, 45*this.SCALE, "platformer_characters", "tile_0002.png").setImmovable(true);
        this.zombie.body.setAllowGravity(false);
        this.zombie.setScale(this.SCALE);
        this.zombie.flipX = true;
        this.zombie.anims.play('zomwalk');
        
        this.staminabar = this.add.rectangle(100,260,150,15,0xffb640,1);
        console.log(this.staminabar);
        this.staminabar.setDepth(10);

        this.eatingbar = this.add.rectangle(150, 115,0,15, 0xffb640,1);
        this.eatingbar.setDepth(10);
        
        this.distbar = this.add.rectangle(96*4/2, 15,96*4 -40,15, 0xff0000,1);
        this.distbar.setDepth(10);

        // TODO: Add coin collision handler
         // Handle collision detection with coins
         

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        // TODO: Add movement vfx here
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

        // TODO: add camera code here
        //this.cameras.main.setZoom(1);
        for(let i = 0; i < 12; i++){
            let tempsprite = this.add.sprite(i*32 + 2, 262, this.region[this.currground].sprites.ground);
            
            tempsprite.setDepth(2);
            this.groundqueue.enqueue(tempsprite);
        }
        this.spawnground();
        this.spawntree();
        
    }

    update() {
        
        if(this.groundqueue.printQueue[this.groundqueue.backIndex - 1].x <= 96*4 - 34){
            this.spawnground();
        }
        if(this.zombie.x >= 125  ){
            this.scene.restart();
            this.scene.start('creditsScene');
        }
        /*
        if(cursors.left.isDown) {
            //my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            // TODO: add particle following code here

            my.vfx.walking.start Follow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground

            

            my.vfx.walking.start();
            //my.vfx.walking.setParticleSpeed(100, 0);
            my.vfx.walking.setParticleGravity(500, 0);
            my.vfx.walking.setX(5);


        } else if(cursors.right.isDown) {*/
            //my.sprite.player.setAccelerationX(this.ACCELERATION);

        if(cursors.space.isDown){
            this.stamina+= 0.1;
            this.staminabar.width = this.stamina/100 * 150;
            this.zombie.x+= this.speed * this.SCALE/1.5; 
            
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
            this.speed = 0.25 *this.SCALE/2;
            this.speedtimer = 0;
            for(let i = this.foodqueue.frontIndex; i < this.foodqueue.backIndex; i++){
                
                if(this.foodqueue.printQueue[i].x > 96*2 - 50 && this.foodqueue.printQueue[i].x < 96*2 + 60){
                    
                    this.eatingtimer++;
                    console.log(this.eatingtimer);
                    this.eatingbar.width = this.eatingtimer * 2;
                    if(this.eatingtimer >= 50){
                        
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
            this.distance+= 0.15;
            if(this.distbar.width >= 0){
            this.distbar.width = 96*4 - 40 - this.distance;
            }else{
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
                my.sprite.player.setAccelerationX(0);
                my.sprite.player.setDragX(this.DRAG);
                my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
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
            if(this.bgtimer >= 500){
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
            // TODO: add particle following code here
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            //console.log(my.vfx.walking);
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
        
        /*}*/ if(0) {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
    }
    
    changebackground(){
        /*
            this.tweens.add({
                targets: [ this.bggroup[this.bgvisible]],
                alpha: {
                    from: 1, 
                    to: 1
                },
                
                duration: 1,
                //ease: 'Sine.easeInOut',
                yoyo: false
            })*/
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