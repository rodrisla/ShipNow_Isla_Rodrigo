import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/index.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [100, 'El nombre no puede superar los 100 caracteres']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede superar los 500 caracteres'],
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    stock: {
      type: Number,
      min: [0, 'El stock no puede ser negativo'],
      default: 0
    },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.OUT_OF_STOCK
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export const ProductModel = mongoose.model('Product', productSchema);