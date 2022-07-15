import React, {useRef} from 'react';
import './App.css';

//import all dependencies
import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import Webcam from 'react-webcam';
import {drawMesh} from './draw';
import saveCanvas from "save-canvas-to-image";

function App() {

    //references
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);

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

            //set canvas
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
            // videoHeight; make detections
            const face = await net.estimateFaces(video);

            const ctx = canvasRef
                .current
                .getContext("2d");
            drawMesh(face, ctx);

        }
    };
    runFacemesh();
    return (

        <div className="App">
            <header className="App-header" style={{textAlign:"end"}}>
                <Webcam
                    ref
                    ={webcamRef}
                    style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    width: 800,
                    zIndex: 9,
                    height: 600
                }}/>

                <canvas
                    id="can"
                    ref
                    ={canvasRef}
                    style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    width: 800,
                    zIndex: 9,
                    height: 600
                }}/>
                 <h1 id="noYes" style ={{
                color: "white",
                position:"absolute",
                top:"800px",
                fontSize:"50"
            }}>NO</h1>
            </header>
           
            {/* <button onClick = {()=> saveCanvas.savePNG("can", "File")}>Save</button> */}
        </div>
    );
}

export default App;
