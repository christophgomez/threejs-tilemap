import React, {
  useRef,
  useEffect,
  cloneElement,
  forwardRef,
  Ref,
  MutableRefObject,
  ReactElement,
} from "react";
type InactivityFaderProps = {
  children: ReactElement;
  timeout?: number;
  shouldGoTransparent?: () => boolean;
};
export default forwardRef<Ref<any>, InactivityFaderProps>(
  ({ children, shouldGoTransparent, timeout = 3000, ...rest }, parentRef) => {
    const localRef = useRef<any>(null);
    const usedRef: MutableRefObject<any | null> =
      (parentRef as MutableRefObject<any | null>) || localRef;

    const shouldSetOpac = useRef(true);
    const windowTimeOutRef = useRef(null);
    const inEl = useRef(false);

    const [isTransparent, setIsTransparent] = React.useState(false);

    useEffect(() => {
      // You can interact with the child component here
      // This example assumes the child is an input that can be focused
      // if (childRef.current && typeof childRef.current.focus === 'function') {
      //   childRef.current.focus();
      // }

      const onDocMouseMove = () => {
        if (shouldSetOpac.current) {
          shouldSetOpac.current = false;

          clearTimeout(windowTimeOutRef.current);
          if (usedRef.current) {
            usedRef.current.style.pointerEvents = "all";
            usedRef.current.style.opacity = "1";
          }

          windowTimeOutRef.current = window.setTimeout(() => {
            if (usedRef.current && !inEl.current) {
              if (shouldGoTransparent !== undefined) {
                if (shouldGoTransparent()) {
                  usedRef.current.style.opacity = "0";
                  usedRef.current.style.pointerEvents = "none";
                }
              } else {
                usedRef.current.style.opacity = "0";
                usedRef.current.style.pointerEvents = "none";
              }
            }
            shouldSetOpac.current = true;
          }, timeout);
        }
      };

      window.addEventListener("mousemove", onDocMouseMove);

      return () => {
        window.removeEventListener("mousemove", onDocMouseMove);
      };
    }, []);

    // console.log("children", children);

    // // Attach the ref to the only child element
    // const childWithRef = cloneElement(React.Children.only(children), {
    //   ...rest,
    //   onMouseOver: () => {
    //     if (children.props.onMouseOver) children.props.onMouseOver();
    //     inEl.current = true;
    //   },
    //   onMouseOut: () => {
    //     if (children.props.onMouseOut) children.props.onMouseOut();
    //     inEl.current = false;
    //   },
    //   ref: usedRef,
    // });

    // console.log("childWithRef", childWithRef)

    return (
      <div
        style={{ transition: "opacity .5s" }}
        ref={usedRef}
        onMouseOut={() => {
          inEl.current = false;
        }}
        onMouseOver={() => {
          inEl.current = true;
        }}
        onMouseEnter={() => {
          inEl.current = true;
        }}
        onMouseLeave={() => {
          inEl.current = false;
        }}
      >
        {children}
      </div>
    );
  }
);
