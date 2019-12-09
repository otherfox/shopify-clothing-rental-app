const gql = require('graphql-tag');

// Get Customer by ID
const getCustomerQuery = `
  query getCustomer($id: ID!) {
    customer(id: $id) {
      id
      displayName
      tags
      orders(first:10) {
        edges {
          node {
            id
            createdAt
            lineItems(first:20) {
              edges {
                node {
                  product {
                    id
                  }
                  variant {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const getCustomer = gql`${getCustomerQuery}`;

module.exports = {
  getCustomer,
  getCustomerQuery
};