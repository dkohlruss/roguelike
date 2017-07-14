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
        attack: 1.0,
        defend: 1.0,
        level: 1,
        location: 0,
        type: 'hero',
        xp: 0
    };

    this.enemies = this.generateEnemies();
    this.treasure = this.generateTreasure();

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

    window.addEventListener("keydown", (event) => {
      let currentXY = this.state.hero.location;
      let nextXY = 0;

      switch (event.key) {
        case "ArrowUp":
          // Calculate cell intended to move to
          nextXY = this.getNextCell(event.key);
          this.checkCollision(currentXY, nextXY);
          break;
        case "ArrowDown":
          nextXY = this.getNextCell(event.key);
          this.checkCollision(currentXY, nextXY);
          break;
        case "ArrowLeft":
          nextXY = this.getNextCell(event.key);
          this.checkCollision(currentXY, nextXY);
          break;
        case "ArrowRight":
          nextXY = this.getNextCell(event.key);
          this.checkCollision(currentXY, nextXY);
          break;
        default:
          break;
        }


      });
  }

  checkCollision(currentXY, nextXY) {
    let hero = this.state.hero;
    let visualMap = this.state.visualMap;

    if (this.map[nextXY][2]) { // if passable
      // Check for collision
      if (!this.state.visualMap[nextXY].props.passable) {
        // If collision -- Determine type & interact (or not)
        let obj = this.enemies.filter((obj) => {
          return obj.location === nextXY;
        });

        switch (this.state.visualMap[nextXY].props.type) {
          case 'enemy': {
            hero.hp = hero.hp - obj[0].attack;
            obj[0].hp = obj[0].hp - hero.attack * 10;

            if (obj[0].hp <= 0) {
              hero.xp += obj[0].xp;
              visualMap[nextXY] = <Cell type='land' key={nextXY} passable={true} />;
            }
            break;
          }
          case 'treasure': {
            let rand = Math.floor(Math.random() * 5);
            this.treasureReward(rand);
            visualMap[nextXY] = <Cell type='land' key={nextXY} passable={true} />;

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

  treasureReward(num) {
    let hero = this.state.hero;
    if (num > 3) {
      hero.hp = 100;
    } else if (num < 1) {
      hero.attack *= 1.5;
    } else {
      hero.attack *= 1.2;
    }
    this.setState({hero});
    this.checkWeapon();
  }

  checkWeapon() {
    let weapons = ['Fist', 'Club', 'Mace', 'Axe', 'Sword'];
    let hero = this.state.hero;
    if (hero.attack > 1 && hero.attack < 2) {
      hero.weapon = weapons[1];
    } else if (hero.attack < 3) {
      hero.weapon = weapons[2];
    } else if (hero.attack < 5) {
      hero.weapon = weapons[3];
    } else {
      hero.weapon = weapons[4];
    }
  }

  getNextCell(direction) {
      let currentXY = this.getRowCol(this.state.hero.location);
      let nextXY = this.getID(currentXY.row, currentXY.col);

      switch(direction) {
        case 'ArrowUp':
          nextXY = this.getID(currentXY.row - 1, currentXY.col);
          break;
        case 'ArrowDown':
          nextXY = this.getID(currentXY.row + 1, currentXY.col);
          break;
        case 'ArrowLeft':
          nextXY = this.getID(currentXY.row, currentXY.col - 1);
          break;
        case 'ArrowRight':
          nextXY = this.getID(currentXY.row, currentXY.col + 1);
          break;
      }

      return nextXY;
  }

  generateEnemies() {
    let enemies = [];
    let rand = Math.floor(Math.random() * 50);
    for (let i = 0; i < rand; i++) {
      enemies.push({
        name: 'Enemy',
        weapon: 'Club',
        hp: 50,
        attack: 1.0,
        defend: 1.0,
        location: i,
        type: 'enemy',
        id: i,
        passable: false,
        xp: 10
      });
      this.map[i][2] = false;
    }

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

  placeTreasure(treasure) {
    let map = this.state.visualMap;
    let rand = Math.random();
    if (rand > 0.6 && this.map[treasure.location][2]) {
      map[treasure.location] = <Cell type={treasure.type} key={treasure.location} passable={treasure.passable}/>;
    }
  }

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

  makeBoard(map) {
    let visualMap = [];
    let iterations = 2;
    for (let j = 0; j < iterations; j++) {
      this.smoothMap();
    }

    for (let i = 0; i < map.length; i++) {
      if (map[i][2]) {
        visualMap.push(<Cell type='land' key={visualMap.length} passable={true} />);
      } else {
        visualMap.push(<Cell type='rock' key={visualMap.length} passable={false} />);
      }
    }
    return visualMap;
  }

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

      if (row > 1 && column > 1 && row < total - 2 && column < total - 2) {
        neighbours = this.getNeighbours(row, column);
      }

      newMap[i][2] = this.doSimulationStep(neighbours, i);
    }

    this.map = newMap;
  }

  getNeighbours(row, column) {
    let neighbours = 0;
    // Check above-left
    if (this.selectedNeighbour(row-1, column-1)) {
      // console.log('Above left Neighbor found for ' + i);
      neighbours++;
    }

    // Check above
    if (this.selectedNeighbour(row-1, column)) {
      neighbours++;
      // console.log('Above Neighbor found for ' + i);
    }

    // Check above-right
    if (this.selectedNeighbour(row-1, column+1)) {
      neighbours++;
      // console.log('Above right Neighbor found for ' + i);
    }

    // Check left
    if (this.selectedNeighbour(row, column-1)) {
      neighbours++;
      // console.log('Left Neighbor found for ' + i);
    }

    // Check right
    if (this.selectedNeighbour(row, column+1)) {
      neighbours++;
      // console.log('Right Neighbor found for ' + i);
    }

    // Check below-left
    if (this.selectedNeighbour(row+1, column-1)) {
      neighbours++;
      // console.log('Below left Neighbor found for ' + i);
    }

    // Check below
    if (this.selectedNeighbour(row+1, column)) {
      neighbours++;
      // console.log('Below Neighbor found for ' + i);
    }

    // Check below-right
    if (this.selectedNeighbour(row+1, column+1)) {
      neighbours++;
      // console.log('Below right Neighbor found for ' + i);
    }

    return neighbours;
  }

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

    let neighbour = row * total + col;
    return this.map[neighbour][2];
  }

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

  renderMap(currentXY, nextXY) {
    let newMap = this.state.visualMap;

    newMap[currentXY] = <Cell type='land' key={currentXY} passable={true} />;
    newMap[nextXY] = <Cell type='hero' key={nextXY} passable={false} />;

    this.setState({visualMap: newMap});
  }

  render() {
    return (
      <div>Health: {this.state.hero.hp}, XP: {this.state.hero.xp}, Weapon: {this.state.hero.weapon}
      <div className='board'>{this.state.visualMap}</div>
      </div>
    );
  }
}

export default App;
