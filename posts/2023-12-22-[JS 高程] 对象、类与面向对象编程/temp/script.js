function object(o) {
  function F() {}
  F.prototype = o;
  return new F();
}
let person = {
  name: "tom",
  friends: ["a", "b"],
};
let person_A = object(person);
let person_B = object(person);

person_A.friends.push("c");
console.log(person_B.friends, "--line14");
