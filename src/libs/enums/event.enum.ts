export enum eventType {
    discount = "discount",
    newArrival = "newArrival",
    clearance = "clearance",
    specialOffer = "specialOffer",
    Conference = "Conference",
    conference = "conference",
}

// Use statuses that match the moderator UI (PROCESS = active, PAUSE = paused, DELETE = removed)
export enum eventStatus {
    PROCESS = "PROCESS",
    PAUSE = "PAUSE",
    DELETE = "DELETE",
}
