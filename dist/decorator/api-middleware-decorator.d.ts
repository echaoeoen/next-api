import { NextApiRequest } from 'next';
import 'reflect-metadata';
import { NextRequest } from 'next/server';
export interface MiddlewareFunction {
    <T extends NextRequest & NextApiRequest>(req: T, next: () => void): Promise<void>;
}
export interface MiddlewareMetadataValue {
    fn: MiddlewareFunction;
    propertyKey?: string | symbol;
}
export declare const Middleware: (fn: MiddlewareFunction) => ClassDecorator & MethodDecorator;
export declare const getMiddleware: (target: any, propertyKey?: string | symbol) => MiddlewareMetadataValue[];
