import type { ParameterType } from './api-parameter-type';
import 'reflect-metadata';
export declare const Body: (classType: new () => any) => ParameterDecorator;
export declare const getBodyParameter: (target: any, propertyKey: string | symbol) => ParameterType;
