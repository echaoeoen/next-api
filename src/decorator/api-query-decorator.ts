import type { ParameterType } from './api-parameter-type';

const query = Symbol('query');

/**
 * A decorator to mark a parameter as a query parameter.
 *
 * @param classTypeParam - The class type of the parameter. If not provided, it will be inferred from the parameter type.
 * @returns A parameter decorator function.
 */
export const Query =
  (classTypeParam?: new () => any): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    const parameterTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey as string);
    const classType: new () => any = classTypeParam ?? parameterTypes[parameterIndex].prototype.constructor;
    Reflect.defineMetadata(
      query,
      {
        parameterIndex,
        classType,
      } as ParameterType,
      target,
      propertyKey as symbol,
    );
  };

export const getQueryParameter = (target: any, propertyKey: string | symbol): ParameterType => {
  return Reflect.getMetadata(query, target, propertyKey);
};
