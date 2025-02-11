import 'reflect-metadata';
import { NextApiResponse } from 'next';
export declare enum Methods {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
    OPTIONS = "OPTIONS"
}
export interface Params {
    params: Record<string, string>;
    res?: NextApiResponse;
}
export declare const HandleDecorator: (method: string, path?: string) => MethodDecorator;
export declare const POST: (path?: string) => MethodDecorator;
export declare const GET: (path?: string) => MethodDecorator;
export declare const PUT: (path?: string) => MethodDecorator;
export declare const PATCH: (path?: string) => MethodDecorator;
export declare const DELETE: (path?: string) => MethodDecorator;
export declare const OPTIONS: (path?: string) => MethodDecorator;
export declare const getHandlerMetadata: (target: any, method: string) => {
    propertyKey: string | symbol;
    path: string;
}[];
export declare const Status: (code: number) => MethodDecorator;
export declare const getStatusCode: (target: any, propertyKey: string | symbol) => number;
