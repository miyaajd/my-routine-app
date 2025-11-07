import { useState, useEffect, useRef } from "react";
// css
import "./Workout.scss";

// data
import menus from "../../data/menu";

function Workout() {
  return (
    <div className="workout">
      <h2>{menus[1].title}</h2>
    </div>
  );
}

export default Workout;
