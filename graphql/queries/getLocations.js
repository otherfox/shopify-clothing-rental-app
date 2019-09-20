import gql from 'graphql-tag';

// Get Locations
const getLocations = gql`
  query getLocations {
    locations(first:1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export default getLocations;