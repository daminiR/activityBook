import { dislikesVar, likesVar} from '../../cache'
import {MAX_LIKES, MAX_DISLIKES} from '../../constants'
import _ from 'lodash'
import {PotentialMatchType, Sport, ImageSetT} from '../../localModels/UserSportsList'

    //Have a separate bloom filter to check if it is a match ... there can be false positives but since the majority will be 'not matched yet' this will save a lot of database queries
    //If it is not a match yet and you need to store the swiped up data entry, keep multiple such entries in memory/redis for a while and then bulk insert in the database
    //update bloom filter real-time (Note: there could be a momentary mismatch between bloom and database till the bulk insert is done.)


      //////squashItemsVar([...squashItems, data.createSquash._id])
export const sanitizeCard = (card) => {
    let sports  = _.map(card.sports, (sportObj) => {
      return _.omit(sportObj, '__typename') as Sport;
    })
     let image_set  = _.map(card.image_set, (imageObj) => {
    const extended = _.extend({"filePath" : "temp"}, imageObj)
    return _.omit(extended, '__typename') as ImageSetT;
    })
    //const sports = card.sports
    console.log("sportssssssssssss",  sports)
    const  potentialMatch: PotentialMatchType= {
       "first_name": card.first_name,
       "age": card.age,
       "_id": card._id,
       "gender": card.gender,
       "sports": sports,
       "description": card.description,
       "image_set": image_set
   }
    return potentialMatch
}
const swipeRightLiked = async (currentUser,_id, card, updateLikes, updateMatches, setMatched) => {
    // push all ids when likes or dislikes and bulk send mutation
    // if potential match likes current user upsert a match array
    // update mutation for both users
    const matchUSerLikedIDs = _.find(card.matches, match => { return match._id})
    const userMatchingData = sanitizeCard(currentUser)
    console.log("card", card)
    console.log("_id", card)

    var array = likesVar()
    const potentialMatch = sanitizeCard(card)
    array.push(potentialMatch)
    likesVar(array)
    console.log(likesVar())
    // test //

    updateLikes({variables: {
            _id: _id,
            likes: array,
            currentUserData: userMatchingData
        }})

    if (_.find(card.likes, (likeObj) => {return likeObj._id == _id})){
    console.log("Matched")
    const matchedUser = sanitizeCard(card)
    setMatched(true)
    updateMatches({variables: {currentUserId: _id,
                  potentialMatchId: card._id,
                  currentUser: userMatchingData,
                  potentialMatch: matchedUser}})
    }
    // matched UI



    // test //
    //
    //if (array.length  == MAX_LIKES){
        //// update mutation for likes
        //updateLikes({variables: {
            //_id: _id,
            //likes: array,
            //currentUserData: userMatchingData
        //}})
        //array = []
    //}
}
const swipeLeftDisliked = async (_id, card, updateDislikes) => {
    // push all ids when likes or dislikes and bulk send mutation
    var array = dislikesVar()
    if (array.length  == MAX_DISLIKES){
        //update mutation for dislikes
        updateDislikes({variables: {
            _id: _id,
            dislikes: array
        }})
        array = []
    }
    const potentialMatch = sanitizeCard(card)
    array.push(potentialMatch)
    dislikesVar(array)
    console.log(dislikesVar())
}
export {swipeLeftDisliked, swipeRightLiked}