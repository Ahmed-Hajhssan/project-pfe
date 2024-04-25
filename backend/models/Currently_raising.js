const mongoose = require('mongoose');

let Currently_raising = new mongoose.Schema({
  type: {type: String, required: false},
  size: {type: String, required: false}, 
  commited: {type: String, required: false},
  investors: {type: String, required: false},
  common_shares: {type: Boolean, required: false},
  preferred_shares: {type: Boolean, required: false},
  convertible_debt: {type: Boolean, required: false},
  loan: {type: Boolean, required: false},
  other: {type: Boolean, required: false},
  business_angel: {type: Boolean, required: false},
  accelerator_incubator: {type: Boolean, required: false},
  vc_fund: {type: Boolean, required: false},
  corporate: {type: Boolean, required: false},
  public_grant: {type: Boolean, required: false},
  crowd: {type: Boolean, required: false},
})

module.exports = mongoose.model('Currently_raising', Currently_raising)