"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryParameter = exports.Query = void 0;
const query = Symbol('query');
const Query = (classType) => (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(query, {
        parameterIndex,
        classType,
    }, target, propertyKey);
};
exports.Query = Query;
const getQueryParameter = (target, propertyKey) => {
    return Reflect.getMetadata(query, target, propertyKey);
};
exports.getQueryParameter = getQueryParameter;
//# sourceMappingURL=api-query-decorator.js.map