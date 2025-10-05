import { CarStatus, CarTransmission, CarType } from "../enums/car.enum";
import { ObjectId } from "mongoose";

export interface Car {
  _id: string;
  carStatus: CarStatus;
  carType: CarType;
  carName: string;
  carPrice: number;
  carLeftCount: number;
  carMileage?: number;
  carYear: Date;
  carTransmission: CarTransmission;
  carColor: string;
  carEngine: number;
  carFuel: string;
  carState?: string;
  carDeiscount?: number;
  carBrand: string;
  carDesc?: string;
  carImages: string[];
  carViews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarInquiry {
  order: string;
  page: number;
  limit: number;
  carType?: CarType;
  search?: string;
}

export interface CarInput {
  carStatus?: CarStatus;
  carType: CarType;
  carName: string;
  carPrice: number;
  carLeftCount: number;
  carMileage?: number;
  carYear: Date;
  carTransmission: CarTransmission;
  carColor: string;
  carEngine: number;
  carFuel: string;
  carState?: string;
  carDeiscount?: number;
  carBrand: string;
  carDesc?: string;
  carImages?: string[];
  carViews?: number;
}

export interface CarUpdateInput {
  _id: ObjectId;
  carStatus?: CarStatus;
  carType?: CarType;
  carName?: string;
  carPrice?: number;
  carLeftCount?: number;
  carMileage?: number;
  carYear?: Date;
  carTransmission?: CarTransmission;
  carColor?: string;
  carEngine?: number;
  carFuel?: string;
  carState?: string;
  carDeiscount?: number;
  carBrand?: string;
  carDesc?: string;
  carImages?: string[];
  carViews?: number;
}
