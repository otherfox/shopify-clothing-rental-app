const gql = require('graphql-tag');

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

module.exports = { fulfillCustomerOrder };