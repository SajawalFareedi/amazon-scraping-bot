var { Output, Resp } = require("./OutputColumns");
const uuid = require("uuid");
function generateArraysAndID() {
  var Output_d = new Output();
  var Resp_d = new Resp();
  var id = uuid.v1();
  return { Output: Output_d, Resp: Resp_d, id: id };
}

module.exports = generateArraysAndID;
