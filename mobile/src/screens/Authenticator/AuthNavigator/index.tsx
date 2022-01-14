import React, {useContext, createContext, useRef, useEffect, useState} from "react";
import auth from '@react-native-firebase/auth'
import { Formik} from 'formik'
import {byGameLevel} from '@utils'
import {styles} from '@styles'
import _ from 'lodash'
import FlashMessage from "react-native-flash-message";
import { SignOutStack, MatchStackScreen} from '@NavStack'
import { SWIPED_LEFT, READ_SQUASH, MESSAGE_POSTED, GET_POTENTIAL_MATCHES} from '@graphQL2'
import { useSubscription, useQuery, useLazyQuery} from '@apollo/client'
import {SWIPIES_PER_DAY_LIMIT} from '@constants'
import  {cityVar} from '@cache'
import  {AppContainer} from '@components'
import { useApolloClient} from '@apollo/client'
import { showMessage, hideMessage } from "react-native-flash-message";
import {RootRefreshContext} from '../../../index.js'
export const UserContext = createContext(null);
import {createInitialFilterFormik, createPatronList, calculateOfflineMatches} from '@utils'

const AuthNavigator = () => {
  //auth().currentUser.delete().then(() => {})
  const [currentUser, setCurrentUser ] = useState(null)
  const [isProfileComplete, setProfileState ] = useState(false)
  const [loadingSigning, setLoadingSiginig] = useState(true);
  const [deleted, setDeleted] = useState({isDeleted: false});
  const [isUserOnmongoDb, setIsUseOnMongoDb] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [data, setData] = useState(null);
  const [allUsers, setAllUsers] = useState(null)
  const [userDataDidMount, setUserDataDidMount] = useState(false)
  const [offlineMatches, setOfflineMatches] = useState(null)
  const [CacheVal, setCacheVal] = useState(null)
  const [loadAllResults, setLoadAllResults] = useState(true)
  const [initialValuesFormik, setInitialValuesFormik] = useState({});
  //const {setLoadingSignUInRefresh} = useContext(RootRefreshContext)
  const didMountRef = useRef(false)
  const [queryProssibleMatches, {data: testData, fetchMore}] = useLazyQuery(GET_POTENTIAL_MATCHES, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setLoadingMatches(true)
      console.log("check if fetch more updated any data", data)
      const all_users = data.queryProssibleMatches;
      console.log("............",all_users)
      setAllUsers(all_users)
      //setLoadingSignUInRefresh(false)
      //setLoadAllResults(false)
      setLoadingMatches(false)
    }
  });
  const [getSquashProfile, {data: userData, loading: userLoading, error, refetch: refetchUserData}] = useLazyQuery(READ_SQUASH, {
    fetchPolicy: "network-only",
    onCompleted: async (data) => {
      //TODO: if data doesnt exists input is incorrect => add checks
      console.log("data", data)
      if (data?.squash) {
        setDeleted(data.squash.deleted)
        setProfileState(true);
        setData(data)
      }
    },
    onError: (({graphQLErrors, networkError}) => {
      console.log("errors")
      if (networkError){
        console.log(networkError)
      }
        console.log(graphQLErrors)
    })
  });
  useEffect(() => {
    if (!didMountRef.current) {
      if (userData?.squash) {
        createInitialFilterFormik(userData.squash.sports)
          .then((initialValues) => {
            setInitialValuesFormik(initialValues);
            const dislikes = userData.squash.dislikes
              ? userData.squash.dislikes.length
              : 0;
            console.log(dislikes);
            const likes = userData.squash.likes
              ? userData.squash.likes.length
              : 0;
            console.log(likes);
            const limit = dislikes + likes + SWIPIES_PER_DAY_LIMIT;
            console.log('whats the limit', limit);
            console.log(initialValues);
            const sport = _.find(initialValues.sportFilters, (sportObj) => {
              return sportObj.filterSelected == true;
            }).sport;
            byGameLevel(initialValues.gameLevels),
              queryProssibleMatches({
                variables: {
                  _id: currentUser.uid,
                  offset: 0,
                  limit: limit,
                  location: _.omit(userData.squash.location, ['__typename']),
                  sport: sport,
                  game_levels: byGameLevel(initialValues.gameLevels),
                  ageRange: initialValues.ageRange,
                },
              });
            setUserDataDidMount(true);
          })
          .catch((err) => {
            console.log(err);
          });
        didMountRef.current = true;
      }
      if (loadingSigning) setLoadingSiginig(false);
    }
  }, [userLoading]);
  const client = useApolloClient();
  const onAuthStateChanged = (currentUser) => {
    console.log("do we make it here afte submit")
      setCurrentUser(currentUser);
      if (currentUser) {
        setLoadingMatches(true)
        if (!CacheVal) {
          // dta can be null for the first time users during sign up
          const data = client.readQuery({
            query: READ_SQUASH,
            variables: {id: currentUser.uid},
          });
          if (data?.squash) {
            const cachedUser = data.squash
            console.log('cached', cachedUser.matches);
            setCacheVal(cachedUser);
          }
        }
        getSquashProfile({variables: {id: currentUser.uid}});
        setLoadingUser(false);
      } else {
        setLoadingUser(false);
      }
  }
  useEffect(() => {
      setLoadingUser(true)
      const unsubscribe = auth().onAuthStateChanged(onAuthStateChanged)
      console.log(unsubscribe)
      return unsubscribe
  }, [])
  useEffect(() => {
    deleted && deleted.isDeleted &&
      console.log("user info must be erase from react native and soft deleted on database")
  }, [deleted])
  useEffect(() => {
    if(didMountRef.current){
      console.log("figure logic for useRef")
    }
  }, [cityVar()])

  //useEffect(() => {
    //// you have to add new alerts
    //if (userData) {
      //const cachedMatches = calculateOfflineMatches(CacheVal);
      //const totalMatches = calculateOfflineMatches(userData.squash);
      //console.log('cached', cachedMatches);
      //console.log('not cached', totalMatches);
      //const cachedIDs = _.map(cachedMatches, (cachedObj) => {
        //return cachedObj._id;
      //});
      //const matchedIDs = _.map(totalMatches, (matchObj) => {
        //return matchObj._id;
      //});
      //if (!_.isEqual(cachedIDs, matchedIDs)) {
        //showMessage({
          //message: 'New matches!',
          //type: 'info',
          //titleStyle: styles.notificationText,
          //style: styles.notificationStyle,
        //});
      //}
    //}
  //}, [userData.squash.matches]);
  if (loadingSigning) return null
  const value = {
    getSquashProfile: getSquashProfile,
    refetchUserData: refetchUserData,
    userData: userData,
    setData: setData,
    data: data,
    userLoading: userLoading,
    currentUser: currentUser,
    isProfileComplete: isProfileComplete,
    setProfileState: setProfileState,
    potentialMatches: allUsers,
    setPotentialMatches: setAllUsers,
    cachedUser: CacheVal,
    offlinMatches:offlineMatches,
    setOfflineMatches:setOfflineMatches,
    initialValuesFormik: initialValuesFormik,
    queryProssibleMatches: queryProssibleMatches,
    setLoadAllResults: setLoadAllResults,
  };
  const render2 = () =>{
    console.log(
      'lis fo things htat gotrefreshed',
      userData,
      currentUser,
      deleted,
    );
    if (userData?.squash && currentUser && (!deleted || !deleted.isDeleted)) {
      return !loadingSigning && !loadingMatches && <MatchStackScreen />;
    } else {
      return !loadingUser && <SignOutStack />;
    }
  }

  const renderRoot = () => {
    return (
      <AppContainer loading={loadingSigning || loadingUser || loadingMatches}>
        <UserContext.Provider value={value}>
          {initialValuesFormik && (
            <Formik
              enableReinitialize={true}
              initialValues={initialValuesFormik}
              //validationSchema={FilterSchema}
              onSubmit={(values) =>
                console.log('if it works it submits', values)
              }>
              {render2()}
            </Formik>
          )}
        </UserContext.Provider>
      </AppContainer>
    );
  };
  return <>{renderRoot()}</>;}
  export {AuthNavigator}