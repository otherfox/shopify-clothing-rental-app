import gql from 'graphql-tag';

const fulfillCustomerOrder = gql`
  mutation fulfillmentCreate($input: FulfillmentInput!) {
    fulfillmentCreate(input: $input) {
      fulfillment {
        id
      }
      order {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export default fulfillCustomerOrder;