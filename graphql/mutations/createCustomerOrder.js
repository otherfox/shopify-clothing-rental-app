const gql = require('graphql-tag');

const createCustomerOrder = gql`
  mutation draftOrderCreate($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        order {
          id
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

module.exports = { createCustomerOrder };