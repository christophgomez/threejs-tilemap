import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";
import "./styles.css";
import { PLAYER_CONTROLS_ZINDEX } from "../../Spotify/PlayerComponent";

function getRandomEmoji() {
  const emojiRanges = [
    [0x1F601, 0x1F64F], // Emoticons
    [0x1F680, 0x1F6C0], // Transport & Map Symbols
    [0x1F6F0, 0x1F6F3], // Transport & Map Symbols Extended
    [0x1F30D, 0x1F567], // Other additional symbols
  ];

  // Select one range randomly
  const range = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
  // Select one codepoint within that range randomly
  const codePoint = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
  // Convert the codepoint to a string/character
  return String.fromCodePoint(codePoint);
}

export default ({
  loading,
  onToggled,
  hasBackground = true,
}: {
  hasBackground?: boolean;
  loading: boolean;
  onToggled?: (active) => void;
}) => {
  const [internalLoadShowing, setInternalLoadShowing] = React.useState(true);

  const [isLoadFinished, setIsLoadFinished] = React.useState(false);
  const [isLoadFadePauseFinished, setIsLoadFadePauseFinished] =
    React.useState(false);

  const [emoji, setEmoji] = React.useState(getRandomEmoji());

  React.useEffect(() => {
    if (!loading) {
      // Wait for a short delay before updating the state to show the "Have Fun!" text
      const firstDelay = 500;
      const secondDelay = 500; // Adjust the delay as needed

      let secondAnimTimeout;
      const firstAnimTimeout = setTimeout(() => {
        setIsLoadFinished(true);
        secondAnimTimeout = setTimeout(() => {
          setIsLoadFadePauseFinished(true);
        }, secondDelay);
      }, firstDelay);

      // Clear the timeout if the component unmounts or loadShowing changes
      return () => {
        clearTimeout(firstAnimTimeout);
        clearTimeout(secondAnimTimeout);
      };
    } else {
      if (!internalLoadShowing) setInternalLoadShowing(true);
    }
  }, [loading]);

  React.useEffect(() => {
    if (internalLoadShowing) {
      setIsLoadFinished(false);
      setIsLoadFadePauseFinished(false);
    }

    if (onToggled !== undefined) onToggled(internalLoadShowing);
  }, [internalLoadShowing]);

  React.useEffect(() => {
    if (isLoadFadePauseFinished) {
      const delay = 500; // Adjust the delay as needed
      const animationTimeout = setTimeout(() => {
        setInternalLoadShowing(loading);
      }, delay);

      return () => {
        clearTimeout(animationTimeout);
      };
    }
  }, [isLoadFadePauseFinished]);

  return (
    <>
      {internalLoadShowing && (
        <Box
          className={
            isLoadFadePauseFinished ? "fade-out-overlay" : "fade-in-overlay"
          }
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            height: "100%",
            width: "100%",
            backgroundColor:
              hasBackground === undefined || hasBackground
                ? "black"
                : "transparent",
            color: "white",
            zIndex: PLAYER_CONTROLS_ZINDEX + 100,
            display: "flex",
            flexFlow: "row",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            pointerEvents: "none",
          }}
        >
          <Box>
            {!isLoadFinished && <CircularProgress />}
            <Typography
              className={isLoadFinished ? "change-text" : "enlarge-text"}
              sx={{ mt: 1.5 }}
              variant="h6"
            >
              {isLoadFinished ? emoji : `Loading`}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};
