import gql from 'graphql-tag';

const getEndlessCustomer = gql`
  query getCustomer($id: ID! $namespace: String! $key: String! $order_namespace: String! $order_key: String!) {
    customer(id: $id) {
      id
      displayName
      tags
      metafield(namespace: $namespace key: $key) {
        id
        key
        value
      }
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
            metafield(namespace: $order_namespace key: $order_key) {
              id
              key
              value
            }

          }
        }
      }
    }
  }
`;

export default getEndlessCustomer;