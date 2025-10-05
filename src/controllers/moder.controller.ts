import Errors, { HttpCode } from "../libs/Errors";
import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import { AdminRequest, ExtendedRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/member.enum";
import { Message } from "../libs/Errors";
import EventService from "../models/Event.service";
import MemberService from "../models/Member.service";
import { EventInput } from "../libs/types/event";

const eventService = new EventService();
const memberService = new MemberService();
const moderatorController: T = {};

moderatorController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome-moderator"); //send || render || redirect || json
    res.render("moderator/home");
  } catch (err) {
    console.log("Error, moderator.goHome:", err);
    res.redirect("/moderator");
  }
};

moderatorController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin");
    res.render("moderator/login-moder.ejs");
  } catch (err) {
    console.log("Error, moderator.getLogin:", err);
    res.redirect("/moderator");
  }
};

moderatorController.getSignup = (req: Request, res: Response) => {
  try {
    console.log("getSignup");
    res.render("moderator/signup");
  } catch (err) {
    console.log("Error, moderator.getSignup:", err);
    res.redirect("/moderator");
  }
};

moderatorController.processSignup = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("processSignup");
    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    const newMember: MemberInput = req.body;
    newMember.memberImage = file?.path.replace(/\\/g, "/");
    newMember.memberType = MemberType.MODERATOR;
    const result = await memberService.processSignupModer(newMember);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/moderator/event/all");
    });
  } catch (err) {
    console.log("Error, moderator.processSignup:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("Hi, ${message}"); window.location.replace('/moderator/signup') </script>`
    );
  }
};

moderatorController.processLogin = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("moderator.processLogin");
    console.log("req.body:", req.body);
    const input: LoginInput = req.body;
    const result = await memberService.processLogin(input);

    req.session.member = result;
    req.session.save(function () {
      res.redirect("/moderator/event/all");
    });
  } catch (err) {
    console.log("Error, moderator.processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("Hi, ${message}"); window.location.replace('/moderator/login') </script>`
    );
  }
};

moderatorController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("checkAuthSession");
    req.session.destroy(function () {
      res.redirect("/moderator");
    });
  } catch (err) {
    console.log("Error, checkAuthSession:", err);
    res.redirect("/moderator");
  }
};

moderatorController.getEvents = async (req: Request, res: Response) => {
  try {
    console.log("getUsers");
    const result = await eventService.moderGetEvents();
    console.log("result:", result);
    res.render("moderator/events", { events: result });
  } catch (err) {
    console.log("Error, getEvents:", err);
    res.redirect("/moderator/login");
  }
};

moderatorController.getCar = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getCar");
    const { id } = req.params;
    console.log("req.member:", req.member);

    const memberId = req.member?._id ?? null,
      result = await eventService.getEvent(memberId, id);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getCar:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

moderatorController.createNewEvent = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("createNewEvent");
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    if (!req.files?.length)
      throw new Errors(
        HttpCode.INTERNATIONAL_SERVER_ERROR,
        Message.CREATE_FAILED
      );

    const data: EventInput = req.body;
    data.eventImage = req.files?.map((ele) => {
      return ele.path.replace(/\\/g, "/");
    });

    await eventService.createNewEvent(data);

    res.send(
      `<script> alert("Sucessful creation!"); window.location.replace('/moderator/event/all') </script>`
    );
  } catch (err) {
    console.log("Error, createNewEvent:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace('/moderator/event/all') </script>`
    );
  }
};

moderatorController.updateChosenEvent = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenEvent");
    const id = req.params.id;
    const result = await eventService.updateChosenEvent(id, req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenEvent:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

moderatorController.checkAuthSession = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("logout");
    if (req.session?.member)
      res.send(
        `<script> alert("Hi, ${req.session.member.memberNick}") </script>`
      );
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}") </script>`);
  } catch (err) {
    console.log("Error, logout:", err);
    res.status(500).json({ error: err });
  }
};

moderatorController.verifyModerator = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.MODERATOR) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace('admin/login'); </script>`
    );
  }
};

export default moderatorController;
