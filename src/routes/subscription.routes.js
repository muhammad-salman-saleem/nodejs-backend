import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
  .route("/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/user-channel/:channelId").get(getUserChannelSubscribers);

export default router;
