import mongoose, { Schema } from "mongoose";
import { CarType, CarTransmission, CarFuel, CarState, CarStatus } from "../libs/enums/car.enum";

const carSchema = new Schema(
  {
    carStatus: {
      type: String,
      enum: CarStatus,
      default: CarStatus.PAUSE,
    },

    carType: {
      type: String,
      enum: CarType,
      required: true,
    },

    carName: {
      type: String,
      required: true,
    },

    carPrice: {
      type: Number,
      required: true,
    },

    carLeftCount: {
      type: Number,
      required: true,
    },

    carMileage: {
      type: Number,
      default: 0,
      required: true,
    },

    carYear: {
      type: Date,
      required: true,
    },

    carTransmission: {
      type: String,
      enum: CarTransmission,
      required: true,
    },

    carColor: {
      type: String,
      required: true,
    },

    carEngine: {
      type: Number,
      required: true,
    },

    carFuel: {
      type: String,
      enum: CarFuel,
      required: true,
    },

    carState: {
      type: String,
      enum: CarState,
      required: true,
    },

    carDeiscount: {
      type: Number,
      default: 0,
    },

    carImages: {
      type: [String],
      default: [],
    },

    carDesc: {
      type: String,
    },


    carViews: {
      type: Number,
      default: 0,
    },

    carBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    }
  },
  { timestamps: true } //updatedAt createdAt
);

carSchema.index(
  { carName: 1 },
  { unique: true }
);
export default mongoose.model("Car", carSchema);
