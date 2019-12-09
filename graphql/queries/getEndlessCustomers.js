const gql = require('graphql-tag');

const getEndlessCustomers = gql`
  query getCustomers($query: String! $namespace: String! $key: String!) {
    customers(first: 25, query: $query) {
      edges {
        node {
          id
          displayName
          tags
          metafield(namespace: $namespace key: $key) {
            id
            key
            value
          }
        }
      }
    }
  }
`;

module.exports = {
  getEndlessCustomers
};