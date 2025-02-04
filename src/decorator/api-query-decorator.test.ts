import 'reflect-metadata';
import { Query, getQueryParameter } from './api-query-decorator'; // Update path accordingly

class MockQueryClass {
  // Example class to pass to the Query decorator
  value: string = 'test';
}

describe('Query Decorator', () => {
  it('should store metadata for the query parameter', () => {
    class TestClass {
      someMethod(@Query(MockQueryClass) queryParam: MockQueryClass) {}
    }

    const metadata = getQueryParameter(TestClass.prototype, 'someMethod');

    expect(metadata).toEqual({
      parameterIndex: 0, // First parameter in someMethod
      classType: MockQueryClass, // Class provided to Query decorator
    });
  });

  it('should store metadata for the query parameter with inferred class type', () => {
    class TestClass {
      someMethod(@Query() queryParam: MockQueryClass) {}
    }

    const metadata = getQueryParameter(TestClass.prototype, 'someMethod');

    expect(metadata).toEqual({
      parameterIndex: 0, // First parameter in someMethod
      classType: MockQueryClass, // Class inferred from parameter type
    });
  });
});
