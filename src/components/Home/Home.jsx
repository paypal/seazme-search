import React, { Component } from 'react'
import SeazmeHeader from '../Header/Header';
import illustrations from './illustrations.jpg';
import PropTypes from 'prop-types';
import {
    Container,
    Header,
    Icon,
    Menu,
    Responsive,
    Segment,
    Visibility,
    Button,
    Input
} from 'semantic-ui-react'
import './Home.css';


class DesktopContainer extends Component {
    state = {}
    constructor(props, context) {
        super(props, context);
        this.state = {
            q : ''
        }
    }
    static contextTypes = {
        router: PropTypes.object
      }
    hideFixedMenu = () => this.setState({ fixed: false })
    showFixedMenu = () => this.setState({ fixed: true })
    handleChange = (event, data) => {
        this.setState({q: data.value});
    }
    onKeyPress = (event) => {
        if(event.key === 'Enter'){
            this.context.router.history.push("./?q=" + this.state.q);
          }
    }
    search = () => {
        this.context.router.history.push("./?q=" + this.state.q);
    }
    render() {
        const mobile = null;
        return (
            <Responsive {...Responsive.onlyComputer}>
                <Visibility once={false} onBottomPassed={this.showFixedMenu} onBottomPassedReverse={this.hideFixedMenu} style={{ backgroundImage: 'url(' + illustrations + ')' }}>
                    <Segment textAlign='center' style={{ minHeight: 700, padding: '1em 0em' }} vertical>
                        <div style={{ top: 0 }}> <SeazmeHeader name='home' username={this.props.username} /> </div>
                        <Container text>
                            <Header
                                as='h3'
                                content='Seazme Search'
                                style={{
                                    fontSize: mobile ? '2em' : '3em',
                                    fontWeight: 'normal',
                                    marginBottom: 0,
                                    marginTop: mobile ? '1.5em' : '3em',
                                    color: 'white'
                                }}
                            />
                            <Header
                                as='h4'
                                content='Discovery of information across all datasources though unified search'
                                inverted
                                style={{
                                    fontSize: mobile ? '1.2em' : '1.3em',
                                    fontWeight: 'normal',
                                    marginTop: mobile ? '0.5em' : '1.5em',
                                }}
                            />
                            <div className="uk-flex uk-flex-center uk-inliner">
                                <Input id="autocomplete" className="uk-search-input uk-form-large" placeholder="Enter your search term" onChange={this.handleChange} onKeyPress={this.onKeyPress} />
                                <Button icon className="search-button-icon" disabled = {this.state.q.length === 0} onClick = {this.search}> <Icon name="search" /></Button>
                            </div>
                        </Container>
                        <Menu secondary={true} fixed='bottom' className='footer-menu' style={{ background: 'white' }}>
                            <Menu.Item className='text-paypal-blue'>
                                <Menu.Item as='a' className='text-paypal-blue' target='_blank' href='https://github.com/paypal/seazme' active={this.props.name === 'home'} > <Icon name='linkify' /> About Seazme</Menu.Item>
                                <Menu.Item as='a' className='text-paypal-blue' active={this.props.name === 'contact'} name='contact'> <Icon name='microphone' /> Contact</Menu.Item>
                                <Menu.Item as='a' className='text-paypal-blue' target='_blank' href='https://github.com/paypal/seazme-search'> <Icon name='github square' /> Github Repo</Menu.Item>
                            </Menu.Item>
                            <Menu.Item position='right' as='a' className='text-paypal-blue uk-text-right' href='https://<movetoconfig>.slack.com/messages/C<movetoconfig>' target='_blank'> <Icon name='code' /> Want to add a feature or DataSet ? Join US !!</Menu.Item>
                        </Menu>
                    </Segment>
                </Visibility>
            </Responsive>
        )
    }
}

const ResponsiveContainer = (props, { children }) => (
    <div>
        <DesktopContainer username={props.username}>{children}</DesktopContainer>
    </div>
)

const Home = (props) => {
    return <ResponsiveContainer username={props.username}> </ResponsiveContainer>
}
export default Home;
