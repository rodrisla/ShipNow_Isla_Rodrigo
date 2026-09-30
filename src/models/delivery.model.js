import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { DELIVERY_STATUS } from '../constants/index.js';
import { fileMetadataSchema } from './schemas/file-metadata.schema.js';

const deliverySchema = new mongoose.Schema(
  {
    trackingCode: {
      type: String,
      default: () =>
        `SHP-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`,
      required: [true, 'El código de seguimiento es obligatorio'],
      match: [
        /^SHP-[A-F0-9]{12}$/,
        'El código de seguimiento no tiene un formato válido'
      ],
      unique: true,
      sparse: true,
      immutable: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'El pedido de la entrega es obligatorio']
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING
    },
    receipts: {
      type: [fileMetadataSchema],
      default: []
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const DeliveryModel = mongoose.model('Delivery', deliverySchema);
