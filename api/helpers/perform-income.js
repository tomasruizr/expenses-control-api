module.exports = {


  friendlyName: 'Perform Income Operation',


  description: 'Performs the addition of the amount of the operation to the data',


  inputs: {
    model:{
      type: 'ref'
    },
    id:{
      type: 'number',
      description: 'the data id',
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
  },


  fn: async function (inputs, exits) {
    let previous = await inputs.model.findOne(inputs.id);
    let data = Object.assign({}, previous);
    if (!data){
      throw 'recordNotFount';
    }
    if (typeof inputs.amount !== 'number' || inputs.amount <= 0){
      throw 'invalidAmount';
    }
    data.balance += inputs.amount;

    await sails.helpers.updateAndPublish.with({
      previous,
      data,
      model: inputs.model
    });
    return exits.success(true);
  }
};

