const names = ["John", "Jane", "Bob", "Alice", "Mike"];



function myForEach(arr, callback) {
    for (let i = 0; i < arr.length; i++) {
        callback(arr[i]);
    }
}

myForEach(names, (name) => {
    console.log(name);
});