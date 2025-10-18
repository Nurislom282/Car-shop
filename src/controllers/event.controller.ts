import { NextFunction, Request, Response } from "express";
import EventService from "../models/Event.service";
import { EventInput, EventQueryOptions, EventUpdateInput } from "../libs/types/event";
import mongoose from "mongoose";

const eventService = new EventService();

/** API Methods */
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
            data.eventImage = (req.files as Express.Multer.File[]).map(file => file.filename);
        }
        return await eventService.createNewEvent(data);
    } catch (error) {
        throw error;
    }
};

export const updateEventData = async (eventId: string, data: Partial<EventInput>) => {
    try {
        const updateData: EventUpdateInput = {
            _id: eventId,
            ...data
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