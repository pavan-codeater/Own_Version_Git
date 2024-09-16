
let x=10;
console.log(x);

const c=10;
console.log(c);
let array=["the","red"];
console.log(array[0]);
let letters=['a','b','c'];

const person={
    name:'Happy',
    age:34
};

for(let key in person){
    console.log(person[key]);
}

function add(a,b){
    return a+b;
}


function display(a,b,operation){
    let res=operation(a,b);
    console.log("res is "+res);
}

display(1,2,add);