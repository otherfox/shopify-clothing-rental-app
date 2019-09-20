import gql from 'graphql-tag';

// Get Customer by ID
const getCustomer = gql`
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

export default getCustomer;