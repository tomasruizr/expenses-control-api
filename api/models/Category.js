/**
 * Category.js
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
    name:'string',
    isDeposit: {
      type: 'boolean',
      defaultsTo: false
    },
    isActive: {
      type: 'boolean',
      defaultsTo: true
    }

  },

};

