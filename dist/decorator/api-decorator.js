"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusCode = exports.Status = exports.getHandlerMetadata = exports.OPTIONS = exports.DELETE = exports.PATCH = exports.PUT = exports.GET = exports.POST = exports.HandleDecorator = exports.Methods = void 0;
require("reflect-metadata");
const class_transformer_1 = require("class-transformer");
const validator_1 = require("../validator");
const cookie_1 = require("../cookie");
const api_body_decorator_1 = require("./api-body-decorator");
const api_query_decorator_1 = require("./api-query-decorator");
const api_cookie_decorator_1 = require("./api-cookie-decorator");
const api_path_decorator_1 = require("./api-path-decorator");
const api_header_decorator_1 = require("./api-header-decorator");
const api_request_ip_decorator_1 = require("./api-request-ip-decorator");
const api_res_decorator_1 = require("./api-res-decorator");
const api_req_decorator_1 = require("./api-req-decorator");
const server_1 = require("next/server");
var Methods;
(function (Methods) {
    Methods["POST"] = "POST";
    Methods["GET"] = "GET";
    Methods["PUT"] = "PUT";
    Methods["PATCH"] = "PATCH";
    Methods["DELETE"] = "DELETE";
    Methods["OPTIONS"] = "OPTIONS";
})(Methods || (exports.Methods = Methods = {}));
const getClassValue = async (targetClass, request) => {
    const data = (0, class_transformer_1.plainToInstance)(targetClass, request);
    await (0, validator_1.validateRequest)(data);
    return data;
};
const getBody = async (req) => {
    return req.json && req.json() || req.body;
};
const getQuery = (req) => {
    if (req.nextUrl?.searchParams) {
        return Object.fromEntries(req.nextUrl.searchParams.entries());
    }
    return req.query;
};
const getHeaders = (req) => {
    if (req.headers.entries) {
        return Object.fromEntries(req.headers.entries());
    }
    return req.headers;
};
const handleApiDescriptor = (target, { propertyKey }, descriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (req, p) {
        console.log(p);
        const args = [];
        const bodyParameter = (0, api_body_decorator_1.getBodyParameter)(target, propertyKey);
        if (bodyParameter) {
            const body = await getBody(req);
            const data = await getClassValue(bodyParameter.classType, body);
            args[bodyParameter.parameterIndex] = data;
        }
        const queryParameter = (0, api_query_decorator_1.getQueryParameter)(target, propertyKey);
        if (queryParameter) {
            const params = { ...getQuery(req), ...p?.params };
            const data = await getClassValue(queryParameter.classType, params);
            args[queryParameter.parameterIndex] = data;
        }
        const cookieParameter = (0, api_cookie_decorator_1.getCookieParameter)(target, propertyKey);
        if (cookieParameter) {
            const cookie = (0, cookie_1.getCookieFunction)(req)(cookieParameter.key);
            args[cookieParameter.parameterIndex] = cookie;
        }
        const responsePipe = (0, api_res_decorator_1.getResponse)(target, propertyKey);
        if (responsePipe) {
            args[responsePipe.parameterIndex] = new server_1.NextResponse();
        }
        const requestPipe = (0, api_req_decorator_1.getRequest)(target, propertyKey);
        if (requestPipe) {
            args[requestPipe.parameterIndex] = req;
        }
        const cookieParserParameter = (0, api_cookie_decorator_1.getCookieParserParameter)(target, propertyKey);
        if (cookieParserParameter !== undefined) {
            args[cookieParserParameter.parameterIndex] = {
                set: (0, cookie_1.setCookieFunction)(req, cookieParserParameter.encryptionKey, p?.res),
                get: (0, cookie_1.getCookieFunction)(req, cookieParserParameter.encryptionKey),
            };
        }
        (0, api_path_decorator_1.getPathParametersMeta)(target, propertyKey).forEach((params) => {
            const par = req.query ? req.query[params.pathParameter] : p?.params[params.pathParameter];
            args[params.parameterIndex] = par;
        });
        const headerParameter = (0, api_header_decorator_1.getHeaderParameter)(target, propertyKey);
        if (headerParameter) {
            const header = getHeaders(req);
            if (headerParameter.key) {
                args[headerParameter.parameterIndex] = header[headerParameter.key];
            }
            else
                args[headerParameter.parameterIndex] = header.ent;
        }
        const ipAddressParameter = (0, api_request_ip_decorator_1.getIpAddressParameter)(target, propertyKey);
        if (ipAddressParameter !== undefined) {
            const header = getHeaders(req);
            args[ipAddressParameter] = header['x-forwarded-for'];
        }
        const response = await originalMethod.apply(this, args);
        return response;
    };
};
const HandleDecorator = (method, path) => (target, propertyKey, descriptor) => {
    const handlers = (0, exports.getHandlerMetadata)(target, method);
    const exists = handlers.find((handler) => handler.propertyKey === propertyKey && handler.path === path);
    if (exists)
        throw new Error(`Duplicate handler for ${method} ${path}`);
    handlers.push({ propertyKey, path });
    Reflect.defineMetadata(method, handlers, target);
    handleApiDescriptor(target, { path, propertyKey }, descriptor);
};
exports.HandleDecorator = HandleDecorator;
const POST = (path) => (0, exports.HandleDecorator)('POST', path);
exports.POST = POST;
const GET = (path) => (0, exports.HandleDecorator)('GET', path);
exports.GET = GET;
const PUT = (path) => (0, exports.HandleDecorator)('PUT', path);
exports.PUT = PUT;
const PATCH = (path) => (0, exports.HandleDecorator)('PATCH', path);
exports.PATCH = PATCH;
const DELETE = (path) => (0, exports.HandleDecorator)('DELETE', path);
exports.DELETE = DELETE;
const OPTIONS = (path) => (0, exports.HandleDecorator)('OPTIONS', path);
exports.OPTIONS = OPTIONS;
const getHandlerMetadata = (target, method) => {
    return Reflect.getMetadata(method, target) || [];
};
exports.getHandlerMetadata = getHandlerMetadata;
const Status = (code) => (target, propertyKey) => {
    Reflect.defineMetadata('statusCode', code, target, propertyKey);
};
exports.Status = Status;
const getStatusCode = (target, propertyKey) => {
    return Reflect.getMetadata('statusCode', target, propertyKey);
};
exports.getStatusCode = getStatusCode;
//# sourceMappingURL=api-decorator.js.map