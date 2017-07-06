import React, { Component } from 'react';
import './App.css';
import Board from './Board';

class App extends Component {
  constructor(props) {
    super(props);

    this.map = this.createBoard(100,100); // Creates game board with x,y width/height
    this.state = {map: this.map};
  }

  createBoard(height, width) {
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

  // smoothMap(map, iterations) {
  //   let rockLimit =
  // }
  //
  // countNeighbours(map) {
  //
  // }

  render() {
    return (
      <div>
        <Board map={this.map} />
      </div>
    );
  }
}

export default App;
