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
  ThemeProvider
} from '@shopify/polaris';
import { Component } from 'react';
import moment from 'moment';

import { ENDLESS_STATUS_DATE_FORMAT } from '../constants';

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
    const closet = this.props.closet;
    if (!this.props.customer.metafield) return <div>Customer closet metafield undefined. Recreate closet.</div>;
    if (closet.length == 0) return <div>No items in closet</div>;

    const statuses = JSON.parse(this.props.customer.metafield.value).statuses;

    return (
      <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: _.map(closet, 'id') }}>
        {({ data, loading, error }) => {
          if (loading) return <div><Spinner size="small" color="teal" /> Fetching Items…</div>;
          if (error) return <div>{error.message}</div>;
          return (
            <Card>
              <ResourceList
                items={data.nodes}
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
                        <Stack.Item fill>
                          <TextStyle variation="subdued">Notes</TextStyle>
                          {itemMeta.notes}
                        </Stack.Item>
                        <Stack.Item>
                          <TextStyle variation="subdued">Activity</TextStyle>
                          {itemMeta.dates.map(d => (
                            <div key={d.label}>
                              <Tag
                                onRemove={() => this.handleRemoveActivity(itemMeta, d.label)}>
                                {d.label} - {d.value}
                              </Tag>
                            </div>
                          ))}
                        </Stack.Item>
                        <Stack.Item>
                          <StatusSelect
                            item={itemMeta}
                            options={statuses.map(s => ({ label: s, value: s }))}
                            onUpdateCloset={this.props.onUpdateCloset} />
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

class StatusSelect extends Component {
  state = {
    statusSelected: this.props.item.status
  }

  handleStatusSelect = (selected) => {
    const oldDates = this.props.item.dates;
    const newDate = moment().format(ENDLESS_STATUS_DATE_FORMAT);

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