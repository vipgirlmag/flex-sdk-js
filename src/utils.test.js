import { methodPath, assignDeep } from './utils';

describe('utils', () => {
  describe('pathToMethodName', () => {
    it('takes URL path, returns method name', () => {
      expect(methodPath('users')).toEqual(['users']);
      expect(methodPath('/users')).toEqual(['users']);
      expect(methodPath('users/')).toEqual(['users']);
      expect(methodPath('/users/')).toEqual(['users']);
      expect(methodPath('/users/create/')).toEqual(['users', 'create']);
    });
  });

  describe('assignDeep', () => {
    it('assigns value to object to given path', () => {
      expect(assignDeep({}, ['sharetribe'], 1)).toEqual({ sharetribe: 1 });
      expect(assignDeep({ sharetribe: { listings: 1 } }, ['sharetribe', 'users'], 1)).toEqual({ sharetribe: { users: 1, listings: 1 } });
      expect(assignDeep({ sharetribe: { listings: 1 } }, ['sharetribe', 'users', 'create'], 1)).toEqual({ sharetribe: { users: { create: 1 }, listings: 1 } });
    });

    it('mutates the destination object', () => {
      const a = { a: 1 };
      const abc = assignDeep(a, ['b', 'c'], 1);

      expect(a).toEqual({ a: 1, b: { c: 1 } });
      expect(abc).toEqual({ a: 1, b: { c: 1 } });
      expect(a).toBe(abc);
    });
  });
});
