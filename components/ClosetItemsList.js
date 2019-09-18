import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
  Select,
  Spinner,
  Tag,
  Badge,
  Layout,
  Button,
  Collapsible,
  TextContainer,
  Heading,
  FormLayout
} from '@shopify/polaris';
import { Component, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';

import UpdateCloset from './UpdateCloset';
import {
  ENDLESS_DATE_FORMAT, ENDLESS_ITEM_RETURN_STATUS, ENDLESS_ITEM_DEFAULT_STATUS
} from '../constants';

const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              originalSrc
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

class ClosetItemsList extends Component {

  handleRemoveActivity = (item, label) => {
    this.props.onUpdateCloset({
      id: item.id,
      dates: item.dates.filter(i => i.label !== label)
    });
  }

  render() {
    const {
      closet, customer, order, invalidStatusMsg,
      orders, mutation, refetchQueries } = this.props;

    if (invalidStatusMsg) return <div>{invalidStatusMsg}</div>;

    const customerMeta = JSON.parse(customer.metafield.value);
    const statuses = customerMeta.statuses;
    let returnsMeta = [], returns = [],
      currentOrderMeta = [], currentOrder = [],
      unsubmittedItemsMeta = [], unsubmittedItems = [];

    return (
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: _.map(closet, 'id') }}>
        {({ data, loading, error }) => {
          if (loading) return <div><Spinner size="small" color="teal" /> Fetching Items…</div>;
          if (error) return <div>{error.message}</div>;

          if (data && data.nodes) {
            // filter out returns, current order queue, etc. from closet
            if (closet.length > 0) {
              closet.forEach(i => {
                if (i.status == ENDLESS_ITEM_RETURN_STATUS) returnsMeta.push(i);
                if (i.order == order.id) currentOrderMeta.push(i);
                if (!i.order) unsubmittedItemsMeta.push(i);
              });

              // group data by category
              data.nodes.forEach(i => {
                if (_.find(returnsMeta, { id: i.id })) returns.push(i);
                if (_.find(currentOrderMeta, { id: i.id })) currentOrder.push(i);
                if (_.find(unsubmittedItemsMeta, { id: i.id })) unsubmittedItems.push(i);
              });
            }
          }

          if (data && data.nodes) return (
            <Layout>
              <ClosetItemSection
                displayText={`Endless Order: ${order.date}`}
                items={currentOrder}
                closet={closet}
                onUpdateCloset={this.props.onUpdateCloset}
                statuses={statuses}
                orders={orders}
                customer={customer}
                mutation={mutation}
                refetchQueries={refetchQueries}
                handleRemoveActivity={this.handleRemoveActivity}
                id="currentOrder"
              />
              <ClosetItemSection
                displayText="Current Closet"
                items={unsubmittedItems}
                closet={closet}
                onUpdateCloset={this.props.onUpdateCloset}
                showStatusSelect={false}
                handleRemoveActivity={this.handleRemoveActivity}
                id="currentCloset"
              />
              <ClosetItemSection
                displayText="Returned"
                items={returns}
                closet={closet}
                onUpdateCloset={this.props.onUpdateCloset}
                showStatusSelect={false}
                showNotes={false}
                showOrder={true}
                showReturned={true}
                showActivity={false}
                id="returned"
              />
            </Layout>
          );
        }}
      </Query>
    );
  }
}

const ClosetItemSection = (props) => {
  let {
    displayText, items, closet, onUpdateCloset, statuses,
    showStatusSelect, showNotes, showOrder, id, showData,
    orders, mutation, refetchQueries, customer, handleRemoveActivity,
    showActivity, showReturned
  } = props;

  // set defaults
  showStatusSelect = showStatusSelect == undefined ? true : false;
  showNotes = showNotes == undefined ? true : false;
  showOrder = showOrder == undefined ? false : true;
  showData = showData == undefined ? false : true;
  showActivity = showActivity == undefined ? true : false;
  showReturned = showReturned == undefined ? false : true;

  const [open, setOpen] = useState(props.showData);

  return (
    <Layout.Section>
      <Card sectioned>
        <Heading variation="strong">{displayText}</Heading>
        <FormLayout>
          <TextStyle variation="strong">Items: {items.length}</TextStyle>
          <Button
            onClick={() => setOpen(!open)}
            ariaExpanded={open}
            ariaControls={id}
          >
            Toggle Data
          </Button>
        </FormLayout>
        <Collapsible open={open} id={id}>
          <ResourceList
            items={items}
            renderItem={item => {
              const itemMeta = _.find(closet, { id: item.id });
              const media = (
                <Thumbnail
                  source={
                    item.images.edges[0]
                      ? item.images.edges[0].node.originalSrc
                      : ''
                  }
                  alt={
                    item.images.edges[0]
                      ? item.images.edges[0].node.altText
                      : ''
                  }
                />
              );
              console.log('view-closet closet item state:', itemMeta);
              return (
                <ResourceList.Item
                  id={item.id}
                  media={media}
                  accessibilityLabel={`View details for ${item.title}`}
                >
                  <Stack>
                    <Stack.Item>
                      <h3>
                        <TextStyle variation="strong">
                          {item.title}
                        </TextStyle>
                      </h3>
                    </Stack.Item>
                    {showNotes && (
                      <Stack.Item fill>
                        <TextStyle variation="subdued">Notes</TextStyle>
                        <TextContainer>{itemMeta.notes}</TextContainer>
                      </Stack.Item>
                    )}
                    {showOrder && (
                      <Stack.Item fill>
                        <TextStyle variation="subdued">Order # {itemMeta.order}</TextStyle>
                      </Stack.Item>
                    )}
                    {showActivity && (
                      <Stack.Item>
                        <TextStyle variation="subdued">Activity</TextStyle>
                        {itemMeta.dates.map(d => {
                          return d.label == ENDLESS_ITEM_DEFAULT_STATUS ?
                            (
                              <div key={d.label}>
                                <Badge> {d.label} - {d.value} </Badge>
                              </div>
                            ) :
                            (
                              <div key={d.label}>
                                <Tag
                                  onRemove={() => handleRemoveActivity(itemMeta, d.label)}>
                                  {d.label} - {d.value}
                                </Tag>
                              </div>
                            );
                        })}
                      </Stack.Item>
                    )}
                    {showReturned && (
                      <Stack.Item>
                        <TextStyle variation="subdued">Returned</TextStyle>
                        {itemMeta.dates.map(d => {
                          if (d.label == ENDLESS_ITEM_RETURN_STATUS) {
                            return (
                              <div key={d.label}>
                                <Badge> {d.label} - {d.value} </Badge>
                              </div>
                            );
                          }
                        })}
                      </Stack.Item>
                    )}
                    {showStatusSelect && (
                      <Stack.Item>
                        <StatusSelect
                          item={itemMeta}
                          options={statuses.map(s => ({ label: s, value: s }))}
                          onUpdateCloset={onUpdateCloset} />
                      </Stack.Item>
                    )}
                  </Stack>
                </ResourceList.Item>
              );
            }}
          />
          {mutation && customer && refetchQueries && orders && (
            <UpdateCloset
              mutation={mutation}
              customer={customer}
              closet={closet}
              refetchQueries={refetchQueries}
              orders={orders} />
          )}
        </Collapsible>
      </Card>
    </Layout.Section>
  )
}

const OrdersSection = props => {
  const { orders } = props;

  const [open, setOpen] = useState(props.showData);

  return (
    <Layout.Section>
      <Card sectioned>
        <Heading variation="strong">Orders</Heading>
        <FormLayout>
          <TextStyle variation="strong">Items: {orders.length}</TextStyle>
          <Button
            onClick={() => setOpen(!open)}
            ariaExpanded={open}
            ariaControls="ordersList"
          >
            Toggle Data
          </Button>
        </FormLayout>
        <Collapsible open={open} id="ordersList">
          <ResourceList
            items={orders}
            renderItem={order => (
              <ResourceList.Item
                id={order.id}
              >
                <Stack>
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">
                        Order #{order.id}
                      </TextStyle>
                    </h3>
                  </Stack.Item>
                  <Stack.Item>
                    <TextStyle variation="subdued">Date Ordered</TextStyle>
                    <TextContainer>{order.date}</TextContainer>
                  </Stack.Item>
                </Stack>
              </ResourceList.Item>
            )}
          />
        </Collapsible>
      </Card>
    </Layout.Section>
  )
}

class StatusSelect extends Component {
  state = {
    statusSelected: this.props.item.status
  }

  handleStatusSelect = (selected) => {
    const oldDates = this.props.item.dates;
    const newDate = moment().format(ENDLESS_DATE_FORMAT);

    if (!_.find(oldDates, { label: selected })) {
      const newDates = oldDates.concat([{ label: selected, value: newDate }]);
      console.log('new item meta: ', { id: this.props.item.id, status: selected, dates: newDates });

      this.props.onUpdateCloset({ id: this.props.item.id, status: selected, dates: newDates });
    }

    this.setState({ statusSelected: selected });
  }

  render() {
    return (
      <Select
        label="Status"
        options={this.props.options}
        onChange={this.handleStatusSelect}
        value={this.state.statusSelected}
      />
    )
  }
}

export default ClosetItemsList;