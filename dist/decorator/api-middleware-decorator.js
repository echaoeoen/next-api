"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMiddleware = exports.Middleware = void 0;
require("reflect-metadata");
const middlewareMetadataKey = Symbol('middleware');
const Middleware = (fn) => (target, propertyKey) => {
    const middlewares = (0, exports.getMiddleware)(target, propertyKey);
    middlewares.push({
        fn,
        propertyKey,
    });
    if (!propertyKey)
        Reflect.defineMetadata(middlewareMetadataKey, middlewares, target);
    else
        Reflect.defineMetadata(middlewareMetadataKey, middlewares, target, propertyKey);
};
exports.Middleware = Middleware;
const getMiddleware = (target, propertyKey) => {
    const mds = propertyKey ? Reflect.getMetadata(middlewareMetadataKey, target, propertyKey) : Reflect.getMetadata(middlewareMetadataKey, target);
    return mds || [];
};
exports.getMiddleware = getMiddleware;
//# sourceMappingURL=api-middleware-decorator.js.map