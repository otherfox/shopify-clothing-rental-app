const gql = require('graphql-tag');

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

module.exports = {
  getLocations
};