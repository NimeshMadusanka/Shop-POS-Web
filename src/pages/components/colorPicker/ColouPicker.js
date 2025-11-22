/* eslint-disable */ 
import React, { useState } from "react";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";

export default function ColouPicker({ color, setColor }) {
  const [displayPicker, setDisplayPicker] = useState(false);

  const handleClick = () => {
    setDisplayPicker(!displayPicker);
  };

  const handleClose = () => {
    setDisplayPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.hex);
  };

  const styles = reactCSS({
    default: {
      color: {
        width: "5rem",
        height: "1.5rem",
        background: `${color}`,
      },
      swatch: {
        background: "#fff",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
        marginLeft: "1rem",
        border: "solid #000",
        borderRadius: "5px",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  return (
    <div>
      <div style={styles.swatch} onClick={handleClick}>
        <div style={styles.color} />
      </div>
      {displayPicker ? (
        <div style={styles.popover}>
          <div style={styles.cover} onClick={handleClose} />
          <SketchPicker color={color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
}
