import type { ParameterType } from './api-parameter-type';
import 'reflect-metadata';
const bodyMetadataKey = Symbol('body');
/**
 * The Body decorator is used to inject the request body as a parameter of a route handler.
 *
 * @param classTypeParam The class of the request body.
 * @returns A parameter decorator.
 *
 * @example
 *
 */
export const Body =
  (classTypeParam?: new () => any): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    const parameterTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey as string);
    const classType: new () => any = classTypeParam ?? parameterTypes[parameterIndex].prototype.constructor;
    Reflect.defineMetadata(
      bodyMetadataKey,
      {
        parameterIndex,
        classType,
      } as ParameterType,
      target,
      propertyKey as symbol,
    );
  };

/**
 * Gets the parameter metadata for the Body decorator.
 * @param target The target object that the decorator is attached to.
 * @param propertyKey The property key of the decorator.
 * @returns The parameter metadata.
 */
export const getBodyParameter = (target: any, propertyKey: string | symbol): ParameterType => {
  return Reflect.getMetadata(bodyMetadataKey, target, propertyKey);
};
