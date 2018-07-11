/**
 * User.js
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
    email: {
      type: 'string',
      isEmail: true,
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
  },

};

