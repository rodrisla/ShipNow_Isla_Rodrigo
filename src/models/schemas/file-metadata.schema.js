import mongoose from 'mongoose';

import {
  DELIVERY_DOCUMENT_TYPES,
  USER_DOCUMENT_TYPES
} from '../../constants/index.js';

const DOCUMENT_TYPES = [
  ...Object.values(USER_DOCUMENT_TYPES),
  ...Object.values(DELIVERY_DOCUMENT_TYPES)
];

export const fileMetadataSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    storedName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    },
    documentType: {
      type: String,
      required: true,
      enum: DOCUMENT_TYPES
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);
