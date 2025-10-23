// src/components/ConnectParticles.jsx
import React, { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Container, ISourceOptions } from "@tsparticles/engine";

type ConnectParticlesProps = React.ComponentProps<typeof Particles>;

const ConnectParticles: React.FC<ConnectParticlesProps> = (props) => {
  const [init, setInit] = useState(false);

  // 1. Particle Options defined directly inside the component
  const connectPatternOptions: ISourceOptions = useMemo(
    () => ({
      autoPlay: true,
      background: {
        color: {
          value: "#000000",
        },
        image: "",
      },
      clear: true,
      fullScreen: {
        enable: true, // Set to false to contain within a parent element
      },
      detectRetina: true,
      fpsLimit: 120,
      interactivity: {
        detectsOn: "window",
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "connect", // Key interaction mode
            parallax: {
              enable: false,
              force: 2,
              smooth: 10,
            },
          },
          resize: {
            delay: 0.5,
            enable: true,
          },
        },
        modes: {
          connect: {
            distance: 80,
            links: {
              opacity: 0.5,
            },
            radius: 60,
          },
          grab: {
            distance: 400,
            links: {
              blink: false,
              consent: false,
              opacity: 1,
            },
          },
          push: {
            default: true,
            groups: [],
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
            factor: 100,
            speed: 1,
            maxSpeed: 50,
            easing: "ease-out-quad",
          },
        },
      },
      particles: {
        color: {
          value: "random",
        },
        move: {
          enable: true,
          direction: "none",
          random: false,
          speed: 1, // Slower speed for connect pattern
          straight: false,
          outModes: {
            default: "out",
          },
        },
        number: {
          density: {
            enable: true,
          },
          value: 150, // Moderate particle count
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: {
            min: 1,
            max: 3, // Smaller size for subtlety
          },
        },
        links: {
          enable: true,
          distance: 150,
          opacity: 0.2, // Subtler links
          width: 1,
          color: {
            value: "#ffffff",
          },
        },
      },
      pauseOnBlur: true,
      pauseOnOutsideViewport: true,
      smooth: false,
      zLayers: 100,
      motion: {
        disable: false,
        reduce: {
          factor: 4,
          value: true,
        },
      },
    }),
    []
  );

  // 2. Initialization effect (from your original code)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
      // console.log(init); // Note: This will log 'false' as 'init' hasn't updated yet.
    });
  }, []);

  const particlesLoaded = (container: Container) => {
    // console.log(container);
  };

  // 3. Removed the dynamic particle count click listener as it's specific to the 'fire' effect

  if (!init) {
    return null;
  }

  return (
    <Particles
      id={props.id || "tsparticles-connect"}
      init={particlesLoaded}
      options={connectPatternOptions}
      style={props.style}
    />
  );
};

export default ConnectParticles;
