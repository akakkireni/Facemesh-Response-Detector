import React, {useRef, useState} from 'react';
import './Play.css';
import styles from './play.module.css';
//import all dependencies
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import Webcam from 'react-webcam';
import {drawMesh} from './draw';

function Play() {
    function load_video() {
        var video = document.getElementById('video');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator
                .mediaDevices
                .getUserMedia({video: true})
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                });
        }
    }

    var video;
    var model;

    async function init() {
        video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Not adding `{ audio: true }` since we only want video now
            navigator
                .mediaDevices
                .getUserMedia({video: true})
                .then(function (stream) {
                    //video.src = window.URL.createObjectURL(stream);
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function () {
                    document
                        .getElementById('warning')
                        .innerHTML = "Please check your permissions: access to camera is needed to estimate head direc" +
                            "tion to control the snake."
                });
        }
        model = await facemesh.load();
    }
    var preds;
    var left_cheek;
    var right_cheek;
    var lips_lower_inner;
    var left_diff;
    var right_diff;
    var lr;
    var ud;
    var cross;
    var init_lr;
    var init_ud;
    var direction = "centre";
    var pred_interval;
    //references
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [predictions,
        setPred] = useState(0);

    async function main() {
        const predictions = await model.estimateFaces(video);
        return predictions
    }

    function cross_normalised(x, y) {
        cross = [
            x[1] * y[2] - x[2] * y[1],
            x[2] * y[0] - x[0] * y[2],
            x[0] * y[1] - x[1] * y[0]
        ];
        var norm = Math.sqrt((cross[0] ** 2) + (cross[1] ** 2) + (cross[2] ** 2));
        return [
            cross[0] / norm,
            cross[1] / norm,
            cross[2] / norm
        ]
    }

    function stop_pred() {
        window.clearInterval(pred_interval)
    }

    function load_video() {
        var video = document.getElementById('video');

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator
                .mediaDevices
                .getUserMedia({video: true})
                .then(function (stream) {
                    video.srcObject = stream;
                    video.play();
                });
        }
    }

    var video;
    var model;

    async function init() {
        video = document.getElementById('video');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Not adding `{ audio: true }` since we only want video now
            navigator
                .mediaDevices
                .getUserMedia({video: true})
                .then(function (stream) {
                    //video.src = window.URL.createObjectURL(stream);
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function () {
                    document
                        .getElementById('warning')
                        .innerHTML = "Please check your permissions: access to camera is needed to estimate head direc" +
                            "tion to control the snake."
                });
        }
        model = await facemesh.load();
    }

    //load facemesh
    const runFacemesh = async() => {

        const net = await facemesh.load({
            inputResolution: {
                width: 800,
                height: 600
            },
            scale: 0.8
        });
        setInterval(() => {
            detect(net)
        }, 100)
    };

    //detect function
    const detect = async(net) => {

        if (typeof webcamRef.current !== "undefined" && webcamRef.current !== null && webcamRef.current.video.readyState === 4) {

            //Get Video props
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            //set video
            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            // videoHeight; make detections
            const predictions = await net.estimateFaces(video);

            if (predictions.length > 0) {
                preds = predictions[0];
                left_cheek = preds["annotations"]["leftCheek"][0]
                right_cheek = preds["annotations"]["rightCheek"][0]

                lips_lower_inner = [0, 0, 0]
                var lips_coords = preds["annotations"]["lipsLowerInner"]
                for (var i = 0; i < lips_coords.length; i++) {
                    for (j = 0; j < 3; j++) {
                        lips_lower_inner[j] += lips_coords[i][j]
                    }
                }
                for (var j = 0; j < 3; j++) {
                    lips_lower_inner[j] = lips_lower_inner[j] / lips_coords.length
                }

                left_diff = [];
                right_diff = [];
                for (i = 0; i < 3; i++) {
                    left_diff.push(left_cheek[i] - lips_lower_inner[i]);
                    right_diff.push(right_cheek[i] - lips_lower_inner[i]);
                }

                cross = cross_normalised(left_diff, right_diff)
                console.log(cross);

                lr = cross[0];
                ud = cross[1];
                if (init_lr === undefined) {
                    init_lr = lr
                }
                if (init_ud === undefined) {
                    init_ud = ud
                }

                var tol = 0.2;
                if (lr - init_lr > tol) {
                    direction = "left";
                } else if (lr - init_lr < -tol) {
                    direction = "right";
                } else if (ud - init_ud > tol) {
                    direction = "down";
                } else if (ud - init_ud < -tol) {
                    direction = "up";
                } else {
                    direction = "centre";
                }
                document
                    .getElementById('direction')
                    .innerHTML = direction;
            }

        }
    };

    function stop_pred() {
        window.clearInterval(pred_interval)
    }
    class Board {
        constructor(canvas) {
            this.canvas = canvas;
            this.length = 1;
            this.direction = "D";
            this.positions = [
                [10, 10]
            ];
            this.box_dim = 20;
            this.grid_size = 20;
            this.context = this
                .canvas
                .getContext("2d");
            var random_pos_x = 8 + Math.floor(Math.random() * 12);
            var random_pos_y = 8 + Math.floor(Math.random() * 12);
            this.food = [random_pos_x, random_pos_y];
        }
        plot(obj) {
            obj.context.fillStyle = "#ffffff";
            obj
                .context
                .fillRect(0, 0, obj.box_dim * obj.grid_size, obj.box_dim * obj.grid_size);

            obj.context.fillStyle = "#000000";
            obj
                .context
                .fillRect(0, 0, 1, obj.box_dim * obj.grid_size);
            obj
                .context
                .fillRect(0, 0, obj.box_dim * obj.grid_size, 1);
            obj
                .context
                .fillRect(0, obj.box_dim * obj.grid_size - 1, obj.box_dim * obj.grid_size, 1);
            obj
                .context
                .fillRect(obj.box_dim * obj.grid_size - 1, 0, 1, obj.box_dim * obj.grid_size);

            obj.context.fillStyle = "#0000FF";
            obj
                .context
                .fillRect(obj.food[0] * obj.box_dim, obj.food[1] * obj.box_dim, obj.box_dim, obj.box_dim);

            obj.context.fillStyle = "#FF0000";

            var i;
            var x;
            var y;
            for (i = 0; i < obj.positions.length; i++) {
                x = obj.positions[i][0];
                y = obj.positions[i][1];
                obj
                    .context
                    .fillRect(x * obj.box_dim, y * obj.box_dim, obj.box_dim, obj.box_dim);
            }
            document
                .getElementById('score')
                .innerHTML = obj.positions.length
            if (obj.positions.length > 9) {
                document
                    .getElementById('circle')
                    .style
                    .visibility = "visible";
            }

            return;
        }
        new_food(obj) {
            var random_pos_x = 4 + Math.floor(Math.random() * 12);
            var random_pos_y = 4 + Math.floor(Math.random() * 12);

            while (obj.check_intersects(obj, [random_pos_x, random_pos_y])) {
                random_pos_x = Math.floor(Math.random() * obj.grid_size);
                random_pos_y = Math.floor(Math.random() * obj.grid_size);
            }
            obj.food = [random_pos_x, random_pos_y];
        }

        check_intersects(obj, coords) {
            var x;
            var y;
            var i;
            for (i = 0; i < obj.positions.length; i++) {
                x = obj.positions[i][0];
                y = obj.positions[i][1];
                if ((x == coords[0]) && (y == coords[1])) {
                    return Boolean(1);
                }
            }
            return Boolean(0);
        }

        end_if_intersects(obj, new_head) {
            var x;
            var y;
            var i;
            for (i = 0; i < obj.positions.length; i++) {
                x = obj.positions[i][0];
                y = obj.positions[i][1];
                if ((x == new_head[0]) && (y == new_head[1]) || (new_head[0] < 0 || new_head[1] < 0 || new_head[0] > obj.grid_size - 1 || new_head[1] > obj.grid_size - 1)) {
                    window.clearInterval(interval);
                    document
                        .getElementById('status')
                        .innerHTML = "Game over! Your score:";
                }
            }
        }

        update_step(obj) {
            if (direction == 'down' && obj.direction != 'U') {
                obj.direction = "D";
            } else if (direction == 'up' && obj.direction != 'D') {
                obj.direction = "U";
            } else if (direction == 'left' && obj.direction != 'R') {
                obj.direction = "L";
            } else if (direction == 'right' && obj.direction != 'L') {
                obj.direction = "R";
            }

            var head = obj.positions[obj.positions.length - 1];
            var new_head;
            if (obj.direction == "D") {
                new_head = [
                    head[0], head[1] + 1
                ];
            } else if (obj.direction == "U") {
                new_head = [
                    head[0], head[1] - 1
                ];
            } else if (obj.direction == "R") {
                new_head = [
                    head[0] + 1,
                    head[1]
                ];
            } else if (obj.direction == "L") {
                new_head = [
                    head[0] - 1,
                    head[1]
                ];
            }

            obj.end_if_intersects(obj, new_head);

            obj
                .positions
                .push(new_head);
            if (new_head[0] != obj.food[0] | new_head[1] != obj.food[1]) {
                obj
                    .positions
                    .shift();
            } else {
                obj.new_food(obj);
            }
            obj.plot(obj);
            return;
        }
    }

    var interval;

    const begin_game = async() => {
        // if (pred_interval === undefined) {     start_pred() }
        var c = document.getElementById("snake_board");
        var snake_game = new Board(c);
        document
            .getElementById('status')
            .innerHTML = "Score:";
        document
            .getElementById('button')
            .innerHTML = "Restart game";
        var speed = 350;
        if (interval) {
            window.clearInterval(interval);
        }
        interval = window.setInterval(() => snake_game.update_step(snake_game), speed);
    };

    runFacemesh();
    return (

        <div className="content" style={{
            color: "white "
        }}>
            <body onload="init()">
                <h1>
                    Snake Game
                </h1>
                <br/>
                <div id='warning'></div>

                <canvas
                    id="snake_board"
                    style={{
                    backgroundColor: "white",
                    border: "1px solid white"
                }}
                    width="400"
                    height="400"></canvas>
                <br/>

                <div id="status">Score:
                </div>
                <div id="score" style={{
                    color: "white"
                }}></div>
                <br/>
                <button id="button" onClick={() => begin_game()}>Begin game</button>

                <br/>
                <br/>
                <Webcam mirrored={true}
                    ref
                    ={webcamRef}
                    style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    width: 620,
                    zIndex: 9,
                    height: 240
                }}/>

                <div id="direction"></div>

            </body>
        </div>
    );
}

export default Play;
