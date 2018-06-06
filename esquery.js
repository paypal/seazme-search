var bodybuilder = require('bodybuilder');

function isMultiFilter(searchParam) {
    let filterCount = 0;
    (searchParam.lastauthor && searchParam.lastauthor != '') ? filterCount++ : '';
    (searchParam.typename && searchParam.typename != '') ? filterCount++ : '';
    (searchParam.level0 && searchParam.level0 != '') ? filterCount++ : '';
    (searchParam.instancename && searchParam.instancename != '') ? filterCount++ : '';
    if (filterCount > 1)
        return true;
    return false;
}

function getFilterNames(searchParam) {
    let filterNames = [];
    (searchParam.instancename && searchParam.instancename != '') ? filterNames.push('instancename') : '';
    (searchParam.typename && searchParam.typename != '') ? filterNames.push('typename') : '';
    (searchParam.level0 && searchParam.level0 != '') ? filterNames.push('level0') : '';
    (searchParam.lastauthor && searchParam.lastauthor != '') ? filterNames.push('lastauthor') : '';
    return filterNames;
}

function getSingleFilterParams(searchParam) {
    let filterDescription = {};
    if (searchParam.instancename && searchParam.instancename != '') {
        filterDescription.name = 'bu-name';
        filterDescription.value = (searchParam.instancename instanceof Array) ? searchParam.instancename : new Array(searchParam.instancename);
        filterDescription.filterName = 'instancename';
    }
    if (searchParam.typename && searchParam.typename != '') {
        filterDescription.name = 'kind-name';
        filterDescription.value = (searchParam.typename instanceof Array) ? searchParam.typename : new Array(searchParam.typename);
        filterDescription.filterName = 'typename';
    }
    if (searchParam.level0 && searchParam.level0 != '') {
        filterDescription.name = 'level0';
        filterDescription.value = (searchParam.level0 instanceof Array) ? searchParam.level0 : new Array(searchParam.level0);
        filterDescription.filterName = 'level0';
    }
    if (searchParam.lastauthor && searchParam.lastauthor != '') {
        filterDescription.name = 'last-author';
        filterDescription.value = (searchParam.lastauthor instanceof Array) ? searchParam.lastauthor : new Array(searchParam.lastauthor);;
        filterDescription.filterName = 'lastauthor';
    }
    return filterDescription;
}

function constructMultiParamQuery(filterList, searchParam) {
    let postfilter = {
        bool: {
            must: new Array()
        }
    };

    if (filterList && filterList.length > 0) {
        for (let i = 0; i < filterList.length; i++) {
            let facetName = {};
            facetName[filterList[i]] = searchParam[filterList[i]];
            let filter = getSingleFilterParams(facetName);
            postfilter.bool.must.push(constructSingleFilter(filter))
        }

    }
    return postfilter;
}

function constructSingleFilter(filter) {
    let post_filter = {};
    if (filter.value && filter.value.length > 0) {
        post_filter = bodybuilder().filter('bool', b => {
            for (let i = 0; i < filter.value.length; i++) {
                b.orFilter('term', filter.name, filter.value[i])
            }
            return b;
        }).build();
    } else {
        post_filter = bodybuilder().filter('term', filter.name, filter.value[0]).build()
    }
    return post_filter.query;
}

function getFacetFilter(searchParam) {
    let post_filter = {};
    if (isMultiFilter(searchParam)) {
        let filterList = getFilterNames(searchParam);
        post_filter = constructMultiParamQuery(filterList, searchParam);
    } else {
        let filter = getSingleFilterParams(searchParam);
        if (!filter || Object.keys(filter).length == 0) {
            return post_filter;
        }
        post_filter = constructSingleFilter(filter);
    }
    return post_filter;
}

function getAggregationFilter(query, searchParam) {
    let filters = { filter: {} };
    filters.filter = getFacetFilter(searchParam);
    for (var i in query.body.aggs) {
        query.body.aggs[i].filter = filters.filter;
    }
    return query;

}
module.exports = {
    queryBuilder: function (searchParam) {
        const suggestions = {
            'text': searchParam.search,
            'suggestions': {
                "phrase": {
                    "field": "text",
                    "real_word_error_likelihood": 0.95,
                    "max_errors": 1,
                    "gram_size": 4,
                    "direct_generator": [
                        {
                            "field": "_all",
                            "suggest_mode": "always",
                            "min_word_length": 1
                        }
                    ]
                }
            }
        }
        const highlights = {
            "fields": {
                "text": { "pre_tags": ["<strong>"], "post_tags": ["</strong>"] },
                "work_notes_s": {

                }
            }
        }
        let query = {
            index: 'prod-seazme',
            body: bodybuilder()
                .query('simple_query_string', 'fields', ["text", "last-author", "level1"], { 'query': searchParam.search })
                .aggregation('aggs', 'bu-name', b => {
                    b.aggregation('cardinality', 'bu-name').aggregation('terms', 'bu-name')
                    return b;
                }, 'bu-name')
                .aggregation('aggs', 'kind-name', b => {
                    b.aggregation('cardinality', 'kind-name').aggregation('terms', 'kind-name')
                    return b;
                }, 'kind-name')
                .aggregation('aggs', 'level0', b => {
                    b.aggregation('cardinality', 'level0').aggregation('terms', 'level0')
                    return b;
                }, 'level0')
                .aggregation('aggs', 'last-author', b => {
                    b.aggregation('cardinality', 'last-author').aggregation('terms', 'last-author')
                    return b;
                }, 'last-author')

                .rawOption('highlight', highlights)
                .rawOption('suggest', suggestions)
                .from(10 * searchParam.page)
                .size(10)
                .build()
        }
        query =  getAggregationFilter(query, searchParam);
        query.body.post_filter = getFacetFilter(searchParam);
        return query;
    }

}

