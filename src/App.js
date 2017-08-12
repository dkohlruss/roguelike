import React, { Component } from 'react';
import './App.css';
import Cell from './Cell';

class App extends Component {
  constructor(props) {
    super(props);

    this.map = this.createMap(50,50); // Creates game board with x,y width/height
    this.visualMap = this.makeBoard(this.map);

    let hero = {
        name: 'Rudiger',
        weapon: 'Fist',
        hp: 100,
        attack: 1,
        level: 1,
        location: 0,
        type: 'hero',
        xp: 0
    };

    this.enemies = this.generateEnemies();
    this.treasure = this.generateTreasure();
    this.meds = this.generateMeds();

    this.state = {
      visualMap: this.visualMap,
      hero
    };

    this.placeObject(this.state.hero);

    for (let i = 0; i < this.enemies.length; i++) {
      this.placeObject(this.enemies[i]);
    }

    for (let i = 0; i < this.treasure.length; i++) {
      this.placeTreasure(this.treasure[i]);
    }

    for (let i = 0; i < this.meds.length; i++) {
      this.placeTreasure(this.meds[i]);
    }

    this.blackOut(this.state.hero.location);

    window.addEventListener("keydown", (event) => {
        let currentXY = this.getRowCol(this.state.hero.location);
        let currentID = this.state.hero.location;
        let nextID = 0;

        switch (event.key) {
          case "ArrowUp":
            // Calculate cell intended to move to
            nextID = this.getID(currentXY.row - 1, currentXY.col);
            this.checkCollision(currentID, nextID);
            break;
          case "ArrowDown":
            nextID = this.getID(currentXY.row + 1, currentXY.col);
            this.checkCollision(currentID, nextID);
            break;
          case "ArrowLeft":
            nextID = this.getID(currentXY.row, currentXY.col - 1);
            this.checkCollision(currentID, nextID);
            break;
          case "ArrowRight":
            nextID = this.getID(currentXY.row, currentXY.col + 1);
            this.checkCollision(currentID, nextID);
            break;
          default:
            break;
        }
      });
  }

  // HELPER FUNCTIONS TO EASILY MOVE FROM ID OF ARRAY TO X/Y COORDS
  getID(row, col) {
    let total = Math.sqrt(this.map.length);
    let neighbour = row * total + col;

    return neighbour;
  }

  getRowCol(id) {
    let total = Math.sqrt(this.map.length);
    let row = Math.floor(id / total);
    let column = id - row * total;

    let rowCol = {
      row: row,
      col: column
    }

    return rowCol;
  }

  // CELLULAR AUTOMA 'NEIGHBOUR COUNTING' FUNCTIONS

  // When selectedNeighbour returns true (when there is an 'alive'/passable neighbour), neighbours is increased by 1
  getNeighbours(row, column) {
    let neighbours = 0;
    if (this.selectedNeighbour(row-1, column-1)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row-1, column)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row-1, column+1)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row, column-1)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row, column+1)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row+1, column-1)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row+1, column)) {
      neighbours++;
    }
    if (this.selectedNeighbour(row+1, column+1)) {
      neighbours++;
    }

    return neighbours;
  }

  // Returns true if the coordinates passed coincide with an 'alive' cell
  selectedNeighbour(row, col) {
    let total = Math.sqrt(this.map.length);
    if (row === -1) {
      return false;
    }
    if (row === total) {
      return false;
    }
    if (col === -1) {
      return false;
    }
    if (col === total) {
      return false;
    }

    let neighbour = this.getID(row, col);
    return this.map[neighbour][2];
  }

  // MAP CREATION AND SMOOTHING
  // Randomly creates a grid of alive & dead cells, using the limit var to determine likelihood of an 'alive' cell. Lower = more likely to be alive
  // Returns an array of arrays that contain an x-coord, y-coord, and boolean true/false value for an 'alive'/land cell.
  createMap(height, width) {
    let map = [];
    let isLand = true;
    let limit = 0.55;

    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        let rand = Math.random();
        if (rand < limit) {
          isLand = false;
        }
        map.push([j, i, isLand]);
        isLand = true;
      }
    }

    return map;
  }

  // Takes in a map array, uses celular automa to 'smooth' the map into a cave system, and creates an array of JSX values to be used as map tiles/cells
  makeBoard(map) {
    let visualMap = [];
    let iterations = 2;
    for (let j = 0; j < iterations; j++) {
      this.smoothMap();
    }

    for (let i = 0; i < map.length; i++) {
      if (map[i][2]) {
        visualMap.push(<Cell type='land' key={visualMap.length} passable={true} black={false} />);
      } else {
        visualMap.push(<Cell type='rock' key={visualMap.length} passable={false} black={false} />);
      }
    }
    return visualMap;
  }

  // Calculates neighbours of each cell and sends the # of neighbours and cell ID to doSimulationStep to determine whether to 'kill' or 'birth' pathway
  smoothMap() {
    let newMap = [];
    for (let i = 0; i < this.map.length; i++) {
      newMap.push(this.map[i]);
    }

    let total = Math.sqrt(this.map.length);

    for (var i = 0; i < this.map.length; i++) {
      let neighbours = 0;
      let row = Math.floor(i / total);
      let column = i - row * total;

      if (row > 2 && column > 2 && row < total - 3 && column < total - 3) {
        neighbours = this.getNeighbours(row, column);
      }

      newMap[i][2] = this.doSimulationStep(neighbours, i);
    }

    this.map = newMap;
  }

  // Kills or births pathway depending on count, the number of neighbours a cell has.
  doSimulationStep(count, id) {
    let deathLimit = 3;
    let birthLimit = 4;

    if (this.map[id][2]) {
      if (count < deathLimit) {
        return false;
      } else {
        return true;
      }
    } else {
      if (count > birthLimit) {
        return true;
      } else {
        return false;
      }
    }
  }


  // WORLD INTERACTION FUNCTIONS

  checkCollision(currentXY, nextXY) {
    let hero = this.state.hero;
    let visualMap = this.state.visualMap;

    if (this.map[nextXY][2]) { // If cell exists on top of pathway (or is pathway)
      // Check for collision with an object
      if (!this.state.visualMap[nextXY].props.passable) {
        switch (this.state.visualMap[nextXY].props.type) { // Check what type of interaction -- enemy or pickup
          default: { // default state = all enemies
            let obj = this.enemies.filter((obj) => {
              return obj.location === nextXY;
            }); // Looks at only the enemy in the location given

            // Hero & enemy attack
            let levelModifier = Math.random() + hero.level;
            hero.hp = Math.floor(hero.hp - obj[0].attack / levelModifier);
            obj[0].hp = obj[0].hp - hero.attack * levelModifier * 10;

            // If enemy is killed, it is replaced by pathway and hero gains XP
            if (obj[0].hp <= 0) {
              hero.xp += obj[0].xp;
              visualMap[nextXY] = <Cell type='land' key={nextXY} passable={true} black={false} />;

              this.checkXP(obj[0]);
            }

            // If hero is killed, game over and new map generated
            if (hero.hp <= 0) {
              alert('Game over!  Generating a new dungeon.');
              window.location.reload(false);
            }
            break;
          }
          case 'treasure': {
            this.treasureReward(1);
            visualMap[nextXY] = <Cell type='land' key={nextXY} passable={true} black={false} />;

            break;
          }
          case 'meds': {
            this.treasureReward(0);
            visualMap[nextXY] = <Cell type='land' key={nextXY} passable={true} black={false} />;

            break;
          }
        }

        this.setState({hero});

      } else {
        // Move if no collision
        hero.location = nextXY;
        this.setState({hero});

        this.renderMap(currentXY, nextXY);
      }

    }
  }

  // Checks new XP of hero (or if hero beat the game) and levels up accordingly
  checkXP(enemy) {
    if (enemy.type === 'boss') {
      alert('You win!');
    } else {
      let hero = this.state.hero;

      let xp = hero.xp;

      if (xp > 99 && hero.level === 1) {
        hero.level++;
        hero.hp = 100;
      }
      if (xp > 199 && hero.level === 2) {
        hero.level++;
        hero.hp = 100;
      }
      if (xp > 399 && hero.level === 3) {
        hero.level++;
        hero.hp = 100;
      }
      if (xp > 799 && hero.level === 4) {
        hero.level++;
        hero.hp = 100;
      }
    }
  }

  // Applies treasure and medical rewards when picked up
  treasureReward(num) {
    let hero = this.state.hero;
    if (num === 0) {
      let random = Math.floor(Math.random() * 50) + 15;
      hero.hp += random;

      if (hero.hp > 100) {
        hero.hp = 100;
      }
    }
      else if (num === 1) {
      this.getWeapon();
    } else {
      hero.attack *= 1.2;
    }

    this.setState({hero});
  }

  // When a weapon is picked up, attack is increased and displayed weapon name is modified
  getWeapon() {
    let weapons = ['null', 'Fist', 'Club', 'Mace', 'Axe', 'Sword'];
    let hero = this.state.hero;

    hero.attack++;
    hero.weapon = weapons[hero.attack] || weapons[5];

    this.setState({hero});
  }

    // GENERATION AND PLACING OF OBJECTS, ENEMIES, ETC RANDOMLY
  generateEnemies() {
    let enemies = [];
    let limit = 20;
    for (let i = 0; i < limit; i++) {
      let level = Math.floor(Math.random() * 5 + 1);
      switch(level) {
        case 1:
          enemies.push({
            name: 'Enemy',
            weapon: 'Club',
            hp: 20,
            attack: 5,
            location: i,
            type: 'enemy1',
            id: i,
            passable: false,
            xp: 10
          });
          break;
        case 2:
          enemies.push({
            name: 'Enemy',
            hp: 50,
            attack: 10,
            location: i,
            type: 'enemy2',
            id: i,
            passable: false,
            xp: 20
          });
          break;
        case 3:
          enemies.push({
            name: 'Enemy',
            hp: 100,
            attack: 20,
            location: i,
            type: 'enemy3',
            id: i,
            passable: false,
            xp: 40
          });
          break;
        case 4:
          enemies.push({
            name: 'Enemy',
            hp: 200,
            attack: 50,
            location: i,
            type: 'enemy4',
            id: i,
            passable: false,
            xp: 100
          });
          break;
        case 5:
          enemies.push({
            name: 'Enemy',
            hp: 400,
            attack: 100,
            location: i,
            type: 'enemy5',
            id: i,
            passable: false,
            xp: 200
          });
          break;
      }

      this.map[i][2] = false;
    }

    enemies.push({
      name: 'Boss',
      hp: 1000,
      attack: 400,
      location: 0,
      type: 'boss',
      id: 0,
      passable: false,
      xp: 1000
    })

    return enemies;
  }

  generateTreasure() {
    let treasure = [];

    for (let i = 0; i < this.map.length; i++) {
      let rowCol = this.getRowCol(i);

      let neighbours = this.getNeighbours(rowCol.row, rowCol.col);
      if (neighbours < 4) {
        treasure.push({
          name: 'Treasure',
          hp: 20,
          attack: 1.2,
          type: 'treasure',
          id: i,
          location: i,
          passable: false
        });
      }
    }
    return treasure;
  }

  generateMeds() {
    let meds = [];

    for (let i = 0; i < this.map.length; i++) {
      let rowCol = this.getRowCol(i);

      let neighbours = this.getNeighbours(rowCol.row, rowCol.col);
      if (neighbours < 4) {
        meds.push({
          name: 'Meds',
          hp: 20,
          type: 'meds',
          id: i,
          location: i,
          passable: false
        });
      }
    }
    return meds;
  }

  // If a random value of a potential treasure cell is > than a limit, treasure or health is placed there.
  placeTreasure(treasure) {
    let map = this.state.visualMap;
    let rand = Math.random();
    let limit = 0.75;
    if (rand > limit && this.map[treasure.location][2]) {
      map[treasure.location] = <Cell type={treasure.type} key={treasure.location} passable={treasure.passable} black={false} />;
    }
  }

  // Places an enemy or other interactable
  placeObject(obj) {
    let map = this.state.visualMap;
    let placed = false;
    let rand = 0;
    let size = Math.sqrt(this.map.length);

    while (!placed && obj.type !== 'treasure') {
      rand = Math.floor(Math.random() * this.map.length);
      if (this.map[rand][2] && this.map[rand+1][2] && this.map[rand-1][2] && this.map[rand+size][2] && this.map[rand-size][2]) {
        placed = true;
      }
    }

    obj.location = rand;

    map[rand] = <Cell type={obj.type} key={obj.location} passable={obj.passable}/>;
  }

  // MAP RERENDERING DUE TO MOVEMENT & INTERACTION
  renderMap(currentXY, nextXY) {
    let newMap = this.state.visualMap;

    newMap[currentXY] = <Cell type='land' key={currentXY} passable={true} black={false} />;
    newMap[nextXY] = <Cell type='hero' key={nextXY} passable={false} black={false} />;

    this.blackOut(nextXY);

    this.setState({visualMap: newMap});
  }

  // Controls the 'fog of war' beyond a 6x6 area around the hero
  blackOut(location) {
    let visualMap = this.state.visualMap;
    let total = Math.floor(Math.sqrt(visualMap.length));

    let visible = [];

    for (let i = 3; i > -4; i--) {
      let newLocation = location + i;
      for (var j = 3; j > -1; j--) {
        let aboveLocation = newLocation - j * total;
        let belowLocation = newLocation + j * total;
        visible.push(aboveLocation, belowLocation);
      }
    }

    for (let i = 0; i < visualMap.length; i++) {
      if (visible.indexOf(i) !== -1) {
        console.log(i);
        visualMap[i] = <Cell type={this.state.visualMap[i].props.type} key={i} passable={this.state.visualMap[i].props.passable} black={false} />;
      } else {
        visualMap[i] = <Cell type={this.state.visualMap[i].props.type} key={i} passable={this.state.visualMap[i].props.passable} black={true} />;
      }
    }
  }

  render() {
    return (
      <div>Health: {this.state.hero.hp}, Level: {this.state.hero.level} XP: {this.state.hero.xp}, Weapon: {this.state.hero.weapon}
      <div className='board'>{this.state.visualMap}</div>
      </div>
    );
  }
}

export default App;
