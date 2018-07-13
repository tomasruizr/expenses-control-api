/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

async function performOperation(data, previous = {amount:0}){
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

module.exports = {

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
    if (previous.destination){
      await sails.helpers.rollbackAccountTransfer(data.id);
    } else {
      await sails.helpers.rollbackAccountOperation(data.id);
      if (previous.budget) {
        await sails.helpers.rollbackBudgetOperation(data.id);
      }
    }
    await sails.helpers.destroyAndPublish.with({
      model: Operation,
      id: data.id,
      req,
    });
    res.ok(previous);
  },


  async update(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);

    let previous = await Operation.findOne(data.id);
    // await sails.helpers.rollbackAccountOperation(data.id);
    // if (previous.budget) {
    //   await sails.helpers.rollbackBudgetOperation(data.id);
    // }
    try {
      await performOperation(data, previous);
    } catch (err){
      err.data = previous;
      // Operation.publish([data.id], {verb: 'updated', data: previous});
      throw err;
    }
    await sails.helpers.updateAndPublish.with({
      model: Operation,
      previous,
      data,
      req
    });
    res.ok(data);
  }
};


