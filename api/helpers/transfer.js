module.exports = {


  friendlyName: 'Performs a transfer operation',


  description: 'Performs the addition of the amount of the operation to the data',


  inputs: {
    model:{
      type: 'ref'
    },
    origin:{
      type: 'number',
      required: true
    },
    destination:{
      type: 'number',
      required: true
    },
    amount: {
      type: 'number',
      description: 'the amount to add or substract from the data',
      required: true
    }
  },


  exits: {
    success: {
      outputFriendlyName: 'Operation Success',
      outputDescription: 'Was Operation Successful',
    },
    originAndDestinationMustDiffer: {
      description: 'Origin and Destination records must be differents',
    }
  },


  fn: async function ( inputs, exits ) {
    if ( inputs.origin === inputs.destination ){
      throw 'originAndDestinationMustDiffer';
    }
    let substraction = await sails.helpers.validateOperation.with({
      model: inputs.model,
      id: inputs.origin,
      amount: inputs.amount
    }).intercept( 'insufficientFunds', () => sails.helpers.throwInsufficientFunds( inputs.model.identity ));
    let addition = await sails.helpers.validateOperation.with({
      model: inputs.model,
      id: inputs.destination,
      amount: inputs.amount,
      substraction: false
    });
    await sails.helpers.updateAndPublish.with( substraction );
    await sails.helpers.updateAndPublish.with( addition );
    // await sails.helpers.performIncome.with({
    //   model: inputs.model,
    //   id: inputs.destination,
    //   amount: inputs.amount
    // });
    return exits.success( true );
  }
};
