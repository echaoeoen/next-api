"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBodyParameter = exports.Body = void 0;
require("reflect-metadata");
const bodyMetadataKey = Symbol('body');
const Body = (classTypeParam) => (target, propertyKey, parameterIndex) => {
    const parameterTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    const classType = classTypeParam ?? parameterTypes[parameterIndex].prototype.constructor;
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