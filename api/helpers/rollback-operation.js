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
    console.log(inputs.operation);
    let operation = await Operation.findOne(inputs.operation);
    let account = await Account.findOne(operation.account);
    if (operation.isDeposit) {
      account.balance -= operation.amount;
    }
    else {
      account.balance += operation.amount;
    }
    await sails.helpers.updateAndPublish.with({
      // id: account.id,
      model: Account,
      data: account
    });
    return exits.success();

  }


};

