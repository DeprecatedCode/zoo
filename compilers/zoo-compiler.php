<?php

/**
 * PHP Compiler for Zoo
 * @author Nate Ferrero
 */

namespace zoo;
use \stdClass;

/**
* Parse Code String
*/
function parse($code) {
    $syntax = array(
        '(' => ')'   ,
        '[' => ']'   ,
        '{' => '}'   ,
       '/*' => '*/'  ,
        '#' => "\n"  ,
      '"""' => '"""' ,
      "'''" => "'''" ,
       '"'  =>  '"'  ,
       "'"  =>  "'"
    );

    $nest = array(
         '(' => 1,
         '[' => 1,
         '{' => 1,
        '/*' => 1
    );

    $esc = '\\';

    $current = new stdClass;
    $current->nest = true;
    $current->token = '{';
    $current->stop = '}';

    $stack = array($current);

    $ql = $current->line = $line = 1;
    $qc = $current->column = $column = 0;

    $length = strlen($code);
    $queue = '';
    $nlescape = $escape = false;

    /**
     * Main Parse Loop
     */
    for($pos = 0; $pos < $length; $pos++) {

        if($code[$pos] == "\r") {
            if ($pos == $length - 1 || $code[$pos + 1] != "\n") {
                $column = 0;
                $line++;
                if ($nlescape) {
                    continue;
                }
            }
        } else if($code[$pos] == "\n") {
            $column = 0;
            $line++;
            if ($nlescape) {
                continue;
            }
        } else {
            $column++;
            $nlescape = false; // Back to non-newline characters
        }

        /**
         * Handle Escape Characters
         */
        if ($code[$pos] == $esc) {
            if ($escape) {
                $queue .= $esc;
                $escape = false;
            }
            else {
                $escape = true;
            }

            continue;
        }

        /**
         * Handle Escape Sequence
         */
        if ($escape) {
            $chr = $code[$pos];
            switch($chr) {
            case 'r':
                $queue .= "\r";
                break;
            case 'n':
                $queue .= "\n";
                break;
            case 't':
                $queue .= "\t";
                break;
            case "\r":
            case "\n":
                $nlescape = true;
                break;
            case "'":
            case '"':
                $queue .= $chr;
                break;
            default:
                $queue .= $esc . $chr;
            }
            $escape = false;
            continue;
        }

        /**
         * First, check for the current stop block.
         */
        if(isset($current->stop)) {
            $slen = strlen($current->stop);
            $chars = substr(
                $code, $pos, $slen
            );

            if($chars === $current->stop) {
                process($current, $queue, $ql, $qc);
                $queue = '';

                if(count($stack) === 0) {
                    break;
                }

                if (isset($current->end)) {
                    echo $current->end;
                }

                array_pop($stack);
                $current = $stack[count($stack) - 1];

                $pos += $slen - 1;
                continue;
            }
        }

        /**
         * Search for matching characters, from 3 to 1
         */
        if($current->nest) {
            for($blen = 3; $blen >= 1; $blen--) {
                $chars = substr(
                    $code, $pos, $blen
                );
                if(isset($syntax[$chars])) {
                    if($queue !== '') {
                        process($current, $queue, $ql, $qc);
                        $queue = '';
                    }

                    $new = new stdClass;
                    $new->token    = $chars;
                    $new->stop     = $syntax[$chars];
                    $new->nest     = isset($nest[$chars]);
                    $new->line     = $line;
                    $new->column   = $column;

                    $new->end = block($chars, $line, $column);

                    $current = $new;
                    $stack[] = $current;
                    $pos += $blen - 1;
                    continue 2;
                }
            }
        }

        /**
         * No match, add to queue and continue
         */
        if($queue === '') {
            /**
             * Note: If the queue is empty and the first character
             * is a newline, $line has already been incremented
             * above. We need to account for that and subtract 1.
             */
            $ql = $line - ($code[$pos] === "\n" ? 1 : 0);
            $qc = $column;
        }
        $queue .= $code[$pos];
    }

    process($current, $queue, $ql, $qc);
    $queue = '';
    if(count($stack) > 1) {
        $sline = $current->line;
        $scolumn = $current->column;
        throw new Exception("Unclosed block starting with `$current->token` " .
                            "at line $sline column $scolumn");
    }
}

function block($code, $line, $column) {
    $loc = strlen($line) . strlen($column) . $line . $column;
    switch($code) {
    case '{':
        echo "${loc}o\n";
        break;
    case '[';
        echo "${loc}a\n";
        break;
    case '(';
        echo "${loc}g\n";
        break;
    case '/*';
        echo "${loc}c\n";
        break;
    default:
        return '';
    }
    return "${loc}e\n";
}

function process($current, $code, $line, $column) {
    $loc = strlen($line) . strlen($column) . $line . $column;
    switch($current->token) {
    case '#':
    case '/*':
        $code = str_replace("\n", "\n&", $code);
        echo "${loc}c$code\n";
        return;
    case "'":
    case '"':
    case "'''":
    case '"""':
        $code = str_replace("\n", "\n&", str_replace("'", "\\'", str_replace('\\', '\\\\', $code)));
        echo "${loc}s$code\n";
        return;
    default:
        expr($current, $code, $line, $column);
    }
}

function expr(&$current, $expr, $line, $column) {
    $loc = strlen($line) . strlen($column) . $line . $column;
    static $regex = array(
        '[+-]?(\d+(\.\d+)?([eE][+-]?\d+)?)'               => 'v',
        '\$?[a-zA-Z0-9_]+'                                => 'i',
        '\:\:|\*\:|\:|\.\.|\.|\,|[^\sa-zA-Z0-9_.:,]{1,2}' => '',
        '[\n\r]+'                                         => 'b',
        '[ \t]+'                                          => ' '
    );
    while(strlen($expr) > 0) {
        foreach($regex as $re => $type) {
            $match = preg_match("/^($re)/", $expr, $groups);
            if($match) {
                $str = $groups[0];
                $len = strlen($str);
                $expr = substr($expr, $len);

                /**
                 * Output
                 */
                switch($type) {
                case 'b':
                    $value = '';
                    break;
                default:
                    $value = $str;
                }
                if ($type !== ' ') {
                    echo "${loc}$type$value\n";
                }

                /**
                 * Update Line and Column
                 */
                for($i = 0; $i < $len; $i++) {
                    if($str[$i] == "\r") {
                        ;
                    } else if($str[$i] == "\n") {
                        $column = 1;
                        $line++;
                    } else {
                        $column++;
                    }
                }
            }
        }
    }
}

parse(file_get_contents("php://stdin"));
