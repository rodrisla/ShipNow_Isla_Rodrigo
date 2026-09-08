import { OrderModel } from '../models/order.model.js';

class OrderRepository {
  async getAll({ filter = {}, skip = 0, limit = 10 } = {}) {
    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', '-password')
        .lean(),
      OrderModel.countDocuments(filter)
    ]);

    return { orders, total };
  }

  async getById(id) {
    return OrderModel.findById(id).populate('user', '-password');
  }

  async create(orderData) {
    const order = await OrderModel.create(orderData);

    return order.populate('user', '-password');
  }

  async updateStatus(id, status) {
    return OrderModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', '-password');
  }
}

export const orderRepository = new OrderRepository();
