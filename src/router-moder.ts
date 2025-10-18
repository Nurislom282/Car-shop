import express, { Request, Response } from "express";
const routerModer = express.Router();
import makeUploader from "./libs/utils/uploader";
import moderatorController from "./controllers/moder.controller";


/* Moderator */
routerModer.get("/", moderatorController.goHome);
routerModer
  .get("/login", moderatorController.getLogin)
  .post("/login", moderatorController.processLogin);

routerModer
  .get("/create", moderatorController.CreateModerator)
  .post(
    "/create",
    makeUploader("members").single("memberImage"),
    moderatorController.processSignup
  );

routerModer.get("/logout", moderatorController.logout);
routerModer.get("/check-me", moderatorController.checkAuthSession);

/* Event */
routerModer.get(
  "/event/all",
  moderatorController.verifyModerator,
  moderatorController.getEvents
);
routerModer.post(
  "/event/create",
  moderatorController.verifyModerator,
  makeUploader("events").array("eventImage", 5),
  moderatorController.createNewEvent
);
routerModer.post(
  "/event/:id",
  moderatorController.verifyModerator,
  moderatorController.updateChosenEvent
);
export default routerModer;
