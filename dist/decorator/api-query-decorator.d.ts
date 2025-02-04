import type { ParameterType } from './api-parameter-type';
export declare const Query: (classTypeParam?: new () => any) => ParameterDecorator;
export declare const getQueryParameter: (target: any, propertyKey: string | symbol) => ParameterType;
