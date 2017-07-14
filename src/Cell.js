import React from 'react';

const Cell = (props) => {
  if (props.black) {
    return (
      <div className='black' />
    );
  } else {
    return (
      <div className={props.type} />
    );
  }

}

export default Cell;
