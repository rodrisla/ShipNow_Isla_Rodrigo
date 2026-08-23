import mongoose from 'mongoose';
import { DELIVERY_PRIORITY, ORDER_STATUS } from '../constants/index.js';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario del pedido es obligatorio']
    },
    deliveryAddress: {
      type: String,
      required: [true, 'La dirección de entrega es obligatoria'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED
    },
    priority: {
      type: String,
      enum: Object.values(DELIVERY_PRIORITY),
      default: DELIVERY_PRIORITY.NORMAL
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const OrderModel = mongoose.model('Order', orderSchema);