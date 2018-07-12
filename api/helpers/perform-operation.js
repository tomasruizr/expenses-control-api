module.exports = {


  friendlyName: 'Perform operation',


  description: 'Performs the addition or substraction of the amount of the operation to the account',


  inputs: {
    account:{
      type: 'number',
      description: 'the account id',
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
    notFound: {
      description: 'No user with the specified ID was found in the database.',
      responseType: 'notFound'
    }
  },


  fn: async function (inputs, exits) {
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
    }
    // await Account.update(inputs.account, account);
    await sails.helpers.updateAndPublish.with({
      // id: inputs.account,
      previous,
      data: account,
      model: Account
    });
    // Account.publish([inputs.account], {
    //   verb: 'updated',
    //   data: account
    // }, this.req);
    return exits.success(true);

  }


};

