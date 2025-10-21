import express from "express";
const router = express.Router();
import membersController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import orderController from "./controllers/order.controller";
import carController from "./controllers/car.controller";
import brandController from "./controllers/brand.controller";

/** Member **/
router.get("/member/shop", membersController.getShop);
router.post("/member/login", membersController.login);
router.post("/member/signup", membersController.signup);
router.post(
  "/member/logout",
  membersController.verifyAuth,
  membersController.logout
);
router.get(
  "/member/detail",
  membersController.verifyAuth,
  membersController.getMemberDetail
);
router.post(
  "/member/update",
  membersController.verifyAuth,
  uploader("members").single("memberImage"),
  membersController.updateMember
);

router.get("/member/top-users", membersController.getTopUsers);
/** Car **/

router.get("/car/all", carController.getCars);
router.get("/car/discounted", carController.getDiscountedCars);
router.get("/car/top-viewed", carController.getTopViewedCars);

/** Brand **/
router.get("/car/brand/:brandId", carController.getCarsByBrand);
router.get("/car/brands", carController.getCarsByBrands);

router.get(
  "/car/:id",
  membersController.retrieveAuth,
  carController.getCar
);
router.get("/brand/top", brandController.getTopBrands);

/** Order **/
router.post(
  "/order/create",
  membersController.verifyAuth,
  orderController.createOrder
);
router.get(
  "/order/all",
  membersController.verifyAuth,
  orderController.getMyOrders
);

router.post(
  "/order/update",
  membersController.verifyAuth,
  orderController.updateOrder
);
export default router;
