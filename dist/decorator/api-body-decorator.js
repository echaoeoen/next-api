"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBodyParameter = exports.Body = void 0;
require("reflect-metadata");
const bodyMetadataKey = Symbol('body');
const Body = (classType) => (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(bodyMetadataKey, {
        parameterIndex,
        classType,
    }, target, propertyKey);
};
exports.Body = Body;
const getBodyParameter = (target, propertyKey) => {
    return Reflect.getMetadata(bodyMetadataKey, target, propertyKey);
};
exports.getBodyParameter = getBodyParameter;
//# sourceMappingURL=api-body-decorator.js.map