import {
  Page,
  Frame,
  Loading,
  Banner
} from '@shopify/polaris';
import { Query } from 'react-apollo';
import _ from 'lodash';

import AddClosetItems from '../components/AddClosetItems';
import ClosetItemsList from '../components/ClosetItemsList';
import ResetCloset from '../components/ResetCloset';

import {
  ENDLESS_GET_CUSTOMER, ENDLESS_TYPES, ENDLESS_ITEM_SHIPPED_STATUS,
  ENDLESS_ITEM_SELECTED_STATUS, ENDLESS_ITEM_DEFAULT_STATUS
} from '../graphql/variables';
import { getEndlessCustomer } from '../graphql/queries';

class ViewCloset extends React.Component {
  state = {
    showItemPicker: false,
    closet: [],
    orderLimit: 0,
    selectionsLeft: 0,
    orderId: '',
    getEndlessCustomerComplete: false
  }

  static async getInitialProps({ query }) {
    return { query }
  }

  countSelections = closet => {
    // Check item statuses and count selections
    let selectedCount = 0;
    closet.forEach(i => {
      if (i) {
        switch (i.status) {
          case ENDLESS_ITEM_SHIPPED_STATUS:
            selectedCount++;
            break;
          case ENDLESS_ITEM_SELECTED_STATUS:
            selectedCount++;
            break;
          default:
            break;
        }
      }
    });

    return selectedCount;
  }

  getSelectionsLeft = (closet) => {
    const selectedCount = this.countSelections(closet);
    const { orderLimit } = this.state;

    return orderLimit - selectedCount;
  }

  handleHideAddItems = () => {
    this.setState({ showItemPicker: false });
  }

  handleSelections = closet => {
    console.log('handleSelection', closet);
    const selectedCount = this.countSelections(closet);
    const { orderLimit } = this.state;

    return closet.map(i => {
      switch (i.status) {
        // if all items are selected move unselected items back into closet
        case ENDLESS_ITEM_DEFAULT_STATUS:
          i.order = (selectedCount >= orderLimit) ? '' : this.state.orderId;
        default:
          return i;
      }
    });;
  }

  handleUpdateCloset = newCloset => {
    newCloset = this.handleSelections(newCloset);
    const selectionsLeft = this.getSelectionsLeft(newCloset)
    console.log('handle update closet: ', newCloset, ' and selectionsLeft: ', selectionsLeft);
    this.setState({ closet: newCloset, selectionsLeft: selectionsLeft });
  }

  handleUpdateClosetItem = newItemProps => {
    console.log('handle update item', newItemProps);
    let newCloset = _.map(this.state.closet, obj => {
      return (obj.id == newItemProps.id) ?
        _.assignIn(obj, newItemProps) :
        obj;
    });

    this.handleUpdateCloset(newCloset);
  }

  handleUpdateOrderLimit = newLimit => {
    this.setState({ orderLimit: newLimit });
  }

  render() {
    const customerId = this.props.query.id;
    //const customerId = "gid://shopify/Customer/2150341050402";

    const endlessCustomerVariables = ENDLESS_GET_CUSTOMER({ id: customerId });
    const refetchQueries = [{ query: getEndlessCustomer, variables: endlessCustomerVariables }];
    const { closet, getEndlessCustomerComplete, selectionsLeft } = this.state;


    return (
      <Query
        query={getEndlessCustomer}
        variables={endlessCustomerVariables}
        onCompleted={(data) => {
          // Set closet initial state
          if (data.customer.metafield && data.customer.metafield !== null) {
            const closetMeta = JSON.parse(data.customer.metafield.value)
            this.setState({
              closet: closetMeta.items,
              orderLimit: closetMeta.orderLimit,
              orderId: _.isEmpty(closetMeta.order) ? '' : closetMeta.order.id,
              selectionsLeft: closetMeta.orderLimit - this.countSelections(closetMeta.items)
            });
          }
          // Set complete
          this.setState({ getEndlessCustomerComplete: true });
        }
        }>
        {({ data, loading, error }) => {
          const showLoading = loading && (<Loading />);
          const showError = error && (<Banner status="critical">{error.message}</Banner>);
          let showData = null;

          if (getEndlessCustomerComplete) {
            const customer = data.customer;
            const membership =
              customer && _.intersection(customer.tags, ENDLESS_TYPES).length > 0 ?
                _.intersection(customer.tags, ENDLESS_TYPES)[0] :
                '';
            const metafield = customer && customer.metafield;
            const order = metafield && JSON.parse(customer.metafield.value).order;

            let invalidStatusMsg = '';

            invalidStatusMsg += !metafield ? 'Customer closet metafield undefined. Recreate closet. ' : '';
            invalidStatusMsg += closet.length == 0 ? 'No items in closet. ' : '';

            console.log(
              'metafield', metafield, 'order', order, 'closet state', closet, 'selectionsLeft', selectionsLeft
            );

            showData = (
              <Page
                breadcrumbs={[{ content: 'Virtual Closets', url: '/' }]}
                title={customer.displayName}
                subtitle={'Level: ' + membership}
                primaryAction={{
                  content: 'Add Items',
                  onAction: () => {
                    this.setState({ showItemPicker: true });
                  }
                }}
              >
                <AddClosetItems
                  customer={customer}
                  hideAddItems={this.handleHideAddItems}
                  invalidStatusMsg={invalidStatusMsg}
                  onUpdateCloset={this.handleUpdateCloset}
                  open={this.state.showItemPicker}
                  order={order} />
                <ClosetItemsList
                  closet={this.state.closet}
                  customer={customer}
                  invalidStatusMsg={invalidStatusMsg}
                  membership={membership}
                  onUpdateClosetItem={this.handleUpdateClosetItem}
                  onUpdateCloset={this.handleUpdateCloset}
                  order={order}
                  refetchQueries={refetchQueries}
                  selectionsLeft={selectionsLeft} />
                <ResetCloset
                  closet={this.state.closet}
                  customer={customer}
                  order={order}
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