# Class Validation and Transformation
you need to use `class-validator` to validate and `class-transformer` to transform the incoming request.
```bash
$ yarn add class-validator class-transformer  
```

# Usage
create DTO class to define the rules:
```ts
import { IsNotEmpty, IsEmail } from 'class-validator';

export class UserRequest {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  fullName: string;
}
```

And, later we make use of the UserRequest in the request route handler.

```ts

class UserHandler {
    @POST()
    register(@Body() req: UserRequest) {
        await UserService.create(req);
    }
}
```

this can be applied for `@Query` aswell