import {Cell} from "./Cell.js";

class Matrix {

    constructor(size, numberOfSets, setsToBeSelected) {
        this.size = size;
        this.setsToBeSelected = setsToBeSelected;
        this.numberOfSets = numberOfSets;
    }

    mainFunction(){

        //Unpacking
        let matricesAndSets = [this.makeCellGroupings()]

        let updatedMatrix = matricesAndSets[0][0];
        let firstMatrix = matricesAndSets[0][2];
        let setOfSets = matricesAndSets[0][1];

        setOfSets = this.convertToMapAndSort(setOfSets);
        let pairs = this.makePairsOfSets(setOfSets);

        console.log("COMBINATIONS, PAIRS");
        console.table(pairs);

        let pairsAndMaxCounter = Object.assign(this.combinePairsAndMakeSets(pairs),[]);

        let combinedPairings = pairsAndMaxCounter[0];
        // let maxOfCombinedPairings = pairsAndMaxCounter[1];

        console.log("ALL PAIRING SETS COMBINED");
        console.table(combinedPairings);

        //K - value
        let setsToBeSelected = this.setsToBeSelected;
        let deepCopyOfSetsToBeSelected = Object.assign(setsToBeSelected,[]);

        console.log("SETS TO BE SELECTED (K)", setsToBeSelected);
        console.log("NOTE: sets to be selected can't exceed numbers of set groupings at the start");

        let finalSet = new Set();
        while (setsToBeSelected !== 0){

            //CASE1
            //First we select the set with the biggest number of elements
            if ((finalSet.size === 0) && (setsToBeSelected !== 1)){
                console.log("FIRST STEP");
                this.overLapStep(combinedPairings,finalSet);
                //2 sets picked, subtract them (because they have been combined in the pairings
                setsToBeSelected = setsToBeSelected - 2;
            }

            //CASE 2
            //Second, we keep selecting sets that overlap the least
            if ((finalSet.size !== 0) && (setsToBeSelected !== 1)){
                console.log("OVERLAP STEP");
                this.overLapStep(combinedPairings,finalSet);
                setsToBeSelected = setsToBeSelected - 2;
            }

            //CASE3
            //Edge case when setsToBeSelected are an odd number
            if (setsToBeSelected === 1){
                console.log("OVERLAP STEP");
                this.overLapStep(combinedPairings,finalSet);
                setsToBeSelected--;
            }
        }

        //----------------------------------------------------------------------------

        console.log("REPAIRING HEALTH FOR THE FOLLOWING CELLS: ")
        for (let cell of finalSet){
            console.log(cell);
            cell.health = 10;
        }


        console.log("");
        console.log("FINAL CELL COUNT", finalSet.size);
        console.table(finalSet);
        console.log("MAX POSSIBLE CELLS: ", deepCopyOfSetsToBeSelected * 9, "| Number of sets: " + deepCopyOfSetsToBeSelected + " * " + "9 cells under ideal conditions")
        console.log("");
        console.log("FINAL MATRIX");
        console.table(updatedMatrix);

        return [firstMatrix, updatedMatrix, finalSet];
    }

    //Gets the max number of elements that don't overlap with our final set
    overLapStep(combinedPairings,finalSet){
        //Get the max counter for the most elements
        //Extract those sets further below
        let maxElementsThatDontOverlap = 0;
        let sameSizedSets = [];
        for (let i = 0; i < combinedPairings.length; i++){

            let count = 0;
            for (let cell of combinedPairings[i]){
                if (!finalSet.has(cell)){
                    count++;
                }
                if (count > maxElementsThatDontOverlap)
                    maxElementsThatDontOverlap = count;
            }
        }

        console.log("MAXIMUM ELEMENTS THAT DONT OVERLAP: ", maxElementsThatDontOverlap);
        for (let i = 0; i < combinedPairings.length; i++){

            let count = 0;
            for (let cell of combinedPairings[i]){
                if (!finalSet.has(cell)){
                    count++;
                }
            }
            if (count === maxElementsThatDontOverlap){
                let packaging = [];
                packaging.push(combinedPairings[i]);
                packaging.push(i);
                sameSizedSets.push(packaging);
            }
        }

        console.log("SAME SIZED SETS" +
            "GROUPING - INDEX IN OLD COMBINED SETS");
        console.table(sameSizedSets);

        if (sameSizedSets.length > 1) {
            let lowestHealth = 1000;
            let healthIndex = 0;
            for (let i = 0; i < sameSizedSets.length; i++) {

                let totalHealth = 0;
                for (let cell of sameSizedSets[i][0])
                    totalHealth = totalHealth + cell.health;

                if (totalHealth < lowestHealth) {
                    lowestHealth = totalHealth;
                    healthIndex = i;
                }
            }

            console.log("ADDING CELLS WITH LOWEST COMBINED HEALTH");
            console.log(sameSizedSets[healthIndex][0]);

            let healthCheck = 0;
            for (let cell of sameSizedSets[healthIndex][0]){
                console.log(cell)
                healthCheck+=cell.health;
                finalSet.add(cell);
            }
            console.log("Health Check of group in progress...");
            console.log("Health: ", healthCheck + " out of " + sameSizedSets[healthIndex][0].size * 10);

            combinedPairings.splice(sameSizedSets[healthIndex][1],1);//spliced

        }

        if (sameSizedSets.length === 1) {
            console.log("ADDING BIGGEST DEFAULT GROUPING");
            console.log(sameSizedSets[0][0]);
            for (let cell of sameSizedSets[0][0]) {
                console.log(cell)
                finalSet.add(cell);
            }
            combinedPairings.splice(sameSizedSets[0][1],1);//spliced
        }

        console.log("");
        console.log("UPDATED CELL COUNT AFTER OVERLAP", finalSet.size);
        console.table(finalSet);
        console.log("");

    }

    //1D for overlook convinience
    createMatrix(){
        let matrix = [];
        let copyMatrix = [];

        let index = 0;
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let newCell = new Cell(index, x, y, 0, Math.floor((Math.random() * 10) + 1));

                copyMatrix.push(new Cell(newCell.id, newCell.x, newCell.y, newCell.flag, newCell.health))

                matrix.push(newCell);
                index++;
            }

        }
        return [matrix, copyMatrix];
    }

    //Grouping of cells from the matrix
    makeCellGroupings() {

        console.log("STARTING MATRIX");
        let matrices = this.createMatrix();

        let matrix = matrices[0];
        let firstMatrix = matrices[1];

        console.table(matrix);

        let numberOfSets = this.numberOfSets;
        console.log("ASSIGNING RANDOM STARTING POSITIONS and NEIGHBOURING CELL LIMITS");
        console.log("NUMBER OF SETS/GROUPINGS SELECTED: ", numberOfSets);
        let randomSets = this.randomStartsAndNeighbours(numberOfSets);
        console.table(randomSets);

        let allGroupings =[];
        let expandingPosition = 0;

        for (let i = 0; i < randomSets.length; i++){
            for (let x = 0; x < matrix.length; x++){

                if (matrix[x].id === randomSets[i][0]){

                    //Expanding position is the randomly chosen starting position in the matrix
                    expandingPosition = randomSets[i][0];

                    let newGrouping = [];
                    let cellLimit = randomSets[i][1];

                    newGrouping.push(matrix[x]);

                    //Expand to the sides first because there is less chance to miss a grouping
                    if ( (matrix[expandingPosition-1] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition-1])) ) {
                        newGrouping.push(matrix[expandingPosition-1]);
                        cellLimit--;
                    }
                    if ( (matrix[expandingPosition+1] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition+1])) ) {
                        newGrouping.push(matrix[expandingPosition+1]);
                        cellLimit--;
                    }

                    //Expand up and down
                    if ( (matrix[expandingPosition-3] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition-3])) )  {
                        newGrouping.push(matrix[expandingPosition-3]);
                        cellLimit--;
                    }

                    if ( (matrix[expandingPosition+3] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition+3])) ) {
                        newGrouping.push(matrix[expandingPosition+3]);
                        cellLimit--;

                        if ( (matrix[expandingPosition-2] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition-2])) ) {
                            newGrouping.push(matrix[expandingPosition-2]);
                            cellLimit--;
                        }

                        if ( (matrix[expandingPosition+2] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition+2])) ) {
                            newGrouping.push(matrix[expandingPosition+2]);
                            cellLimit--;
                        }

                        if ( (matrix[expandingPosition-4] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition-4])) ){
                            newGrouping.push(matrix[expandingPosition-4]);
                            cellLimit--;
                        }

                    }
                    if ( (matrix[expandingPosition+4] !== undefined) && (cellLimit !== 0) && (!newGrouping.includes(matrix[expandingPosition+4])) ) {
                        newGrouping.push(matrix[expandingPosition+4]);
                        cellLimit--;
                    }

                    allGroupings.push(newGrouping);
                }
            }
        }

        console.log("GROUPINGS FROM SELECTED SETS");
        console.table(allGroupings);

        return [matrix, allGroupings, firstMatrix];
    }

    //Easier to convert to key, value and sort values, then convert back into array
    convertToMapAndSort(setOfSets){
        //Convert sets to map to sort them and extract the max (plus better pairings)
        let mapOfSets = new Map();
        for (let i = 0; i < setOfSets.length; i++){
            let count = 0;
            for (let j = 0;  j < setOfSets[i].length; j++)
                if (setOfSets[i][j].flag === 0)
                    count++;
            mapOfSets.set(setOfSets[i], count);
        }
        let mapSort1 = new Map([...mapOfSets.entries()].sort((a, b) => b[1] - a[1]));
        let keys = Array.from( mapSort1.keys() );
        let deepCopy = Object.assign(keys, []);

        //This will prevent our original map's cells being affected
        return deepCopy;
    }

    //[[Set1,Set2],[Set1,Set3]... combinations
    makePairsOfSets(setOfSets){
        let pairs = [];
        // Since you only want pairs, there's no reason to iterate over the last element directly
        for (let i = 0; i < setOfSets.length - 1; i++) {
            // This is where you'll capture that last value
            for (let j = i + 1; j < setOfSets.length; j++) {
                let pair = [];
                pair.push(setOfSets[i]);
                pair.push(setOfSets[j])

                if (!pairs.includes(pair))
                    pairs.push(pair);
            }
        }
        return pairs;
    }

    //[[Starting location,neighbours]]
    randomStartsAndNeighbours(numberOfSets){

        let newSets = []

        let newPositions = [0,1,2,3,4,5, this.size**2-3, this.size**2-2, this.size**2-1];

        while (numberOfSets !== 0){
            let newPosition = this.randomBetweenMinMax(1,this.size**2)-1;

            //Just to make sure that the starting locations are never the same
            for (let i = 0; i < 10; i++){
                if (newPositions.includes(newPosition)){
                    newPosition = this.randomBetweenMinMax(1,this.size**2)-1;
                }
            }

            let newSet = [newPosition, this.randomBetweenMinMax(5,8)]
            newSets.push(newSet)
            numberOfSets--;
        }
        return newSets;
    }

    //Combine Set1 and Set2 into 1 set
    //Later will be easier for selections
    combinePairsAndMakeSets(pairs){
        let myArrayOfSets = [];
        let max = 0;
        for (let i = 0; i < pairs.length; i++){
            let newSet = new Set()
            for (let elementInPair1 = 0; elementInPair1 < pairs[i][0].length; elementInPair1++)
                newSet.add(pairs[i][0][elementInPair1]);
            for (let elementInPair2 = 0; elementInPair2 < pairs[i][1].length; elementInPair2++)
                newSet.add(pairs[i][1][elementInPair2]);
            if (newSet.size > max)
                max = newSet.size;
            myArrayOfSets.push(newSet)
        }
        return [myArrayOfSets, max];
    }

    // min and max included
    randomBetweenMinMax(min, max) { return Math.floor(Math.random() * (max - min + 1) + min)}

}

export {Matrix};
