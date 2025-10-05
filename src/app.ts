import express from "express";
import path from "path";
import cors from "cors";
import router from "./router";
import routerAdmin from "./router-admin";
import morgan from "morgan";
import { MORGAN_FORMAT } from "./libs/config";
import cookieParser from "cookie-parser";

import session from "express-session";
import ConnectMongoDB from "connect-mongodb-session";
import { T } from "./libs/types/common";
import routerModer from "./router-moder";

const MongoDBStore = ConnectMongoDB(session);
const store = new MongoDBStore({
  uri: String(process.env.MONGO_URL),
  collection: "sessions",
});

/** 1-ENTRANCE **/
const app = express();
app.use(express.static(path.join(__dirname, "public")));
// Serve uploads at both /uploads and /admin/uploads to avoid broken relative paths
app.use("/uploads", express.static("./uploads"));
app.use("/admin/uploads", express.static("./uploads"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(cookieParser());
app.use(morgan(MORGAN_FORMAT));

/** 2-SESSIONS **/
app.use(
  session({
    secret: String(process.env.SESSION_SECRET),
    cookie: {
      maxAge: 1000 * 3600 * 6, // 3h
    },
    store: store,
    resave: true, // 10:30 auth 13:30 12:00 => ubdate
    saveUninitialized: true,
  })
);
app.use(function (req, res, next) {
  const sessionInstance = req.session as T;
  res.locals.member = sessionInstance.member;
  next();
});
/** 3-VIEWS **/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/** 4-ROUTERS **/
app.use("/admin", routerAdmin); // SSR: EJS
app.use("/moderator", routerModer); //SSR: EJS
// app.use("/", router); // SPA: REACT (REST API)
// app.use("/", router); // public routes (rendering simple pages / API)

export default app;
