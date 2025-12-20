// dependencies:
// https://supertestnet.github.io/bankify/super_nostr.js
// https://bundle.run/noble-secp256k1@1.2.14
var chain_client = {
    connection_info: null,
    getPrivkey: () => window.crypto.getRandomValues( new Uint8Array( 32 ) ).toHex(),
    getPubkey: privkey => nobleSecp256k1.getPublicKey( privkey, true ).substring( 2 ),
    waitSomeTime: num => new Promise( resolve => setTimeout( resolve, num ) ),
    textToHex: text => {
        var encoded = new TextEncoder().encode( text );
        return Array.from( encoded )
            .map( x => x.toString( 16 ).padStart( 2, "0" ) )
            .join( "" );
    },
    createNetwork: async relays => {
        return new Promise( async resolve => {
            var privkey = chain_client.getPrivkey();
            var say_when_connected = chain_client.getPrivkey();
            var pubkey = chain_client.getPubkey( privkey );
            var hex_relays = chain_client.textToHex( JSON.stringify( relays ) );
            var iframe = document.createElement( "iframe" );
            // iframe.src = `https://supertestnet.github.io/testnet_generator/#privkey=${privkey}#relays=${hex_relays}#say_when_connected=${say_when_connected}`;
            iframe.src = `file:///home/supertestnet/bitcoin_projects/testnet_generator/testnet_generator.html#privkey=${privkey}#relays=${hex_relays}#say_when_connected=${say_when_connected}`;
            iframe.style.display = "none";
            iframe.className = `chain_client_network_${privkey}`;
            document.body.append( iframe );
            var network_string = `${pubkey},${relays[ 0 ]}`;

            //return info when testnet is ready for commands
            var listenFunction = async socket => {
                var subId = super_nostr.bytesToHex( crypto.getRandomValues( new Uint8Array( 8 ) ) );
                var filter  = {}
                filter.kinds = [ 54091 ];
                filter.authors = [ pubkey ];
                filter[ "#e" ] = [ say_when_connected ];
                var subscription = [ "REQ", subId, filter ];
                socket.send( JSON.stringify( subscription ) );
            }
            var handleFunction = async message => {
                var [ type, subId, event ] = JSON.parse( message.data );
                if ( !event || event === true ) return;
                chain_client.connection_info = [ privkey, network_string ];
                resolve( [ privkey, network_string ] );
            }
            var connection_id = await super_nostr.newPermanentConnection( relays[ 0 ], listenFunction, handleFunction );

            //shut down
            var loop = async () => {
                if ( chain_client.connection_info ) {
                    super_nostr.sockets[ connection_id ].socket.close();
                    delete super_nostr.sockets[ connection_id ];
                    return chain_client.connection_info = null;
                }
                await chain_client.waitSomeTime( 1_000 );
                return loop();
            }
            loop();
        });
    },
    loadNetwork: async ( privkey, network_string ) => {
        return new Promise( async resolve => {
            var [ pubkey, relay ] = network_string.split( "," );
            var relays = [ relay ];
            var hex_relays = chain_client.textToHex( JSON.stringify( relays ) );
            var iframe = document.createElement( "iframe" );
            // if ( privkey ) iframe.src = `https://supertestnet.github.io/testnet_generator/#privkey=${privkey}#relays=${hex_relays}#say_when_connected=${say_when_connected}`;
            // else iframe.src = `https://supertestnet.github.io/testnet_generator/#pubkey=${pubkey}#relays=${hex_relays}#say_when_connected=${say_when_connected}`;
            if ( privkey ) iframe.src = `file:///home/supertestnet/bitcoin_projects/testnet_generator/testnet_generator.html#privkey=${privkey}#relays=${hex_relays}`;
            else iframe.src = `file:///home/supertestnet/bitcoin_projects/testnet_generator/testnet_generator.html#pubkey=${pubkey}#relays=${hex_relays}`;
            iframe.style.display = "none";
            iframe.className = `chain_client_network_${privkey || pubkey}`;
            document.body.append( iframe );

            //return info when testnet is ready for commands
            var loop = async () => {
                var commander = chain_client.createCommander( network_string.split( "," ) );
                var test = await commander( "rawtx", "a".repeat( 64 ) );
                if ( test === "tx not found" && privkey ) return resolve( [ privkey, network_string ] );
                if ( test === "tx not found" ) return resolve( [ null, network_string ] );
                await chain_client.waitSomeTime( 1_000 );
                loop();
            }
            await loop();
        });
    },
    createCommander: network => {
        var [ miner, relay ] = network;
        var commander = async ( command, params ) => {
            //prepare requisite variables
            var privkey = super_nostr.getPrivkey();
            var pubkey = super_nostr.getPubkey( privkey );
            var item_listened_for = null;

            //establish connection to relay
            var listenFunction = async socket => {
                var subId = super_nostr.bytesToHex( crypto.getRandomValues( new Uint8Array( 8 ) ) );
                var filter  = {}
                filter.kinds = [ 4 ];
                filter[ "#p" ] = [ pubkey ];
                filter.since = Math.floor( Date.now() / 1000 );
                var subscription = [ "REQ", subId, filter ];
                socket.send( JSON.stringify( subscription ) );
            }
            var handleFunction = async message => {
                var [ type, subId, event ] = JSON.parse( message.data );
                if ( !event || event === true ) return;
                var recipient = event.pubkey;
                var content = await super_nostr.alt_decrypt( privkey, recipient, event.content );
                var json = JSON.parse( content );
                item_listened_for = json.msg_value;
            }
            var connection_id = await super_nostr.newPermanentConnection( relay, listenFunction, handleFunction );

            //send command
            var msg = JSON.stringify({msg_type: command, msg_value: params});
            var emsg = await super_nostr.alt_encrypt( privkey, miner, msg );
            var event = await super_nostr.prepEvent( privkey, emsg, 4, [ [ "p", miner ] ] );
            super_nostr.sendEvent( event, relay );

            //listen for reply
            var loop = async () => {
                await chain_client.waitSomeTime( 10 );
                if ( !item_listened_for ) return loop();
            }
            await loop();

            //delete connection
            try {
                var loop = async () => {
                    if ( !super_nostr.sockets.hasOwnProperty( connection_id ) ) return;
                    super_nostr.sockets[ connection_id ].socket.close();
                    delete super_nostr.sockets[ connection_id ];
                    var rand_interval = Math.floor( Math.random() * 1000 ) + 1000;
                    await chain_client.waitSomeTime( rand_interval );
                    loop();
                }
                loop();
            } catch ( e ) {}

            //return reply
            return item_listened_for;
        }
        return commander;
    },
    commander: async ( network, command, params ) => {
        if ( typeof network === "object" ) var commander = chain_client.createCommander( network );
        var reply = await commander( command, params );
        return reply;
    },
}
