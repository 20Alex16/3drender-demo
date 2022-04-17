const deg = x => (x * Math.PI) / 180.0;
import {vec,cube,matrix, camera} from './components.js';
const canvas = document.getElementById('rotating cube');
const ctx = canvas.getContext('2d');

ctx.canvas.width = canvas.clientWidth;
ctx.canvas.height = canvas.clientHeight;

function drawDot(x, y, color = '#000000') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function project(object, fov, aspect, near, far){
    let f = 1.0 / Math.tan(fov * 0.5);
    let rangeInv = 1.0 / (far - near);
    
    let projMatrix = new matrix(4,4);
    
    projMatrix.set(0,0, aspect * f);
    projMatrix.set(1,1, f);
    projMatrix.set(2,2, far * rangeInv);
    projMatrix.set(3,2, -near * far * rangeInv);
    projMatrix.set(2,3, 1.0);
    
    
    // projMatrix.set(0,0, f / aspect);
    // projMatrix.set(1,1, f);
    // projMatrix.set(2,2, (near + far) * rangeInv);
    // projMatrix.set(2,3, 2 * near * far * rangeInv);
    // projMatrix.set(3,2, -1);
    
    let projectedVertices = [];
    object.vertices.forEach(vert => {
        let vertMatrix = new matrix(1,4);
        //console.log(vertMatrix)
        
        vertMatrix.set(0,0, vert.x);
        vertMatrix.set(0,1, vert.y);
        vertMatrix.set(0,2, vert.z);
        vertMatrix.set(0,3, 1);
        
        let projected = vertMatrix.multiply(projMatrix)
        let x1 = projected.get(0,0) / projected.get(0,3);
        let y1 = projected.get(0,1) / projected.get(0,3);
        let z1 = projected.get(0,2) / projected.get(0,3);
        //console.log(projected.get(0,3))
        //console.log(projected)
        
        let offset = 350
        let scale = 100
        
        x1 = x1 * scale + offset
        y1 = y1 * scale + offset
        
        //drawDot(x1 * scale + offset, y1 * scale + offset, lerpColor("#ffffff", "#000000", projected.get(0,3)/5));
        
        projectedVertices.push(new vec(x1,y1,z1));        
    });
    
    return projectedVertices;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function listToColor(list) {
    return "#" + componentToHex(list[0]) + componentToHex(list[1]) + componentToHex(list[2]);
}

function drawShape(shape, projVertices){
    projVertices.forEach(vert => {
        drawDot(vert.x, vert.y, '#ffffff');
    });
    
    shape.faces.forEach((face,i) => {
        let v1 = projVertices[face[0]];
        let v2 = projVertices[face[1]];
        let v3 = projVertices[face[2]];
        
        let V1 = shape.vertices[face[0]];
        let V2 = shape.vertices[face[1]];
        let V3 = shape.vertices[face[2]];
        
        //v1, v2, v3 are the projected vertices
        //V1, V2, V3 are the vertices of the cube
        
        let vecTri = new vec(
        (V1.x+V2.x+V3.x)/3,
        (V1.y+V2.y+V3.y)/3,
        (V1.z+V2.z+V3.z)/3
        );
        
        let faceNormal = V2.cross(V1, V3)
        faceNormal.normalize();
        let dot = cam.lookVector.dot(faceNormal);
        
        if(
            faceNormal.x * (vecTri.x - cam.position.x) +
            faceNormal.y * (vecTri.y - cam.position.y) +
            faceNormal.z * (vecTri.z - cam.position.z) < 0
            ){
                ctx.beginPath();
                ctx.moveTo(v1.x, v1.y);
                ctx.lineTo(v2.x, v2.y);
                ctx.lineTo(v3.x, v3.y);
                ctx.closePath();
                ctx.fillStyle = lerpColor(
                    "#000000",
            // "#ffffff",
            listToColor(shape.colors[i]),
            -dot);
            
            ctx.fill();
        }            
    });
}

let c = new cube(0,0,0)
let cam = new camera(0,0,0)
    
// c.setPosition(0,0,2)
// c.rotate(deg(30),0,0)

// setInterval(() => {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     //c.rotate(0.01,0.05,0.03);
//     c.rotate(0,0.05,0);
//     let projVertices = project(c, deg(90), canvas.height / canvas.width, 1, 100);
//     drawShape(c,projVertices);
// }, 30)
    
// c.rotate(deg(30),deg(1),0)
// let projVertices = project(c, deg(15), canvas.height / canvas.width, 1, 100);
// drawShape(c, projVertices)

setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let projVertices = project(c, deg(90), canvas.height / canvas.width, 1, 100);
    drawShape(c,projVertices);
}, 30)

const sliderX = document.querySelector('#slider.X');
const sliderY = document.querySelector('#slider.Y');
const sliderZ = document.querySelector('#slider.Z');

const sliderRotX = document.querySelector('#slider.rotX');
const sliderRotY = document.querySelector('#slider.rotY');
const sliderRotZ = document.querySelector('#slider.rotZ');

function valueChanged(){
    c.setPosition(sliderX.value, sliderY.value, sliderZ.value);
    c.setRotation(
        deg(sliderRotX.value),
        deg(sliderRotY.value),
        deg(sliderRotZ.value)
    );
}

sliderX.addEventListener('input', valueChanged)
sliderY.addEventListener('input', valueChanged)
sliderZ.addEventListener('input', valueChanged)

sliderRotX.addEventListener('input', valueChanged)
sliderRotY.addEventListener('input', valueChanged)
sliderRotZ.addEventListener('input', valueChanged)

valueChanged()