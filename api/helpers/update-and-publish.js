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
    previous: {
      type: 'ref'
    },
    data: {
      type: 'ref'
    }
  },


  exits: {

  },


  fn: async function ( inputs, exits ) {
    let response = await inputs.model.update( inputs.data.id, inputs.data ).fetch();
    inputs.model.publish([inputs.data.id], {
      verb: 'updated',
      data: inputs.data,
      previous: inputs.previous
    }, inputs.req );
    return exits.success( response );
  }


};

