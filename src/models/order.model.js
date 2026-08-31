import mongoose from 'mongoose';
import { DELIVERY_PRIORITY, ORDER_STATUS } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'El nombre del item es obligatorio'], trim: true },
    quantity: { type: Number, required: [true, 'La cantidad del item es obligatoria'], min: [1, 'La cantidad del item debe ser mayor a cero'] },
    price: { type: Number, required: [true, 'El precio del item es obligatorio'], min: [0, 'El precio del item no puede ser negativo'] }
  },
  { _id: false }
);

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
    items: {
      type: [orderItemSchema],
      required: [true, 'El pedido debe incluir al menos un item'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'El pedido debe incluir al menos un item'
      }
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