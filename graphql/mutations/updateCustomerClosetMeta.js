const gql = require('graphql-tag');

const updateCustomerClosetMetaQuery = `
  mutation updateCustomerClosetMeta($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        tags
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

const updateCustomerClosetMeta = gql`${updateCustomerClosetMetaQuery}`;

module.exports = {
  updateCustomerClosetMeta,
  updateCustomerClosetMetaQuery
}; 