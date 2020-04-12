const fs = require('fs')

function buildTemplate(filePath, params) {
  var template = "";

  try {
    template = fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error("An error occurred while building template: " + err);
  }

  if (params != undefined && params != null) {
    for (var entry of params.entries()) {
      var key = entry[0],
          value = entry[1];
      template = template.replace(key, value);
    }
  }
  console.log("Successfully build template: \n" + template);

  return template;
}

module.exports = {
  buildTemplate: buildTemplate
};