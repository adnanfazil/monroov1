const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentKeySchema = new Schema({
  integration: Number,
  key: String,
  gateway_type: String,
  iframe_id: { type: String, default: '' }
});

const IntentionDetailItemSchema = new Schema({
  name: String,
  amount: Number,
  description: String,
  quantity: Number
});

const IntentionDetailSchema = new Schema({
  amount: Number,
  items: [IntentionDetailItemSchema],
  currency: String
});

const PaymentMethodSchema = new Schema({
  integration_id: Number,
  alias: { type: String, default: '' },
  name: String,
  method_type: String,
  currency: String,
  live: Boolean
});

const CreationExtrasSchema = new Schema({
  ee: Number
});

const ExtrasSchema = new Schema({
  creation_extras: CreationExtrasSchema,
  confirmation_extras: { type: String, default: '' }
});

const PaymentIntentionSchema = new Schema({
  payment_keys: [PaymentKeySchema],
  id: String,
  userID: String,
  providerID: String,
  eventID: String,
  intention_detail: IntentionDetailSchema,
  client_secret: String,
  payment_methods: [PaymentMethodSchema],
  special_reference: { type: String, default: '' },
  extras: ExtrasSchema,
  confirmed: Boolean,
  status: String,
  created: Date,
  card_detail: { type: String, default: '' },
  object: String
});

module.exports = mongoose.model('PaymentIntention', PaymentIntentionSchema);
