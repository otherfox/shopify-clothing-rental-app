import {
  Card, ResourceList, Stack, TextStyle, Thumbnail, Select,
  Tag, Badge, Layout, Button, Collapsible,
  TextContainer, Heading, FormLayout
} from '@shopify/polaris';
import { Component, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';

import UpdateCloset from './UpdateCloset';
import CreateClosetOrder from '../components/CreateClosetOrder';

import {
  ENDLESS_DATE_FORMAT, ENDLESS_ITEM_DEFAULT_STATUS, ENDLESS_ITEM_SHIPPED_STATUS
} from '../graphql/variables';

const ClosetItemSection = (props) => {
  let {
    closet, customer, displayText, handleRemoveActivity, id, items, membership,
    onUpdateCloset, refetchQueries, selectionsLeft, onUpdateClosetItem,
    showActivity, showData, showInvoice, showNotes, showSelected,
    showStatusSelect, showUpdate, statuses
  } = props;

  // set defaults
  showActivity = showActivity == undefined ? true : showActivity;
  showData = showData == undefined ? false : showData;
  showInvoice = showInvoice == undefined ? false : showInvoice;
  showNotes = showNotes == undefined ? true : showNotes;
  showSelected = showSelected == undefined ? false : showSelected;
  showStatusSelect = showStatusSelect == undefined ? true : showStatusSelect;
  showUpdate = showUpdate == undefined ? false : showUpdate;

  // choose which update to render
  let hasShippedWithoutInvoice = false;
  closet.map(i => {
    if (!i.invoice && i.status == ENDLESS_ITEM_SHIPPED_STATUS) {
      hasShippedWithoutInvoice = true;
    }
  });

  const [open, setOpen] = useState(showData && items.length);

  return (
    <Layout.Section>
      <Card sectioned>
        <Heading variation="strong">{displayText}</Heading>
        <FormLayout>
          <TextContainer><TextStyle variation="strong">Items: {items.length}</TextStyle></TextContainer>
          {showSelected && !!(items.length > 0) && (
            <TextContainer><TextStyle variation="strong">Remaining items to select for customer: {selectionsLeft}</TextStyle></TextContainer>
          )}
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
                    <Stack.Item>
                      <TextStyle variation="subdued">Hearted</TextStyle>
                      <TextContainer>{itemMeta.hearted}</TextContainer>
                    </Stack.Item>
                    {showInvoice && (
                      <Stack.Item fill>
                        <TextContainer>
                          <TextStyle variation="subdued">Invoice # {itemMeta.invoice}</TextStyle>
                        </TextContainer>
                      </Stack.Item>
                    )}
                    {showActivity && (
                      <Stack.Item>
                        <TextStyle variation="subdued">Activity</TextStyle>
                        {(id !== "shippedItems") && itemMeta.dates.map(d => {
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
                        {(id == "shippedItems") && itemMeta.dates.map(d => {
                          return (
                            <div key={d.label}>
                              <Badge> {d.label} - {d.value} </Badge>
                            </div>
                          );
                        })}
                      </Stack.Item>
                    )}
                    {showStatusSelect && (
                      <Stack.Item>
                        <StatusSelect
                          item={itemMeta}
                          options={statuses.map(s => ({ label: s, value: s }))}
                          onUpdateClosetItem={onUpdateClosetItem} />
                      </Stack.Item>
                    )}
                  </Stack>
                </ResourceList.Item>
              );
            }}
          />
          {showUpdate && (!hasShippedWithoutInvoice ? (
            <UpdateCloset
              customer={customer}
              closet={closet}
              onUpdateCloset={onUpdateCloset}
              refetchQueries={refetchQueries} />
          ) : (
              <CreateClosetOrder
                membership={membership}
                customer={customer}
                closet={closet}
                refetchQueries={refetchQueries} />
            ))}
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
      console.log({ id: this.props.item.id, status: selected, dates: newDates });
      this.props.onUpdateClosetItem({ id: this.props.item.id, status: selected, dates: newDates });
    } else {
      console.log({ id: this.props.item.id, status: selected, dates: newDates });
      this.props.onUpdateClosetItem({ id: this.props.item.id, status: selected });
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

export default ClosetItemSection;