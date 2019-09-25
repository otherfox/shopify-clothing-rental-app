const gql = require('graphql-tag');

const getEndlessCustomers = gql`
  query getCustomers($query: String!) {
    customers(first: 5, query: $query) {
      edges {
        node {
          id
          displayName
          tags
        }
      }
    }
  }
`;

module.exports = {
  getEndlessCustomers
};