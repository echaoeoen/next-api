# Route
## Introduction

Defining routes are partially dictated by Next.js and can be read in depth [here](https://nextjs.org/docs/app/building-your-application/routing/route-handlers).

We provide the following built-in decorators for you to handle the HTTP method that corresponds to each:
* `@Get()`
* `@Post()`
* `@Put()`
* `@Delete()`
* `@Patch()`

Since Next.js expects the default export to be a request handler, we provide the `createHandler` function which accepts a class as the only parameter.

```ts
import { createHandler, Get } from 'next-app-router-decorator';

class UserHandler {
  @Get()
  users() {
    return 'Some User';
  }
}

module.exports = createHandler(UserHandler);
```

## Request object

In certain cases we may need to access the underlying request (`req`) object. We can access it by using the `@Req()` decorator.

```ts
import { createHandler, Get, Req } from 'next-app-router-decorator';
import { NextRequest } from 'next';

class UserHandler {
  @Get()
  users(@Req() req: NextRequest) {
    return `The url you requested: ${req.url}`
  }
}

module.exports = createHandler(UserHandler);
```

In most cases, you won't need to access the request object since we provide decorators for most use cases, such as `@Body` and `@Query`. You can read more about the decorators [here](./decorators)

## Status code

By default, the response status code is `200`, unless the returned value is `null` or `undefined`. In that case, the response status code is `204`. However, it's possible to change it per route.

```ts
import { createHandler, Post, Status } from 'next-app-router-decorator';

class UserHandler {
  @Post()
  @Status(201)
  create() {
    return 'You just created a new user.';
  }
}

module.exports = createHandler(UserHandler);
```

## Headers

Depending on your use case, you may either want to read a header value, set a custom one or do both. We provide `@Header` parameter decorator to read.

```ts
import { createHandler, Get, Header, SetHeader } from 'next-app-router-decorator';

class UserHandler {
  @Get()
  users(@Header('referer') referer: string) {
    return `Your referer is ${referer}`;
  }
}

module.exports = createHandler(UserHandler);
```

## Request payloads

In the [example](#status-code) above we created a `POST` request handler but we didn't expect the client to send any payload. Let's say, now we do want some data from the client, so first we need to determine the shape of the payload we expect. In order to do that we will use classes, which are part of the ES6 standard.

```ts
import { createHandler, Post, Body } from 'next-app-router-decorator';

class CreateUserInput {
  email: string;
  fullName: string;
}

class UserHandler {
  @Post()
  create(@Body() body: CreateUserInput) {
    // Do something with the body
    return `A new user is created with email address "${body.email}"`;
  }
}

module.exports = createHandler(UserHandler);
```

:::note
In theory, it's possible to use interfaces if you are using TypeScript. However, in order to make use of the `class-validator` using classes is the only way. You can read [why](/docs/validation#class-vs-interface) here.
:::
## Basic comparison

Assuming you have a handler (`app/api/user/route.ts`) to get the details of a user, and to create a user in which you also validate the incoming data.

In a naive way, you'd write your function like below:

```ts
export async function GET (req: NextRequest, p: { params }) {
    const user = await DB.findUserById(req.query.id);
    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        message: 'User not found'
      })
    }
    return NextResponse.json(user);
}
  
export async function POST(req: NextRequest, p: { params }) {
    if (!req.body.email || (req.body.email && !req.body.email.includes('@'))) {
      return NextResponse.json({
        message: 'Invalid e-mail address.'
      }, 400)
    }
    const user = await DB.createUser(req.body.email);
    return NextResponse.json(user, 201);
}
```

However, with `next-app-router-decorator` you can write the same handler in a declarative manner:

```ts
import { createHandler, Body, Get, HttpCode, NotFoundException, Post, Query, ValidationPipe } from 'next-app-router-decorator';

class User {
  @Get()
  async fetchUser(@Query('id') id: string) {
    const user = await DB.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  @Post()
  @HttpCode(201)
  async createUser(@Body() body: UserRequest) {
    return await UserRepository.create(body);
  }
}

module.exports = createHandler(UserHandler);
```