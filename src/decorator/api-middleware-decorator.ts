import { NextApiRequest } from 'next';
import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
const middlewareMetadataKey = Symbol('middleware');
export interface MiddlewareFunction {
    <T extends NextRequest & NextApiRequest>(req: T, next: () => void): Promise<void>;
}

export interface MiddlewareMetadataValue {
    fn: MiddlewareFunction;
    propertyKey?: string | symbol;
}

export const Middleware =
    (fn: MiddlewareFunction): ClassDecorator & MethodDecorator =>
    (target: Function | Object, propertyKey?: string | symbol) => {
        const middlewares = getMiddleware(target, propertyKey);
        middlewares.push({
            fn,
            propertyKey,
        })
        if(!propertyKey) Reflect.defineMetadata(
                middlewareMetadataKey,
                middlewares,
                target,
            ); 
        else Reflect.defineMetadata(
            middlewareMetadataKey,
            middlewares,
            target,
            propertyKey as symbol,
        );
    };

export const getMiddleware = (target: any, propertyKey?: string | symbol): MiddlewareMetadataValue[] => {
    const mds = propertyKey ? Reflect.getMetadata(middlewareMetadataKey, target, propertyKey) : Reflect.getMetadata(middlewareMetadataKey, target);
    return mds || [];
};
