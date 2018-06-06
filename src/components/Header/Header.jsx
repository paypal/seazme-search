import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import {
  Container,
  Icon,
  Menu,
} from 'semantic-ui-react'
import './Header.css'


class SeazmeHeader extends Component {

  state = {};
  constructor() {
    super();
    this.state = {
      homepath: (process.env.REACT_APP_HOMEPATH)? process.env.REACT_APP_HOMEPATH: '/search'
    }
  }
  render() {
    const AppBarMenu = () => (
      <Menu
        fixed='top'
        secondary={true}>
        <Container>
          <Menu.Item position='right'>
            <Menu.Item as='a' href={this.state.homepath} active={this.props.name === 'home'} > <Icon name='home' /> Home</Menu.Item>
            <Menu.Item as='a' href={this.state.homepath + '/datasources' } active={this.props.name === 'datasources'}  name='datasources'><Icon name='server' /> DataSources</Menu.Item>
          <Menu.Item as='a' active={this.props.name === 'profile'} name='profile'><Icon name='user' />{this.props.username}</Menu.Item>
          </Menu.Item>
        </Container>
      </Menu>
    )
    return (
      <AppBar
        className="uk-position-fixed paypal-header-blue" style={{ top: 0 }}
        iconElementLeft={<Icon name='search' link className='seazme-logo' href='./' />}
        iconElementRight={<AppBarMenu />} />
    )
  }
}

export default SeazmeHeader;
