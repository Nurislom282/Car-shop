import express, { Request, Response } from "express";
const routerAdmin = express.Router();
import shopController from "./controllers/shop.controller";
import makeUploader from "./libs/utils/uploader";
import carController from "./controllers/car.controller";
import brandController from "./controllers/brand.controller";

// /* RESTURANT */
routerAdmin.get("/", shopController.goHome);
routerAdmin
  .get("/login", shopController.getLogin)
  .post("/login", shopController.processLogin);

routerAdmin
  .get("/signup", shopController.getSignup)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    shopController.processSignup
  );

routerAdmin.get("/logout", shopController.logout);
routerAdmin.get("/check-me", shopController.checkAuthSession);

/* Car */
routerAdmin.get(
  "/car/all",
  shopController.verifyShop,
  carController.getAllCars
);
// Quick GET handler for single car edit link — redirect to list to avoid 404
routerAdmin.get(
  "/car/:id",
  shopController.verifyShop,
  carController.getupdateChosenCar
);
// Admin JSON endpoint for edit modal to fetch car data (returns JSON)
routerAdmin.get(
  "/car/:id/data",
  shopController.verifyShop,
  carController.getCarData
);
routerAdmin.post(
  "/car/create",
  shopController.verifyShop,
  makeUploader("cars").array("carImage", 5),
  carController.createNewCar
);
routerAdmin.post(
  "/brand/create",
  shopController.verifyShop,
  makeUploader("members").single("brandImage"),
  brandController.createBrand
);
routerAdmin.post(
  "/brand/edit",
  shopController.verifyShop,
  makeUploader("members").single("brandImage"),
  brandController.updateBrand
);
// fetch brand data for edit modal
routerAdmin.get(
  "/brand/:id",
  shopController.verifyShop,
  brandController.getBrand
);
// delete brand (admin)
routerAdmin.post(
  "/brand/:id/delete",
  shopController.verifyShop,
  brandController.deleteBrand
);
routerAdmin.post(
  "/car/:id",
  shopController.verifyShop,
  // allow up to 5 images when updating; files are optional
  makeUploader("cars").array("carImage", 5),
  carController.updateCar
);

// Admin delete (soft delete)
routerAdmin.post(
  "/car/:id/delete",
  shopController.verifyShop,
  carController.deleteCar
);

// Status change endpoint
routerAdmin.post(
  "/car/:id/status",
  shopController.verifyShop,
  carController.updateChosenCar
);

/* USER */
routerAdmin.get(
  "/user/all",
  shopController.verifyShop,
  shopController.getUsers
);

routerAdmin.post(
  "/user/edit",
  shopController.verifyShop,
  shopController.updateChosenUser
);
export default routerAdmin;
