import { DeliveryModel } from '../../models/delivery.model.js';
import { OrderModel } from '../../models/order.model.js';
import { ProductModel } from '../../models/product.model.js';
import { UserModel } from '../../models/user.model.js';

class MockRepository {
  async insertUsers(users) {
    return UserModel.insertMany(users);
  }

  async insertProducts(products) {
    return ProductModel.insertMany(products);
  }

  async insertOrders(orders) {
    return OrderModel.insertMany(orders);
  }

  async insertDeliveries(deliveries) {
    return DeliveryModel.insertMany(deliveries);
  }
}

export const mockRepository = new MockRepository();