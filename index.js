console.log("Hello Sachin");

var foo = function(){
	var v1 = 0;
	var v2 = "v2";

	var boo = function(){
		console.log("Print", v1++);
	}
	return boo;
}

var k = foo();

k();
k();
k();
k();
k();
k();
k();