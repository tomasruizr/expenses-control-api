module.exports = {


  friendlyName: 'Create And Publish',


  description: 'Creates the model and publish the record',


  inputs: {
    model:{
      type: 'ref'
    },
    req:{
      type: 'ref'
    },
    data: {
      type: 'ref'
    }
  },


  exits: {
    newInstance:{
      outputType: 'ref'
    }
  },


  fn: async function (inputs, exits) {

    await inputs.model.create(inputs.data).meta({fetch: true}).exec(function created (err, newInstance) {

      if (err) {
        switch (err.name) {
          case 'AdapterError':
            switch (err.code) {
              case 'E_UNIQUE': return res.badRequest(err);
              default: return res.serverError(err);
            }//•
          case 'UsageError': return res.badRequest('Usage Error');
          default: return res.serverError(err);
        }
      }

      if (inputs.req._sails.hooks.pubsub) {
        if (inputs.req.isSocket) {
          inputs.model.subscribe(inputs.req, [newInstance.id]);
          inputs.model._introduce(newInstance);
        }
        inputs.model._publishCreate(newInstance, !inputs.req.options.mirror && inputs.req);
      }
      return exits.success(newInstance);

    });
  }
};
