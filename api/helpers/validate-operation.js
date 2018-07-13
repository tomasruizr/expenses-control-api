module.exports = {
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
    },
    rollback: {
      type: 'number',
      defaultsTo: 0
    },
    substraction:{
      type: 'boolean',
      defaultsTo: true
    }
  },
  exits: {
    success: {
      outputFriendlyName: 'Operation Success',
      outputDescription: 'Was Operation Successful',
      responseType: 'ref'
    },
    recordNotFount: {
      description: 'The data provided is not valid to operate a transaction'
    },
    invalidAmount: {
      description: 'Invalid amount. Should be a positive number'
    },
    insufficientFunds: {
      description: 'Insuficient funds in the data to perform the operation',
      responseType: 'notFound'
    }
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
    if (inputs.substraction){
      data.balance += inputs.rollback - inputs.amount;
    } else {
      data.balance += inputs.amount;
    }
    if (data.balance < 0){
      throw 'insufficientFunds';
    }
    return exits.success({
      previous,
      data,
      model: inputs.model
    });
  }
};
