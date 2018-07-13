/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

async function performOperation(data, previous = {amount:0}){
  if (data.isDeposit){
    await sails.helpers.performIncome.with({
      model: Account,
      id: data.account,
      amount: data.amount - previous.amount
    });
    if (data.budget) {
      await sails.helpers.performIncome.with({
        model: Budget,
        id: data.budget,
        amount: data.amount - previous.amount
      });
    }
  } else {
    await sails.helpers.performExpense.with({
      model: Account,
      id: data.account,
      amount: data.amount - previous.amount
    }).intercept('insufficientFunds', () => {
      let error = new Error('accountInsufficientFunds');
      error.code = 'accountInsufficientFunds';
      return error;
    });
    if (data.budget) {
      await sails.helpers.performExpense.with({
        model: Budget,
        id: data.budget,
        amount: data.amount - previous.amount
      }).intercept('insufficientFunds', async () => {
        await sails.helpers.performIncome.with({
          model: Account,
          id: data.account,
          amount: data.amount - previous.amount
        });
        let error = new Error('budgetInsufficientFunds');
        error.code = 'budgetInsufficientFunds';
        return error;
      });
    }
  }
}

module.exports = {

  async update(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    // await sails.helpers.rollbackAccountOperation(data.id);
    // if (previous.budget) {
    //   await sails.helpers.rollbackBudgetOperation(data.id);
    // }
    await performOperation(data, previous);
    await sails.helpers.updateAndPublish.with({
      model: Operation,
      previous,
      data,
      req
    });
    res.ok(data);
  },

  async create(req, res) {
    let data = await sails.helpers.getReqRecord(Operation, req);
    await performOperation(data);
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data
    });
    res.ok(newInstance);
  },

  async destroy(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    await sails.helpers.rollbackAccountOperation(data.id);
    if (previous.budget) {
      await sails.helpers.rollbackBudgetOperation(data.id);
    }
    await sails.helpers.destroyAndPublish.with({
      model: Operation,
      id: data.id,
      req,
    });
    res.ok(previous);
  }
};


