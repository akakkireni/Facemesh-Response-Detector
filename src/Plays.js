// import React, {Component} from 'react'
// import './Play.css';
// import * as tf from "@tensorflow/tfjs";
// import * as facemesh from "@tensorflow-models/facemesh";
// import Webcam from 'react-webcam';
// import {drawMesh} from './draw';

// function Play() {
//     var preds;
//     var left_cheek;
//     var right_cheek;
//     var lips_lower_inner;
//     var left_diff;
//     var right_diff;
//     var lr;
//     var ud;
//     var cross;
//     var init_lr;
//     var init_ud;
//     var direction = "centre";
//     var pred_interval;
//     var interval;
//     const get_predictions = async() => {
//         predictions = main()
//         predictions.then(function(val){
//             if (val.length > 0){
//             preds = val[0];
//             left_cheek = preds["annotations"]["leftCheek"][0]
//             right_cheek = preds["annotations"]["rightCheek"][0]
      
//             lips_lower_inner = [0, 0, 0]
//             lips_coords = preds["annotations"]["lipsLowerInner"]
//             for (i=0; i < lips_coords.length; i++) {
//                 for (j=0; j < 3; j++){
//                   lips_lower_inner[j] += lips_coords[i][j]
//                 }
//             }
//             for (j=0; j < 3; j++){
//                 lips_lower_inner[j] = lips_lower_inner[j] / lips_coords.length
//             }
      
//             left_diff = [];
//             right_diff = [];
//             for (i=0; i< 3; i++){
//                 left_diff.push(left_cheek[i] - lips_lower_inner[i]);
//                 right_diff.push(right_cheek[i] - lips_lower_inner[i]);
//             }
      
//             cross = cross_normalised(left_diff, right_diff)
//             console.log(cross);
      
//             lr = cross[0];
//             ud = cross[1];
//             if (init_lr === undefined){
//                 init_lr = lr
//             }
//             if (init_ud === undefined){
//                 init_ud = ud
//             }
      
//             tol = 0.2
//             if (lr - init_lr > tol){
//                 direction = "left";
//             } else if (lr - init_lr < -tol) { 
//                 direction = "right";
//             } else if (ud - init_ud > tol) {
//                 direction = "down";
//             } else if (ud - init_ud < -tol) {
//                 direction = "up";
//             } else {
//                 direction = "centre";
//             }
//             document.getElementById('direction').innerHTML = direction;
//             }
//           });
//       };
//     const start_pred = async() => {
//         document.getElementById('direction').innerHTML = "Thinking...";
//         pred_interval = window.setInterval(() => get_predictions(), 1000/10)
//     };
//     const begin_game = async() => {

//         if (pred_interval === undefined) {
//             start_pred()
//         }
//         var c = document.getElementById("snake_board");
//         var snake_game = new Board(c);
//         document
//             .getElementById('status')
//             .innerHTML = "Score:";
//         document
//             .getElementById('button')
//             .innerHTML = "Restart game";
//         var speed;
//         if (document.getElementById('r1').checked) {
//             speed = 400
//         } else if (document.getElementById('r2').checked) {
//             speed = 300
//         } else if (document.getElementById('r3').checked) {
//             speed = 200
//         } else if (document.getElementById('r4').checked) {
//             speed = 150
//         }
//         if (interval) {
//             window.clearInterval(interval);
//         }
//         interval = window.setInterval(() => snake_game.update_step(snake_game), speed);
//     };
//     return (
//         <div class="content">
//             <body onload="init()">
//                 <h2>
//                     Play snake with your face!
//                 </h2>
//                 <p>
//                     Look straight ahead, press "Begin game" and have a moment of patience before the
//                     game begins.
//                     <br/>Best performance on desktop.</p>
//                 <br/>
//                 <div id='warning'></div>

//                 <canvas id="snake_board" width="200" height="200"></canvas>
//                 <br/>

//                 <div id="status">Score:
//                 </div>
//                 <div id="score"></div>
//                 <br/>
//                 Difficulty:
//                 <input id="r1" type="radio" name="difficulty" value="easy" checked/>
//                 Easy
//                 <input id="r2" type="radio" name="difficulty" value="medium"/>
//                 Medium
//                 <input id="r3" type="radio" name="difficulty" value="hard"/>
//                 Hard

//                 <br/>
//                 <br/> {/* <button id="button" onClick = {()=> begin_game()}>Begin game</button> */}

//                 <br/>
//                 <br/>

//                 <Webcam
//                     id="video"
//                     style={{
//                     position: "absolute",
//                     marginLeft: "auto",
//                     marginRight: "auto",
//                     left: 0,
//                     right: 0,
//                     textAlign: "center",
//                     width: 300,
//                     zIndex: 9,
//                     height: 300
//                 }}/>

//                 <div id="direction"></div>
//                 <br/>
//                 <br/>
//                 <a href="https://github.com/paruby/snake-face">Source on GitHub</a>
//                 <br/>
//                 <a href="http://paulrubenstein.co.uk/">http://paulrubenstein.co.uk/</a>
//             </body>
//         </div>
//     )
// }

// export default Play
