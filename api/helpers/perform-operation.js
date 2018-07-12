module.exports = {


  friendlyName: 'Perform operation',


  description: 'Performs the addition or substraction of the amount of the operation to the account',


  inputs: {
    account:{
      type: 'number',
      description: 'the account id',
      required: true
    },
    budget: {
      type: 'number',
      description: 'the budget id',
      required: true
    },
    amount: {
      type: 'number',
      description: 'the amount to add or substract from the account',
      required: true
    },
    isDeposit: {
      type: 'boolean',
      description: 'Whether is a expense or a deposit',
      required: true
    }
  },


  exits: {
    success: {
      outputFriendlyName: 'Operation Success',
      outputDescription: 'Was Operation Successful',
    },

    accountNotFount: {
      description: 'The account provided is not valid to operate a transaction'
    },
    invalidAmount: {
      description: 'Invalid amount. Should be a positive number'
    },
    insufficientFunds: {
      description: 'Insuficient funds in the account to perform the operation',
      responseType: 'notFound'
    },
    budgetExceeded: {
      description: 'The amount is larger than the budget left for this period',
      responseType: 'notFound'
    },
    notFound: {
      description: 'No user with the specified ID was found in the database.',
      responseType: 'notFound'
    }
  },


  fn: async function (inputs, exits) {
    let prevBudget = await Budget.findOne(inputs.budget);
    let budget = Object.assign({}, prevBudget);
    let previous = await Account.findOne(inputs.account);
    let account = Object.assign({}, previous);
    if (!account){
      throw 'accountNotFount';
    }
    if (typeof inputs.amount !== 'number' || inputs.amount <= 0){
      throw 'invalidAmount';
    }
    if (inputs.isDeposit){
      account.balance += inputs.amount;
    } else {
      account.balance -= inputs.amount;
      if (account.balance < 0){
        throw 'insufficientFunds';
      }
      budget.balance -= inputs.amount;
      if (budget.balance < 0){
        throw 'budgetExceeded';
      }
    }
    await sails.helpers.updateAndPublish.with({
      previous,
      data: account,
      model: Account
    });
    await sails.helpers.updateAndPublish.with({
      previus: prevBudget,
      data: budget,
      model: Budget
    });
    return exits.success(true);
  }
};

