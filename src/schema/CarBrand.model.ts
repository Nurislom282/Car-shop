import mongoose, { Schema } from "mongoose";

const brandSchema = new Schema(
  {
    BrandName: {
      type: String,
      required: true,
    },

    BrandImages: {
      type: [String],
      default: [],
    },

    BrandViews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } //updatedAt createdAt
);

// Ensure BrandName is unique to prevent duplicate brand entries
brandSchema.index({ BrandName: 1 }, { unique: true });
export default mongoose.model("CarBrand", brandSchema);
