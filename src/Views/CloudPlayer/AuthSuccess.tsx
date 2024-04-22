import * as React from "react";
import CountdownTimer from "../../Components/UI/CountdownTimer";
import { useNavigate } from "react-router-dom";
import { RouteMenuButton } from "../../Components/UI/RoutesView";

export default () => {
  const [authorizing, setAuthorizing] = React.useState(true);
  let navigate = useNavigate();
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code");

    const handleAuthorize = async () => {
      try {
        const response = await fetch(
          "https://spotilize.uc.r.appspot.com/spotify/authorize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              code: authCode,
              app: "CloudPlayer",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Network response was not ok ${response.statusText}`);
        }

        const data = await response.json();

        localStorage.setItem("refresh_token", data.refresh_token);

        setAuthorizing(false);

        return data.access_token;
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (authCode) {
      handleAuthorize();
    } else {
    }
  }, []);

  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    if (!authorizing) {
      // navigate("/cloudplayer");
      timeoutRef.current = window.setTimeout(() => {
        navigate("/cloudplayer");
      }, 5000)
    }
  }, [authorizing]);

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    }
  }, [])

  if (authorizing) return null;

  return (
    <div>
      <h1>Success!</h1>
      {/* <p>Click the link to redirect</p> */}
      <RouteMenuButton to="/cloudplayer">Go to CloudPlayer</RouteMenuButton>
      {/* <p>You can close this tab now.</p> */}
      <br/><br/>
      <p>This page will automatically redirect in: </p>
      <CountdownTimer seconds={5} />
    </div>
  );
};
