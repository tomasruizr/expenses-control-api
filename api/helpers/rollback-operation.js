module.exports = {


  friendlyName: 'Rollback operation',


  description: 'Undoes the operation from the account balances',


  inputs: {
    operation: {
      type: 'number'
    }
  },


  exits: {
    // success: {
    //   outputFriendlyName: 'rollback success',
    //   outputType: 'boolean'
    // },
  },


  fn: async function (inputs, exits) {

    let operation = await Operation.findOne(inputs.operation);
    let account = await Account.findOne(operation.account);
    if (operation.isDeposit) {
      account.balance -= operation.amount;
    }
    else {
      account.balance += operation.amount;
    }
    sails.helpers.updateAndPublish.wiht({
      // id: account.id,
      model: Account,
      data: account
    });
    return exits.success();

  }


};

