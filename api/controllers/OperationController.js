/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async create(req, res) {
    let data = await sails.helpers.getReqRecord(Operation, req);
    if (data.isDeposit){
      await sails.helpers.performIncome.with({
        model: Account,
        id: data.account,
        amount: data.amount
      });
    } else {
      let operation = await sails.helpers.validateOperation.with({
        model: Account,
        id: data.account,
        amount: data.amount
      }).intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('account'));
      let budOperation = await sails.helpers.validateOperation.with({
        model: Budget,
        id: data.budget,
        amount: data.amount
      }).intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('budget'));
      await sails.helpers.updateAndPublish.with(operation);
      await sails.helpers.updateAndPublish.with(budOperation);
    }
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data
    });
    res.ok(newInstance);
  },

  async update(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    let substraction;
    let addition = {
      model: Account,
      amount: data.amount
    };
    let budSubstraction;
    let budAddition = {
      model: Budget,
      amount: data.amount,
      id : data.budget
    };
    let updateAccount = false;
    let updateBudget = false;
    try {
      if (data.destination !== data.destination){
        return res.badRequest('cannotInterchangeOperationAndTransfer');
      }
      if (  (data.isDeposit !== previous.isDeposit) ||
            (data.amount !== previous.amount) ||
            (data.account !== previous.account))  {
        updateAccount = true;
        if (previous.isDeposit){
          substraction = await sails.helpers.validateOperation.with({
            model: Account,
            id: previous.account,
            amount: data.amount
          }).intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('account'));
          if (data.isDeposit){
            addition.id = data.id;
          } else {
            addition.id = previous.id;
          }
        } else {
          substraction = await sails.helpers.validateOperation.with({
            model: Account,
            id: data.account,
            amount: data.amount,
            rollback: previous.amount
          }).intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('account'));
          if (!data.isDeposit){
            addition.id = data.id;
          } else {
            addition.id = previous.id;
          }
        }
      }
      if (!data.isDeposit || data.budget !== previous.budget){
        updateBudget = true;
        budSubstraction = await sails.helpers.validateOperation.with({
          model: Budget,
          id: previous.budget,
          amount: data.amount
        }).intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('budget'));
      }
      if (updateAccount){
        await sails.helpers.updateAndPublish.with(substraction);
        await sails.helpers.performIncome.with(addition);
      }
      if (updateBudget){
        await sails.helpers.updateAndPublish.with(budSubstraction);
        await sails.helpers.performIncome.with(budAddition);
      }
    } catch (err){
      err.data = previous;
      throw err;
    }

    await sails.helpers.updateAndPublish.with({
      model: Operation,
      previous,
      data,
      req
    });
    res.ok(data);
  },

  async destroy(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    if (previous.destination){
      await sails.helpers.transfer.with({
        model: Account,
        origin: previous.destination,
        destination: previous.account,
        amount: previous.amount
      });
    } else {
      let accountData = {
        model: Account,
        id: previous.account,
        amount: previous.amount
      };
      if (previous.isDeposit){
        let substraction = await sails.helpers.validateOperation.with(accountData)
          .intercept('insufficientFunds', () => sails.helpers.throwInsufficientFunds('account'));
        await sails.helpers.updateAndPublish.with(substraction);
      } else {
        await sails.helpers.performIncome.with(accountData);
        if (previous.budget) {
          await sails.helpers.performIncome.with({
            model: Budget,
            id: previous.budget,
            amount: previous.amount
          });
        }
      }
    }
    await sails.helpers.destroyAndPublish.with({
      model: Operation,
      id: data.id,
      req,
    });
    res.ok(previous);
  }

};


