import type { ParameterType } from './api-parameter-type';
export declare const Query: (classType: new () => any) => ParameterDecorator;
export declare const getQueryParameter: (target: any, propertyKey: string | symbol) => ParameterType;
