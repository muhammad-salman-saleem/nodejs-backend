import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const ownerId = req.user._id;

  const newPlaylist = new Playlist({
    name,
    description,
    owner: ownerId,
  });

  await newPlaylist.save();
  return res
    .status(201)
    .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const playlists = await Playlist.find({ owner: userId })
    .select("name description")
    .populate(
      "videos",
      "videoFile thumbnail isPublished title description thumbnail duration"
    );
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlists, "User playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findOne({ _id: playlistId }).populate(
    "videos",
    "videoFile thumbnail isPublished title description thumbnail duration"
  );

  if (!playlist) {
    throw new ApiError(
      404,
      "Playlist not found or you cannot access this playlisy"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ID(s)");
  }

  const findvideoinplaylist = await Playlist.findOne({ _id: playlistId });
  if (findvideoinplaylist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $push: { videos: videoId } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid ID(s)");
  }
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $pull: { videos: videoId } },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist or video note found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video removed from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findOneAndDelete({
    _id: playlistId,
    owner: userId,
  });
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: userId },
    { name, description },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
