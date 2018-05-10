import React from 'react';
import ReactDOM from 'react-dom';

const title = 'My Minimal React Webpack Babel Setup';

ReactDOM.render(
  <div>{title+user2}</div>,
  document.getElementById('app')
);

module.hot.accept();