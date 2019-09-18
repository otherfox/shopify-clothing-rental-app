import _ from 'lodash';
import moment from 'moment';

// Endless Types
export const ENDLESS_TYPES = ['Endless II', 'Endless III'];

// Closet Defualt Variables
export const ENDLESS_ITEM_RETURN_STATUS = 'Returned'
export const ENDLESS_CLOSET_EMPTY = {
  keys: [
    'id', // STRING Shopify Product ID
    'note', // STRING
    'status', // STRING Status values below
    'order', // STRING Order ID
    'dates', // COLLLECTION [{ label: <STRING Status i.e. "In Closet" >, value: <STRING Date i.e. "01/01/20 01:00:00 AM"> }, ...]
  ],
  statuses: [
    'In Closet',
    'Selected',
    'Shipped',
    'Delivered',
    ENDLESS_ITEM_RETURN_STATUS
  ],
  orders: [], // COLLECTION [{ id: <STRING Order ID i.e. "ac2627e0-d8b6-11e9-8ebf-e1ad09d4e300", date: <STRING Date i.e. "01/01/20 01:00:00 AM"> }]
  items: [] // COLLECTION [{ <KEYS described above> }]
};
export const ENDLESS_ITEM_DEFAULT_STATUS = 'In Closet';
export const ENDLESS_CLOSET_NAMESPACE = 'cc-virtual-closet';
export const ENDLESS_CLOSET_KEY = 'queue';
export const ENDLESS_DATE_FORMAT = 'MM/DD/YY h:mm:ss a';

// Order default variables
export const ENDLESS_ORDER_NAMESPACE = 'cc-virtual-orders';
export const ENDLESS_ORDER_KEY = 'returns';

// Customer(s) Query Variables
export const ENDLESS_CUSTOMER_QUERY = customer => {
  return {
    id: customer.id,
    namespace: ENDLESS_CLOSET_NAMESPACE,
    key: ENDLESS_CLOSET_KEY,
    order_namespace: ENDLESS_ORDER_NAMESPACE,
    order_key: ENDLESS_ORDER_KEY
  };
};
export const ENDLESS_CUSTOMERS_QUERY = { query: ENDLESS_TYPES.map(v => 'tags:' + v).join(' AND ') };

// Customer(s) Mutation Variables
export const ENDLESS_CUSTOMER_ADD_ITEMS = (oldCloset, newItems) => {
  const order = JSON.parse(oldCloset).orders.pop();
  return _.values(_.merge(
    _.keyBy(JSON.parse(oldCloset).items, 'id'),
    _.keyBy(newItems.map(i => ({
      id: i,
      note: '',
      status: ENDLESS_ITEM_DEFAULT_STATUS,
      order: order ? order.id : '',
      dates: [{ label: ENDLESS_ITEM_DEFAULT_STATUS, value: moment().format(ENDLESS_DATE_FORMAT) }]
    })), 'id')
  ));
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
        value: JSON.stringify(_.assignIn(ENDLESS_CLOSET_EMPTY, value)),
        valueType: 'JSON_STRING'
      }
    ]
  };
};

// Order Mutation Variables

export const ENDLESS_ORDER_CREATE = (customer, membership, items) => {
  items = items.map(id => ({ variantId: id, quantity: 1 }));
  return {
    customerId: customer.id,
    lineItems: [
      { variantId: 'gid://shopify/ProductVariant/29574943965218', quantity: 1 },
      { variantId: 'gid://shopify/ProductVariant/29574944030754', quantity: 1 }
    ],
    metafields: [
      {
        namespace: ENDLESS_ORDER_NAMESPACE,
        key: ENDLESS_ORDER_KEY,
        value: membership,
        valueType: 'STRING'
      }
    ]
  };
}