module.exports = {


  friendlyName: 'Update And Publish',


  description: 'Updates the model and publish the record',


  inputs: {
    model:{
      type: 'ref'
    },
    req:{
      type: 'ref'
    },
    id: {
      type: 'number'
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    await inputs.model.destroy(inputs.id);
    inputs.model.publish([inputs.id], {
      verb: 'destroyed',
      id: inputs.id,
    }, inputs.req.isSocket ? inputs.req : undefined);
    return exits.success();

  }


};

