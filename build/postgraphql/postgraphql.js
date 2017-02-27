"use strict";
var tslib_1 = require("tslib");
var pg_1 = require("pg");
var pg_connection_string_1 = require("pg-connection-string");
var events_1 = require("events");
var chalk = require("chalk");
var createPostGraphQLSchema_1 = require("./schema/createPostGraphQLSchema");
var createPostGraphQLHttpRequestHandler_1 = require("./http/createPostGraphQLHttpRequestHandler");
var watchPgSchemas_1 = require("./watch/watchPgSchemas");
function postgraphql(poolOrConfig, schemaOrOptions, maybeOptions) {
    var schema;
    var options;
    // If the second argument is undefined, use defaults for both `schema` and
    // `options`.
    if (typeof schemaOrOptions === 'undefined') {
        schema = 'public';
        options = {};
    }
    else if (typeof schemaOrOptions === 'string' || Array.isArray(schemaOrOptions)) {
        schema = schemaOrOptions;
        options = maybeOptions || {};
    }
    else {
        schema = 'public';
        options = schemaOrOptions;
    }
    // Creates the Postgres schemas array.
    var pgSchemas = Array.isArray(schema) ? schema : [schema];
    // Do some things with `poolOrConfig` so that in the end, we actually get a
    // Postgres pool.
    var pgPool = 
    // If it is already a `Pool`, just use it.
    poolOrConfig instanceof pg_1.Pool
        ? poolOrConfig
        : new pg_1.Pool(typeof poolOrConfig === 'string'
            ? pg_connection_string_1.parse(poolOrConfig)
            : poolOrConfig || {});
    // Creates a promise which will resolve to a GraphQL schema. Connects a
    // client from our pool to introspect the database.
    //
    // This is not a constant because when we are in watch mode, we want to swap
    // out the `gqlSchema`.
    var gqlSchema = createGqlSchema();
    var _emitter = new events_1.EventEmitter();
    // If the user wants us to watch the schema, execute the following:
    if (options.watchPg) {
        watchPgSchemas_1.default({
            pgPool: pgPool,
            pgSchemas: pgSchemas,
            onChange: function (_a) {
                var commands = _a.commands;
                // tslint:disable-next-line no-console
                console.log("Rebuilding PostGraphQL API after Postgres command(s): \uFE0F" + commands.map(function (command) { return chalk.bold.cyan(command); }).join(', '));
                _emitter.emit('schemas:changed');
                // Actually restart the GraphQL schema by creating a new one. Note that
                // `createGqlSchema` returns a promise and we aren’t ‘await’ing it.
                gqlSchema = createGqlSchema();
            },
        })
            .catch(function (error) {
            // tslint:disable-next-line no-console
            console.error(error.stack + "\n");
            process.exit(1);
        });
    }
    // Finally create our Http request handler using our options, the Postgres
    // pool, and GraphQL schema. Return the final result.
    return createPostGraphQLHttpRequestHandler_1.default(Object.assign({}, options, {
        getGqlSchema: function () { return gqlSchema; },
        pgPool: pgPool,
        _emitter: _emitter,
    }));
    /**
     * Creates a GraphQL schema by connecting a client from our pool which will
     * be used to introspect our Postgres database. If this function fails, we
     * will log the error and exit the process.
     *
     * This may only be executed once, at startup. However, if we are in watch
     * mode this will be updated whenever there is a change in our schema.
     */
    function createGqlSchema() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pgClient, newGqlSchema, error_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, pgPool.connect()];
                    case 1:
                        pgClient = _a.sent();
                        return [4 /*yield*/, createPostGraphQLSchema_1.default(pgClient, pgSchemas, options)];
                    case 2:
                        newGqlSchema = _a.sent();
                        // If no release function exists, don’t release. This is just for tests.
                        if (pgClient && pgClient.release)
                            pgClient.release();
                        return [2 /*return*/, newGqlSchema];
                    case 3:
                        error_1 = _a.sent();
                        // tslint:disable no-console
                        console.error(error_1.stack + "\n");
                        process.exit(1);
                        // This is just here to make TypeScript type check. `process.exit` will
                        // quit our program meaning we never execute this code.
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = postgraphql;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdGdyYXBocWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcG9zdGdyYXBocWwvcG9zdGdyYXBocWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5QkFBcUM7QUFDckMsNkRBQXVFO0FBRXZFLGlDQUFxQztBQUNyQyw2QkFBK0I7QUFDL0IsNEVBQXNFO0FBQ3RFLGtHQUFvSDtBQUNwSCx5REFBbUQ7QUF5Qm5ELHFCQUNFLFlBQXlDLEVBQ3pDLGVBQTZELEVBQzdELFlBQWlDO0lBRWpDLElBQUksTUFBOEIsQ0FBQTtJQUNsQyxJQUFJLE9BQTJCLENBQUE7SUFFL0IsMEVBQTBFO0lBQzFFLGFBQWE7SUFDYixFQUFFLENBQUMsQ0FBQyxPQUFPLGVBQWUsS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sR0FBRyxRQUFRLENBQUE7UUFDakIsT0FBTyxHQUFHLEVBQUUsQ0FBQTtJQUNkLENBQUM7SUFJRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxlQUFlLEtBQUssUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9FLE1BQU0sR0FBRyxlQUFlLENBQUE7UUFDeEIsT0FBTyxHQUFHLFlBQVksSUFBSSxFQUFFLENBQUE7SUFDOUIsQ0FBQztJQUdELElBQUksQ0FBQyxDQUFDO1FBQ0osTUFBTSxHQUFHLFFBQVEsQ0FBQTtRQUNqQixPQUFPLEdBQUcsZUFBZSxDQUFBO0lBQzNCLENBQUM7SUFFRCxzQ0FBc0M7SUFDdEMsSUFBTSxTQUFTLEdBQWtCLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7SUFFMUUsMkVBQTJFO0lBQzNFLGlCQUFpQjtJQUNqQixJQUFNLE1BQU07SUFDViwwQ0FBMEM7SUFDMUMsWUFBWSxZQUFZLFNBQUk7VUFDeEIsWUFBWTtVQUNaLElBQUksU0FB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