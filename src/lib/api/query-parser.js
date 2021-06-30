import _ from 'lodash';
import mongoose from 'mongoose';

/**
 * The QueryParser class
 */
class QueryParser {
    /**
     * @constructor
     * @param {Object} query This is a query object of the request
     */
    constructor(query) {
        console.log('query', this.sanitize(query));
        this._query = {...query };
        this.initialize(query);
        const excluded = [
            'per_page', 'page', 'limit', 'sort', 'all', 'includes',
            'selection', 'population', 'search', 'regex', 'nested', 'range',
        ];
        // omit special query string keys from query before passing down to the model for filtering
        this._query = _.omit(this._query, ...excluded);
        // Only get collection that has not been virtually deleted.
        // _.extend(this._query, { deleted: false });
        Object.assign(this, this._query);
        // TODO: Show emma
    }

    /**
     * @return {Object} get the parsed query
     */
    get query() {
        return this._query;
    }

    /**
     * @param {Object} query set the parsed query
     */
    set query(query) {
        this._query = query;
    }

    /**
     * @return {Object} get the parsed query
     */
    get search() {
        return this._search;
    }

    /**
     * @return {Object} get the selection property
     */
    get selection() {
        if (this._selection) {
            return this._selection;
        }
        return [];
    }

    /**
     * @param {Object} value is the population object
     */
    set selection(value) {
        this._selection = value;
    }

    /**
     * @return {Object} get the population object for query
     */
    get population() {
        if (this._population) {
            return this._population;
        }
        return [];
    }

    /**
     * @param {Object} value is the population object
     */
    set population(value) {
        this._population = value;
        if (!_.isObject(value)) {
            try {
                this._population = JSON.parse(value.toString());
            } catch (e) {
                console.log(e);
            }
        }
    }

    /**
     * @return {Object} get the range object for query
     */
    get range() {
        if (this.range) {
            return this.range;
        }
        return {};
    }

    /**
     * @param {Object} value is the population object
     */
    set range(value) {
        this._range = value;
        if (!_.isObject(value)) {
            try {
                this._range = JSON.parse(value.toString());
            } catch (e) {
                console.log(e);
            }
        }
    }


    /**
     * when String i.e ?sort=name it is sorted by name ascending order
     * when Object ?sort[name]=desc {name: 'desc'} it is sorted by name descending order
     * when Object ?sort[name]=desc,sort[age]=asc {name: 'desc', age: 'asc'} it is sorted by name desc and age asc order
     *
     * @return {Object} get the sort property
     */
    get sort() {
        if (this._sort) {
            if (!_.isObject(this._sort)) {
                try {
                    this._sort = JSON.parse(this._sort);
                } catch (e) {
                    return {
                        [this._sort]: 1
                    };
                }
            }

            for (const [column, direction] of Object.entries(this._sort)) {
                if (_.isString(direction))
                    this._sort[column] = (direction.toLowerCase() === 'asc') ? 1 : -1;
            }

            return this._sort;
        }
        return { createdAt: -1 };
    }

    /**
     * @return {Boolean} get the value for all data request
     */
    get getAll() {
        return this._all;
    }

    /**
     *  Initialise all the special object required for the find query
     *  @param {Object} query This is a query object of the request
     */

     sanitize(query){
        Object.keys(query).forEach(object =>{
            if (object.includes('=')){
                query[object.replace('=', '')] = query[object]
                delete query[object]
            }
        })
        return query;
     }

    /**
     *  Initialise all the special object required for the find query
     *  @param {Object} query This is a query object of the request
     */
    initialize(query) {
        this._all = query.all;
        this._sort = query.sort;
        if (query.population) {
            this.population = query.population;
        }
        if (query.selection) {
            this.selection = query.selection;
        }
        if (query.search) {
            this._search = query.search;
        }
        if (query.nested) {
            this._query = {...this._query, ...this.processNestedQuery(query) };
        }
        if (query.regex) {
            this._query = {...this._query, ...this.processRegSearch(query) };
        }
        if (Object.keys(query).includes('range')) {
            console.log('range rove')
            this._query = {...this._query, ...this.processRangeQuery(query)};
            console.log('range', query.range);
        }
    }

    /**
     * @param {Object} query is the population object
     * @return {Object} get the parsed query
     */
    processNestedQuery(query) {
        let value = query.nested;
        let result = {};
        if (value) {
            try {
                value = JSON.parse(value.toString());
                for (const filter of value) {
                    if (filter.hasOwnProperty('key') &&
                        filter.hasOwnProperty('value')) {
                        if (filter.value.in_array) {
                            filter.value = { $in: filter.value.in_array.filter(v => mongoose.Types.ObjectId.isValid(v)) };
                        }
                        result[filter.key] = filter.value;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        return result;
    }

    /**
     * @param {Object} query is the population object
     * @return {Object} get the parsed query
     */
    processRegSearch(query) {
        const value = query.regex;
        const result = {};
        if (!_.isObject(value)) {
            try {
                const regex = JSON.parse(value.toString());
                for (const r of regex) {
                    const q = new RegExp(r.value);
                    result[r.key] = { $regex: q, $options: 'i' };
                }
            } catch (e) {
                console.log(e);
            }
        }
        return result;
    }

    /**
     * @param {Object} query is the population object
     * @return {Object} get the parsed query
     */
    processRangeQuery(query) {
        const range = query.range;
        console.log(new Date(range.startDate))
        console.log(range.endDate)
        if (range.startDate && range.endDate){
            return {
                createdAt : {
                    $gte : new Date(range.startDate), 
                    $lt: new Date(range.endDate)
                    }
                }
        }
    }

}

/**
 * @typedef QueryParser
 */
export default QueryParser;
