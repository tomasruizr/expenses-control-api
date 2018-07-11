/**
 * User.js
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
    name:{
      type: 'string'
    },
    timeToComplete: {
      type: 'number',
    },
    timeUnits: {
      type: 'string'
    },
    amount: {
      type: 'number'
    },
    budget: {
      model: 'budget'
    }
  },

};

