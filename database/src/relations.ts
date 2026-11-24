import { defineRelations } from "drizzle-orm";
import * as authSchema from "./schemas/auth";
import { friend } from "./schemas/friend";
import { friendRequest } from "./schemas/friend_request";
import { post } from "./schemas/post";
import { postLike } from "./schemas/post_like";
import { profile } from "./schemas/profile";

export const relations = defineRelations(
  {
    ...authSchema,
    profile,
    friend,
    friendRequest,
    post,
    postLike,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      profile: r.one.profile(),
      posts: r.many.post(),
      postLikes: r.many.postLike(),
      // `friend` and `friendRequest` point at `user` twice, so the sides are
      // paired up by alias.
      friends: r.many.friend({ alias: "friend_user" }),
      sentFriendRequests: r.many.friendRequest({
        alias: "friend_request_sender",
      }),
      receivedFriendRequests: r.many.friendRequest({
        alias: "friend_request_receiver",
      }),
    },
    session: {
      user: r.one.user({ from: r.session.userId, to: r.user.id }),
    },
    account: {
      user: r.one.user({ from: r.account.userId, to: r.user.id }),
    },
    profile: {
      user: r.one.user({
        from: r.profile.userId,
        to: r.user.id,
        optional: false,
      }),
    },
    friend: {
      user: r.one.user({
        from: r.friend.userId,
        to: r.user.id,
        optional: false,
        alias: "friend_user",
      }),
      friend: r.one.user({
        from: r.friend.friendId,
        to: r.user.id,
        optional: false,
        alias: "friend_friend",
      }),
    },
    friendRequest: {
      sender: r.one.user({
        from: r.friendRequest.senderId,
        to: r.user.id,
        optional: false,
        alias: "friend_request_sender",
      }),
      receiver: r.one.user({
        from: r.friendRequest.receiverId,
        to: r.user.id,
        optional: false,
        alias: "friend_request_receiver",
      }),
    },
    post: {
      user: r.one.user({
        from: r.post.userId,
        to: r.user.id,
        optional: false,
      }),
      likes: r.many.postLike(),
    },
    postLike: {
      post: r.one.post({
        from: r.postLike.postId,
        to: r.post.id,
        optional: false,
      }),
      user: r.one.user({
        from: r.postLike.userId,
        to: r.user.id,
        optional: false,
      }),
    },
  }),
);
