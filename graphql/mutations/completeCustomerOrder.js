const gql = require('graphql-tag');

const completeCustomerOrder = gql`
  mutation draftOrderComplete($id: ID!, $paymentPending: Boolean!) {
    draftOrderComplete(id: $id, paymentPending: $paymentPending) {
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

module.exports = { completeCustomerOrder };