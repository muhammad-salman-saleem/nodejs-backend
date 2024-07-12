import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId  = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const [totalVideos, totalViews, totalLikes, totalSubscribers] = await Promise.all([
    Video.countDocuments({ owner: channelId }),
    Video.aggregate([
      { $match: { owner: channelId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]),
    Like.countDocuments({ video: { $in: (await Video.find({ owner: channelId })).map(v => v._id) } }),
    Subscription.countDocuments({ channel: channelId })
  ]);

  const stats = {
    totalVideos,
    totalViews: totalViews.length ? totalViews[0].totalViews : 0,
    totalLikes,
    totalSubscribers
  };

  return res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ owner: channelId });

  if (!videos.length) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export {
  getChannelStats,
  getChannelVideos
};
