var cos = Math.cos
var sin = Math.sin

export class vec{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;

        // this.prototype.

        // this.prototype.neg = function(){
        //     return new vec(-this.x, -this.y, -this.z);
        // }
    }

    add(v){
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
    }
    
    add(x,y,z){
        this.x += x;
        this.y += y;
        this.z += z;
    }

    subtract(v){
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
    }

    multiply(v){
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
    }

    subtract(x,y,z){
        this.x -= x;
        this.y -= y;
        this.z -= z;
    }

    magnitude(){
        if(this.x == 0 && this.y == 0 && this.z == 0) return 0;

        return Math.sqrt(
            this.x * this.x + this.y * this.y + this.z * this.z
        );
    }

    normalize(){
        let mag = this.magnitude();
        //console.log(this.x, this.y, this.z, mag);
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    copy(){
        return new vec(this.x, this.y, this.z);
    }

    dot(vec2){
        return this.x * vec2.x +
            this.y * vec2.y +
            this.z * vec2.z;
    }

    cross(vec2, vec3){
        let x1 = vec3.x - this.x;
        let y1 = vec3.y - this.y;
        let z1 = vec3.z - this.z;

        let x2 = vec2.x - this.x;
        let y2 = vec2.y - this.y;
        let z2 = vec2.z - this.z;

        return new vec(
            y1 * z2 - z1 * y2,
            z1 * x2 - x1 * z2,
            x1 * y2 - y1 * x2
        );
    }

    // https://en.wikipedia.org/wiki/Rotation_matrix
    rotateX(theta){
        let c = cos(theta);
        let s = sin(theta);

        let x = this.x;
        let y = this.y;
        let z = this.z;

        //return new vec(x, c * y + s * z, -s * y + c * z);

        this.x = x;
        this.y = c * y - s * z;
        this.z = s * y + c * z;
    }

    rotateY(theta){
        let c = cos(theta);
        let s = sin(theta);

        let x = this.x;
        let y = this.y;
        let z = this.z;

        //return new vec(c * x - s * z, y, s * x + c * z);

        this.x = c * x - s * z;
        this.y = y;
        this.z = s * x + c * z;
    }

    rotateZ(theta){
        let c = cos(theta);
        let s = sin(theta);

        let x = this.x;
        let y = this.y;
        let z = this.z;

        //return new vec(c * x + s * y, -s * x + c * y, z);

        this.x = c * x + s * y;
        this.y = -s * x + c * y;
        this.z = z;
    }

    rotateYXZ(thetaX, thetaY, thetaZ){
        this.rotateY(thetaY);
        this.rotateX(thetaX);
        this.rotateZ(thetaZ);
    }
}

export class matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data = new Array(rows);
        for(let i = 0; i < rows; i++){
            this.data[i] = new Array(cols);
        }
    }

    set(row, col, value){
        this.data[row][col] = value;
    }

    get(row, col){
        return this.data[row][col];
    }

    multiply(m){
        let result = new matrix(this.rows, m.cols);
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < m.cols; j++){
                let sum = 0;
                for(let k = 0; k < this.cols; k++){
                    sum += this.data[i][k] * (m.data[k][j] ?? 0);
                }
                result.set(i, j, sum);
            }
        }
        return result;
    }

    transpose(){
        let result = new matrix(this.cols, this.rows);
        for(let i = 0; i < this.rows; i++){
            for(let j = 0; j < this.cols; j++){
                result.set(j, i, this.data[i][j]);
            }
        }
        return result;
    }

    static identity(rows){
        let result = new matrix(rows, rows);
        for(let i = 0; i < rows; i++){
            result.set(i, i, 1);
        }
        return result;
    }
}

export class cube{
    constructor(x,y,z,latura=1){
        this.edgeLength = latura;
        this.position = new vec(x,y,z);
        this.rotation = new vec(0,0,0); // in radians

        this.vertices = [
            new vec(0,0,0),
            new vec(0,0,this.edgeLength),
            new vec(this.edgeLength,0,this.edgeLength), // 2
            new vec(this.edgeLength,0,0),
            new vec(0,this.edgeLength,0),
            new vec(0,this.edgeLength,this.edgeLength), // 5
            new vec(this.edgeLength,this.edgeLength,this.edgeLength),
            new vec(this.edgeLength,this.edgeLength, 0)
        ];

        this.vertices.forEach(vert => {
            vert.subtract(latura/2, latura/2, latura/2); // set center in the middle of the cube
            vert.add(x,y,z); // set proper vert positions according to cube position
        });

        this.faces = [
            [0,3,1], [1,3,2], // bottom
            [4,5,7], [5,6,7], // top
            [0,4,3], [4,7,3], // front
            [1,2,6], [6,5,1], // back
            [0,1,4], [1,5,4], // left
            [2,3,6], [3,7,6]  // right
        ];

        this.colors = [
            [255,0,0], [255,0,0],
            [0,255,0], [0,255,0],
            [0,0,255], [0,0,255],
            [255,255,0], [255,255,0],
            [255,0,255], [255,0,255],
            [0,255,255], [0,255,255]
        ];
    }

    move(x,y,z){
        this.position.add(x,y,z);
        this.vertices.forEach(vert => {
            vert.add(x,y,z);
        });
    }

    setPosition(x,y,z){
        let dx = x - this.position.x;
        let dy = y - this.position.y;
        let dz = z - this.position.z;
        this.move(dx,dy,dz);
        // this.position = new vec(x,y,z);
    }

    setRotation(x,y,z){
        this.rotate(
            x - this.rotation.x,
            y - this.rotation.y,
            z - this.rotation.z
        );
    }

    rotate(rx,ry,rz, pivot=this.position){
        //update this.rotation with the new values
        this.rotation.add(rx,ry,rz);
        this.rotation.x %= 2*Math.PI;
        this.rotation.y %= 2*Math.PI;
        this.rotation.z %= 2*Math.PI;

        this.vertices.forEach(vert => {
            vert.subtract(pivot.x, pivot.y, pivot.z);
            vert.rotateYXZ(rx, ry, rz);
            //vert.rotateYXZ(ry, rx, rz);
            vert.add(pivot.x, pivot.y, pivot.z);
        })
    }

    // not properly understood; dont use
    // rotateAxisAngle(axis, angle, pivot=this.position){ // this is not properly done....
    //     axis.normalize()
    //     this.rotate(
    //         axis.x * angle,
    //         axis.y * angle,
    //         axis.z * angle,
    //         pivot
    //     );    
    // }
    
    lookVector(){
        let forward = new vec(0,0,1);
        forward.rotateYXZ(this.rotation.x, this.rotation.y, this.rotation.z);
        return forward;
    }
}

export class camera{
    constructor(x=0,y=0,z=0,rx=0,ry=0,rz=0){
        this.position = new vec(x,y,z);
        this.rotation = new vec(rx,ry,rz);
        this.lookVector = new vec(0,0,1);
    }

    move(x,y,z){
        this.position.add(x,y,z);
    }

    setPosition(x,y,z){
        this.position = new vec(x,y,z);
    }

    rotate(rx,ry,rz){
        this.rotation.add(rx,ry,rz);
    }
}

origin = new vec(0,0,0);