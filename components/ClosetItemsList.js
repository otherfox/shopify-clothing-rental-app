import { Query } from 'react-apollo';
import {
  Spinner, Layout
} from '@shopify/polaris';
import { Component } from 'react';
import _ from 'lodash';

import ClosetInvoicesSection from '../components/ClosetInvoicesSection';
import ClosetItemSection from '../components/ClosetItemSection';

import { ENDLESS_SHIPPED_STATUSES } from '../graphql/variables';
import { getProducts } from '../graphql/queries';

class ClosetItemsList extends Component {

  handleRemoveActivity = (item, label) => {
    this.props.onUpdateClosetItem({
      id: item.id,
      dates: item.dates.filter(i => i.label !== label)
    });
  }

  render() {
    const {
      closet, customer, invalidStatusMsg, membership, onUpdateCloset, order,
      refetchQueries, selectionsLeft, onUpdateClosetItem
    } = this.props;

    if (invalidStatusMsg) return <div>{invalidStatusMsg}</div>;

    const customerMeta = JSON.parse(customer.metafield.value);
    const statuses = customerMeta.statuses;

    let currentOrderMeta = [], currentOrder = [],
      unsubmittedItemsMeta = [], unsubmittedItems = [],
      shippedItemsMeta = [], shippedItems = [];

    return (
      <Query query={getProducts} variables={{ ids: _.map(closet, 'id') }}>
        {({ data, loading, error }) => {
          if (loading) return <div><Spinner size="small" color="teal" /> Fetching Items…</div>;
          if (error) return <div>{error.message}</div>;

          // Sort items into sections
          if (data && data.nodes) {
            // filter out returns, current order queue, etc. from closet
            if (closet.length > 0) {
              closet.forEach(i => {
                if (i.order && !i.invoice) currentOrderMeta.push(i);
                if (i.order && i.invoice) shippedItemsMeta.push(i);
                if (!i.order) unsubmittedItemsMeta.push(i);
              });

              // group data by category
              data.nodes.forEach(i => {
                if (_.find(currentOrderMeta, { id: i.id })) currentOrder.push(i);
                if (_.find(unsubmittedItemsMeta, { id: i.id })) unsubmittedItems.push(i);
                if (_.find(shippedItemsMeta, { id: i.id })) shippedItems.push(i);
              });
            }
          }

          if (data && data.nodes) return (
            <Layout>
              <ClosetItemSection
                closet={closet}
                customer={customer}
                displayText={`Endless Order: ${_.isEmpty(order) ? "No Closet Submited" : order.date}`}
                handleRemoveActivity={this.handleRemoveActivity}
                id="currentOrder"
                items={currentOrder}
                membership={membership}
                onUpdateCloset={onUpdateCloset}
                onUpdateClosetItem={onUpdateClosetItem}
                order={order}
                refetchQueries={refetchQueries}
                selectionsLeft={selectionsLeft}
                showData={true}
                showSelected={true}
                showStatusSelect={true}
                showUpdate={true}
                statuses={statuses}
              />
              <ClosetItemSection
                closet={closet}
                customer={customer}
                displayText={'Shipped Items'}
                handleRemoveActivity={this.handleRemoveActivity}
                id="shippedItems"
                items={shippedItems}
                onUpdateCloset={onUpdateCloset}
                onUpdateClosetItem={onUpdateClosetItem}
                refetchQueries={refetchQueries}
                showActivity={true}
                showInvoice={true}
                showNotes={false}
                showStatusSelect={true}
                showUpdate={true}
                statuses={ENDLESS_SHIPPED_STATUSES}
              />
              <ClosetInvoicesSection
                customer={customer}
              />
              <ClosetItemSection
                closet={closet}
                displayText="Closet"
                id="currentCloset"
                items={unsubmittedItems}
                showStatusSelect={false}
              />
            </Layout>
          );
        }}
      </Query>
    );
  }
}

export default ClosetItemsList;