import express from "express";
const router = express.Router();
import membersController from "./controllers/member.controller";
import uploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";

/** Member **/
router.get("/member/restaurant", membersController.getRestaurant);
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

/** Product **/
router.get("/product/all", productController.getProducts);
router.get(
  "/product/:id",
  membersController.retrieveAuth,
  productController.getProduct
);
import carController from "./controllers/car.controller";

// Public car view (rendered page)
router.get(
  "/car/:id",
  carController.getCarPage
);
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
