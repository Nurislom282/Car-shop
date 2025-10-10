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

    /**
     * Return cars that have a discount (carDeiscount > 0).
     * Supports same inquiry params as getCars (page, limit, order, carType, search)
     */
    public async getDiscountedCars(inquery: CarInquiry): Promise<Car[]> {
        const match: T = { carStatus: CarStatus.PROCESS, carDeiscount: { $gt: 0 } };

        if (inquery.carType)
            match.carType = inquery.carType;

        if (inquery.search)
            match.carName = { $regex: new RegExp(inquery.search, "i") };

        const sort: T =
            inquery.order === "carDeiscount"
                ? { [inquery.order]: 1 }
                : { [inquery.order]: -1 };

        const page = inquery.page && inquery.page > 0 ? inquery.page : 1;
        const limit = inquery.limit && inquery.limit > 0 ? inquery.limit : 10;

        const result = await this.carModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (page * 1 - 1) * limit },
                { $limit: limit * 1 },
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
                // make sure to await the update so result contains the updated doc
                result = await this.carModel
                    .findByIdAndUpdate(
                        carId,
                        { $inc: { carViews: 1 } },
                        { new: true }
                    )
                    .exec();
            }
        }
        return result;
    }

    /* SSR - paginated server-side render helper
     * Accepts an optional inquiry (page, limit, order, carType, search)
     * Returns { data, total, page, limit, pages }
     */
    public async getCarsSSR(inquery?: CarInquiry): Promise<{ data: Car[]; total: number; page: number; limit: number; pages: number }> {
        const page = inquery && inquery.page && inquery.page > 0 ? inquery.page : 1;
        const limit = inquery && inquery.limit && inquery.limit > 0 ? inquery.limit : 12;

        const match: T = {};
        if (inquery?.carType) match.carType = inquery.carType;
        if (inquery?.search) match.carName = { $regex: new RegExp(inquery.search, 'i') };
        if (inquery?.brand) match.carBrand = inquery.brand;

        // count total matching documents
        const total = await this.carModel.countDocuments(match).exec();

        const sort: T = {};
        if (inquery && inquery.order) {
            sort[inquery.order] = inquery.order === 'carDeiscount' ? 1 : -1;
        } else {
            sort['createdAt'] = -1;
        }

        const data = await this.carModel
            .find(match)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

        const pages = Math.max(1, Math.ceil(total / limit));

        return { data, total, page, limit, pages };
    }

    /**
     * Return top viewed cars. `limit` controls number of returned cars.
     */
    public async getTopViewedCars(limit = 10): Promise<Car[]> {
        const result = await this.carModel.find({ carStatus: CarStatus.PROCESS }).sort({ carViews: -1 }).limit(limit).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    /**
     * Return cars filtered by brandId. Brand id should be a string that can be shaped into ObjectId.
     */
    public async getCarsByBrand(inquery: CarInquiry, brandId: string): Promise<Car[]> {
        const match: T = { carStatus: CarStatus.PROCESS };

        if (inquery.carType)
            match.carType = inquery.carType;

        if (inquery.search)
            match.carName = { $regex: new RegExp(inquery.search, "i") };

        // accept brandId as a direct string reference stored in carBrand
        match.carBrand = brandId;

        const sort: T =
            inquery.order === "carDeiscount"
                ? { [inquery.order]: 1 }
                : { [inquery.order]: -1 };

        const page = inquery.page && inquery.page > 0 ? inquery.page : 1;
        const limit = inquery.limit && inquery.limit > 0 ? inquery.limit : 10;

        const result = await this.carModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                { $skip: (page * 1 - 1) * limit },
                { $limit: limit * 1 },
            ])
            .exec();

        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

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