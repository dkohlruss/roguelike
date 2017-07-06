import React, { Component } from 'react';
import Cell from './Cell';

class Board extends Component {
  constructor(props) {
        super(props);

        this.map = this.props.map;
        this.visualMap = this.makeBoard(this.map);

        this.state = {
             visualMap: this.visualMap,
             map: this.map
         };
  }

  makeBoard(map) {
    let visualMap = [];
    let iterations = 2;
    for (let j = 0; j < iterations; j++) {
      this.smoothMap(map);
    }

    for (let i = 0; i < map.length; i++) {
      if (map[i][2]) {
        visualMap.push(<Cell type='land' key={visualMap.length} />)
      } else {
        visualMap.push(<Cell type='rock' key={visualMap.length} />)
      }
    }
    return visualMap;
  }

  smoothMap(map) {
    let newMap = map.slice();
    let total = Math.sqrt(map.length);

    for (var i = 0; i < map.length; i++) {
      let neighbours = 0;
      let row = Math.floor(i / total);
      let column = i - row * total;

      if (row > 1 && column > 1 && row < total - 2 && column < total - 2) {
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
      }

      newMap[i][2] = this.doSimulationStep(neighbours, i);
    }
    map = newMap;
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

  render() {
    return (
      <div className='board'>
        {this.visualMap}
      </div>
    );
  }
}

export default Board;
