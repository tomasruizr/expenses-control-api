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
    let prevBudget = await Budget.findOne(operation.budget);
    let budget = Object.assign({}, prevBudget);
    let previous = await Account.findOne(operation.account);
    let account = Object.assign({}, previous);
    if (operation.isDeposit) {
      account.balance -= operation.amount;
      budget.balance -= operation.amount;
    }
    else {
      account.balance += operation.amount;
      budget.balance += operation.amount;
    }
    await sails.helpers.updateAndPublish.with({
      model: Account,
      data: account,
      previous
    });
    await sails.helpers.updateAndPublish.with({
      model: Budget,
      data: budget,
      previous: prevBudget
    });
    return exits.success();

  }


};

