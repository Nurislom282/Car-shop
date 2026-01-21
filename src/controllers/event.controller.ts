import { NextFunction, Request, Response } from "express";
import EventService from "../models/Event.service";
import { EventInput, EventQueryOptions, EventUpdateInput } from "../libs/types/event";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";

const eventService = new EventService();

/** Data helpers (kept for internal use) */
export const getEventsData = async (queryOptions: EventQueryOptions) => {
    try {
        return await eventService.getEvents(queryOptions);
    } catch (error) {
        throw error;
    }
};

export const getEventData = async (eventId: string) => {
    try {
        const event = await eventService.getEvent(null, eventId);
        if (!event) {
            throw new Error("Event not found");
        }
        return event;
    } catch (error) {
        throw error;
    }
};

export const createEventData = async (req: Request) => {
    try {
        const data = req.body as EventInput;
        if (req.files && Array.isArray(req.files)) {
            data.eventImage = (req.files as Express.Multer.File[]).map((file) => file.filename);
        }
        return await eventService.createNewEvent(data);
    } catch (error) {
        throw error;
    }
};

export const updateEventData = async (eventId: string, data: Partial<EventInput>) => {
    try {
        const { eventImage, ...restData } = data;
        const updateData: EventUpdateInput = {
            _id: eventId,
            ...restData,
            ...(eventImage && Array.isArray(eventImage) ? { eventImage } : {}),
        };
        const updatedEvent = await eventService.updateChosenEvent(eventId, updateData);
        if (!updatedEvent) {
            throw new Error("Event not found");
        }
        return updatedEvent;
    } catch (error) {
        throw error;
    }
};

export const deleteEventData = async (eventId: string) => {
    try {
        const result = await eventService.deleteEvent(eventId);
        if (!result) {
            throw new Error("Event not found");
        }
        return { success: true, message: "Event deleted successfully" };
    } catch (error) {
        throw error;
    }
};

/** Express HTTP handlers (REST API) */
const eventController: T = {};

eventController.getEvents = async (req: Request, res: Response) => {
    try {
        const { page, limit, order, eventType, search } = req.query;
        const inquiry: EventQueryOptions = {
            order: order ? String(order) : "_id",
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            eventType: eventType ? String(eventType) : undefined,
            search: search ? String(search) : undefined,
        } as EventQueryOptions;

        const result = await eventService.getEvents(inquiry);
        return res.status(HttpCode.OK).json({ data: result });
    } catch (err) {
        console.log("Error, eventController.getEvents:", err);
        if (err instanceof Errors) return res.status(err.code).json(err);
        return res.status(Errors.standart.code).json(Errors.standart);
    }
};

// public single event endpoint; uses optional member info via req.member if present
eventController.getEvent = async (req: Request & { member?: any }, res: Response) => {
    try {
        const id = req.params.id;
        // if requester attached a member (via membersController.retrieveAuth), pass its id to increment views
        const memberId = (req as any).member?._id ?? null;
        const event = await eventService.getEvent(memberId, id);
        return res.status(HttpCode.OK).json({ data: event });
    } catch (err) {
        console.log("Error, eventController.getEvent:", err);
        if (err instanceof Errors) return res.status(err.code).json(err);
        return res.status(Errors.standart.code).json(Errors.standart);
    }
};

export default eventController;