import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const match = {};
  if (query) {
    match.title = { $regex: query, $options: "i" };
  }
  if (userId && isValidObjectId(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };

  const aggregateQuery = Video.aggregate([
    { $match: match },
    { $sort: sort },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) },
  ]);

  const videos = await Video.aggregatePaginate(aggregateQuery, { page, limit });
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoFilePath = req.files?.videoFile[0]?.path;
  const thumbnailPath = req.files?.thumbnail[0]?.path;
  if (!videoFilePath || !thumbnailPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);
  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Error uploading files");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: Number(videoFile.duration),
    isPublished: false,
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "fullName username avatar"
  );
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const hasViewed = video.viewsUser.includes(req.user._id);

  if (!hasViewed) {
    video.views += 1;
    video.viewsUser.push(req.user._id);
    await video.save();
  }
await User.findByIdAndUpdate(req.user._id, { $addToSet: { watchHistory: videoId } })
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const ownerVideo = await Video.findById(videoId);

  if (!ownerVideo.owner.equals(req.user._id)) {
    throw new ApiError(
      403,
      "You cannot update this video, it is protected by owner"
    );
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const updateData = { title, description };

  if (req.file.path) {
    const thumbnailPath = req.file?.path;
    const thumbnail = await uploadOnCloudinary(thumbnailPath);
    if (thumbnail) {
      updateData.thumbnail = thumbnail.url;
    }
  }

  const video = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const ownerVideo = await Video.findById(videoId);

  if (!ownerVideo.owner.equals(req.user._id)) {
    throw new ApiError(
      403,
      "You cannot delete this video, it is protected by owner"
    );
  }
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const ownerVideo = await Video.findById(videoId);

  if (!ownerVideo.owner.equals(req.user._id)) {
    throw new ApiError(
      403,
      "You cannot publish this video, it is protected by owner"
    );
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video publish status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
