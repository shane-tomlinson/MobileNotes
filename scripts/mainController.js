MobileNotes.MainController = ( function() {
    var Controller = AFrame.Class( AFrame.Display, {
        bindEvents: function() {
            this.bindDOMEvent( $( window ), 'hashchange', onHashChange );
            
            Controller.sc.bindEvents.call( this );
        },
        
        initialRouting: onHashChange
    } );
    
    function onHashChange() {
        var hash = document.location.hash;
        hash = hash.replace( '#', '' );
        
        var commands = hash.split( '&' );
        
        var primary = commands[0];
        if( primary == 'noteEditForm' ) {
            var id;
            var idParts = commands[ 1 ] && commands[ 1 ].split( '=' );
            if( idParts ) {
                id = idParts[ 1 ];
                
                this.triggerEvent( {
                    type: 'editnote',
                    id: id
                } );
            }
        }
    }
    
    return Controller;
}() );