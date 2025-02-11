# Page API Router
you can use this decorator on page api router as well `pages/api/user.ts`
```ts
import { createApiRouteHandler } from '@aslina/next-app-router-decorator'

class UserHandler {
  @Get()
  users() {
    return 'Some User';
  }
}

export default createApiRouteHandler(UserHandler);
```

when you use Page Router the `@Req()` decorator will returns `NextApiRequest` object instead of use `NextRequest`