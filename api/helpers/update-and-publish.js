module.exports = {


  friendlyName: 'Update And Publish',


  description: 'Updates the model and publish the record',


  inputs: {
    model:{
      type: {}
    },
    id: {
      type: 'number'
    },
    data: {
      type: {}
    }
  },


  exits: {

  },


  fn: async function (inputs, exits) {

    await inputs.model.update(inputs.id || inputs.data.id, inputs.data);
    inputs.model.publish([inputs.id || inputs.data.id], {
      verb: 'updated',
      data: inputs.data
    }, this.req);
    return exits.success();

  }


};

