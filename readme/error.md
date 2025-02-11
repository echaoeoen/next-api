# Error
use HttpError to throw the httpStatus
```ts
import HttpError from '@aslina/next-app-router-decorator'
class UserHandler {
    @GET()
    getUser() {
        throw new HttpError("Bad request", 400)
    }
}
```
this will returns json object in the response
```json
{
    "message": "Bad Request"
}
```
with 400 error status

## Custom error
you can extend the class
```ts
import HttpError from '@aslina/next-app-router-decorator'
class NotFoundError extends HttpError{
    constructor(message: string) {
        super(message, 404)
    }
}
class UserHandler {
    @GET()
    getUser() {
        throw new NotFoundError("Bad request")
    }
}
