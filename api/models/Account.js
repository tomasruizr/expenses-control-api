/**
 * Account.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey :'id',
  attributes: {
    id: {
      type: 'number',
      unique: true,
      // required: true,
      autoIncrement: true
    },
    balance: {
      type: 'number'
    },
    name: {
      type: 'string'
    },
    isActive: {
      type: 'boolean'
    }

  },

};

