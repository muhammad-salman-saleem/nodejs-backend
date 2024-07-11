import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js"; 
import { Comment } from "../models/comment.model.js"; 
import { Tweet } from "../models/tweet.model.js"; 
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleLike = async (userId, itemId, itemType) => {
    const query = { likedBy: userId };
    query[itemType] = itemId;

    const existingLike = await Like.findOne(query);

    if (existingLike) {
        await Like.deleteOne(query);
        return false;
    } else {
        const newLike = {};
        newLike[itemType] = itemId;
        newLike.likedBy = userId;
        await Like.create(newLike);
        return true;
    }
};

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const liked = await toggleLike(userId, videoId, 'video');
    const message = liked ? "Video liked successfully" : "Video unliked successfully";

 return   res.status(200).json(new ApiResponse(200, {}, message));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const liked = await toggleLike(userId, commentId, 'comment');
    const message = liked ? "Comment liked successfully" : "Comment unliked successfully";

    return   res.status(200).json(new ApiResponse(200, {}, message));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    const liked = await toggleLike(userId, tweetId, 'tweet');
    const message = liked ? "Tweet liked successfully" : "Tweet unliked successfully";

    return  res.status(200).json(new ApiResponse(200, {}, message));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate('video',
            "_id owner isPublished title description thumbnail"
        );

        return   res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
