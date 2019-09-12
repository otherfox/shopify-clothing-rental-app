import gql from 'graphql-tag';
import {
  Page,
  Frame,
  Loading,
  Banner,
  ThemeProvider
} from '@shopify/polaris';
import { Query } from 'react-apollo';
import store from 'store-js';
import _ from 'lodash';

import AddClosetItems from '../components/AddClosetItems';
import ClosetItemsList from '../components/ClosetItemsList';
import ResetCloset from '../components/ResetCloset';
import UpdateCloset from '../components/UpdateCloset'

import { ENDLESS_CUSTOMER_QUERY, ENDLESS_TYPES } from '../constants';

// Get Endless Customer by ID
const GET_ENDLESS_CUSTOMER = gql`
  query getCustomer($id: ID! $namespace: String! $key: String!) {
    customer(id: $id) {
      id
      displayName
      tags
      metafield(namespace: $namespace key: $key) {
        id
        key
        value
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

class ViewCloset extends React.Component {
  state = {
    showItemPicker: false,
    closet: []
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
    const customerId = store.get('customer');
    const endlessCustomerVariables = ENDLESS_CUSTOMER_QUERY({ id: customerId });
    const refetchQueries = [{ query: GET_ENDLESS_CUSTOMER, variables: endlessCustomerVariables }];
    return (
      <Query
        query={GET_ENDLESS_CUSTOMER}
        variables={endlessCustomerVariables}
        onCompleted={(data) => {
          if (data.customer.metafield !== null) {
            this.setState({ closet: JSON.parse(data.customer.metafield.value).items })
          }
        }
        }>
        {({ data, loading, error }) => {
          const showLoading = loading && (
            <Loading />
          );
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          let showData = null;

          if (data) {
            console.log('view-closet data:', data);
            console.log('view-closet closet state', this.state.closet)
            const customer = data.customer;
            const membership =
              customer && _.intersection(customer.tags, ENDLESS_TYPES).length > 0 ?
                _.intersection(customer.tags, ENDLESS_TYPES)[0] :
                '';

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
                  refetchQueries={refetchQueries}
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  onUpdateCloset={this.handleUpdateCloset}
                  open={this.state.showItemPicker}
                  hideAddItems={this.handleHideAddItems} />
                <ClosetItemsList
                  customer={customer}
                  closet={this.state.closet}
                  onUpdateCloset={this.handleUpdateClosetItem} />
                <UpdateCloset
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  customer={customer}
                  closet={this.state.closet}
                  refetchQueries={refetchQueries} />
                <ResetCloset
                  mutation={UPDATE_CUSTOMER_CLOSET_META}
                  customer={customer}
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