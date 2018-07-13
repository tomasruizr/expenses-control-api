module.exports = {


  friendlyName: 'Rollback operation',


  description: 'Undoes the operation from the account balances',


  inputs: {
    operation: {
      type: 'number'
    }
  },
  exits: {},


  fn: async function (inputs, exits) {
    let data = await Operation.findOne(inputs.operation);
    await sails.helpers.transfer.with({
      model: Account,
      origin: data.destination,
      destination: data.account,
      amount: data.amount
    });
    return exits.success();
  }
};

