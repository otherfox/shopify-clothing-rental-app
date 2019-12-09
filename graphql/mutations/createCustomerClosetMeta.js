const gql = require('graphql-tag');

const createCustomerClosetMetaQuery = `
  mutation createCustomerClosetMeta($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        metafields(first:10) {
          edges {
            node {
              id
              namespace
              key
              value
            }
          }
        }
      }
    }
  }
`;

const createCustomerClosetMeta = gql`${createCustomerClosetMetaQuery}`;

module.exports = {
  createCustomerClosetMeta,
  createCustomerClosetMetaQuery
}; 