import {XYZ} from './building-map.service';


export class Trilateration {
    //gets called if >= 3 beacons are available
    //positions is the beacon positions in order w.r.t distance to device (ascending order)
    //distances is the dev distances to beacon in order w.r.t distance to device (ascending order)
    public findDevLocation(positions: XYZ[], distances: number[]): XYZ{
        /* we need to solve following equation:
        |x2-x1 y2-y1 |   *  | x-x1 |  =  | 1/2 (r1^2 + d21^2 - r2^2) |
        |x3-x1 y3-y1 |      | y-y1 |     | 1/2 (r1^2 + d31^2 - r3^2) |
        */
       console.assert(positions.length >= 3, 'Atleast three Beacons required');
       //
       let element00 = positions[1].x - positions[0].x; // x2-x1
       let element01 = positions[1].y - positions[0].y; // y2-y1
       let element10 = positions[2].x - positions[0].x; // x3-x1
       let element11 = positions[2].y - positions[0].y; // y3-y1
       //
       let b21 = 1 / 2 * (Math.pow(distances[0],2) + this.distance(positions[1], positions[0]) - Math.pow(distances[1],2));
       let b31 = 1 / 2 * (Math.pow(distances[0],2) + this.distance(positions[2], positions[0]) - Math.pow(distances[2],2));
       let matrix = [ [element00, element01, b21],
                      [element10, element11, b31] 
                    ];
       let res: number[] = this.gaussian(matrix);
       return {x: res[0] + positions[0].x, y: res[1] + positions[0].y, z: null} ;

    }
    private distance (p1: XYZ, p2: XYZ) {
        let x1 = p1.x;
        let y1 = p1.y;
        

        let x2 = p2.x;
        let y2 = p2.y;
        

        let xdif = Math.abs ( x2 - x1 );
        let ydif = Math.abs ( y2 - y1 );
        
        return Math.sqrt( Math.pow(xdif, 2) +
                           Math.pow(ydif, 2) 
                        );

    }
    private gaussian(A: number[][]) : number[] {
        let n: number = A.length;
    
        for (let i=0; i<n; i++) {
            // Search for maximum in this column
            let maxEl = Math.abs(A[i][i]);
            let maxRow = i;
            for(let k=i+1; k<n; k++) {
                if (Math.abs(A[k][i]) > maxEl) {
                    maxEl = Math.abs(A[k][i]);
                    maxRow = k;
                }
            }
    
            // Swap maximum row with current row (column by column)
            let k;
            for ( k=i; k<n+1; k++) {
                let tmp = A[maxRow][k];
                A[maxRow][k] = A[i][k];
                A[i][k] = tmp;
            }
    
            // Make all rows below this one 0 in current column
            for (k=i+1; k<n; k++) {
                let c = -A[k][i]/A[i][i];
                for(let j=i; j<n+1; j++) {
                    if (i==j) {
                        A[k][j] = 0;
                    } else {
                        A[k][j] += c * A[i][j];
                    }
                }
            }
        }
    
        // Solve equation Ax=b for an upper triangular matrix A
        let x: number[]= new Array(n);
        for (let i=n-1; i>-1; i--) {
            x[i] = A[i][n]/A[i][i];
            for (let k=i-1; k>-1; k--) {
                A[k][n] -= A[k][i] * x[i];
            }
        }
        return x;
        
    }

}