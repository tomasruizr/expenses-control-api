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
    let operation = await Operation.findOne(inputs.operation);
    let previous = await Account.findOne(operation.account);
    let data = Object.assign({}, previous);
    if (operation.isDeposit) {
      data.balance -= operation.amount;
    }
    else {
      data.balance += operation.amount;
    }
    await sails.helpers.updateAndPublish.with({
      model: Account,
      data,
      previous
    });
    return exits.success();
  }
};

