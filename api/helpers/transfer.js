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

    recordNotFount: {
      description: 'The data provided is not valid to operate a transaction'
    },
    invalidAmount: {
      description: 'Invalid amount. Should be a positive number'
    },
    insufficientFunds: {
      description: 'Insuficient funds in the data to perform the operation',
    },
    originAndDestinationMustDiffer: {
      description: 'Origin and Destination records must be differents',
    }
  },


  fn: async function (inputs, exits) {
    if (inputs.origin === inputs.destination){
      throw 'originAndDestinationMustDiffer';
    }
    let previousOrigin = await inputs.model.findOne(inputs.origin);
    let previousDestination = await inputs.model.findOne(inputs.destination);
    if (!previousOrigin || !previousDestination){
      throw 'recordNotFount';
    }
    if (typeof inputs.amount !== 'number' || inputs.amount <= 0){
      throw 'invalidAmount';
    }
    let origin = Object.assign({}, previousOrigin);
    let destination = Object.assign({}, previousDestination);
    origin.balance -= inputs.amount;
    if (previousOrigin.balance < 0){
      throw 'insufficientFunds';
    }
    destination.balance += inputs.amount;
    await sails.helpers.updateAndPublish.with({
      previous:previousOrigin,
      data:origin,
      model: inputs.model
    });
    await sails.helpers.updateAndPublish.with({
      previous: previousDestination,
      data: destination,
      model: inputs.model
    });
    return exits.success(true);
  }
};
