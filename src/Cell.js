import React, { Component } from 'react';

class Cell extends Component {

  render() {
    if (this.props.type === 'land') {
      return (
        <div className='land'></div>
      );
    } else if (this.props.type === 'rock') {
      return (
        <div className='rock'></div>
      );
    }


  }
}

export default Cell;
