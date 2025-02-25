import User from '../../../models/User';
import _ from 'lodash'
import sanitize from 'mongo-sanitize'

export const resolvers = {
  Query: {
    //retrieveSwipeLimits: async (parents, unSanitizedId, context, info) => {
      //const _id = sanitize(unSanitizedId);
      //const userData = await User.findById(_id);
      //return userData ? userData.swipesPerDay : 0;
    //},
  },
  Mutation: {
    recordLikesAndUpdateCount: async (parents, unSanitizedData, context, info) => {
      const { _id, likes, currentUserData, isFromLikes } = sanitize(
        unSanitizedData
      );
      if (!isFromLikes) {
        const doc = await User.findOneAndUpdate(
          { $and: [{ _id: _id }, { $gt: { swipesPerDay: 0 } }] },
          {
            $addToSet: { likes: { $each: likes } },
            $inc: { swipesPerDay: -1 },
          },
          { new: true }
        );
        const filter = { _id: likes };
        const likedByUser = {
          firstName: doc?.firstName,
          _id: _id,
          age: doc?.age,
          gender: doc?.gender,
          sport: doc?.sport,
          description: doc?.description,
          imageSet: doc?.imageSet,
          neighborhood: doc?.neighborhood,
        };
        const update = { $addToSet: { likedByUSers: likedByUser } };
        await User.updateMany(filter, update);
        return doc;
      } else {
        const doc = await User.findOneAndUpdate(
          {
            $and: [
              { _id: _id },
              { $gt: { swipesPerDay: 0, visableLikePerDay: 0 } },
            ],
          },
          {
            $addToSet: { likes: { $each: likes } },
            $inc: { swipesPerDay: -1, visableLikePerDay: -1 },
          },
          { new: true }
        );
        const filter = { _id: likes };
        //const profileImage = _.find(doc?.imageSet, (imgObj) => {
        //imgObj.img_idx == 0;
        //});
        const likedByUser = {
          firstName: doc?.firstName,
          _id: _id,
          age: doc?.age,
          gender: doc?.gender,
          sport: doc?.sport,
          description: doc?.description,
          imageSet: doc?.imageSet,
          neighborhood: doc?.neighborhood,
        };
        const update = { $addToSet: { likedByUSers: likedByUser } };
        await User.updateMany(filter, update);
        return doc;
      }
    },
    recordDislikesAndUpdateCount: async (parents, unSanitizedData, context, info) => {
      //const user = context.user;
      const { _id, dislikes, isFromLikes } = sanitize(unSanitizedData);
      //if (user?.sub != _id) throw new AuthenticationError("not logged in");
      if (!isFromLikes) {
        const doc = await User.findOneAndUpdate(
          { $and: [{ _id: _id }, { $gt: { swipesPerDay: 0 } }] },
          {
            $addToSet: { dislikes: { $each: dislikes } },
            $inc: { swipesPerDay: -1 },
          },
          { new: true }
        );
        return doc;
      } else {
        const doc = await User.findOneAndUpdate(
          {
            $and: [
              { _id: _id },
              { $gt: { swipesPerDay: 0, visableLikePerDay: 0 } },
            ],
          },
          {
            $addToSet: { dislikes: { $each: dislikes } },
            $inc: { swipesPerDay: -1, visableLikePerDay: -1 },
          },
          { new: true }
        );
        return doc;
      }
    },
  },
};
