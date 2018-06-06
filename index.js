'use strict';

var express = require('express');
var kraken = require('kraken-js');
var logger = require('./logger').logger;
var esquery = require('./esquery');
var elasticsearch = require('elasticsearch');


var options, app;

/*
 * Create and configure application. Also exports application instance for use by tests.
 * See https://github.com/krakenjs/kraken-js#options for additional configuration options.
 */
options = {
    onconfig: function (config, next) {
        /*
         * Add any additional config setup or overrides here. `config` is an initialized
         * `confit` (https://github.com/krakenjs/confit/) configuration object.
         */
        next(null, config);
    }
};

app = module.exports = express();
app.use('/search', kraken(options));
app.on('start', function () {
    console.log('Application ready to serve requests.');
    console.log('Environment: %s', app.kraken.get('env:env'));
});

const host = process.env.ES_URL;
const homepath = process.env.REACT_APP_HOMEPATH || '/search';

logger.info('Initializing ES URL: ' + host);
const client = new elasticsearch.Client({
    host: host,
    log: 'error'
});

app.get(homepath + '/api/search', (req, res) => {

    logger.info('Executing search query wiyth the following search params');
    let searchParam = {
        search: req.query.q,
        page: (req.query.page) ? req.query.page : 0,
        lastauthor: [],
        typename: [],
        instancename: [],
        level0: []
    };

    if (req.query.lastauthor) {
        (req.query.lastauthor.length === 1) ? searchParam.lastauthor.push(req.query.lastauthor) : searchParam.lastauthor = req.query.lastauthor;
    }
    if (req.query.instancename) {
        (req.query.instancename.length === 1) ? searchParam.instancename.push(req.query.instancename) : searchParam.instancename = req.query.instancename;
    }
    if (req.query.level0) {
        (req.query.level0.length === 1) ? searchParam.level0.push(req.query.level0) : searchParam.level0 = req.query.level0;
    }
    if (req.query.typename) {
        (req.query.typename.length === 1) ? searchParam.typename.push(req.query.typename) : searchParam.typename = req.query.typename;
    }

    logger.info('Search term : ' + JSON.stringify(req.query));
    client.search(esquery.queryBuilder(searchParam), function (error, response) {
        if (error) {
            res.status(500).send({ error: 'Something failed! Please try again later' });
            logger.error('Error while executing search query : ' + error.message);
        } else {
            logger.info('Results fetched successfully');
            res.send(response);
        }
    });
});

app.get(homepath + '/api/profile', (req, res) => {
    logger.info('Getting profile details for user' + req.query.username);
    client.search({
        index: 'ldap-profile',
        'query': {
            simple_query_string: {
                query: req.query.username,
                fields: [
                    'userId'
                ]
            }
        }
    }, function (error, response) {
        if (error) {
            res.status(500).send({ error: 'Something failed! Please try again later' });
            logger.error('Error while fetching user profile details' + error.message);
        } else {
            res.send(response.hits.hits);
        }
    });
});

app.get(homepath + '/api/datasources', (req, res) => {
    logger.info('Getting datasources details');
    client.search({
        index: 'datasources',
        'query': {
            'match_all': {}
        }
    }, function (error, response) {
        if (error) {
            res.status(500).send({ error: 'Something failed! Please try again later' });
            logger.error('Error while fetching  datasources list' + error.message);
        } else {
            let dataSources = [];
            if (response.hits) {
                response.hits.hits.forEach(function (document) {
                    dataSources.push(document._source);
                });
            }
            res.send(dataSources);
        }
    });
});