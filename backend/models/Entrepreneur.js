const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Define collection and schema
let Entrepreneur = new Schema({
   name: {type: String, required: false},
   description: {type: String, required: false},
   website_url: {type: String, required: false},
   country: {type: String, required: false},
   city: {type: String, required: false},
   business_type: {type: String, required: false},
   product_type: {type: String, required: false},
   company_stage: {type: String, required: false},
   annual_revenue: {type: String, required: false},
   mrr: {type: String, required: false},
   employee_count: {type: String, required: false},
   linkedin_url: {type: String, required: false},
   facebook_url: {type: String, required: false},
   twitter_url: {type: String, required: false},
   image_profile: { type: String, required: false },
   pitch_deck: { type: String, required: false},
   other_document: [{ type: String, required: false}],
   video_pitch: { type: String, required: false},
   video_pitchUrl: { type: String, required: false},
   sector: [{type: String, required: false}],
   currently_raising: { type: mongoose.Schema.Types.ObjectId, ref: 'Currently_raising' },
   previous_round: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Previous_round' }],
   member: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
   questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],

})
module.exports = mongoose.model('Entrepreneur', Entrepreneur)