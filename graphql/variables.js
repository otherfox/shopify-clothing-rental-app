import _ from 'lodash';
import moment from 'moment';

// Endless Types
export const ENDLESS_TYPES = ['Endless II', 'Endless III'];

// Closet Defualt Variables
export const ENDLESS_ITEM_DEFAULT_STATUS = 'In Closet';
export const ENDLESS_ITEM_SELECTED_STATUS = 'Selected';
export const ENDLESS_ITEM_RETURNED_STATUS = 'Returned';
export const ENDLESS_ITEM_SHIPPED_STATUS = 'Shipped';
export const ENDLESS_ITEM_REMOVE_STATUS = 'Remove';

export const ENDLESS_CLOSET_EMPTY = {
  keys: [
    'id', // STRING Shopify Product ID
    'variantIds', // ARRAY [ <STRING Variant Id>, <STRING Variant Id ]
    'note', // STRING
    'status', // STRING Status values below
    'order', // STRING Customer Order ID
    'invoice', // STRING Shopify Order ID
    'dates', // COLLLECTION [{ label: <STRING Status i.e. "In Closet" >, value: <STRING Date i.e. "01/01/20 01:00:00 AM"> }, ...]
  ],
  statuses: [
    ENDLESS_ITEM_DEFAULT_STATUS,
    ENDLESS_ITEM_SELECTED_STATUS,
    ENDLESS_ITEM_SHIPPED_STATUS,
    ENDLESS_ITEM_RETURNED_STATUS,
    ENDLESS_ITEM_REMOVE_STATUS
  ],
  orderLimit: 3, // NUMBER Amount of items that can be ordered
  closetLimit: 10, // NUMBER Amount of items that can be in the closet
  order: {}, // OBJECT { id: <STRING Order ID i.e. "ac2627e0-d8b6-11e9-8ebf-e1ad09d4e300", date: <STRING Date i.e. "01/01/20 01:00:00 AM"> }
  items: [] // COLLECTION [{ <KEYS described above> }]
};
export const ENDLESS_CLOSET_NAMESPACE = 'cc-virtual-closet';
export const ENDLESS_CLOSET_KEY = 'queue';
export const ENDLESS_DATE_FORMAT = 'MM/DD/YY h:mm:ss a';
export const ENDLESS_SHIPPED_STATUSES = [
  ENDLESS_ITEM_SHIPPED_STATUS,
  ENDLESS_ITEM_RETURNED_STATUS,
  ENDLESS_ITEM_REMOVE_STATUS
];

// Order variables
export const ENDLESS_ORDER_NAMESPACE = 'cc-virtual-orders';
export const ENDLESS_ORDER_KEY = 'returns';

// Customer(s) Query Variables
export const ENDLESS_GET_CUSTOMER = customer => {
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
export const ENDLESS_ADD_ITEMS = (oldCloset, newItems) => {
  const order = JSON.parse(oldCloset).order;
  return _.values(_.merge(
    _.keyBy(JSON.parse(oldCloset).items, 'id'),
    _.keyBy(newItems.map(i => ({
      id: i.id,
      variantIds: i.variantIds,
      note: '',
      status: ENDLESS_ITEM_DEFAULT_STATUS,
      order: order ? order.id : '',
      invoice: '',
      dates: [{ label: ENDLESS_ITEM_DEFAULT_STATUS, value: moment().format(ENDLESS_DATE_FORMAT) }]
    })), 'id')
  ));
}

export const ENDLESS_CREATE_CLOSET = customer => {
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

export const ENDLESS_CLEAN_CLOSET = closet => {
  // remove returned and remove items
  return closet.filter(i => (
    i.status !== ENDLESS_ITEM_REMOVE_STATUS &&
    i.status !== ENDLESS_ITEM_RETURNED_STATUS
  ));
}

export const ENDLESS_UPDATE_CLOSET = (customer, value) => {
  value.items = value.items.length ? ENDLESS_CLEAN_CLOSET(value.items) : value.items;

  return {
    id: customer.id,
    metafields: [
      {
        id: customer.metafield.id,
        namespace: ENDLESS_CLOSET_NAMESPACE,
        key: ENDLESS_CLOSET_KEY,
        value: JSON.stringify(_.assignIn(JSON.parse(customer.metafield.value), value)),
        valueType: 'JSON_STRING'
      }
    ]
  };
};

// Order Mutation Variables

export const ENDLESS_CREATE_ORDER = (customer, membership, itemIds) => {
  const items = itemIds.map(id => ({ variantId: id, quantity: 1 }));
  return {
    customerId: customer.id,
    lineItems: items,
    tags: membership
  };
}