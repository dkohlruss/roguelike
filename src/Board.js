import React, { Component } from 'react';

class Board extends Component {
  constructor(props) {
        super(props);

        let map = this.props.map;
        this.visualMap = this.makeBoard(map);
  }

  makeBoard(map) {
    let visualMap = [];
    let limit = 0.4; // Percentage (/100) of land
    map.forEach((entry) => {
      if (entry[1] > limit) {
        visualMap.push(<div className='land'></div>)
      } else {
        visualMap.push(<div className='rock'></div>)
      }
    })

    return visualMap;
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
