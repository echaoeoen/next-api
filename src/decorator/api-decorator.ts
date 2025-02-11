import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateRequest } from '../validator';
import { getCookieFunction, setCookieFunction } from '../cookie';
import { getBodyParameter } from './api-body-decorator';
import { getQueryParameter } from './api-query-decorator';
import { getCookieParameter, getCookieParserParameter } from './api-cookie-decorator';
import { getPathParametersMeta } from './api-path-decorator';
import { getHeaderParameter } from './api-header-decorator';
import { getIpAddressParameter } from './api-request-ip-decorator';
import { getResponse } from './api-res-decorator';
import { getRequest } from './api-req-decorator';
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
export enum Methods {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS'
}

export interface Params {
    params: Record<string, string>
    res?: NextApiResponse
}

const getClassValue = async (targetClass: new () => any, request: any) => {
    const data = plainToInstance(targetClass, request);
    await validateRequest(data);
    return data;
};

const getBody = async (req: NextRequest | NextApiRequest) => {
    return (req as NextRequest).json && (req as NextRequest).json() || req.body;
}

const getQuery = (req: NextRequest | NextApiRequest) => {
    if((req as NextRequest).nextUrl?.searchParams) {
        return Object.fromEntries((req as NextRequest).nextUrl.searchParams.entries());
    }
    return (req as NextApiRequest).query;
}

const getHeaders = (req: NextRequest | NextApiRequest) => {
    if(req.headers.entries) {
        return Object.fromEntries((req as NextRequest).headers.entries());
    }
    return req.headers as Record<string, string>;
}
const handleApiDescriptor = (target, {
    propertyKey
}: {
    path?: string;
    propertyKey: string | symbol;
}, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req: NextRequest | NextApiRequest, p?: Params) {
        console.log(p)
        const args: any[] = [];
        const bodyParameter = getBodyParameter(target, propertyKey);
        if (bodyParameter) {
            const body = await getBody(req);
            const data = await getClassValue(bodyParameter.classType, body);
            args[bodyParameter.parameterIndex] = data;
        }
        const queryParameter = getQueryParameter(target, propertyKey);
        if (queryParameter) {
            
            const params = {...getQuery(req), ...p?.params};
            const data = await getClassValue(queryParameter.classType, params);
            args[queryParameter.parameterIndex] = data;
        }

        const cookieParameter = getCookieParameter(target, propertyKey);
        if (cookieParameter) {
            const  cookie = getCookieFunction(req)(cookieParameter.key as string);
            args[cookieParameter.parameterIndex] = cookie;
        }
        const responsePipe = getResponse(target, propertyKey);
        if (responsePipe) {
            args[responsePipe.parameterIndex] = new NextResponse();
        }
        const requestPipe = getRequest(target, propertyKey);
        if (requestPipe) {
            args[requestPipe.parameterIndex] = req;
        }
        const cookieParserParameter = getCookieParserParameter(target, propertyKey);
        if (cookieParserParameter !== undefined) {
            args[cookieParserParameter.parameterIndex] = {
                set: setCookieFunction(req, cookieParserParameter.encryptionKey, p?.res),
                get: getCookieFunction(req, cookieParserParameter.encryptionKey),
            };
        }
        getPathParametersMeta(target, propertyKey).forEach((params) => {
            const par = (req as NextApiRequest).query ? (req as NextApiRequest).query[params.pathParameter]:  p?.params[params.pathParameter]; 
            args[params.parameterIndex] = par;
        });
        const headerParameter = getHeaderParameter(target, propertyKey);
        if (headerParameter) {
            const header = getHeaders(req);
            if (headerParameter.key) {
                args[headerParameter.parameterIndex] = header[headerParameter.key];
            } else args[headerParameter.parameterIndex] = header.ent;
        }
        const ipAddressParameter = getIpAddressParameter(target, propertyKey);
        if (ipAddressParameter !== undefined) {
            const header = getHeaders(req);
            args[ipAddressParameter] = header['x-forwarded-for'];
        }
        const response = await originalMethod.apply(this, args);
        return response;
    };
};

export const HandleDecorator =
    (method: string, path?: string): MethodDecorator =>
    (target, propertyKey, descriptor: PropertyDescriptor) => {
        const handlers = getHandlerMetadata(target, method);
        const exists = handlers.find((handler) => handler.propertyKey === propertyKey &&  handler.path === path)
        if(exists) throw new Error(`Duplicate handler for ${method} ${path}`);
        handlers.push({ propertyKey, path });
        Reflect.defineMetadata(method, handlers, target);
        handleApiDescriptor(target, { path, propertyKey}, descriptor);
    };

export const POST = (path?: string) => HandleDecorator('POST', path);
export const GET = (path?: string) => HandleDecorator('GET', path);
export const PUT = (path?: string) => HandleDecorator('PUT', path);
export const PATCH = (path?: string) => HandleDecorator('PATCH', path);
export const DELETE = (path?: string) => HandleDecorator('DELETE', path);
export const OPTIONS = (path?: string) => HandleDecorator('OPTIONS', path);

export const getHandlerMetadata = (target: any, method: string): {
    propertyKey: string | symbol;
    path: string;
}[] => {
    return Reflect.getMetadata(method, target) || [];
};

export const Status =
    (code: number): MethodDecorator =>
    (target, propertyKey) => {
        Reflect.defineMetadata('statusCode', code, target, propertyKey);
    };

export const getStatusCode = (target: any, propertyKey: string | symbol): number => {
    return Reflect.getMetadata('statusCode', target, propertyKey);
};
