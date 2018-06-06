import React from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Route
} from 'react-router-dom';

import App from './components/Main/App';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import './index.css';
import 'semantic-ui-css/semantic.min.css';

const Root = () => {
    const homepath = (process.env.REACT_APP_HOMEPATH)? process.env.REACT_APP_HOMEPATH : '/search';
    return (
        <Router basename={homepath}>
            <MuiThemeProvider>
                <div className="container" username={user2}>
                    <Route path='/' component={App}>
                    </Route>
                </div></MuiThemeProvider>
        </Router>
    );
};

ReactDOM.render(<Root />, document.getElementById('root'));
//module.hot.accept();