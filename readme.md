Monkey Chatter
==============

This is an attempt to work through the book 
'[Writing an interpreter in Go](https://interpreterbook.com/)' by Thorsten Ball,
but I'll be writing Javascript code instead of retyping Golang examples from the text. 
The toy language in the book is called 'Monkey'.

In the Section 2.7 of the book the author shows in detail how he implemented the parser 
by using ideas from 
the paper '[Top Down Operator Precedence](https://tdop.github.io/)' by Vaughan Pratt.

Running tests
-------------

`npm test`

```
let map = fn(arr, f) {
    let iter = fn(arr, accumulated) {
        if (len(arr) == 0) {
            accumulated
        } else {
            iter(rest(arr), push(accumulated, f(first(arr))));
        }
    };
    
    iter(arr, []);
};

let a = [1, 2, 3, 4];
let double = fn(x) { x * 2 };
map(a, double);
```
> [2, 4, 6, 8]
```
let reduce = fn(arr, initial, f) {
    let iter = fn(arr, result) {
        if (len(arr) == 0) {
            result
        } else {
            iter(rest(arr), f(result, first(arr)));
        }
	};
    
    iter(arr, initial);
};

let sum = fn(arr) {
    reduce(arr, 0, fn(initial, el) { initial + el });
};

sum([1, 2, 3, 4, 5]);
```
> 15