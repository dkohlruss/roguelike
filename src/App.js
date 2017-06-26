import React, { Component } from 'react';
import './App.css';
import Board from './Board';

class App extends Component {
  constructor(props) {
    super(props);

    this.map = this.createBoard(10,10);
  }

  createBoard(height, width) {
    let map = [];

    for (var i = 0; i < height; i++) {
      for (var j = 0; j < width; j++) {
        map.push([[j, i], Math.random()]);
      }
    }

    return map;
  }

  render() {
    return (
      <div>
        <Board map={this.map} />
      </div>
    );
  }
}

export default App;
