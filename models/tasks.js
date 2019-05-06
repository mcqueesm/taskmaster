var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TaskSchema = new Schema({
  Category: { type: String, required: true, min: 1, max: 20 },
  User: { type: Schema.Types.ObjectId, ref: "User", required: true },
  Date_added: { type: Date, required: true },
  Description: { type: String },
  Completed: { type: Boolean, required: true }
});

module.exports = mongoose.model("Task", TaskSchema);
