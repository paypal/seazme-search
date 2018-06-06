import React, { Component } from 'react';
import { Segment, Icon, Form, Input, Card, Label, Divider, Checkbox, Pagination, Message, Grid, Dimmer, Loader, Menu, Transition, Responsive } from 'semantic-ui-react'
import SeazmeHeader from '../Header/Header';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import Moment from 'moment';
import './resultspane.css';


class ResultsPane extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      open: true,
      queryParam: queryString.parse(this.props.query),
      hits: {},
      aggregation: {},
      results: {},
      isLoading: false,
      suggestions: {},
      searchTimeout: 0,
      lastauthor: [],
      homepath: (process.env.REACT_APP_HOMEPATH)? process.env.REACT_APP_HOMEPATH: '/search'
    };

  }
  static contextTypes = {
    router: PropTypes.object
  }

  componentWillMount() {
    this.getSearchResults(this.state.queryParam)
      .then(res => {
      })
      .catch(err => console.log(err));
  }

  getSearchResults = async () => {
    const search = queryString.stringify(this.state.queryParam);
    this.context.router.history.push("./?" + search);
    const searchapi = this.state.homepath + '/api/search?';
    const response = await fetch(searchapi + search);
    const body = await response.json();
    if (response.status !== 200) {
      this.setState({ results: undefined })
      this.setState({ hits: [] });
      this.setState({ aggregation: undefined });
      this.setState({ suggestions: undefined });
      this.setState({ isLoading: true });
      throw Error(body.message);
    }
    if (body) {
      this.setState({ results: body })
      this.setState({ hits: this.state.results.hits.hits });
      this.setState({ aggregation: this.state.results.aggregations });
      this.setState({ suggestions: this.state.results.suggest.suggestions });
      this.setState({ isLoading: true });
    }
    return body;
  }

  handleChange = (event) => {
    let self = this;
    if (self.state.searchTimeout) {
      clearTimeout(self.state.searchTimeout);
    }
    let query = self.state.queryParam;
    query.q = event.target.value;
    self.setState({
      queryParam: query,
      typingTimeout: setTimeout(function () {
        self.getSearchResults();
      }, 1000)
    });
  }

  getContent = (txt) => {
    return { __html: txt };
  }

  getnewPage = (event, object) => {
    let query = this.state.queryParam;
    query.page = object.activePage;
    this.setState({ queryParam: query });
    this.getSearchResults();

  }

  searchByAuthors = (author) => {
    let query = this.state.queryParam;
    if (!query.lastauthor) {
      query.lastauthor = [];
    }
    query.lastauthor.push(author);
    this.setState({ queryParam: query });
    this.getSearchResults();
  }


  searchbyFacet = (event, data) => {
    let query = this.state.queryParam;
    let facetname = data.label.children.props;
    if (data.checked) {
      if (facetname.fieldname) {
        if (!query[facetname.fieldname]) {
          query[facetname.fieldname] = [];
        }
        if (!(query[facetname.fieldname] instanceof Array)) {
          let filter = query[facetname.fieldname];
          query[facetname.fieldname] = [];
          query[facetname.fieldname].push(filter);
        }
        query[facetname.fieldname].push(facetname.facet);
      }
    } else {
      if (query[facetname.fieldname] instanceof Array) {
        for (let i = 0; i < query[facetname.fieldname].length; i++) {
          if (query[facetname.fieldname][i] === facetname.facet) {
            query[facetname.fieldname].splice(i, 1);
            break;
          }
        }
      } else {
        delete query[facetname.fieldname];
      }

    }
    query.page = 1;
    this.setState({ queryParam: query });
    this.getSearchResults();

  }

  searchByFacet = (key, facetname) => {
    let query = this.state.queryParam;
    if (facetname) {
      if (!query[facetname]) {
        query[facetname] = [];
      }
      if (!(query[facetname] instanceof Array)) {
        let filter = query[facetname];
        query[facetname] = [];
        query[facetname].push(filter);
      }
      query[facetname].push(key);
      this.setState({ queryParam: query });
      this.getSearchResults();
    }
  }


  setSearchTerm = (search) => {
    let query = this.state.queryParam;
    query.q = search;
    this.setState({ queryString: query })
    this.getSearchResults();
  }

  clearAllFilters = () => {
    let query = this.state.queryParam;
    for (let i in query) {
      if (i !== 'q') {
        delete query[i];
      }
    }
    this.setState({ queryString: query });
    this.getSearchResults();
  }
  render() {
    const DocCount = (props) => (
      <div className='uk-text-small text-overflow facet-name'>
        <span>{props.facet}</span>
        <span className='facet-doc-count uk-text-muted uk-text-capitalized'>({props.doc_count})</span></div>
    )
    const FacetSubFilter = (props) => {
      return <Menu.Item>{props.filter.buckets.map((facet) =>
        <Checkbox key={facet.key} label={{ children: <DocCount facet={facet.key} doc_count={facet.doc_count} fieldname={props.facetname} /> }}
          className='facet-checkbox' onChange={this.searchbyFacet}
          checked={this.state.queryParam[props.facetname] && this.state.queryParam[props.facetname].indexOf(facet.key) > -1} />
      )}</Menu.Item>
    }
    const FacetSidebar = () => {
      return <Menu vertical className='results-page-body'>{
        this.state.isLoading && this.state.hits.length > 0 &&
        <div>
          <Menu.Item> <Menu.Header sub="true" className='uk-text-right'>
            <a onClick={this.clearAllFilters}><Icon name='close' />Clear All Filters</a>
          </Menu.Header>
          </Menu.Item>
          <Menu.Item> <Menu.Header sub="true" className='facet-header'>Business Unit</Menu.Header>
            <Menu.Menu>
              <Menu.Item className='results-menu'>
                <FacetSubFilter filter={this.state.aggregation['bu-name']['agg_terms_bu-name']} facetname='instancename' />
              </Menu.Item>
            </Menu.Menu>
          </Menu.Item>
          <Menu.Item> <Menu.Header sub="true" className='facet-header'>DataSources</Menu.Header>
            <Menu.Menu>
              <Menu.Item className='results-menu'>
                <FacetSubFilter filter={this.state.aggregation['kind-name']['agg_terms_kind-name']} facetname='typename' />
              </Menu.Item>
            </Menu.Menu>
          </Menu.Item>
          <Menu.Item> <Menu.Header sub="true" className='facet-header'>Projects</Menu.Header>
            <Menu.Menu>
              <Menu.Item className='results-menu'>
                <FacetSubFilter filter={this.state.aggregation.level0.agg_terms_level0} facetname='level0' />
              </Menu.Item>
            </Menu.Menu>
          </Menu.Item>
          <Menu.Item> <Menu.Header sub="true" className='facet-header'>Authors</Menu.Header>
            <Menu.Menu>
              <Menu.Item className='results-menu'>
                <FacetSubFilter filter={this.state.aggregation['last-author']['agg_terms_last-author']} facetname='lastauthor' />
              </Menu.Item>
            </Menu.Menu>
          </Menu.Item> </div>
      } </Menu>
    }
    const Hits = () => (
      <span>
        {this.state.isLoading && this.state.hits.total > 1 && <p>About {this.state.results.hits.total} results ({this.state.results.took / 1000} s)</p>}
      </span>
    )

    const Timestamp = (props) => {
      return <span>{Moment.unix(props.ts).format('YYYY-MM-DD')}</span>
    }
    const Results = () => (
      <Card.Group itemsPerRow={1}>
        {this.state.isLoading && this.state.hits.length > 0 && this.state.hits.map((hit, index) =>
          <Card centered className='results-card' key={index}>
            <Card.Content>
              <Card.Header as='a' href={hit._source.url} target='_blank' className='result-header text-paypal-blue'> {hit._source.level1}  </Card.Header>
              <Card.Meta className='uk-text-small results-content'>
                {hit.highlight && <span dangerouslySetInnerHTML={this.getContent(hit.highlight.text.join('...'))}></span>}
              </Card.Meta>
            </Card.Content>
            <Card.Content extra className='extra-results-info'>
              <Label basic className='uk-text-capitalize uk-text-green'>
                {hit._type}
              </Label>
              <a href={'./?q=' + hit._source['last-author']} className='result-author'>
                <Icon name='user' />
                {hit._source['last-author']}
              </a>
              <span className='result-author'>
                <Icon name='time' />
                <Timestamp ts={hit._source['last-ts']} />
              </span>
            </Card.Content>
          </Card>
        )}

        {this.state.isLoading && this.state.hits.length === 0 && <Message warning className='no-results-found'>
          <div> No results found </div>
          {(this.state.suggestions && this.state.suggestions[0].length > 0) && <div className='uk-text-muted'> Try searching for {this.state.suggestions[0].options.map((suggest) =>
            <Label basic as='a' onClick={() => { this.setSearchTerm(suggest.text) }} key={suggest.text}>{suggest.text}</Label>
          )} </div>}
        </Message>}
      </Card.Group>
    )
    const SearchResults = () => (
      <div>
        <Hits />
        <Transition visible={this.state.isLoading} animation='scale' duration={500}>
          <Results />
        </Transition>
      </div>
    )

    return (
      <Responsive >
        <SeazmeHeader name='home' username={this.props.username} />
        {!this.state.isLoading && <Segment className='results-page-loader'>
          <Dimmer active inverted>
            <Loader inverted content='Loading' />
          </Dimmer>
        </Segment>}
        {this.state.isLoading && <Grid>
          {this.state.hits.length > 0 && <Grid.Row>
            <Grid.Column width={2} stretched className='facet-sidebar-grid'>
              <FacetSidebar />
            </Grid.Column>
            <Grid.Column width={14} stretched>
              <Segment basic className='results-page-body'>
                <Form className='search-input'>
                  <Segment>
                    <Form.Field>
                      <Input icon placeholder='Search...' value={this.state.queryParam.q} onChange={this.handleChange}>
                        <input />
                        <Icon name='search' />
                      </Input>
                    </Form.Field>
                  </Segment>
                  <Divider />
                </Form>
                <SearchResults />
                {this.state.isLoading && this.state.hits.length > 0 && <Pagination defaultActivePage={(!this.state.queryParam.page) ? 1 : this.state.queryParam.page} totalPages={Math.ceil(this.state.results.hits.total / 10)} className='search-pagination ' onPageChange={this.getnewPage} />}
              </Segment>
            </Grid.Column>
          </Grid.Row>}
        </Grid>}
        {this.state.isLoading && this.state.hits.length === 0 && <Grid> <Grid.Row> <Grid.Column width={16}>
          <Segment basic className='results-page-body'>
            <Form className='search-input'>
              <Segment>
                <Form.Field>
                  <Input icon placeholder='Search...' value={this.state.queryParam.q} onChange={this.handleChange}>
                    <input />
                    <Icon name='search' />
                  </Input>
                </Form.Field>
              </Segment>
              <Divider />
            </Form>
            <SearchResults />
            {this.state.isLoading && this.state.hits.length > 0 && <Pagination defaultActivePage={(!this.state.queryParam.page) ? 1 : this.state.queryParam.page} totalPages={Math.ceil(this.state.results.hits.total / 10)} className='search-pagination ' onPageChange={this.getnewPage} />}
          </Segment>
        </Grid.Column> </Grid.Row> </Grid>
        }
      </Responsive>)
  }
}
export default ResultsPane;
