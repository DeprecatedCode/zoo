# zoo
Universal Application Runtime for Node.js, Python, and PHP. Develop libraries once and run anywhere.

## Zoo Ecosystem Components

### Compilers

Compilers turn `*.zs` Zoo source files into `*.zo` Zoo object files containing Zoo bytecode / source maps.

Each compiler produces exactly the same output files, so use the one that fits in with your language and workflow. As of right now, only the PHP Compiler is ready for use.

![Zoo Compilers](http://yuml.me/diagram/plain/class/[*.zs{bg:wheat}]->[PHP Compiler], [PHP Compiler]->[*.zo{bg:wheat}], [*.zs{bg:wheat}]->[Node.js Compiler], [Node.js Compiler]->[*.zo{bg:wheat}], [*.zs{bg:wheat}]->[Python Compiler], [Python Compiler]->[*.zo{bg:wheat}])

### Runtimes

Runtimes execute the `*.zo` files in your preferred programming environment, creating a consistent and reliable interface for common libraries across programming languages.

![Zoo Node.js Runtime](http://yuml.me/diagram/plain;dir:LR/class/[*.zo{bg:wheat}]->[Node.js Zoo Runtime], [Node.js Zoo Runtime]->[Node.js], [*.js{bg:skyblue}]->[Node.js])

![Zoo Python Runtime](http://yuml.me/diagram/plain;dir:LR/class/[*.zo{bg:wheat}]->[Python Zoo Runtime], [Python Zoo Runtime]->[Python], [*.py{bg:skyblue}]->[Python])

![Zoo PHP Runtime](http://yuml.me/diagram/plain;dir:LR/class/[*.zo{bg:wheat}]->[PHP Zoo Runtime], [PHP Zoo Runtime]->[PHP], [*.php{bg:skyblue}]->[PHP])
