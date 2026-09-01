import { DeliveryModel } from '../models/delivery.model.js';

const deliveryPopulate = [
  {
    path: 'order',
    populate: {
      path: 'user',
      select: '-password'
    }
  },
  {
    path: 'driver',
    select: '-password'
  }
];

class DeliveryRepository {
  async getAll() {
    return DeliveryModel.find().populate(deliveryPopulate);
  }

  async getById(id) {
    return DeliveryModel.findById(id).populate(deliveryPopulate);
  }

  async create(deliveryData) {
    const delivery = await DeliveryModel.create(deliveryData);

    return delivery.populate(deliveryPopulate);
  }

  async addReceipt(id, receipt) {
    return DeliveryModel.findByIdAndUpdate(
      id,
      { $push: { receipts: receipt } },
      { returnDocument: 'after', runValidators: true }
    ).populate(deliveryPopulate);
  }

  async updateStatus(id, status) {
    return DeliveryModel.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: 'after', runValidators: true }
    ).populate(deliveryPopulate);
  }
}

export const deliveryRepository = new DeliveryRepository();
