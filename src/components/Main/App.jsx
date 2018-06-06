import React, { Component } from 'react';
import ResultsPane from '../Searchresults/Resultspane';
import Home from '../Home/Home'
import DataSources from '../Datasources/DataSources';

class App extends Component {
    state = {};

    constructor() {
        super();
        this.state = { homepath: (process.env.REACT_APP_HOMEPATH) ? process.env.REACT_APP_HOMEPATH : '/search', user: user2 };
    }
    render() {
        if (this.state.user && this.props.location.pathname.includes("/datasources")) {
            return <DataSources username={this.state.user} />
        }
        else {
            if (this.state.user && this.props.location.search) {
                return <ResultsPane query={this.props.location.search} username={this.state.user} />
            } else {
                return (<div>{this.state.user && <Home username={this.state.user} />} </div>)
            }
        }
    }
}
export default App;

