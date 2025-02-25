import { gql } from 'urql';

const APPLY_NEIGHBORHOOD_FILTER = gql`
  mutation ApplyNeighborhoodFilter($_id: String!, $neighborhood: NeighborhoodInput!) {
    applyNeighborhoodFilter(_id: $_id, neighborhood: $neighborhood) {
      matchUserId
      firstName
      age
      gender
      sport {
        sportName
        gameLevel
      }
      description
      imageSet {
        img_idx
        imageURL
      }
      neighborhood {
        city
        state
        country
      }
      interacted
      createdAt
      updatedAt
    }
  }
`
const APPLY_FILTERS = gql`
  mutation ApplyFilters($_id: String!, $filtersHash: String!, $filters: FilterTypeInput!) {
    applyFilters(_id: $_id, filtersHash: $filtersHash, filters: $filters) {
      filters {
        age {
          min
          max
        }
        gameLevel {
          min
          max
        }
      }
      filtersHash
      potentialMatches {
        interacted
        createdAt
        updatedAt
        neighborhood {
          city
          state
          country
        }
        matchUserId
        firstName
        age
        gender
        sport {
          sportName
          gameLevel
        }
        description
        imageSet {
          img_idx
          imageURL
        }
      }
    }
  }
`
const UPDATE_USER_PROFILE = gql`
  mutation UpdateProfile(
    $_id: String!
    $firstName: String!
    $lastName: String!
    $gender: String!
    $add_local_images: [FileUploadInput!]!
    $remove_uploaded_images: [DataInput]
    $original_uploaded_imageSet: [DataInput!]!
    $sport: SportNodeInput!
    $neighborhood: LocationInput!
    $age: Int!
    $description: String!
  ) {
    updateProfile(
      _id: $_id
      firstName: $firstName
      gender: $gender
      age: $age
      sport: $sport
      neighborhood: $neighborhood
      lastName: $lastName
      addLocalImages: $add_local_images
      removeUploadedImages: $remove_uploaded_images
      originalImages: $original_uploaded_imageSet
      description: $description
    ) {
      _id
      firstName
      lastName
      neighborhood {
        city
        state
        country
      }
      age
      gender
      sport {
        sportName
        gameLevel
      }
      description
      imageSet {
        img_idx
        imageURL
        filePath
      }
    }
  }
`;


const UPDATE_DISLIKES = gql`
  mutation RecordDislikesAndUpdateCount($_id: String!, $dislikes: [String!]!, $isFromLikes: Boolean!) {
    recordDislikesAndUpdateCount(_id: $_id, dislikes: $dislikes, isFromLikes: $isFromLikes)
    {
      _id
      first_name
      age
      gender
      sport {
        sportName
        gameLevel
      }
      description
      imageSet {
        img_idx
        imageURL
        filePath
      }
    }
  }
`;
export {
  UPDATE_USER_PROFILE,
  UPDATE_DISLIKES,
  APPLY_FILTERS,
  APPLY_NEIGHBORHOOD_FILTER
};
