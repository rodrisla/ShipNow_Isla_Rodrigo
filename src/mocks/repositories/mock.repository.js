import { DeliveryModel } from '../../models/delivery.model.js';
import { OrderModel } from '../../models/order.model.js';
import { UserModel } from '../../models/user.model.js';

class MockRepository {
  async insertUsers(users) {
    return UserModel.insertMany(users);
  }

  async insertOrders(orders) {
    return OrderModel.insertMany(orders);
  }

  async insertDeliveries(deliveries) {
    return DeliveryModel.insertMany(deliveries);
  }
}

export const mockRepository = new MockRepository();