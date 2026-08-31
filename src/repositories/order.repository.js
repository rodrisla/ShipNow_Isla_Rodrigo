import { OrderModel } from '../models/order.model.js';

class OrderRepository {
  async getAll() {
    return OrderModel.find().populate('user', '-password');
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
      { new: true, runValidators: true }
    ).populate('user', '-password');
  }
}

export const orderRepository = new OrderRepository();
