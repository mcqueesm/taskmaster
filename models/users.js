var mongoose=require('mongoose');

var Schema = mongoose.Schema;
var UserSchema = new Schema({
  Username: {type: String, required: true, min: 1, max: 15},
  Password: {type: String, required: true, min: 8},
  Email: {type: String, required: true},
  First_name: {type: String, required: true, min: 1, max: 20},
  Last_name: {type: String, required: true, min: 1, max: 20}
});

module.exports = mongoose.model('User', UserSchema);
