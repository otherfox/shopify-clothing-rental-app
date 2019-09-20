import gql from 'graphql-tag';

const updateCustomerClosetMeta = gql`
  mutation updateCustomerClosetMeta($input: CustomerInput!) {
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

export default updateCustomerClosetMeta;