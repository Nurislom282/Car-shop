import { T } from "../libs/types/common";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/view.enum";
import EventModel from "../schema/Event.model";
import { EventInput, EventQueryOptions, Event, EventUpdateInput } from "../libs/types/event";
import { eventStatus, eventType } from "../libs/enums/event.enum";

class EventService {
    private readonly eventModel;
    public viewService;
    constructor() {
        this.eventModel = EventModel;
        this.viewService = new ViewService();
    }
    /* SPA */
    public async getEvents(inquery: EventQueryOptions): Promise<Event[]> {
        const match: T = { eventStatus: eventStatus.active };

        if (inquery.eventType)
            match.eventType = inquery.eventType;

        if (inquery.search)
            match.eventTitle = { $regex: new RegExp(inquery.search, "i") };

        const sort: T =
            inquery.order === "eventDate"
                ? { [inquery.order]: 1 }
                : { [inquery.order]: -1 };

        const result = await this.eventModel
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

    public async getEvent(
        memberId: ObjectId | null,
        id: string
    ): Promise<Event> {
        const eventId = shapeIntoMongooseObjectId(id);

        let result = await this.eventModel
            .findOne({
                _id: eventId,
                eventStatus: eventStatus.active,
            })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        if (memberId) {
            //Check Existence
            const input: ViewInput = {
                memberId: memberId,
                viewRefId: eventId,
                viewGroup: ViewGroup.EVENT,
            };
            const existView = await this.viewService.checkViewExistence(input);
            console.log("exist:", !!existView);
            if (!existView) {
                //Insert View
                console.log("PlANNING TO INSERT NEW VIEW");
                await this.viewService.insertMemberView(input);

                //Insert Counts
                result = this.eventModel
                    .findByIdAndUpdate(
                        eventId,
                        { $inc: { eventViews: +1 } },
                        { new: true }
                    )
                    .exec();
            }
        }
        return result;
    }

    /* Moderator PANEL */
    public async moderGetEvents(): Promise<Event[]> {
        //String => ObjectId
        const result = await this.eventModel.find().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        console.log("result:", result);
        return result;
    }

    public async createNewEvent(input: EventInput): Promise<Event> {
        try {
            return await this.eventModel.create(input);
        } catch (err) {
            console.log("Error, createNewEvent:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
        }
    }

    public async updateChosenEvent(
        id: string,
        input: EventUpdateInput
    ): Promise<Event> {
        //String => ObjectId
        id = shapeIntoMongooseObjectId(id);
        const result = await this.eventModel
            .findOneAndUpdate({ _id: id }, input, { new: true })
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
        console.log("result:", result);
        return result;
    }
}
export default EventService;