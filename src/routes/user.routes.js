import { Router } from "express";
import {
  changeCurrentPassword,
  deleteUser,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-user").patch(verifyJWT, updateAccountDetails);
router.route("/delete-user").delete(verifyJWT, deleteUser);
router.route("/user-channel-profile/:username").get(verifyJWT, getUserChannelProfile);
router.route("/user-watch-history").get(verifyJWT, getWatchHistory);
router
  .route("/update-user-avatar")
  .post(
    verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateUserAvatar
  );
router
  .route("/update-user-coverImage")
  .post(
    verifyJWT,
    upload.fields([{ name: "coverImage", maxCount: 1 }]),
    updateUserCoverImage
  );

export default router;
