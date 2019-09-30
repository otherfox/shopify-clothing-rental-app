const _ = require('lodash');
const moment = require('moment');

// Endless Types
const ENDLESS_TYPES = ['Endless I', 'Endless II', 'Endless III'];

// Closet Defualt Variables
const ENDLESS_ITEM_DEFAULT_STATUS = 'In Closet';
const ENDLESS_ITEM_SELECTED_STATUS = 'Selected';
const ENDLESS_ITEM_RETURNED_STATUS = 'Returned';
const ENDLESS_ITEM_SHIPPED_STATUS = 'Shipped';
const ENDLESS_ITEM_REMOVE_STATUS = 'Remove';

const ENDLESS_CLOSET_EMPTY = (orderLimit) => ({
  keys: [
    'id', // STRING Shopify Product ID
    'variantIds', // ARRAY [ <STRING Variant Id>, <STRING Variant Id ]
    'hearted', // BOOLEAN 
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
  orderLimit: orderLimit, // NUMBER Amount of items that can be ordered
  closetLimit: 10, // NUMBER Amount of items that can be in the closet
  order: {}, // OBJECT { id: <STRING Order ID i.e. "ac2627e0-d8b6-11e9-8ebf-e1ad09d4e300", date: <STRING Date i.e. "01/01/20 01:00:00 AM"> }
  items: [] // COLLECTION [{ <KEYS described above> }]
});
const ENDLESS_CLOSET_NAMESPACE = 'cc-virtual-closet';
const ENDLESS_CLOSET_KEY = 'queue';
const ENDLESS_DATE_FORMAT = 'MM/DD/YY h:mm:ss a';
const ENDLESS_SHIPPED_STATUSES = [
  ENDLESS_ITEM_SHIPPED_STATUS,
  ENDLESS_ITEM_RETURNED_STATUS,
  ENDLESS_ITEM_REMOVE_STATUS
];

// Order variables
const ENDLESS_ORDER_NAMESPACE = 'cc-virtual-orders';
const ENDLESS_ORDER_KEY = 'returns';

// Customer(s) Query Variables
const ENDLESS_GET_CUSTOMER = customer => {
  return {
    id: customer.id,
    namespace: ENDLESS_CLOSET_NAMESPACE,
    key: ENDLESS_CLOSET_KEY,
    order_namespace: ENDLESS_ORDER_NAMESPACE,
    order_key: ENDLESS_ORDER_KEY
  };
};
const ENDLESS_GET_CUSTOMERS = {
  query: `tags:${ENDLESS_TYPES[0]}`,
  namespace: ENDLESS_CLOSET_NAMESPACE,
  key: ENDLESS_CLOSET_KEY
};

// Customer(s) Mutation Variables
const ENDLESS_ADD_ITEMS = (oldCloset, newItems, isOrder) => {
  const order = JSON.parse(oldCloset).order;
  console.log(order);
  return _.values(_.merge(
    _.keyBy(JSON.parse(oldCloset).items, 'id'),
    _.keyBy(newItems.map(i => ({
      id: i.id,
      variantIds: i.variantIds,
      note: '',
      headted: false,
      status: ENDLESS_ITEM_DEFAULT_STATUS,
      order: isOrder ? order.id : '',
      invoice: i.invoice ? i.invoice : '',
      dates: [{ label: ENDLESS_ITEM_DEFAULT_STATUS, value: moment().format(ENDLESS_DATE_FORMAT) }]
    })), 'id')
  ));
}

const ENDLESS_RETURN_ITEMS = (closet) => {
  return closet.items.map(i => {
    if (i.status == ENDLESS_ITEM_SHIPPED_STATUS) {
      i.dates.push({ label: 'Client Returning', value: moment().format(ENDLESS_DATE_FORMAT) });
    }
    return i;
  });
}

const ENDLESS_CREATE_CLOSET = (customer, orderLimit) => ({
  id: customer.id,
  metafields: [
    {
      namespace: ENDLESS_CLOSET_NAMESPACE,
      key: ENDLESS_CLOSET_KEY,
      value: JSON.stringify(ENDLESS_CLOSET_EMPTY(orderLimit)),
      valueType: 'JSON_STRING'
    }
  ]
});

const ENDLESS_CLEAN_CLOSET = closet => {
  // remove returned and remove items
  return closet.filter(i => (
    i.status !== ENDLESS_ITEM_REMOVE_STATUS &&
    i.status !== ENDLESS_ITEM_RETURNED_STATUS
  ));
}

const ENDLESS_UPDATE_CLOSET = (customer, value) => {
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

const ENDLESS_CREATE_ORDER = (customer, membership, itemIds) => {
  const items = itemIds.map(id => ({ variantId: id, quantity: 1 }));
  return {
    customerId: customer.id,
    lineItems: items,
    tags: membership
  };
}

module.exports = {
  ENDLESS_DATE_FORMAT,
  ENDLESS_CLOSET_KEY,
  ENDLESS_CLOSET_NAMESPACE,
  ENDLESS_CLOSET_EMPTY,
  ENDLESS_ITEM_REMOVE_STATUS,
  ENDLESS_ITEM_SHIPPED_STATUS,
  ENDLESS_ITEM_RETURNED_STATUS,
  ENDLESS_ITEM_SELECTED_STATUS,
  ENDLESS_ITEM_DEFAULT_STATUS,
  ENDLESS_TYPES,
  ENDLESS_CREATE_ORDER,
  ENDLESS_UPDATE_CLOSET,
  ENDLESS_CREATE_CLOSET,
  ENDLESS_CLEAN_CLOSET,
  ENDLESS_ADD_ITEMS,
  ENDLESS_GET_CUSTOMERS,
  ENDLESS_GET_CUSTOMER,
  ENDLESS_ORDER_KEY,
  ENDLESS_ORDER_NAMESPACE,
  ENDLESS_SHIPPED_STATUSES,
  ENDLESS_RETURN_ITEMS
}