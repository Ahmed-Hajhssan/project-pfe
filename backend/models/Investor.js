const mongoose = require('mongoose');

let Investor = new mongoose.Schema({
  name: { type: String, required: false },
  description: { type: String, required: false },
  phone_number: { type: String, required: false },
  country: { type: String, required: false },
  city: { type: String, required: false },
  linkedin_url: { type: String, required: false },
  facebook_url: { type: String, required: false },
  twitter_url: { type: String, required: false },
  image_profile: { type: String, required: false },
  sector: [{ type: String, required: false }],
  stage: [{ type: String, required: false }],
  company: { type: String, required: false },
  type: { type: String, required: false },
  preferred_area: { type: String, required: false },
  company_stage: [{ type: String, required: false }],
  amount: { type: String, required: false },
  investment_amount: { type: String, required: false },
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  more: { type: String, required: false },
})

module.exports = mongoose.model('Investor', Investor)