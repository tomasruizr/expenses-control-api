module.exports = {


  friendlyName: 'Get request record',


  description: 'Gets the record from the request',


  inputs: {
    model:{
      type: {},
    }
  },


  exits: {

    success: {
      outputFriendlyName: 'Req record',
      outputType: 'ref'
    },

  },


  fn: async function (inputs, exits) {
    let req = this.req;
    var values = req.allParams();

    // Attempt to JSON parse any collection attributes into arrays.  This is to allow
    // setting collections using the shortcut routes.
    _.each(model.attributes, (attrDef, attrName) => {
      if (attrDef.collection && (!req.body || !req.body[attrName]) && (req.query && _.isString(req.query[attrName]))) {
        try {
          values[attrName] = JSON.parse(req.query[attrName]);
          // If it is not valid JSON (e.g. because it's just a normal string),
          // then fall back to interpreting it as-is
        } catch(unusedErr) {}

      }
    });

    return exits.success(values);

  }


};

