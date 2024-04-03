import { types, flow, cast, SnapshotOrInstance, SnapshotOut, Instance, getRoot} from 'mobx-state-tree';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CognitoUser, CognitoUserAttribute, AuthenticationDetails, CognitoUserPool } from 'amazon-cognito-identity-js';
import { getRootStore } from './helpers/getRootStore';

export const LocationModel = types.model("LocationModel", {
  city: types.maybeNull(types.string),
  state: types.maybeNull(types.string),
  country: types.maybeNull(types.string),
});
export const SportModel = types.model("SportModel", {
  sport: types.maybeNull(types.string),
  game_level: types.maybeNull(types.number),
});

export const ImageModel = types.model("ImageModel", {
  img_idx: types.maybeNull(types.number),
  imageURL: types.maybeNull(types.string),
});

export const PotentialMatchModel = types.model("PotentialMatchModel", {
  _id: types.maybeNull(types.string),
  firstName: types.maybeNull(types.string),
  age: types.maybeNull(types.number),
  gender: types.maybeNull(types.string),
  sports: types.array(SportModel),
  description: types.maybeNull(types.string),
  image_set: types.array(ImageModel),
  neighborhood: LocationModel,
});


export const MatchModel = types
  .model("MatchModel", {
    _id: types.maybeNull(types.string), // Assuming you're providing a unique identifier when creating a user instance
    matchPool: types.array(PotentialMatchModel),
  })
  .actions((self) => ({
    setMatchPool(matches: SnapshotOrInstance<typeof PotentialMatchModel>[]) {
      self.matchPool.replace(matches)
    },
    reset() {},
  }))
  .actions((self) => {
     fetchAndUpdateMatches: flow(function* (filters) {
       // Example API call to fetch matches based on filters
      const mongoDBStore = getRootStore(self).mongoDBStore
       try {
         const newMatches = yield mongoDBStore.queryPotentialMatches(filters)
         self.setMatchPool(newMatches)
         yield AsyncStorage.setItem("matches", JSON.stringify(newMatches))
       } catch (error) {
         console.error("Failed to fetch and update matches:", error)
       }
     })
     applyFilters: flow(function* (filters) {
       // Optionally: Modify this method to apply filters and fetch updated matches
       //yield fetchAndUpdateMatches(filters)
     })
     loadStoredMatches : flow(function* () {
      try {
        const storedMatches = yield AsyncStorage.getItem("matches")
        if (storedMatches) {
          const matches = JSON.parse(storedMatches)
          self.setMatchPool(matches)
        }
      } catch (error) {
        console.error("Failed to load stored matches:", error)
      }
    })
  })
    // Add other actions as needed