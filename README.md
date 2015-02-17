# zoo
Universal Application Runtime for Node.js, Python, and PHP. Develop libraries once and run anywhere.

## Zoo Ecosystem Components

### Compilers

Compilers turn `*.zs` Zoo source files into `*.zo` Zoo object files containing Zoo bytecode / source maps.

Each compiler produces exactly the same output files, so use the one that fits in with your language and workflow. As of right now, only the PHP Compiler is ready for use.

![Zoo Compilers](http://yuml.me/diagram/plain/class/[*.zs]->[PHP Compiler], [PHP Compiler]->[*.zo], [*.zs]->[Node.js Compiler], [Node.js Compiler]->[*.zo], [*.zs]->[Python Compiler], [Python Compiler]->[*.zo])

### Runtimes

Runtimes execute the `*.zo` files in your preferred programming environment, creating a consistent and reliable interface for common libraries across programming languages.

![Zoo Node.js Runtime](http://yuml.me/diagram/plain/class/[*.zo]->[Node.js Zoo Runtime], [Node.js Zoo Runtime]->[Node.js], [*.js]->[Node.js])
![Zoo Python Runtime](http://yuml.me/diagram/plain/class/[*.zo]->[Python Zoo Runtime], [Python Zoo Runtime]->[Python], [*.py]->[Python])
![Zoo PHP Runtime](http://yuml.me/diagram/plain/class/[*.zo]->[PHP Zoo Runtime], [PHP Zoo Runtime]->[PHP], [*.php]->[PHP])
