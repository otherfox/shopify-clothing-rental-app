import gql from 'graphql-tag';
import {
  Page,
  Frame,
  Loading,
  Banner
} from '@shopify/polaris';
import { Query } from 'react-apollo';
// import Router from 'next/router';
import _ from 'lodash';

import AddClosetItems from '../components/AddClosetItems';
import ClosetItemsList from '../components/ClosetItemsList';
import CreateClosetOrder from '../components/CreateClosetOrder';
import ResetCloset from '../components/ResetCloset';

import { ENDLESS_CUSTOMER_QUERY, ENDLESS_TYPES } from '../constants';

// Get Endless Customer by ID
const GET_ENDLESS_CUSTOMER = gql`
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

// Update customer meta
const UPDATE_CUSTOMER_CLOSET_META = gql`
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

// Create Endless Order
const CREATE_CUSTOMER_ORDER = gql`
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

// Complete Endless Order
const COMPLETE_CUSTOMER_ORDER = gql`
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

// Fulfill Endless Order
const FULFILL_CUSTOMER_ORDER = gql`
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

// Get Locations
const GET_LOCATIONS = gql`
  query getLocations {
    locations(first:1) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

class ViewCloset extends React.Component {
  state = {
    showItemPicker: false,
    closet: []
  }

  static async getInitialProps({ query }) {
    return { query }
  }

  handleHideAddItems = () => {
    this.setState({ showItemPicker: false });
  }

  handleUpdateCloset = newCloset => {
    console.log('handle update closet: ', newCloset);
    this.setState({ closet: newCloset });
  }

  handleUpdateClosetItem = newItemProps => {
    let newCloset = _.map(this.state.closet, function (obj) {
      return (obj.id == newItemProps.id) ?
        _.assignIn(obj, newItemProps) :
        obj;
    });

    this.handleUpdateCloset(newCloset);
  }

  render() {
    //const customerId = this.props.query.id;
    const customerId = "gid://shopify/Customer/2150341050402";

    const endlessCustomerVariables = ENDLESS_CUSTOMER_QUERY({ id: customerId });
    const refetchQueries = [{ query: GET_ENDLESS_CUSTOMER, variables: endlessCustomerVariables }];
    const { closet } = this.state;


    return (
      <Query
        query={GET_ENDLESS_CUSTOMER}
        variables={endlessCustomerVariables}
        onCompleted={(data) => {
          if (data.customer.metafield !== null) {
            this.setState({ closet: JSON.parse(data.customer.metafield.value).items });
          }
        }
        }>
        {({ data, loading, error }) => {
          const showLoading = loading && (<Loading />);
          const showError = error && (<Banner status="critical">{error.message}</Banner>);
          let showData = null;

          if (data) {
            console.log('view-closet data:', data);
            console.log('view-closet closet state', this.state.closet)

            const customer = data.customer;
            const membership =
              customer && _.intersection(customer.tags, ENDLESS_TYPES).length > 0 ?
                _.intersection(customer.tags, ENDLESS_TYPES)[0] :
                '';
            const metafield = customer && customer.metafield;
            const orders = metafield && JSON.parse(customer.metafield.value).orders;
            const order = orders && orders.length && orders[orders.length - 1];

            console.log('metafield', metafield, 'orders', orders, 'order', order);

            let invalidStatusMsg = '';

            invalidStatusMsg += !metafield ? 'Customer closet metafield undefined. Recreate closet. ' : '';
            invalidStatusMsg += closet.length == 0 ? 'No items in closet. ' : '';
            invalidStatusMsg += !order ? 'No orders exist.' : '';

            showData = data && customer && (
              <Page
                breadcrumbs={[{ content: 'Virtual Closets', url: '/' }]}
                title={customer.displayName}
                subtitle={'Level: ' + membership}
                primaryAction={{
                  content: 'Add Items',
                  onAction: () => {
                    console.log('show item picker');
                    this.setState({ showItemPicker: true });
                  }
                }}
              >
                <AddClosetItems
                  customer={customer}
                  order={order}
                  invalidStatusMsg={invalidStatusMsg}
                  refetchQueries={refetchQueries}
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  onUpdateCloset={this.handleUpdateCloset}
                  open={this.state.showItemPicker}
                  hideAddItems={this.handleHideAddItems} />
                <ClosetItemsList
                  order={order}
                  customer={customer}
                  closet={this.state.closet}
                  invalidStatusMsg={invalidStatusMsg}
                  onUpdateCloset={this.handleUpdateClosetItem}
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  refetchQueries={refetchQueries}
                  orders={orders} />
                <CreateClosetOrder
                  mutation={CREATE_CUSTOMER_ORDER}
                  completeMutation={COMPLETE_CUSTOMER_ORDER}
                  fullfillMutation={FULFILL_CUSTOMER_ORDER}
                  locationsQuery={GET_LOCATIONS}
                  customer={customer}
                  membership={membership}
                  closet={this.state.closet}
                  refetchQueries={refetchQueries} />
                <ResetCloset
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  customer={customer}
                  closet={this.state.closet}
                  orders={orders}
                  refetchQueries={refetchQueries} />
              </Page>
            );
          }

          return (
            <Frame>
              {showLoading}
              {showError}
              {showData}
            </Frame>
          )

        }}
      </Query >
    );
  }
}

export default ViewCloset;