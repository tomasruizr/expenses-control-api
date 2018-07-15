/**
 * BudgetController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  async makeTransfer( req, res ){
    let data = req.body;
    await sails.helpers.transfer.with({
      model: Budget,
      origin: data.origin,
      destination: data.destination,
      amount: data.amount
    });
    res.ok();
  },

};

