import React, { Component } from 'react';
import SeazmeHeader from '../Header/Header';
import { bounce } from 'react-animations';
import { Container, Header, Label, Table, Pagination } from 'semantic-ui-react'
import Radium from 'radium';
import Moment from 'moment';
import 'moment-timezone';
import './Datasource.css';

const styles = {
    bounce: {
        animation: 'x 1s',
        animationName: Radium.keyframes(bounce, 'bounce')
    }
}

class DataSources extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datasourceList: [],
            activePage: 1,
            homepath: (process.env.REACT_APP_HOMEPATH)? process.env.REACT_APP_HOMEPATH : '/search'
        }
    }

    componentDidMount() {
        const dataSourcesURL = this.state.homepath + '/api/datasources';
        this.getDataSourceList(dataSourcesURL)
            .then(res => this.setState({ datasourceList: res }))
            .catch(err => console.log(err));
    }

    getDataSourceList = async (dataSourcesURL) => {
        const response = await fetch(dataSourcesURL);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    }
    handlePaginationChange = (e, { activePage }) => this.setState({ activePage })

    render() {
        const Timestamp = (props) => {
            return <span>{Moment.unix(props.ts).tz('America/Los_Angeles').format('YYYY-MM-DD HH:mm')}</span>
        }

        const DataSourceList = () => (
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>DataSource</Table.HeaderCell>
                        <Table.HeaderCell >Business Unit</Table.HeaderCell>
                        <Table.HeaderCell>Owners</Table.HeaderCell>
                        <Table.HeaderCell>Last Updated Time</Table.HeaderCell>
                        <Table.HeaderCell>TAG</Table.HeaderCell>
                        <Table.HeaderCell>SLA</Table.HeaderCell>
                        <Table.HeaderCell>Data Diagram</Table.HeaderCell>
                        <Table.HeaderCell>Notes</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {this.state.datasourceList && this.state.datasourceList.slice((9 * (this.state.activePage - 1)), ((9 * (this.state.activePage - 1)) + 9)).map((row, index) => (
                        <Table.Row key={index} style={styles.bounce}>
                            <Table.Cell style={{ width: '10px' }} >{(9 * (this.state.activePage - 1)) + index + 1}
                                {(() => {
                                    switch (row.current_status) {
                                        case 'working': return <Label ribbon className='uk-label-success status-label no-padding uk-text-capitalize'>{row.current_status}</Label>
                                        case 'pending': return <Label ribbon className='status-label no-padding  uk-text-capitalize'>{row.current_status}</Label>
                                        case 'update broken': return <Label ribbon className='uk-label-warning status-label no-padding  uk-text-capitalize'>{row.current_status}</Label>
                                        case 'not in search': return <Label ribbon className='uk-label-danger status-label no-padding  uk-text-capitalize'>{row.current_status}</Label>
                                        default: return <Label ribbon className='uk-label-success status-label no-padding uk-text-capitalize'>{row.current_status}</Label>
                                    }
                                })()}
                            </Table.Cell>
                            <Table.Cell>{row.name}</Table.Cell>
                            <Table.Cell>{row.business_unit}</Table.Cell>
                            <Table.Cell>
                                {row.owners}</Table.Cell>
                            <Table.Cell><Timestamp ts={row.last_updated_time} /></Table.Cell>
                            <Table.Cell className='text-paypal-blue'>{row.tag}</Table.Cell>
                            <Table.Cell>https://</Table.Cell>
                            <Table.Cell>https://</Table.Cell>
                            <Table.Cell>{row.notes} </Table.Cell>
                        </Table.Row>))}
                </Table.Body>
            </Table>
        )
        return (
            <div className='page-bodys  '>
                <SeazmeHeader name='datasources' username={this.props.username}/>
                <div className='page-body' >
                    <Container fluid className='ds-container-fluid'>
                        <div>
                            <Header size='medium'>Datasources List</Header></div>
                        <DataSourceList />
                        {this.state.datasourceList && <Pagination className='uk-align-right pagination-seazme'
                            defaultActivePage={1}
                            firstItem={null}
                            lastItem={null}
                            pointing
                            secondary
                            totalPages={Math.ceil(this.state.datasourceList.length / 9)}
                            onPageChange={this.handlePaginationChange}
                        />}
                    </Container>

                </div>
            </div>)
    }
}

export default DataSources;
