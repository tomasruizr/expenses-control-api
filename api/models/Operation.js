/**
 * Operation.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    // name: 'string',
    description: 'string',
    amount: 'number',
    category: 'number',
    budget:'number',
    account:'number',
    destination:'number',
    isDeposit: 'boolean',
    date: { type: 'ref', columnType: 'datetime' }
  },

};
