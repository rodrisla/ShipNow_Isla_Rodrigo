export const buildUser = (overrides = {}) => ({
  name: 'Usuario Test',
  email: 'usuario.test@shipnow.test',
  password: '123456',
  role: 'customer',
  ...overrides
});

export const buildOrder = (userId, overrides = {}) => ({
  user: userId,
  deliveryAddress: 'Av. Corrientes 1234',
  items: [
    {
      name: 'Teclado mecánico',
      quantity: 2,
      price: 25000
    }
  ],
  priority: 'normal',
  ...overrides
});
