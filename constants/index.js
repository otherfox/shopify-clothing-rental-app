import _ from 'lodash';
import moment from 'moment';

// Endless Types
export const ENDLESS_TYPES = ['Endless II', 'Endless III'];

// Closet Defualt Variables
export const ENDLESS_CLOSET_EMPTY = {
  keys: [
    'id',
    'note',
    'status',
    'dates'
  ],
  statuses: [
    'In Closet',
    'Selected',
    'Shipped',
    'Delivered',
    'Returned'
  ],
  items: []
};
export const ENDLESS_ITEM_DEFAULT_STATUS = 'In Closet';
export const ENDLESS_CLOSET_NAMESPACE = 'cc-virtual-closet';
export const ENDLESS_CLOSET_KEY = 'queue';
export const ENDLESS_STATUS_DATE_FORMAT = 'MM/DD/YY h:mm:ss a';

// Customer(s) Query Variables
export const ENDLESS_CUSTOMER_QUERY = customer => {
  return { id: customer.id, namespace: ENDLESS_CLOSET_NAMESPACE, key: ENDLESS_CLOSET_KEY };
};
export const ENDLESS_CUSTOMERS_QUERY = { query: ENDLESS_TYPES.map(v => 'tags:' + v).join(' AND ') };

// Customer(s) Mutation Variables
export const ENDLESS_CUSTOMER_ADD_ITEMS = (oldCloset, newItems) => {
  return _.concat(
    JSON.parse(oldCloset).items,
    newItems.map(i => ({ id: i, note: '', status: ENDLESS_ITEM_DEFAULT_STATUS, dates: [{ label: ENDLESS_ITEM_DEFAULT_STATUS, value: moment().format(ENDLESS_STATUS_DATE_FORMAT) }] })));
}

export const ENDLESS_CUSTOMER_CREATE_CLOSET = customer => {
  return {
    id: customer.id,
    metafields: [
      {
        namespace: ENDLESS_CLOSET_NAMESPACE,
        key: ENDLESS_CLOSET_KEY,
        value: JSON.stringify(ENDLESS_CLOSET_EMPTY),
        valueType: 'JSON_STRING'
      }
    ]
  };
};

export const ENDLESS_CUSTOMER_UPDATE_CLOSET = (customer, value) => {
  return {
    id: customer.id,
    metafields: [
      {
        id: customer.metafield.id,
        namespace: ENDLESS_CLOSET_NAMESPACE,
        key: ENDLESS_CLOSET_KEY,
        value: JSON.stringify(_.assignIn(ENDLESS_CLOSET_EMPTY, { items: value })),
        valueType: 'JSON_STRING'
      }
    ]
  };
};