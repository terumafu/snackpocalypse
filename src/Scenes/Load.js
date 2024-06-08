class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        this.load.atlasXML("foliage", "foliagePack_default.png", "foliagePack_default.xml");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");   
        this.load.image("backgroundsimage", "tilemap-backgrounds.png");                      // Packed tilemap
        this.load.tilemapTiledJSON("backgrounds", "backgroundtiles.tmj");   // Tilemap in JSON

        this.load.image("forest", "backgroundtiles.png");
        this.load.image("sand", "backgroundtilessand.png");
        this.load.image("snow", "backgroundtilessnow.png");
        
        this.load.image("forestground", "grassMid.png");
        this.load.image("snowground", "snowMid.png");
        this.load.image("sandground", "sandMid.png");
        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'zomwalk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 3,
                end: 2,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}