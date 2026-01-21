import { eventType, eventStatus } from "../enums/event.enum";

export interface Event {
    _id: string;
    memberId?: string
    eventTitle: string;
    eventDesc: string;
    eventImage?: string[];
    eventStatus?: eventStatus;
    eventDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventInput {
    eventTitle: string;
    eventDesc: string;
    eventImage?: string[];
    eventDate: Date;
}

export interface EventUpdateInput {
    _id: string;
    eventTitle?: string;
    eventDesc?: string;
    eventImage?: string[];
    eventStatus?: eventStatus;
    eventDate?: Date;
}

export interface EventQueryOptions {
    order: string;
    page: number;
    limit: number;
    eventType?: eventType;
    search?: string;
}

export interface PaginatedEvents {
    events: Event[];
    totalPages: number;
    currentPage: number;
    totalEvents: number;
}

export interface EventRequest {
    file: Express.Multer.File;
    files: Express.Multer.File[];
}

export interface AdminEventRequest extends EventRequest {
    member: {
        _id: string;
        memberNick: string;
        memberType: string;
    };
    session: {
        member: {
            _id: string;
            memberNick: string;
            memberType: string;
        }
    };
}