// basic object creation 
// properties definition and key and value definition
// access the value with dot notation.
// add properties on the fly to a object.
// if two words need to have with quotes.

const user = {
name : 'Jacob',
age: 100
}

const keys = Object.entries(user)



console.log(keys)




function Test() {
  console.log("from test");
  return <h1>Test Webpage!!!</h1>;
}

export default Test;
