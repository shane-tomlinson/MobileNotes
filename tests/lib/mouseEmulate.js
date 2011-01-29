/**
* Licensed under the Creative Commons Attribution 3.0 License.
* See http://creativecommons.org/licenses/by/3.0/legalcode and 
* http://creativecommons.org/licenses/by/3.0/
*
* Written by Shane Tomlinson, 2011
* email: set117@yahoo.com
* Twitter: @shane_tomlinson 
* http://www.shanetomlinson.com
* http://www.aframejs.com
*/

/**
* A mouse emulation jQuery plugin, useful for unit testing.
*
*
*##Basic Usage##
*
*    // moves the mouse from the center of the target 10px right and 10px down.
*    $( target ).emulate( 'mousemove' ).x( 10 ).y( 10 ).go();
*
*    // click the mouse in the center of the target
*    $( target ).emulate( 'click' ).go();
*
* If only using as a jQuery plugin, the initial window.MouseEmulate can be removed to keep
*   the global namespace from being polluted.
*/
window.MouseEmulate = ( function() {
    "use strict";
    
    var STEP_SIZE = 10;
    var INTERVAL = 25;
    
    var lastOver;
    
    var Emulate = function() {
    };
    Emulate.prototype = {
        constructor: Emulate,
        
        init: function( config ) {
            this.type = config.type;
            var target = this.target = $( config.target );
            
            this.currX = target.offset().left + target.outerWidth() / 2;
            this.currY = target.offset().top + target.outerHeight() / 2;
            
            this.xDiff = this.yDiff = 0;
            
            return this;
        },
        
        /**
        * Remove the emulator
        */
        remove: function() {
            if( this.placeholder ) {
                this.placeholder.remove();
            }
            
            return this;
        },
        
        /**
        * Set how much to change for the x coordinate
        * @param {number} amount
        */
        x: function( amount ) {
            this.xDiff = amount;
            
            return this;
        },
        
        /**
        * How much to change in the y coordinate
        * @param {number} amount
        */
        y: function( amount ) {
            this.yDiff = amount;
            
            return this;
        },
        
        /**
        * GO!
        */
        go: function( onComplete ) {
            this.onComplete = onComplete;
            this.placeholder = $( '<div class="mouseMovementPlaceholder">Placholder</div>' ).appendTo( $( 'body' ) );
            this.updatePlaceholder();
                    
            var type = this.type == 'drag' ? 'mousemove' : this.type;
            
            // if doing any sort of movement, start with a mouseover 
            //  - some frameworks depend heavily on mouseovers.
            if( type == 'mousemove' || this.type == 'click' ) {
                this.fireEvent( 'mouseover' );
            }
            
            // if dragging, do a mousedown
            if( this.type == 'drag' || this.type == 'click' ) {
                var event = this.fireEvent( 'mousedown', {
                    which: 1
                } );
                
                if( event.isDefaultPrevented() ) {
                    return this.finish();
                }
            }
            
            if( this.type == 'click' ) {
                event = this.fireEvent( 'mouseup', {
                    which: 1
                } );
                
                if( event.isDefaultPrevented() ) {
                    return this.finish();
                }
            }
            
            this.fireEvent( type );
            

            if( type == 'mousemove' ) {
                this.checkMouseMove();
            }
            else {
                this.finish();
            }
        },
        
        /**
        * Check whether we have to do a mouse move, or to finish
        * @private
        */
        checkMouseMove: function() {
            if( this.xDiff || this.yDiff ) {
                var me = this;
                setTimeout( function() {
                    me.simulateMouseMove();
                }, INTERVAL );
            }
            else {
                this.finish();
            }
        },
        
        /**
        * simulate the mouse move
        * @private
        */
        simulateMouseMove: function() {
            
            this.updateXCoordinates();
            this.updateYCoordinates();
            this.updatePlaceholder();

            this.checkMouseOutOver();
            
            var event = this.fireEvent( 'mousemove' );
            
            this.checkMouseMove();
        },
        
        /**
        * Update the X Coordinates/diff
        * @private
        */
        updateXCoordinates: function() {
            if( this.xDiff ) {
                var xStep = Math.min( Math.abs( this.xDiff ), STEP_SIZE );

                if( this.xDiff >= 0 ) {
                    this.currX += xStep;
                    this.xDiff -= xStep;
                }
                else {
                    this.currX -= xStep;
                    this.xDiff += xStep;
                }
            }
        },
        
        /**
        * Update the Y Coordinates/diff
        * @private
        */
        updateYCoordinates: function() {
            if( this.yDiff ) {
                var yStep = Math.min( Math.abs( this.yDiff ), STEP_SIZE );
                
                if( this.yDiff >= 0 ) {
                    this.currY += yStep;
                    this.yDiff -= yStep;
                }
                else {
                    this.currY -= yStep;
                    this.yDiff += yStep;
                }
            }
        },

        /**
        * Update the position of the placeholder
        * @private
        */
        updatePlaceholder: function() {
            this.placeholder.css( {
                left: this.currX,
                top: this.currY
            } );
        },
        
        /**
        * Checks to see if we moused out of one container and into another.
        * @private
        */
        checkMouseOutOver: function() {
            var currOver = this.getCurrentTarget();

            if( currOver != lastOver ) {
                // only fire mouseout if there is a lastOver.
                lastOver && this.fireEvent( 'mouseout', {}, lastOver );
                
                this.fireEvent( 'mouseover', {}, currOver );
                lastOver = currOver;
            }
        },
        
        /**
        * Fire an event.
        * @param {string} type - type of event to fire
        * @param {object} options (optional)- options to augment event with
        * @param {element} target (optional) - target to send event to, if not given, uses the element
        *   under the current position
        * @return {jQuery.Event}
        * @private
        */
        fireEvent: function( type, options, target ) {
            var event = this.createEvent( type );
            $.extend( event, options || {} );
            
            target = $( target || this.getCurrentTarget() );
            target.trigger( event );
            
            return event;
        },
        
        /**
        * Create an event of the given type
        * @param {string} type - type of event to create
        * @return {jQuery.Event}
        * @private
        */
        createEvent: function( type ) {
            var event = new $.Event( type );
            
            event.clientX = this.currX;
            event.clientY = this.currY;
            event.pageX = this.currX;
            event.pageY = this.currY;
            
            return event;
        },
        
        /**
        * Get the element under the current position
        * @return {Element}
        * @private
        */
        getCurrentTarget: function() {
            this.placeholder.hide();
            var target = $( document.elementFromPoint( this.currX, this.currY ) );
            this.placeholder.show();
            
            return target;
        },
        
        /**
        * Finish up, call any callbacks.
        * @private
        */
        finish: function() {
            if( this.type == 'drag' ) {
                this.fireEvent( 'mouseup' );
            }
            this.xDiff = this.yDiff = 0;
            
            if( this.onComplete ) {
                this.onComplete( this );
            }
            
            this.remove();
        }
    };
    
    
    // $( target ).emulate( 'drag' ).x(10).go();
    // $( target ).emulate( 'mousemove' ).x(10).go();
    
    
    /**
    * a jQuery plugin to emulate mouse events
    * @method $.fn.emulate
    */
    $.fn.emulate = function( type ) {
        var config = {
            type: type,
            target: $( this )[ 0 ]
        };
        
        var emulator = new Emulate();
        emulator.init( config );
        
        return emulator;
    };
    
    return Emulate;
    
}() );