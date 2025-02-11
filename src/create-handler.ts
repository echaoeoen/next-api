import type { NextApiRequest, NextApiResponse } from 'next';
import { getHandlerMetadata, getStatusCode, Methods, Params } from './decorator/api-decorator';
import { StatusCodes } from 'http-status-codes'
import { awaitToError, HttpError } from './utils';
import { NextRequest, NextResponse } from 'next/server';
import { getMiddleware, MiddlewareMetadataValue } from './decorator/api-middleware-decorator';

function getHandler (handlers: {
    propertyKey: string | symbol;
    path: string;
}[], req: NextApiRequest | NextRequest, params?: Params) {    
    let url = (req as NextRequest).nextUrl?.pathname || req.url;
    const handler = handlers.find(({ path }) => {
        if(!path) return true;
        const template = path.split('/');
        const queryIndexStart = url.indexOf('?');
        if(queryIndexStart !== -1) {
            url = url.substring(0, queryIndexStart);
        }
        const urlParts = url.split('/');

        for (const p in template) {
            if(template[p].startsWith(':')) {
                if (params?.params) {
                    params.params[template[p].substring(1)] = urlParts[p];
                } else {
                    (req as NextApiRequest).query[template[p].substring(1)] = urlParts[p];
                }
                continue;
            };
            if(template[p] !== urlParts[p]) return false;
        }
        
        return template.length === urlParts.length;
    });
    return handler;
}
async function executeMiddlewares(middlewares: MiddlewareMetadataValue[], req: NextRequest & NextApiRequest, index = 0): Promise<unknown> {
    if (index < middlewares.length) {
      return middlewares[index].fn(req , () => executeMiddlewares(middlewares, req, index + 1));
    }
  }
const createMethodHandler = <T>(instance: T, method: Methods, c: new() => T) => {

    const handlers = getHandlerMetadata(instance, method);
    if (handlers.length === 0) {
        return undefined;
    }
    const globalMiddlewares = getMiddleware(c);
    return async (req: NextRequest, p: Params) => {
        const handler = getHandler(handlers, req, p);
        if(!handler) return NextResponse.json({ message: 'Not found'}, { status: StatusCodes.NOT_FOUND});
        const methodMiddlewares = getMiddleware(instance, handler.propertyKey);
        const handlerFn: MiddlewareMetadataValue = {
            fn: (req: NextRequest) => instance[handler?.propertyKey].apply(instance, [req, p, handler.path])
        }
        const middlewares = [...globalMiddlewares, ...methodMiddlewares, handlerFn];
        const [error, resp] = await awaitToError<HttpError>(executeMiddlewares(middlewares, req as any));
        if (error) {
            const code = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
            return NextResponse.json({
                ...error,
                message: error.message,
            }, {
                status: code,
            });
        }
        const status = getStatusCode(instance, handler?.propertyKey) || 200;
        return NextResponse.json(resp, { status });
    };
}

/**
 * Creates a Next.js API handler from a class with decorated methods.
 *
 * Given a class with methods decorated with `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`, this function
 * will create a Next.js API handler. The handler will work by calling the method on the class
 * that matches the incoming request method. If no matching method is found, it will return a
 * 405 Method Not Allowed response.
 *
 * The handler will also catch any exceptions thrown by the called method and return a 500
 * Internal Server Error response with the error details.
 *
 * @param target The class to create the handler for.
 * @returns A Next.js API handler.
 */
export const createHandler = <T>(target: new () => T) => {
    const instance = new target();
    const exported: Partial<Record<Methods, (req: NextRequest, p: Params) => Promise<NextResponse<unknown>>>> = {}
    for (const method of Object.values(Methods)) {
        const m = createMethodHandler(instance, method, target);
        if (m) {
            exported[method] = m;
        }
    }
    return exported;
};


/**
 * Creates a Next.js API handler from a class with decorated methods.
 *
 * Given a class with methods decorated with `@GET`, `@POST`, `@PUT`, `@DELETE`, `@PATCH`, this function
 * will create a Next.js API handler. The handler will work by calling the method on the class
 * that matches the incoming request method. If no matching method is found, it will return a
 * 405 Method Not Allowed response.
 *
 * The handler will also catch any exceptions thrown by the called method and return a 500
 * Internal Server Error response with the error details.
 *
 * @param target The class to create the handler for.
 * @returns A Next.js API handler.
 */
export const createApiRouteHandler = <T>(target: new () => T) => {
    const instance = new target();
    const globalMiddlewares = getMiddleware(target);
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const handlers = getHandlerMetadata(instance, req.method as string);
        if (handlers.length === 0) {
            return undefined;
        }
        const handler = getHandler(handlers, req);
        if(!handler) {
            res.status(404).json({
                "message": "not found"
            })
        }
        const methodMiddlewares = getMiddleware(instance, handler?.propertyKey);
        const handlerFn: MiddlewareMetadataValue = {
            fn: (req: NextApiRequest) => instance[handler?.propertyKey].apply(this, [req, { res }, handler?.path])
        }
        const middlewares = [...globalMiddlewares, ...methodMiddlewares, handlerFn];

        const [error, resp] = await awaitToError<HttpError>(executeMiddlewares(middlewares, req as any));

        if (error) {
            const code = error.status || StatusCodes.INTERNAL_SERVER_ERROR;
            return res.status(code).json({
                ...error,
                message: error.message,
            });
        }
        const status = getStatusCode(instance, handler?.propertyKey) || 200;
        return res.status(status).json(resp);
    };
};
