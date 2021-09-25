const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
  view: {
    type: Number,
    default: 0,
  },
  viewdAt: {
    type: String,
    default: new Date(),
  },
});

module.exports = mongoose.model('Views', viewsSchema);
