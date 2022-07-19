function checkHorizontalPosition(boardArray, position, player){
    // let x = position[0];
    let y = position[1];
    
    let compteurHorizontal = 0;
    let last = player;
    for (var b = 0; b < 7; b++) 
    {
        if (last === boardArray[y][b]) 
        {
            compteurHorizontal++;
            if (compteurHorizontal > 3)
            {
                return 1;
            }
        }
        else
        {
            compteurHorizontal = 0;
        }
    }
}

function checkVerticalPosition(boardArray, position, player){
    let x = position[0];
    let y = position[1];
    let ymax = y+3;
    let ymin = y-3;
    
    if (y<2)
    {
        let compteurVerticala = 0;
        let last = player;
        for (var v = 0; v <= ymax; v++) 
        {
            if (last === boardArray[v][x]) 
            {
                compteurVerticala++;
                if (compteurVerticala > 3)
                {
                    return 1;
                }
            }
            else
            {
                compteurVerticala = 0;
            }
        }
    }
    else if (y>3)
    {
        let compteurVerticalb = 0;
        let last = player;
        for (var m = ymin; m < 6; m++) 
        {
            if (last === boardArray[m][x]) 
            {
                compteurVerticalb++;
                if (compteurVerticalb > 3)
                {
                    return 1;
                }
            }
            else
            {
                compteurVerticalb = 0;
            }
        }
    }
    else
    {
        let compteurVertical = 0;
        let last = player;
        for (var p = 0; p < 6; p++) 
        {
            if (last === boardArray[p][x]) {
                compteurVertical++
                if (compteurVertical === 4){
                    return 1;
                }
            }
            else
            {
                compteurVertical = 0;
            }
        }
    }
}

function checkDiagonalHB(boardArray, position, player){
    let x = position[0];
    let y = position[1];
    let sum = x + y
    let minimunY = 0
    let minimunX = 0
    let diagoMax = 0
    let maximunY = 0
    let maximunX = 0
    let maxDiago = 0

    if (x>y) {
        minimunY = 0;
        minimunX = x-y;
        diagoMax = 7-minimunX;
    }
    else
    {
        minimunY = y-x;
        minimunX = 0;
        diagoMax = 6-minimunY;
    }
    
    if ((5-y)<x) {
        maximunY = 5;
        maximunX = x-(5-y);
        maxDiago = 7-maximunX
    }
    else
    {
        maximunY = y+x;
        maximunX = 0;
        maxDiago = maximunY+1
    }
    
    let last = player;
    
    if (diagoMax>=4) {
        let compteur = 0;
        for (var i = 0; i < diagoMax; i++) {
            if (last === boardArray[minimunY+i][minimunX+i]) 
            {
                compteur++;
                if (compteur === 4)
                {
                    return 1;
                }
            }
            else
            {
                compteur = 0;
            }
        }
    }
    
    if (sum<=8 && sum>=3) {
        let compteur = 0;
        for (var r = 0; r < maxDiago; r++) {
            if (last === boardArray[maximunY-r][maximunX+r]) 
            {
                compteur++;
                if (compteur === 4)
                {
                    return 1;
                }
            }
            else
            {
                compteur = 0;
            }
        }
    }
}

export default function checkWin (boardArray, position, player){
    console.log("checkWin", boardArray, position, player)
    var winDiago = checkDiagonalHB(boardArray, position, player)
    var winVertical = checkVerticalPosition(boardArray, position, player)
    var winHorizon = checkHorizontalPosition(boardArray, position, player)
    
    if (winDiago === 1 || winHorizon === 1 || winVertical === 1) {
        return 1;
    }
    
}
