# Route Matching
You can use Express.js-style route matching with parameters inside your handlers.
```ts
// app/api/users/[[...params]]/route.ts
import { createHandler, Get, Param } from '@aslina/next-app-router-decorator';

class UserHandler {
  @Get()
  public list() {
    return DB.findAllUsers();
  }

  @Get('/api/users/:id') // this pattern should include the origin path ex: `/api/users`
  public details(@Query('id') id: string) {
    return DB.findUserById(id);
  }

  @Get('/api/users/:userId/comments')
  public comments(@Query('userId') userId: string) {
    return DB.findUserComments(userId);
  }

  @Get('/api/users/:userId/comments/:commentId')
  public commentDetails(@Query('userId') userId: string, @Query('commentId') commentId: string) {
    return DB.findUserCommentById(userId, commentId);
  }
}

module.exports = createHandler(UserHandler);
```
