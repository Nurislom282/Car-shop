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

brandSchema.index(
  { productName: 1 },
  { unique: true }
);
export default mongoose.model("CarBrand", brandSchema);
