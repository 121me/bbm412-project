import {Cell} from "./Cell.js";

class Matrix {

    constructor(size) {this.size = size;}

    mainFunction(){

        let unpack = this.createSetOfSets();

        // console.log('unpack');
        // console.log(unpack);

        let matrix = unpack[0];
        // console.log(matrix);
        let setOfSets = unpack[1];

        // console.table(setOfSets);

        let deepCopy = Object.assign(setOfSets, {});

        // console.log(deepCopy[0]); //set
        // deepCopy[0][0] = 1;
        // console.table(deepCopy);

        // deepCopy[0].push(1);

        // console.table(deepCopy);

        // console.log(deepCopy[0]);
        // console.log(deepCopy[0][0]);


        let pairs = [];
        // Since you only want pairs, there's no reason
        // to iterate over the last element directly
        for (let i = 0; i < deepCopy.length - 1; i++) {
            // This is where you'll capture that last value
            for (let j = i + 1; j < deepCopy.length; j++) {
                let pair = [];
                pair.push(deepCopy[i]);
                pair.push(deepCopy[j])

                if (!pairs.includes(pair)){
                    pairs.push(pair);
                }

            }

        }

        console.table(pairs);


    }

    createMatrix(){
        let matrix = [];
        let index = 0;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let newCell = new Cell(index, x, y, 0, Math.floor((Math.random() * 10) + 1));
                matrix.push(newCell);
                index++;
            }

        }
        return matrix;
    }

    //[[Location,neighbours]]
    generateRandomSets(numberOfSets){

        let newSets = []

        while (numberOfSets !== 0){
            let newSet = [[this.randomItem(0,this.size**2), this.randomItem(3,8)]]
            newSets.push(newSet)
            numberOfSets--;
        }
        return newSets;
    }

    // min and max included
    randomItem(min, max) { return Math.floor(Math.random() * (max - min + 1) + min)}

    //Grouping of cells from the matrix
    createSetOfSets() {

        let matrix = this.createMatrix();
        let randomSets = this.generateRandomSets(4);


        let setOfSets = [];
        let index = 0;

        for (let i = 0; i < randomSets.length; i++){
            for (let x = 0; x < matrix.length; x++){

               if (matrix[x].id === randomSets[i][0][0]){

                   let newSet = [];
                   let cellLimit = randomSets[i][0][1];

                   newSet.push(matrix[x]);
                   cellLimit--;

                   if ( (matrix[index-4] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index-4])) ){
                       newSet.push(matrix[index-4]);
                       cellLimit--;
                   }
                   if ( (matrix[index-3] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index-3])) )  {
                       newSet.push(matrix[index-3]);
                       cellLimit--;
                   }
                   if ( (matrix[index-2] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index-2])) ) {
                       newSet.push(matrix[index-2]);
                       cellLimit--;
                   }
                   if ( (matrix[index-1] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index-1])) ) {
                       newSet.push(matrix[index-1]);
                       cellLimit--;
                   }
                   if ( (matrix[index+1] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index+1])) ) {
                       newSet.push(matrix[index+1]);
                       cellLimit--;
                   }
                   if ( (matrix[index+2] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index+2])) ) {
                       newSet.push(matrix[index+2]);
                       cellLimit--;
                   }
                   if ( (matrix[index+3] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index+3])) ) {
                       newSet.push(matrix[index+3]);
                       cellLimit--;
                   }
                   if ( (matrix[index+4] !== undefined) &&
                       (this.randomItem(1,10 >= 8) &&
                           (cellLimit !== 0)) &&
                       (!newSet.includes(matrix[index+4])) ) {
                       newSet.push(matrix[index+4]);
                       cellLimit--;
                   }

                   setOfSets.push(newSet);
               }
            }
            index++;
        }
        return [matrix, setOfSets];
    }

}

export {Matrix};

// console.log("Matrix 2");
// console.table(matrix);

// console.table(newMatrix);
// console.table(randomSets);
//
// // console.log(newMatrix[2].id, newMatrix[2].x, newMatrix[2].y, newMatrix[2].flag);
// console.log(randomSets[1]);
// console.log(randomSets[1][0]);
// console.log(randomSets[1][0][1]);

// let sortedSets = this.sortByFlag();
//
// console.table(sortedSets);
//
// let k = 5;
// let p = 2;
// let c = [];
//
// let copySortedSets


// let dva = [];
// let tri = Object.assign(sortedSets, dva); //deep copy
//
// // convert map keys to array
// let keys = Array.from( tri.keys() ); //copy keys into an array
//
// keys[0][0][0] = -1;
// console.log(keys[0][0][0]); // [fruit, quantity]
//
// // console.log(tri.get(1));


//TODO Algorithm

// while (c.length < k){
//     if ( (k - c.length) < p){
//
//     }
// }

/*
sortByFlag(){

        let unpack = [this.createSetOfSets()]
        let matrix = unpack[0][0];
        let setOfSets = unpack[0][1];

        let hashSetOfSets = new Map();

        for (let i = 0; i < setOfSets.length; i++){
            let count = 0;
            for (let j = 0;  j < setOfSets[i].length; j++){

                if (setOfSets[i][j].flag === 0){count++;}
            }
            hashSetOfSets.set(setOfSets[i], count);
        }

        let mapSort1 = new Map([...hashSetOfSets.entries()].sort((a, b) => b[1] - a[1]));

        return mapSort1;

    }
 */

