import React, {useEffect, useContext, useReducer, useState} from 'react';
import _ from 'lodash'
import {
  StyleSheet,
  Text,
  StatusBar,
  SafeAreaView,
  View,
  FlatList,
  RefreshControl,
  AppState,
} from 'react-native';

import {UserContext} from '@UserContext'
import { channelsReducer } from '../../../reducers/Channels';
import Channel from '../../../components/Channels';
import { handleNotificationAction } from '../../../utils/SendBird';

const Channels = props => {
  const { route, navigation} = props;
  const {currentUser} = route.params
  const {data: currentUserData, sendbird, setSendbird} = useContext(UserContext)
  const [query, setQuery] = useState(null);
  const [state, dispatch] = useReducer(channelsReducer, {
    sendbird,
    currentUser,
    channels: [],
    channelMap: {},
    loading: false,
    empty: '',
    error: null,
  });
  console.log("states", state.channels)
  // on state change
  useEffect(() => {
    sendbird.addConnectionHandler('channels', connectionHandler);
    sendbird.addChannelHandler('channels', channelHandler);
    console.log("sbError chennel errors", sendbird.channelHandlers)
    //const unsubscribe = AppState.addEventListener('change', handleStateChange);
    if (!sendbird.currentUser) {
      console.log("channesError: not corret uSer")
      sendbird.connect(currentUser.userId, (err, _) => {
        if (!err) {
          refresh();
        } else {
          console.log("do we hit here refresh error")
          dispatch({
            type: 'end-loading',
            payload: {
              error: 'Connection failed. Please check the network status.',
            },
          });
        }
      });
    } else {
      refresh();
      console.log("channesError: corret uSer")
    }
    return () => {
      console.log("sbError channel error")
      dispatch({ type: 'end-loading' });
      sendbird.removeConnectionHandler('channels');
      sendbird.removeChannelHandler('channels');
      //unsubscribe.remove();
    };
  }, []);

  useEffect(() => {
    console.log("channesError route params change")
    if (route.params && route.params.action) {
      const { action, data } = route.params;
      switch (action) {
        case 'leave':
          data.channel.leave(err => {
            if (err) {
              dispatch({
                type: 'error',
                payload: {
                  error: 'Failed to leave the channel.',
                },
              });
            }
          });
          break;
      }
    }
  }, [route.params]);

  useEffect(() => {
    if (query) {
      next();
    }
  }, [query]);
  /// on connection event
  const connectionHandler = new sendbird.ConnectionHandler();
  connectionHandler.onReconnectStarted = () => {
    dispatch({
      type: 'error',
      payload: {
        error: 'Connecting..',
      },
    });
  };
  connectionHandler.onReconnectSucceeded = () => {
    dispatch({ type: 'error', payload: { error: null } });
    refresh();
    handleNotificationAction(navigation, sendbird, currentUser, 'channels').catch(err => console.error(err));
  };
  connectionHandler.onReconnectFailed = () => {
    dispatch({
      type: 'error',
      payload: {
        error: 'Connection failed. Please check the network status.',
      },
    });
  };

  // now that we have connection add all matches channels


  /// on channel event
  const channelHandler = new sendbird.ChannelHandler();
  channelHandler.onUserJoined = (channel, user) => {
    if (user.userId === sendbird.currentUser.userId) {
      dispatch({ type: 'join-channel', payload: { channel } });
    }
  };
  channelHandler.onUserLeft = (channel, user) => {
    if (user.userId === sendbird.currentUser.userId) {
      dispatch({ type: 'leave-channel', payload: { channel } });
    }
  };
  channelHandler.onChannelChanged = channel => {
    dispatch({ type: 'update-channel', payload: { channel } });
  };
  channelHandler.onChannelDeleted = channel => {
    dispatch({ type: 'delete-channel', payload: { channel } });
  };

  const handleStateChange = newState => {
    if (newState === 'active') {
      sendbird.setForegroundState();
    } else {
      sendbird.setBackgroundState();
    }
  };
  const chat = (channel) => {
    const other_user = _.filter(channel.members, (member)=> {return member.userId !== currentUser.userId})
    const other_id = other_user[0].userId
    const profileViewDataList = _.filter(currentUserData.squash.matches, (match)  => {return match._id === other_id})

    if (profileViewDataList.length === 0) {
      console.log("user doesnt exist anymore")
    } else {

      navigation.navigate('ACTIVE_CHAT', {
        currentUserID: currentUser.sub,
        channel: channel,
        currentUser: currentUser,
        profileViewData: profileViewDataList[0],
      });
    }
  };
  const refresh = () => {
    console.log("channesError: list of groupChannel", sendbird.GroupChannel)
    var q = sendbird.GroupChannel.createMyGroupChannelListQuery()
    q.show_empty = true
    q.includeEmpty = true
    console.log("channesError: list of groupChannel", q)
    //setQuery(sendbird.GroupChannel.createMyGroupChannelListQuery());
    setQuery(q);
    dispatch({ type: 'refresh' });
  };
  const next = () => {
    if (query.hasNext) {
      console.log("channesError: list of quer", query)
      dispatch({ type: 'start-loading' });
      query.limit = 10;
      query.show_empty = true
      query.includeEmpty = true
      // addd channels for ones that dont have any

      _.map(currentUserData.squash.matches, (match) => {
        var userIds = [currentUser.sub, match._id]
        sendbird.GroupChannel.createChannelWithUserIds(
          userIds,
          true,
          function (groupChannel, error) {
            if (error) {
              // Handle error.
              console.log('SB_ERROR', error);
            }
            console.log('SB OPEN2', groupChannel);
          },
        );
      })
      //query.include_empty = true
      query.next((err, fetchedChannels) => {
        console.log("channesError: list of fetched", fetchedChannels)
        console.log("channesError: list of err", err)
        dispatch({ type: 'end-loading' });
        if (!err) {
          dispatch({
            type: 'fetch-channels',
            payload: { channels: fetchedChannels },
          });
        } else {
          dispatch({
            type: 'error',
            payload: {
              error: 'Failed to get the channels.',
            },
          });
        }
      });
    }
  };
  console.log("list of channels", state)
  return (
    <>
      <StatusBar backgroundColor="#742ddd" barStyle="light-content" />
      <SafeAreaView style={style.container}>
        <FlatList
          data={state.channels}
          renderItem={({ item }) => <Channel key={item.url} sendbird={sendbird} channel={item} onPress={channel => chat(channel)} />}
          keyExtractor={item => item.url}
          refreshControl={
            <RefreshControl refreshing={state.loading} colors={['#742ddd']} tintColor={'#742ddd'} onRefresh={refresh} />
          }
          contentContainerStyle={{ flexGrow: 1 }}
          ListHeaderComponent={
            state.error && (
              <View style={style.errorContainer}>
                <Text style={style.error}>{state.error}</Text>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={style.emptyContainer}>
              <Text style={style.empty}>{state.empty}</Text>
            </View>
          }
          onEndReached={() => next()}
          onEndReachedThreshold={0.5}
        />
      </SafeAreaView>
    </>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#333',
    opacity: 0.8,
    padding: 10,
  },
  error: {
    color: '#fff',
  },
  loading: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    fontSize: 24,
    color: '#999',
    alignSelf: 'center',
  },
})

export  {Channels}