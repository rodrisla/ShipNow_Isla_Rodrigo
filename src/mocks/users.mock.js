import { fakerES } from '@faker-js/faker';
import { USER_ROLES } from '../constants/index.js';

const MOCK_USER_ROLES = [USER_ROLES.CUSTOMER, USER_ROLES.DRIVER];

export const generateMockUser = (role = fakerES.helpers.arrayElement(MOCK_USER_ROLES)) => ({
  _id: fakerES.database.mongodbObjectId(),
  name: fakerES.person.fullName(),
  email: `${fakerES.string.uuid()}@shipnow.test`,
  password: fakerES.internet.password({ length: 8 }),
  role,
  active: true
});

export const generateMockUsers = (quantity, role) =>
  Array.from({ length: quantity }, () => generateMockUser(role));