/**
 * args.js v1.0
 * https://github.com/Xaxis/args.js
 * http://www.argsjs.com
 * (c) 2012-2013 Wil Neeley, Trestle Media, LLC.
 * args.js may be freely distributed under the MIT license.
 *
 * The purpose of `args` is to provide a mechanism in which to better define function argument declarations. Features
 * include argument type checking, default values, and passing in an unspecified order.
 *
 * There are FOUR distinct modes of operation:
 *
 * - ARGUMENT OBJECTS:
 *   Creates an arguments object from a users' passed arguments that match a type. Variable types CAN be specified in
 *   the `types` object by delimiting type strings with a pipe. All user passed arguments must be of a different type.
 *
 *     var args = args(arguments, {length: 'number', color: 'string', coords: 'array'});
 *     var args = args(arguments, {length: 'number|bool', color: 'string|number', coords: 'array|object'});
 *     var args = args([len, str, coo], {length: 'number', color: 'string', coords: 'array'});
 *
 *   In the above examples take note that you can pass a function's `arguments` array-like object directly to `args` OR
 *   you can pass an array of arguments.
 *
 * - ORDERED ARGUMENTS OBJECT:
 *   Creates an arguments object from a users' passed arguments that has been compared against a definitions object
 *   which forces passed arguments to be at one or more specified positions while also testing users' passed arguments'
 *   type.
 *
 *     var args = args({0: [fn, [0]], 1:[scope, [0,1]]}, [{fn: 'function'}, {scope: 'object|function'}]);
 *
 *   In the above example the `args` argument is an object literal containing the order definitions for the users'
 *   passed arguments. Each definition consists of an array where the first value is the argument being passed by the
 *   user and the second argument is an array that indicates in which positions a given argument may be passed in. Each
 *   definition must be keyed by a numeric property name starting at 0 at incrementing by 1.
 *
 *   Notes that the `types` object is now an array of objects containing the desired type enforcement information per
 *   object. This is not required. The chosen notation is left to the programmer to decide on. The `types` argument
 *   could remain a single object literal like so:
 *
 *     var args = args({0: [fn, [0]], 1:[scope, [0,1]]}, {fn: 'function', scope: 'object|function'});
 *
 * - UNKNOWN NUMBER OF ARGUMENTS:
 *   Creates an arguments object from an unknown number of user passed arguments. This mode is the correct choice when
 *   building a function that will receive an unknown number of arguments of varying or unvarying types.
 *
 *     var args = args(arguments, [{deep:'bool'}, {'*':'obj:object'}]);
 *
 *  In the above example take note that the `types` argument is an array containing multiple object literals that are
 *  representative of the allowed types instead of a single object literal. Also notice the "prefix:type" syntax in the
 *  second element in `types`. This tells the `args` function to return an arguments object where all arguments of type
 *  object passed to it are bound to the prefix 'obj'[n]. For example the above might return:
 *
 *    {deep: true, obj0: {}, obj1: {}, obj2: {}, obj3: {}}
 *
 * - DEFAULT VALUE ARGUMENTS:
 *   Creates an arguments object from a users' passed arguments that contains initial values. This proves useful when an
 *   argument requires a default value without requiring the user to pass it because JavaScript does not currently
 *   support default argument values. Any value passed at a default value's position overrides the default value
 *   established through the defaults mechanism.
 *
 *     var args = args([len, str, coo], {length: 'number', color: ['blue'], coords: 'array'});
 *
 *   A default value is defined by placing an array in the place of the type string in the `types` object. The array
 *   contains the default value and its type is detected at runtime so that defining a type is not required. In the
 *   above example ONLY strings are allowed to be passed to `color` because the default value is itself a string.
 *
 *   When you need to specify a type argument manually in cases such as enabling multiple types, the notation is as
 *   follows:
 *
 *     var args = args([len, str, coo], {length: 'number', color: ['blue', 'string|function'], coords: 'array'});
 *
 *   Notice that the first element in the defaults array is the default value itself and the second is a types
 *   definition. Again, it is not required to pass a type definition.
 *
 * About type enforcement:
 *
 * - AVAILABLE TYPES:
 *   The `args` method allows for testing arguments against the following types: `date`, `regexp`, `element`, `object`,
 *   `array`, `string`, `bool`, `null`, `number`, `function`, and `defaultobject` (non object literal objects).
 *   Additionally the "any" type represented by the `*` is allowed in cases where an argument can be of any type.
 *
 * Configuration options are set through an OPTIONAL `rules` object:
 *
 * - THE LENGTH PROPERTY:
 *   The `length` property IS returned by default. Giving the `rules` object the 'length' property and settings its
 *   value to FALSE will stop the `args` function from attaching the length property to the returned arguments object.
 *   The `length` property is non-enumerable.
 *
 *     var args = args(arguments, {str:'string'}, {length: false});
 *
 * - RETURNING AN ARRAY:
 *   If you wish to return the arguments object as an array this can be done by giving the `array` property a
 *   value of TRUE to the `rules` object.
 *
 *     var args = args(arguments, {str:'string'}, {array: true, length: true});
 *
 * @param {object|array} args
 * @param {object|array} types
 * @param {object} rules
 * @return {object|array}
 */
function args( args, types, rules ) {

  // The arguments object
  var oargs = {
    __set__ : []
  };

  // Stores definition rules
  var defs = [];

  /*
   * Method returns a string representative of `obj`'s type.
   */
  var typeTest = function( obj ) {
    switch ( true ) {
      case ({}.toString.call(obj) === "[object Date]" || obj instanceof Date) :
        return 'date';
      case ({}.toString.call(obj) === "[object RegExp]" || obj instanceof RegExp) :
        return 'regexp';
      case (typeof obj === "object" ? obj instanceof HTMLElement :
          typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string") :
        return 'element';
      case (typeof obj === "object" && {}.toString.call(obj) === "[object Object]") :
        return 'object';
      case (toString.call(obj) === "[object Array]") :
        return 'array';
      case (typeof obj === "string" && toString.call(obj) === "[object String]") :
        return 'string';
      case ({}.toString.call(obj) === "[object Boolean]") :
        return 'bool';
      case ({}.toString.call(obj) === "[object Null]") :
        return 'null';
      case ({}.toString.call(obj) === "[object Number]") :
        return 'number';
      case ({}.toString.call(obj) === "[object Function]") :
        return 'function';
      case (typeof obj === "object") :
        return 'defaultobject';
      case (typeof obj === "undefined") :
        return 'undefined';
    }
    return 'notype';
  };

  /*
   * Method returns TRUE when a numeric value is in `arr`.
   */
  var inArray = function( arr, val ) {
    for ( var i = 0; i < arr.length; i++ ) {
      if ( arr[i] === val ) {
        return true;
      }
    }
    return false;
  };

  /*
   * Method returns the number of properties in an object.
   */
  var len = function( obj ) {
    var length = 0;
    for ( var i in obj ) {
      length++;
    }
    return length;
  };

  // Build definitions object from types ARRAY
  if ( typeTest(types) === "array" ) {
    for ( var t = 0; t < types.length; t++ ) {
      for ( var d in types[t] ) {
        var typeValue = "";
        if ( typeTest(types[t][d]) === "array" ) {
          if ( types[t][d].length === 2 ) {
            typeValue = types[t][d][1];
          } else {
            typeValue = typeTest(types[t][d][0]);
          }
        } else {
          typeValue = types[t][d];
        }
        defs.push({
          name  : d,
          type  : typeValue,
          order : [],
          set   : false
        });
      }
    }

  // Build definitions object from types OBJECT
  } else if ( typeTest(types) === "object" ) {
    for ( var d in types ) {
      var typeValue = "";
      if ( typeTest(types[d]) === "array" ) {
        if ( types[d].length === 2 ) {
          typeValue = types[d][1];
        } else {
          typeValue = typeTest(types[d][0]);
        }
      } else {
        typeValue = types[d];
      }
      defs.push({
        name  : d,
        type  : typeValue,
        order : [],
        set   : false
      });
    }
  }

  // Get ORDER data from `args` when an object literal
  if ( typeTest(args) === "object" ) {
    var clone = [];
    for ( var d in args ) {
      clone.push(args[d][0]);
      defs[d].order = args[d][1];
    }
    args = clone;
  }

  // Convert array-like `args` object to array
  if ( typeTest(args) === "defaultobject" ) {
    var clone = [];
    for ( var a = 0; a < args.length; a++ ) {
      clone.push(args[a]);
    }
    args = clone;
  }

  // Remove all UNDEFINED values from `args` array
  var clone = [];
  for ( var a in args ) {
    if ( typeTest(args[a]) !== 'undefined' ) {
      clone.push(args[a]);
    }
  }
  args = clone;

  // Detect DEFAULT values in `args` array
  if ( typeTest(types) === "array" ) {
    for ( var t = 0; t < types.length; t++ ) {
      for ( var d in types[t] ) {
        if ( typeTest(types[t][d]) === "array" && !(args.length >= types.length) ) {
          args.push(types[t][d][0]);
          types[t][d] = typeTest(types[t][d][0]);
        }
      }
    }
  } else if ( typeTest(types) === "object" ) {
    for ( var d in types ) {
      if ( typeTest(types[d]) === "array" && !(args.length >= len(types)) ) {
        args.push(types[d][0]);
        types[d] = typeTest(types[d][0]);
      }
    }
  }

  // Build the `oargs` arguments object
  for ( var a = 0; a < args.length; a++ ) {

    // Iterate over each definition on all arguments
    for ( var d = 0; d < defs.length; d++ ) {
      var mtypes = [];
      var name = defs[d].name;
      var type = defs[d].type;

      // When an UNKNOWN NUMBER of arguments passed...
      if ( name === "*" ) {
        var mtype = type.split(":");
        name = mtype[0] + a;
        type = mtype[1];
        if ( ( mtypes = type.split("|")).length > 1 ) {
          for ( var n = 0; n < mtypes.length; n++ ) {
            type = mtypes[n];
            if ( type === typeTest(args[a]) || type === "*" ) {
              oargs[ name ] = args[a];
              break;
            }
          }
        } else {
          if ( type === typeTest(args[a]) || type === "*" ) {
            oargs[ name ] = args[a];
          }
        }

      // When definition has MULTIPLE types...
      } else if ( ( mtypes = type.split("|")).length > 1 ) {
        for ( var n = 0; n < mtypes.length; n++ ) {
          type = mtypes[n];
          if ( defs[d].order.length >= 1 ) {
            if ((type === typeTest(args[a]) || type === "*" )
                && inArray(defs[d].order, parseInt(a) )
                && !(name in oargs)
                && !inArray(oargs.__set__, a)) {
              oargs[ name ] = args[a];
              oargs.__set__.push(a);
              break;
            }
          } else {
            if ( type === typeTest(args[a]) || type === "*" ) {
              oargs[ name ] = args[a];
              break;
            }
          }
        }

      // When definition has a SINGLE type...
      } else {

        // ORDER RULES to validate against
        if ( defs[d].order.length >= 1 ) {

          if ((

                // When the type of an argument matches an allowed type OR any type
                type === typeTest(args[a]) || type === "*" )

                // AND when the pass order definition matches the order in which the argument was passed
                && inArray(defs[d].order, parseInt(a) )

                // AND when the property has not yet been set on the 'oargs' object
                && !(name in oargs)

                // AND when the argument has not been set yet
                && !inArray(oargs.__set__, a)

              ) {

            // Set the oargs object with the current argument
            oargs[ name ] = args[a];

            // Push the argument index into the __set__ array so we know not to set it again
            oargs.__set__.push(a);
            break;
          }

        // No ORDER RULES to validate against
        }	else {
          if ( type === typeTest(args[a]) || type === "*" ) {
            oargs[ name ] = args[a];
            break;
          }
        }
      }
    }
  }

  // Remove the __set__ property
  delete oargs.__set__;

  // Set the length property
  Object.defineProperty(oargs, "length", {
    enumerable: false,
    configurable: true,
    writable: true,
    value: len(oargs)
  });

  // Configure arguments object with rules
  if ( typeTest(rules) === "object" ) {

    // Remove the `length` property
    if ( 'length' in rules ) {
      if ( !rules.length ) {
        Object.defineProperty(oargs, "length", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: false
        });
        delete oargs.length;
      }
    }

    // Convert `oargs` to an array
    if ( 'array' in rules ) {
      oargs = [];
      for ( var a in args ) {
        oargs.push(args[a]);
      }
    }
  }

  return oargs;
}

/*
(function( height, color, coords ) {
  console.log(
      '// Pass arguments of different types in unspecified order \n',
      args(arguments, {height: 'number', color: 'string', coords: 'array'}, {length:true}));
}( 'red', 22, [3,5,3]));

(function( height, color, coords ) {
  console.log(
      '// Pass arguments of different types in unspecified order \n',
      args(arguments, {height: 'number|bool', color: 'string|function', coords: 'array|object'}));
}( 'gold', [3,5,3], false ));

(function( height, color, coords ) {
  console.log(
      '// Pass arguments of different types in unspecified order \n',
      args([height, color, coords], {height: 'number', color: 'string', coords: 'array'}, {length:true}));
}( 'gold', [3,5,3], 22 ));

(function( height, color, coords ) {
  console.log(
      '// Passing arguments of ANY type in unspecified order \n',
      args(arguments, {height: '*', color: 'string', coords: '*'}));
}( '22px', 'red', [3,5,3]));

(function( fn, scope ) {
  console.log(
      '// Passing arguments of ANY type in unspecified order \n',
      args({0: [fn, [0]], 1:[scope, [0,1]]}, [{fn: 'function'}, {scope: 'object|function'}]));
}( function(){}, {0: 'Some Object'} ));

(function( height, color, coords ) {
  console.log(
      '// Passing arguments while setting a default value \n',
      args(arguments, {height: 'number', color: ['red'], coords: 'array'}));
}( 22, [3,5,3] ));

(function( height, color, coords ) {
  console.log(
      '// Setting a default value (arguments object) \n',
      args(arguments, {height: 'number', color: ['red'], coords: 'array'}));
}( [3,5,3], 22 ));

(function( height, color, coords ) {
  console.log(
      '// Setting a default value (array of arguments) \n',
      args([height, color, coords], {height: 'number', color: ['red'], coords: 'array'}));
}( [3,5,3], 22 ));

(function( height, color, coords ) {
  console.log(
      '// Overriding a default value \n',
      args(arguments, {height: 'number', color: ['red'], coords: 'array'}));
}( [3,5,3], 22, 'blue' ));

(function( height, color, coords ) {
  console.log(
      '// Overriding a default value (with `types` as an array of object definitions) \n',
      args(arguments, [{height: 'number'}, {color: ['red']}, {coords: 'array'}]));
}( [3,5,3], 22 ));

(function( height, color, coords ) {
  console.log(
      '// Overriding a default value (with `types` as an array of object definitions) \n',
      args([height, color, coords], [{height: 'number'}, {color: ['red']}, {coords: 'array'}]));
}( 'blue', [3,5,3], 22 ));

(function( height, color, coords ) {
  console.log(
  '// Setting a default value \n',
  args({0: [height, [0]], 1: [color, [0,1,2]], 2: [coords, [1,2]]}, [{height: 'number'}, {color: ['red']}, {coords: 'array'}]));
}( 22, [3,5,3], 'blue' ));

(function() {
  console.log(
      '// Passing an unknown number of arguments \n',
      args(arguments, [{deep:'bool'}, {'*':'obj:object'}]));
}( {}, {}, true, {}, {}, {}, {} ));

(function() {
  console.log(
      '// Passing an unknown number of arguments of multiple types \n',
      args(arguments, [{deep:'bool'}, {'*':'var:object|string'}]));
}( 'red', {}, true, {}, 'green', {}, 'blue' ));

(function() {
  console.log(
      '// Passing an unknown number of arguments of ANY types \n',
      args(arguments, {'*':'var:*'}));
}( 'red', {}, true, [1], 99 ));

(function( height, color, coords ) {
  console.log(
      '// Setting a default value (Passing a single object vs. an array of objects) \n',
      args({0: [height, [0]], 1: [color, [0,1,2]], 2: [coords, [1,2]]}, {height: 'number', color: ['red'], coords: 'array'}));
}( 22, [3,5,3], 'blue' ));

(function( height, color, coords ) {
console.log(
    '// Setting a default value (w/ multiple types definition) \n',
    args(arguments, {height: 'number', color: ['blue', 'string|function'], coords: 'array'}));
}( 22, [3,5,3], 'red' ));
*/