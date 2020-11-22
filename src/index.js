import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Simplecal from "./Simplecal/Simplecal";
import reportWebVitals from "./reportWebVitals";



ReactDOM.render(< React.StrictMode >
	<Simplecal description="{input}" />
</React.StrictMode>,
	document.getElementById("root")
);

reportWebVitals();