/**
 * OperationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  async makeTransfer(req, res){
    let data = req.body;
    await sails.helpers.performOperation.with({
      account: data.origin,
      amount: data.amount,
      isDeposit: false
    });
    await sails.helpers.performOperation.with({
      account: data.destination,
      amount: data.amount,
      isDeposit: true
    });
    let newInstance = await sails.helpers.createAndPublish.with({
      model: Operation,
      req,
      data: {
        account: data.origin,
        destination: data.destination,
        amount: data.amount,
        description: data.description
      }
    });
    res.ok(newInstance);
  },

  async update(req, res){
    let data = await sails.helpers.getReqRecord(Operation, req);
    let previous = await Operation.findOne(data.id);
    await sails.helpers.rollbackOperation(data.id);
    await sails.helpers.performOperation.with({
      budget: data.budget || previous.budget,
      account: data.account || previous.account,
      amount: data.amount || previous.account,
      isDeposit: data.isDeposit || previous.isDeposit || false
    });
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
    await sails.helpers.performOperation.with({
      budget: data.budget,
      account: data.account,
      amount: data.amount,
      isDeposit: data.isDeposit || false
    });
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
    await sails.helpers.rollbackOperation(data.id);
    await sails.helpers.destroyAndPublish.with({
      model: Operation,
      id: data.id,
      req,
    });
    res.ok(previous);
  }
};


