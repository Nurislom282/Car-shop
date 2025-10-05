import mongoose, { Schema } from "mongoose";
import { eventType } from "../libs/enums/event.enum";

const eventSchema = new Schema(
    {
        eventTitle: {
            type: String,
            required: true,
        },
        eventDesc: {
            type: String,
        },
        eventDate: {
            type: Date,
            required: true,
        },
        eventType: {
            type: String,
            enum: eventType,
            required: true,
        },
        eventImage: {
            type: [String],
            required: true,
        },
        eventLocation: {
            type: String,
        },
        eventViews: {
            type: Number,
            default: 0,
        },
    }, { timestamps: true } //updatedAt createdAt
);

export default mongoose.model("Event", eventSchema);