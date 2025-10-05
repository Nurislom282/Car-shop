import { CarStatus } from "../libs/enums/car.enum";
import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Car, CarInput, CarInquiry, CarUpdateInput } from "../libs/types/car";
import CarModel from "../schema/Car.model";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";

class CarService {
    private readonly carModel;
    public viewService;
    constructor() {
        this.carModel = CarModel;
        this.viewService = new ViewService();
    }

    /* SPA */
    public async getCars(inquery: CarInquiry): Promise<Car[]> {
        const match: T = { carStatus: CarStatus.PROCESS };

        if (inquery.carType)
            match.carType = inquery.carType;

        if (inquery.search)
            match.carName = { $regex: new RegExp(inquery.search, "i") };

        const sort: T =
            inquery.order === "carDeiscount"
                ? { [inquery.order]: 1 }
                : { [inquery.order]: -1 };

        const result = await this.carModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (inquery.page * 1 - 1) * inquery.limit }, // page 1 => 0,page 2 = 4,5,6,page 3 => 7,8,9
                { $limit: inquery.limit * 1 }, //3
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async getCar(
        memberId: ObjectId | null,
        id: string
    ): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);

        let result = await this.carModel
            .findOne({
                _id: carId,
                carStatus: CarStatus.PROCESS,
            })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (memberId) {
            //Check Existence
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: carId,
                viewGroup: ViewGroup.CAR,
            };
            const existView = await this.viewService.checkViewExistence(input);
            console.log("exist:", !!existView);
            if (!existView) {
                //Insert View
                console.log("PlANNING TO INSERT NEW VIEW");
                await this.viewService.insertMemberView(input);

                //Insert Counts
                result = this.carModel
                    .findByIdAndUpdate(
                        carId,
                        { $inc: { carViews: +1 } },
                        { new: true }
                    )
                    .exec();
            }
        }
        return result;
    }

    /* SSR */
    public async getCarsSSR(): Promise<Car[]> {
        //String => ObjectId
        const result = await this.carModel.find().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        console.log("result:", result);
        return result;
    }

    public async getCarById(id: string): Promise<Car> {
        const carId = shapeIntoMongooseObjectId(id);
        const result = await this.carModel.findById(carId).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    public async createNewCar(input: CarInput): Promise<Car> {
        try {
            return await this.carModel.create(input);
        } catch (err) {
            console.error("Error, model:createNewCar:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async updateCar(input: CarUpdateInput): Promise<Car> {
        try {
            return await this.carModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
        } catch (err) {
            console.error("Error, model:updateCar:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.UPDATE_FAILED);
        }
    }

    public async getUpdateChosenCar(id: string, input: CarUpdateInput): Promise<Car> {
        //String => ObjectId
        id = shapeIntoMongooseObjectId(id);
        const result = await this.carModel.findByIdAndUpdate(id, input, { new: true }).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    public async updateChosenCar(
        id: string,
        input: CarUpdateInput
    ): Promise<Car> {
        //String => ObjectId
        id = shapeIntoMongooseObjectId(id);
        const result = await this.carModel
            .findOneAndUpdate({ _id: id }, input, { new: true })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        console.log("result:", result);
        return result;
    }

    public async deleteChosenCar(
        id: string,
        input: CarUpdateInput
    ): Promise<Car> {
        //String => ObjectId
        id = shapeIntoMongooseObjectId(id);
        const result = await this.carModel
            .findByIdAndDelete(id)
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        console.log("result:", result);
        return result;
    }
}
export default CarService;