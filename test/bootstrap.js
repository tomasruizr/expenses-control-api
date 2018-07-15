var sails = require( 'sails' );

// Before running any tests...
before( function( done ) {
  // Increase the Mocha timeout so that Sails has enough time to lift, even if you have a bunch of assets.
  this.timeout( 5000 );

  sails.lift({
    // Your sails app's configuration files will be loaded automatically,
    // but you can also specify any other special overrides here for testing purposes.

    // For example, we might want to skip the Grunt hook,
    // and disable all logs except errors and warnings:
    models:{
      migrate: 'drop'
    },
    sockets: {
      // onlyAllowOrigins: ['http://localhost:3000']
    },
    session:{
      // secret: 'extremely-secure-keyboard-cat'
    },
    datastores:{
      default: {
        identity: 'test',
        dir: '.test/testDiskDb',
        adapter: require( 'sails-disk' )
      }
    },
    hooks: { grunt: false },
    log: { level: 'warn' },

  }, ( err ) => {
    if ( err ) { return done( err ); }
    async function loadFixture( model, items ){
      items.forEach( async ( item ) => {
        await model.create( item );
      });
    }
    let accounts = require( './fixtures/accounts.json' );
    let budgets = require( './fixtures/budgets.json' );
    let categories = require( './fixtures/categories.json' );

    loadFixture( Account, accounts );
    loadFixture( Budget, budgets );
    loadFixture( Category, categories );

    // here you can load fixtures, etc.
    // (for example, you might want to create some records in the database)

    return done();
  });
});
sails.on( 'lower', () => {
  setTimeout(()=>process.exit( 1 ), 1000 );
});
// After all tests have finished...
after(( done ) => {
  // here you can clear fixtures, etc.
  // (e.g. you might want to destroy the records you created above)

  sails.lower( done );
});

