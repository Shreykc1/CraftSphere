import * as THREE from 'three';
const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const texture = {
  devil: loadTexture('textures/devil.png'),
};

export class Devil {
  constructor(scene, world, player) {
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.geometry = new THREE.BoxGeometry(1, 2, 1); // Adjust size as needed
    this.material = new THREE.MeshLambertMaterial({ map: texture.devil }); // Red color
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.maxHealth = 50;
    this.health = this.maxHealth;
    this.damage = 10; // Amount of damage the devil inflicts
    this.attackCooldown = 2; // Time in seconds between attacks
    this.lastAttackTime = 0; // Time of the last attack
    this.distanceCheckInterval = 0.5; // Check distance every 0.5 seconds
    this.lastDistanceCheckTime = 0;

    // Initial position (random within the world)
    this.mesh.position.set(
      Math.random() * 64, // Adjust range as needed
      2, // Keep it above ground
      Math.random() * 64
    );

    this.scene.add(this.mesh);
    this.updateHealthBar(); // Initialize health bar
  }

  update(dt) {
    // Check if player or player position is null
    if (!this.player || !this.player.position || !this.mesh) {
      return; // Exit the function if player, position, or mesh is null
    }

    // Basic AI: Move towards the player
    const direction = new THREE.Vector3();
    direction.subVectors(this.player.position, this.mesh.position).normalize();

    // Adjust speed as needed
    const speed = 2 * dt;
    this.mesh.position.add(direction.multiplyScalar(speed));

    // Check for collision with the player
    this.checkCollisionWithPlayer();
  }

  checkCollisionWithPlayer() {
    const distance = this.mesh.position.distanceTo(this.player.position);

    if (distance < 2) {
      // Adjust collision distance as needed
      this.attackPlayer();
    }
  }

  attackPlayer() {
    const currentTime = performance.now() / 1000;

    if (currentTime - this.lastAttackTime >= this.attackCooldown) {
      this.player.takeDamage(this.damage);
      console.log('Devil attacked player!');
      this.lastAttackTime = currentTime;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.health = Math.max(0, this.health); // Prevent health from going below 0
    this.updateHealthBar();
    if (this.health <= 0) {
      this.die();
    }
  }

  updateHealthBar() {
    const healthBar = document.getElementById('devil-health');
    if (healthBar) {
      const healthPercentage = (this.health / this.maxHealth) * 100;
      healthBar.style.width = `${healthPercentage}%`;
    }
  }

  die() {
    console.log('Devil is dying');
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.mesh = null; // Clear the mesh reference

    // Remove the devil from the game
    console.log('Devil has died!');

    // Show death message
    const deathMessage = document.getElementById('devil-death-message');
    if (deathMessage) {
    //   deathMessage.style.display = 'block';
    alert('You killed the devil!');
    }

    // Hide health bar
    const healthBarContainer = document.getElementById(
      'devil-health-container'
    );
    if (healthBarContainer) {
      healthBarContainer.style.display = 'none';
    }

    // Remove the global reference
    window.devil = null;

  }
}
