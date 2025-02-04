import 'reflect-metadata';
import { Body, getBodyParameter } from './api-body-decorator';

class MockBodyClass {
  data: string;
}

describe('Body Decorator', () => {
  it('should store metadata for the body parameter', () => {
    class TestClass {
      someMethod(@Body(MockBodyClass) body: MockBodyClass) {}
    }

    const metadata = getBodyParameter(TestClass.prototype, 'someMethod');
    expect(metadata).toEqual({
      parameterIndex: 0,
      classType: MockBodyClass,
    });
  });

  it('should store metadata for the body parameter with inferred class type', () => {
    class TestClass {
      someMethod(@Body() body: MockBodyClass) {}
    }

    const metadata = getBodyParameter(TestClass.prototype, 'someMethod');
    expect(metadata).toEqual({
      parameterIndex: 0,
      classType: MockBodyClass,
    });
  });
});
