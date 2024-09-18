"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouteHandler = exports.createHandler = void 0;
const api_decorator_1 = require("./decorator/api-decorator");
const http_status_codes_1 = require("http-status-codes");
const utils_1 = require("./utils");
const server_1 = require("next/server");
function getHandler(handlers, req, params) {
    let url = req.nextUrl?.pathname || req.url;
    const handler = handlers.find(({ path }) => {
        if (!path)
            return true;
        const template = path.split('/');
        const queryIndexStart = url.indexOf('?');
        if (queryIndexStart !== -1) {
            url = url.substring(0, queryIndexStart);
        }
        const urlParts = url.split('/');
        for (const p in template) {
            if (template[p].startsWith(':')) {
                if (params?.params) {
                    params.params[template[p].substring(1)] = urlParts[p];
                }
                else {
                    req.query[template[p].substring(1)] = urlParts[p];
                }
                continue;
            }
            ;
            if (template[p] !== urlParts[p])
                return false;
        }
        return true;
    });
    return handler;
}
const createMethodHandler = (instance, method) => {
    const handlers = (0, api_decorator_1.getHandlerMetadata)(instance, method);
    if (handlers.length === 0) {
        return undefined;
    }
    return async (req, p) => {
        const handler = getHandler(handlers, req, p);
        if (!handler)
            return server_1.NextResponse.json({ message: 'Not found' }, { status: http_status_codes_1.StatusCodes.NOT_FOUND });
        const [error, resp] = await (0, utils_1.awaitToError)(instance[handler?.propertyKey].apply(instance, [req, p]));
        if (error) {
            const code = error.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
            return server_1.NextResponse.json({
                ...error,
                message: error.message,
            }, {
                status: code,
            });
        }
        const status = (0, api_decorator_1.getStatusCode)(instance, handler?.propertyKey) || 200;
        return server_1.NextResponse.json(resp, { status });
    };
};
const createHandler = (target) => {
    const instance = new target();
    const exported = {};
    for (const method of Object.values(api_decorator_1.Methods)) {
        const m = createMethodHandler(instance, method);
        if (m) {
            exported[method] = m;
        }
    }
    return exported;
};
exports.createHandler = createHandler;
const createApiRouteHandler = (target) => {
    const instance = new target();
    return async (req, res) => {
        const handlers = (0, api_decorator_1.getHandlerMetadata)(instance, req.method);
        if (handlers.length === 0) {
            return undefined;
        }
        const handler = getHandler(handlers, req);
        if (!handler) {
            res.status(404).json({
                "message": "not found"
            });
        }
        const [error, resp] = await (0, utils_1.awaitToError)(instance[handler?.propertyKey].apply(this, [req, { res }]));
        if (error) {
            const code = error.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR;
            return res.status(code).json({
                ...error,
                message: error.message,
            });
        }
        const status = (0, api_decorator_1.getStatusCode)(instance, handler?.propertyKey) || 200;
        return res.status(status).json(resp);
    };
};
exports.createApiRouteHandler = createApiRouteHandler;
//# sourceMappingURL=create-handler.js.map